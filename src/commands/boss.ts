import type { Context } from 'koishi'
import type { Config } from '../config'
import {
  calculateBossReward,
  getOrCreateDailyBoss,
  parseBossChoiceState,
  parseBossRankings,
  randomTraitChoices,
  serializeBossChoiceState,
  serializeBossRankings,
  simulateBossRaid,
} from '../core/boss'
import { beijingDate } from '../core/exploration-dispatch'
import { getAmulet, getAmuletTrait, parseAmuletTraits, serializeAmuletTraits } from '../data/amulets'
import { renderBossRaidCard, renderBossTraitChoiceCard } from '../output/image'
import { getPlayer } from '../utils/player'
import type { BossChoiceState, DailyBossRecord, DeadcellsPlayer } from '../types'

const DIFFICULTY_NAMES: Record<DailyBossRecord['difficulty'], string> = {
  normal: '普通',
  veteran: '历战',
  'veteran-king': '历战王',
}

function choiceIndex(value: string | undefined, length: number): number | undefined {
  const index = Number.parseInt(value?.trim() || '', 10) - 1
  return Number.isInteger(index) && index >= 0 && index < length ? index : undefined
}

function rankingForUser(rankings: ReturnType<typeof parseBossRankings>, userId: string, username: string, damage: number) {
  const existing = rankings.find((item) => item.userId === userId)
  if (existing) {
    existing.damage += damage
    existing.username = username
  } else {
    rankings.push({ userId, username, damage })
  }
  return rankings
}

function bossText(boss: DailyBossRecord): string {
  const hp = Math.max(0, Math.round(boss.currentHp))
  return `今日 Boss：【${boss.bossName}】（${boss.mapName}，${DIFFICULTY_NAMES[boss.difficulty]}）\nBoss 生命：${hp} / ${boss.maxHp}`
}

async function sendBossCard(ctx: Context, session: any, player: DeadcellsPlayer, boss: DailyBossRecord, result?: ReturnType<typeof simulateBossRaid>, rankings = parseBossRankings(boss.rankings), completed = boss.completed) {
  const card = await renderBossRaidCard(ctx, player, boss, result, rankings, completed)
  if (card) await session.send(card)
  else {
    const log = result?.events?.join('\n')
    await session.send(`${bossText(boss)}${result ? `\n本次造成伤害：${result.damage}\n${log || ''}` : ''}${completed ? '\nBoss 已被讨伐。' : ''}`)
  }
}

async function settleBossChoice(ctx: Context, config: Config, session: any, player: DeadcellsPlayer, state: BossChoiceState, firstAnswer?: string): Promise<string> {
  if (state.date !== beijingDate() || Date.now() > state.expiresAt) {
    await ctx.database.set('deadcells_players', { userId: player.userId }, { bossChoiceState: null })
    return '词条选择已超时，Boss 最后一击奖励失效。'
  }

  const selectedIndex = choiceIndex(firstAnswer, state.choices.length)
  if (selectedIndex === undefined) return `请选择 1-${state.choices.length} 其中一个词条。`
  const selectedTrait = state.choices[selectedIndex]
  const currentTraits = parseAmuletTraits(player.amuletTraits)
  let nextTraits: string[]
  let amuletId = player.amuletId

  if (currentTraits.length >= 2) {
    await session.send('请选择替换第几个护符词条：\n1. 词条1\n2. 词条2')
    const slotAnswer = await session.prompt(config.equipmentConfirmTimeout * 1000)
    if (!slotAnswer) {
      await ctx.database.set('deadcells_players', { userId: player.userId }, { bossChoiceState: null })
      return '词条选择已超时，Boss 最后一击奖励失效。'
    }
    if (!['1', '2'].includes(slotAnswer.trim())) return '请选择 1 或 2 替换护符词条。'
    nextTraits = [...currentTraits]
    nextTraits[Number(slotAnswer!.trim()) - 1] = selectedTrait
  } else if (currentTraits.length === 1) {
    nextTraits = [...currentTraits, selectedTrait]
  } else {
    amuletId = amuletId === 'prisoner-necklace' ? 'amulet-1' : amuletId
    nextTraits = [selectedTrait]
  }

  await ctx.database.set('deadcells_players', { userId: player.userId }, {
    cells: player.cells + state.rewardCells,
    amuletId,
    amuletTraits: serializeAmuletTraits(nextTraits),
    bossChoiceState: null,
  })
  const trait = getAmuletTrait(selectedTrait)
  return `已获得 ${state.rewardCells} 个细胞，并装备词条【${trait?.name || selectedTrait}】。${currentTraits.length >= 2 ? '已替换选择的词条槽位。' : currentTraits.length === 1 ? '已装入第二个词条槽位。' : `已获得护符【${getAmulet(amuletId)?.name || '炼化护符'}】。`}`
}

export function registerBossCommand(ctx: Context, config: Config, busy: Set<string>) {
  const raidLock = '__daily-boss-raid__'
  const commandName = config.commandBoss || 'boss讨伐'
  ctx.command(`${commandName} [choice:text]`)
    .action(async ({ session }, choiceInput) => {
      if (!session?.userId) return '当前消息缺少用户身份，无法参加 Boss 讨伐。'
      const player = await getPlayer(ctx, session.userId)
      if (!player) return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！'
      if (busy.has(player.userId)) return '你当前正在进行其他操作，请稍后再试。'

      const pending = parseBossChoiceState(player.bossChoiceState)
      if (pending) {
        busy.add(player.userId)
        try {
          let answer = choiceInput?.trim()
          if (!answer) {
            const boss = await getOrCreateDailyBoss(ctx)
            const card = config.enableImages ? await renderBossTraitChoiceCard(ctx, player, boss, pending.choices, pending.rewardCells, config.equipmentConfirmTimeout) : undefined
            if (card) await session.send(card)
            else await session.send(`Boss 最后一击奖励：${pending.rewardCells} 个细胞\n${pending.choices.map((id, index) => `${index + 1}. ${getAmuletTrait(id)?.name || id}：${getAmuletTrait(id)?.description || ''}`).join('\n')}\n请回复 1-${pending.choices.length} 选择词条。`)
            answer = await session.prompt(config.equipmentConfirmTimeout * 1000)
          }
          return settleBossChoice(ctx, config, session, player, pending, answer)
        } finally {
          busy.delete(player.userId)
        }
      }

      const boss = await getOrCreateDailyBoss(ctx)
      if (boss.completed) {
        await sendBossCard(ctx, session, player, boss, undefined, parseBossRankings(boss.rankings), true)
        return
      }

      if (choiceInput?.trim()) return '当前没有待选择的 Boss 词条。'
      if (Date.now() < player.lastBossRaidAt + config.bossRaidCooldownSeconds * 1000) {
        const seconds = Math.ceil((player.lastBossRaidAt + config.bossRaidCooldownSeconds * 1000 - Date.now()) / 1000)
        return `你还在 Boss 讨伐冷却中，请 ${seconds} 秒后再试。`
      }
      if (busy.has(raidLock)) return '当前已有其他玩家正在讨伐今日 Boss，请稍后再试。'

      busy.add(player.userId)
      busy.add(raidLock)
      let updatedBoss = boss
      try {
        const result = simulateBossRaid(player, boss, config)
        const rankings = rankingForUser(parseBossRankings(boss.rankings), player.userId, player.username, result.damage)
        const currentHp = Math.max(0, boss.currentHp - result.damage)
        const killed = currentHp <= 0
        updatedBoss = {
          ...boss,
          currentHp,
          completed: killed,
          killerId: killed ? player.userId : boss.killerId,
          killerName: killed ? player.username : boss.killerName,
          rankings: serializeBossRankings(rankings),
        }
        await ctx.database.set('deadcells_daily_bosses', { date: boss.date }, {
          currentHp: updatedBoss.currentHp,
          completed: updatedBoss.completed,
          killerId: updatedBoss.killerId,
          killerName: updatedBoss.killerName,
          rankings: updatedBoss.rankings,
        })
        await ctx.database.set('deadcells_players', { userId: player.userId }, { lastBossRaidAt: Date.now() })

        const reward = calculateBossReward(player, result.damage, boss.rewardMultiplier)
        if (killed) {
          const state: BossChoiceState = {
            date: boss.date,
            choices: randomTraitChoices(Math.random),
            rewardCells: reward,
            expiresAt: Date.now() + config.equipmentConfirmTimeout * 1000,
          }
          await ctx.database.set('deadcells_players', { userId: player.userId }, { bossChoiceState: serializeBossChoiceState(state) })
          const resultPlayer = { ...player, lastBossRaidAt: Date.now(), bossChoiceState: serializeBossChoiceState(state) }
          await sendBossCard(ctx, session, resultPlayer, updatedBoss, result, rankings, true)
          const card = config.enableImages ? await renderBossTraitChoiceCard(ctx, resultPlayer, updatedBoss, state.choices, reward, config.equipmentConfirmTimeout) : undefined
          if (card) await session.send(card)
          else await session.send(`最后一击奖励：${reward} 个细胞\n${state.choices.map((id, index) => `${index + 1}. ${getAmuletTrait(id)?.name || id}：${getAmuletTrait(id)?.description || ''}`).join('\n')}\n请回复 1-${state.choices.length} 选择词条。`)
          return settleBossChoice(ctx, config, session, resultPlayer, state, await session.prompt(config.equipmentConfirmTimeout * 1000))
        }

        await ctx.database.set('deadcells_players', { userId: player.userId }, { cells: player.cells + reward, bossChoiceState: null })
        const resultPlayer = { ...player, cells: player.cells + reward, lastBossRaidAt: Date.now() }
        await sendBossCard(ctx, session, resultPlayer, updatedBoss, result, rankings, false)
        return `本次获得 ${reward} 个细胞。`
      } finally {
        busy.delete(player.userId)
        busy.delete(raidLock)
      }
    })
}
