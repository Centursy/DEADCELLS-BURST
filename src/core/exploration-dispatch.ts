import { h, type Context } from 'koishi'
import type { Config } from '../config'
import { advanceExplorationState, createExplorationState, dispatchExplorationResult, parseExplorationState, serializeExplorationState } from './exploration'
import { explorationText } from '../output/text'
import { renderExploreCard } from '../output/image'
import { getPlayer } from '../utils/player'
import type { DeadcellsPlayer } from '../types'

const activeUsers = new Set<string>()

export function beijingDate(timestamp = Date.now()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}

function resetDailyCount(player: DeadcellsPlayer, now = Date.now()): { date: string; count: number } {
  const date = beijingDate(now)
  return player.dailyExploreDate === date
    ? { date, count: player.dailyExploreCount || 0 }
    : { date, count: 0 }
}

export function dispatchStatus(player: DeadcellsPlayer, now = Date.now()): string | undefined {
  const state = parseExplorationState(player.exploreState)
  if (!state) return undefined
  const remaining = Math.max(0, state.nextAt - now)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.ceil((remaining % 60000) / 1000)
  return `探索进行中……\n当前地图：【${state.currentMap}】\n已探索地图数：【${state.reached.length}】\n当前策略：【${state.strategy === 'cells' ? '更多细胞' : '更深层数'}】\n下一张地图预计在：【${minutes}分${seconds}秒】后结算。`
}

export async function startExploration(
  ctx: Context,
  config: Config,
  player: DeadcellsPlayer,
  strategy: 'cells' | 'depth',
  channelId?: string,
  guildId?: string,
): Promise<DeadcellsPlayer> {
  const now = Date.now()
  const state = createExplorationState(strategy, now, config.exploreDurationSeconds, channelId, guildId)
  const daily = resetDailyCount(player, now)
  await ctx.database.set('deadcells_players', { userId: player.userId }, {
    dailyExploreDate: daily.date,
    dailyExploreCount: daily.count,
    exploreState: serializeExplorationState(state),
    lastExploreAt: now,
  })
  return { ...player, dailyExploreDate: daily.date, dailyExploreCount: daily.count, exploreState: serializeExplorationState(state), lastExploreAt: now }
}

async function sendCompletion(ctx: Context, player: DeadcellsPlayer, state: ReturnType<typeof parseExplorationState>, result: ReturnType<typeof dispatchExplorationResult>) {
  if (!state?.channelId) return
  const bot = (ctx as any).bots?.find((candidate: any) => candidate?.status !== 'offline') || (ctx as any).bots?.[0]
  if (!bot?.sendMessage) return
  const outputPlayer = { ...player, cells: player.cells + result.cellsGained }
  const card = await renderExploreCard(ctx, outputPlayer, result)
  const content = card
    ? h('message', {}, [h('at', { id: player.userId }), h('text', { content: ' 探索已结束！' }), card])
    : h('message', {}, [h('at', { id: player.userId }), h('text', { content: ` 探索已结束！\n${explorationText(result)}` })])
  await bot.sendMessage(state.channelId, content, state.guildId)
}

export async function processDueExplorations(ctx: Context, config: Config, now = Date.now()): Promise<void> {
  const players = await ctx.database.get('deadcells_players', {})
  for (const raw of players) {
    const player = await getPlayer(ctx, raw.userId)
    if (!player || !player.exploreState || activeUsers.has(player.userId)) continue
    const initial = parseExplorationState(player.exploreState)
    if (!initial || initial.nextAt > now) continue
    activeUsers.add(player.userId)
    try {
      let state = initial
      let finished = false
      let result: ReturnType<typeof dispatchExplorationResult> | undefined
      while (!finished && state.nextAt <= now) {
        const advanced = advanceExplorationState(player, state, Math.random, state.nextAt, config.exploreDurationSeconds)
        state = advanced.state
        finished = advanced.finished
        result = advanced.result
      }
      if (!finished) {
        await ctx.database.set('deadcells_players', { userId: player.userId }, { exploreState: serializeExplorationState(state) })
        continue
      }
      if (!result) continue
      const daily = resetDailyCount(player, now)
      const updated = {
        cells: player.cells + result.cellsGained,
        exploreState: null,
        dailyExploreDate: daily.date,
        dailyExploreCount: daily.count + 1,
      }
      await ctx.database.set('deadcells_players', { userId: player.userId }, updated)
      await sendCompletion(ctx, player, state, result)
    } finally {
      activeUsers.delete(player.userId)
    }
  }
}

export function registerExplorationDispatcher(ctx: Context, config: Config): void {
  const run = () => { void processDueExplorations(ctx, config) }
  ctx.on('ready', run)
  ctx.setInterval(run, 15000)
}

export function dailyExploreAvailable(player: DeadcellsPlayer, config: Config, now = Date.now()): boolean {
  return resetDailyCount(player, now).count < config.dailyExploreLimit
}
