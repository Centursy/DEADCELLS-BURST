import { getEquipment } from '../data/equipment'
import { amuletTraitList, getAmuletTrait, parseAmuletTraits } from '../data/amulets'
import type { Config } from '../config'
import type { BossChoiceState, DailyBossRecord, DeadcellsPlayer, Random } from '../types'
import { getPlayerStats } from './progression'
import { maps, type MapDefinition } from '../data/maps'
import { beijingDate } from './exploration-dispatch'

export interface BossRaidResult {
  damage: number
  turns: number
  playerHp: number
  killed: boolean
  events: string[]
}

export function parseBossChoiceState(value: string | null | undefined): BossChoiceState | undefined {
  if (!value) return undefined
  try {
    const state = JSON.parse(value) as BossChoiceState
    if (!state || !Array.isArray(state.choices) || typeof state.rewardCells !== 'number' || typeof state.expiresAt !== 'number') return undefined
    return state
  } catch {
    return undefined
  }
}

export function serializeBossChoiceState(state: BossChoiceState): string {
  return JSON.stringify(state)
}

const FINAL_BOSS_MAPS = new Set(['王座之间', '塔顶', '观星台'])
const DIFFICULTIES: DailyBossRecord['difficulty'][] = ['normal', 'veteran', 'veteran-king']

function randomInt(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

function bossConfig(difficulty: DailyBossRecord['difficulty'], random: Random) {
  if (difficulty === 'veteran') return { maxHp: randomInt(random, 23000, 31000), attackMultiplier: 1.5, rewardMultiplier: 2 }
  if (difficulty === 'veteran-king') return { maxHp: randomInt(random, 35000, 50000), attackMultiplier: 2, rewardMultiplier: 3 }
  return { maxHp: randomInt(random, 2000, 12000), attackMultiplier: 1, rewardMultiplier: 1 }
}

export function raidBossMaps(): MapDefinition[] {
  return maps.filter((map) => map.boss && !FINAL_BOSS_MAPS.has(map.name))
}

export async function getOrCreateDailyBoss(ctx: any, random: Random = Math.random): Promise<DailyBossRecord> {
  const date = beijingDate()
  const [existing] = await ctx.database.get('deadcells_daily_bosses', { date })
  if (existing) return existing
  const pool = raidBossMaps()
  const map = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
  const difficulty = DIFFICULTIES[Math.min(DIFFICULTIES.length - 1, Math.floor(random() * DIFFICULTIES.length))]
  const config = bossConfig(difficulty, random)
  const record: DailyBossRecord = {
    date,
    mapName: map.name,
    bossName: map.boss!,
    difficulty,
    maxHp: config.maxHp,
    currentHp: config.maxHp,
    attackMultiplier: config.attackMultiplier,
    rewardMultiplier: config.rewardMultiplier,
    completed: false,
    killerId: null,
    killerName: null,
    rankings: '[]',
  }
  try {
    await ctx.database.create('deadcells_daily_bosses', record)
    return record
  } catch {
    const [created] = await ctx.database.get('deadcells_daily_bosses', { date })
    if (!created) throw new Error('今日 Boss 创建失败')
    return created
  }
}

function critMultiplier(traits: string[]): number {
  return 1 + traits.reduce((total, id) => total + (getAmuletTrait(id)?.critDamageBonus || 0), 0)
}

function bossDamageMultiplier(traits: string[]): number {
  return traits.reduce((total, id) => total * (getAmuletTrait(id)?.bossDamageMultiplier || 1), 1)
}

function greedMultiplier(traits: string[]): number {
  return traits.reduce((total, id) => {
    const effect = getAmuletTrait(id)?.effectId
    return effect === 'greed-2' ? total * 2 : effect === 'greed-3' ? total * 3 : effect === 'greed-4' ? total * 4 : total
  }, 1)
}

export function calculateBossReward(player: DeadcellsPlayer, damage: number, rewardMultiplier: number): number {
  const levelMultiplier = [1, 2, 3, 4, 5, 5][Math.max(0, Math.min(5, player.bossCellLevel))]
  return Math.round(damage * 10 * rewardMultiplier * levelMultiplier * greedMultiplier(parseAmuletTraits(player.amuletTraits)))
}

export function parseBossRankings(value: string | null | undefined): Array<{ userId: string; username: string; damage: number }> {
  if (!value) return []
  try {
    const result = JSON.parse(value)
    return Array.isArray(result) ? result.filter((item) => item && typeof item.userId === 'string' && typeof item.damage === 'number') : []
  } catch {
    return []
  }
}

export function serializeBossRankings(rankings: Array<{ userId: string; username: string; damage: number }>): string {
  return JSON.stringify(rankings.sort((a, b) => b.damage - a.damage || a.userId.localeCompare(b.userId)).slice(0, 50))
}

export function randomTraitChoices(random: Random, count = 5): string[] {
  const pool = [...amuletTraitList]
  const choices: string[] = []
  while (choices.length < count && pool.length) {
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
    choices.push(pool.splice(index, 1)[0].id)
  }
  return choices
}

export function simulateBossRaid(player: DeadcellsPlayer, boss: DailyBossRecord, config: Config, random: Random = Math.random): BossRaidResult {
  const stats = getPlayerStats(player)
  const traits = parseAmuletTraits(player.amuletTraits)
  const weapon = getEquipment(player.weaponId)
  const shield = getEquipment(player.shieldId)
  let playerHp = stats.maxHp
  let remaining = boss.currentHp
  let damage = 0
  let turns = 0
  let attackCount = 0
  let coldUsed = false
  let critChance = stats.critChance
  let damageTakenMultiplier = shield?.effectId === 'damage-reduction' ? 0.7 : 1
  const events: string[] = []

  const deal = (raw: number, forcedCrit = false) => {
    if (remaining <= 0) return
    const critical = forcedCrit || random() * 100 < critChance
    let amount = raw * (critical ? 2 * critMultiplier(traits) : 1) * bossDamageMultiplier(traits)
    if (!coldUsed && traits.includes('cold-forging')) {
      amount *= 2
      coldUsed = true
      events.push('【寒气练成】本次 Boss 伤害翻倍！')
    }
    amount = Math.min(remaining, Math.max(0, Math.round(amount)))
    remaining -= amount
    damage += amount
    events.push(`对 Boss 造成 ${Math.round(amount)} 点${critical ? '暴击' : ''}伤害！`)
  }

  if (traits.includes('meteor-flash')) {
    playerHp = Math.max(0, playerHp - 90)
    deal(90)
    events.push('【流星一闪】开局自爆！')
  }

  while (playerHp > 0 && remaining > 0 && turns < config.maxBattleTurns) {
    turns++
    attackCount++
    const useSkill = Boolean(weapon?.skill && random() * 100 < config.skillRate)
    const useItem = Boolean((player.item1Id || player.item2Id) && random() * 100 < config.itemUseRate)
    if (useItem) {
      const item = getEquipment(player.item1Id || player.item2Id)
      if (item?.effectId === 'powerful-grenade') deal(stats.attack * 1.5)
      else if (item?.effectId === 'cluster-grenade') for (let index = 0; index < 6 && remaining > 0; index++) deal(10)
      else if (item?.effectId === 'whirlwind-knife') deal(15)
      else if (item?.effectId === 'vampirism-item') deal(stats.attack)
      else if (item?.effectId === 'displacement') deal(stats.attack * 2)
      else events.push(`使用道具【${item?.name || '未知道具'}】，本回合不攻击。`)
    } else {
      const hits = weapon?.effectId === 'double-hit' ? 2 : weapon?.effectId === 'triple-hit' ? 3 : 1
      let guaranteedCrit = Boolean(weapon?.alwaysCrit || useSkill)
      if (weapon?.guaranteedCritAttacks?.includes(attackCount)) guaranteedCrit = true
      if (weapon?.effectId === 'even-crit' && turns % 2 === 0) guaranteedCrit = true
      if (weapon?.effectId === 'third-turn-crit' && turns === 3) guaranteedCrit = true
      if (weapon?.effectId === 'first-turn-crit' && turns === 1) guaranteedCrit = true
      for (let index = 0; index < hits && remaining > 0; index++) deal(stats.attack, guaranteedCrit)
      if (weapon?.effectId === 'electric-damage' && remaining > 0) {
        const extraHits = random() < 0.1 ? 3 : random() < 0.2 ? 1 : 0
        for (let index = 0; index < extraHits; index++) deal(stats.attack, guaranteedCrit)
      }
    }
    if (remaining <= 0) break

    if (turns % 3 === 0) {
      let bossDamage = 30 * boss.attackMultiplier * (random() < 0.5 ? 2 : 1)
      if (shield?.blockRate && random() * 100 < shield.blockRate) bossDamage = 0
      bossDamage *= damageTakenMultiplier
      playerHp = Math.max(0, playerHp - bossDamage)
      events.push(`Boss 发动攻击，造成 ${Math.round(bossDamage)} 点伤害！`)
    } else {
      events.push('Boss 正在蓄力……')
    }
  }

  return { damage: Math.round(damage), turns, playerHp: Math.round(playerHp), killed: remaining <= 0, events }
}
