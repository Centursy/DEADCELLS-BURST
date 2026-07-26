import { h, type Context, type Session } from 'koishi'
import { createPlayer } from '../core/progression'
import type { DeadcellsPlayer } from '../types'

export function normalizePlayer(player: DeadcellsPlayer): DeadcellsPlayer {
  return {
    ...player,
    item1Id: player.item1Id || null,
    item2Id: player.item2Id || null,
    amuletId: player.amuletId || 'prisoner-necklace',
    amuletTraits: player.amuletTraits || '[]',
    exploreState: player.exploreState || null,
    dailyExploreDate: player.dailyExploreDate || '',
    dailyExploreCount: player.dailyExploreCount || 0,
    lastBossRaidAt: player.lastBossRaidAt || 0,
    bossChoiceState: player.bossChoiceState || null,
  }
}

export async function getPlayer(ctx: Context, userId: string): Promise<DeadcellsPlayer | undefined> {
  const [player] = await ctx.database.get('deadcells_players', { userId })
  return player ? normalizePlayer(player) : undefined
}

export async function getOrCreatePlayer(ctx: Context, userId: string, username: string): Promise<{ player: DeadcellsPlayer; created: boolean }> {
  const existing = await getPlayer(ctx, userId)
  if (existing) return { player: existing, created: false }
  const player = createPlayer(userId, username)
  await ctx.database.create('deadcells_players', player)
  return { player, created: true }
}

export async function resolveUsername(session: Session, userId: string, fallback?: string): Promise<string> {
  if (fallback) return fallback
  if (typeof session.bot.getUser === 'function') {
    const user = await session.bot.getUser(userId).catch(() => undefined)
    if (user?.name) return user.name
  }
  return userId
}

export async function parseAtTarget(session: Session, input: string): Promise<{ userId: string; username: string } | undefined> {
  const element = h.parse(input || '').find((item) => item.type === 'at')
  if (!element?.attrs?.id) return undefined
  return {
    userId: element.attrs.id,
    username: await resolveUsername(session, element.attrs.id, element.attrs.name),
  }
}

export function cooldownRemaining(lastAt: number, cooldownSeconds: number, now = Date.now()): number {
  return Math.max(0, lastAt + cooldownSeconds * 1000 - now)
}

export async function confirm(session: Session, timeoutMs: number): Promise<boolean> {
  const answer = await session.prompt(timeoutMs)
  return Boolean(answer && ['y', 'yes'].includes(answer.trim().toLowerCase()))
}

export function confirmFromUser(ctx: Context, channelId: string | undefined, userId: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let finished = false
    let dispose: (() => void) | undefined

    const finish = (value: boolean) => {
      if (finished) return
      finished = true
      dispose?.()
      resolve(value)
    }

    dispose = ctx.on('message', (incoming) => {
      if (incoming.userId !== userId) return
      if (channelId && incoming.channelId !== channelId) return
      const answer = incoming.content?.trim().toLowerCase()
      finish(answer === 'y' || answer === 'yes')
    })

    setTimeout(() => finish(false), timeoutMs)
  })
}
