import { getEquipment } from '../data/equipment'
import { getAmulet, getAmuletTrait, parseAmuletTraits } from '../data/amulets'
import type { DeadcellsPlayer, PlayerStats } from '../types'

export const MAX_BOSS_CELL_LEVEL = 5

export const levelConfig = [
  { cost: 0, multiplier: 1, hp: 0, attack: 0, crit: 0 },
  { cost: 1000, multiplier: 2, hp: 10, attack: 3, crit: 5 },
  { cost: 2000, multiplier: 3, hp: 10, attack: 3, crit: 5 },
  { cost: 3000, multiplier: 4, hp: 10, attack: 3, crit: 5 },
  { cost: 4000, multiplier: 5, hp: 10, attack: 3, crit: 5 },
  { cost: 5000, multiplier: 5, hp: 10, attack: 3, crit: 5 },
]

export function createPlayer(userId: string, username: string): DeadcellsPlayer {
  return {
    userId,
    username,
    cells: 0,
    bossCellLevel: 0,
    weaponId: 'rusty-knife',
    shieldId: null,
    item1Id: null,
    item2Id: null,
    amuletId: 'prisoner-necklace',
    amuletTraits: '[]',
    battleCount: 0,
    winCount: 0,
    lastExploreAt: 0,
    lastBattleAt: 0,
    exploreState: null,
    dailyExploreDate: '',
    dailyExploreCount: 0,
    lastBossRaidAt: 0,
    bossChoiceState: null,
  }
}

export function getLevelConfig(level: number) {
  return levelConfig[Math.max(0, Math.min(MAX_BOSS_CELL_LEVEL, level))]
}

export function getPlayerStats(player: DeadcellsPlayer): PlayerStats {
  const levelIndex = Math.max(0, Math.min(MAX_BOSS_CELL_LEVEL, player.bossCellLevel))
  const cumulativeBonus = levelConfig.slice(1, levelIndex + 1).reduce(
    (total, current) => ({
      hp: total.hp + current.hp,
      attack: total.attack + current.attack,
      crit: total.crit + current.crit,
    }),
    { hp: 0, attack: 0, crit: 0 },
  )
  const weapon = getEquipment(player.weaponId)
  const shield = getEquipment(player.shieldId)
  const amulet = getAmulet(player.amuletId)
  const traitStats = parseAmuletTraits(player.amuletTraits).map(getAmuletTrait).filter(Boolean).reduce(
    (total, current) => ({
      attack: total.attack + (current?.attackBonus || 0),
      crit: total.crit + (current?.critBonus || 0),
      maxHp: total.maxHp + (current?.maxHpBonus || 0),
    }),
    { attack: 0, crit: 0, maxHp: 0 },
  )
  const maxHpBonus = traitStats.maxHp
  const maxHp = weapon?.cursed ? 1 : 50 + cumulativeBonus.hp + maxHpBonus
  return {
    maxHp,
    attack: 10 + cumulativeBonus.attack + (weapon?.attackBonus || 0) + traitStats.attack,
    critChance: Math.min(100, cumulativeBonus.crit + (weapon?.critBonus || 0) + traitStats.crit),
    weaponName: weapon?.name || '无武器',
    shieldName: shield?.name || '无盾牌',
    amuletName: amulet?.name || '囚者颈环',
  }
}

export function formatWinRate(player: DeadcellsPlayer): string {
  return player.battleCount ? `${((player.winCount / player.battleCount) * 100).toFixed(2)}%` : '0%'
}

export function getAmuletCellMultiplier(player: DeadcellsPlayer): number {
  return parseAmuletTraits(player.amuletTraits)
    .map(getAmuletTrait)
    .reduce((multiplier, trait) => {
      if (trait?.effectId === 'greed-2') return multiplier * 2
      if (trait?.effectId === 'greed-3') return multiplier * 3
      if (trait?.effectId === 'greed-4') return multiplier * 4
      return multiplier
    }, 1)
}
