import { formatWinRate, getPlayerStats } from '../core/progression'
import type { ExplorationResult } from '../core/exploration'
import { getEquipment } from '../data/equipment'
import { getAmulet, getAmuletTrait, parseAmuletTraits } from '../data/amulets'
import type { BattleEvent, DeadcellsPlayer } from '../types'

export function playerStatus(player: DeadcellsPlayer): string {
  const stats = getPlayerStats(player)
  const amulet = getAmulet(player.amuletId)
  const traits = parseAmuletTraits(player.amuletTraits).map(getAmuletTrait).filter(Boolean)
  return [
    `${player.username}`,
    `细胞数：${player.cells}`,
    `【${player.bossCellLevel}】细胞等级`,
    `HP ${stats.maxHp} | 攻击 ${stats.attack} | 暴击 ${stats.critChance}%`,
    `武器：【${stats.weaponName}】|副手：【${stats.shieldName}】`,
    `道具1：【${getEquipment(player.item1Id)?.name || '无'}】|道具2：【${getEquipment(player.item2Id)?.name || '无'}】`,
    `护符：【${amulet?.name || '囚者颈环'}】${traits.length ? `|词条：${traits.map((trait) => trait!.name).join('、')}` : ''}`,
    `对战次数：【${player.battleCount}】`,
    `胜率：【${formatWinRate(player)}】`,
  ].join('\n')
}

export function equipmentDescription(player: DeadcellsPlayer): string {
  const weapon = getEquipment(player.weaponId)
  const shield = getEquipment(player.shieldId)
  const item1 = getEquipment(player.item1Id)
  const item2 = getEquipment(player.item2Id)
  const amulet = getAmulet(player.amuletId)
  const traits = parseAmuletTraits(player.amuletTraits).map(getAmuletTrait).filter(Boolean)
  return [
    '当前装备',
    `武器：【${weapon?.name || '无'}】${weapon ? `：${weapon.description}` : ''}`,
    `副手：【${shield?.name || '无'}】${shield ? `：${shield.description}` : ''}`,
    `道具1：【${item1?.name || '无'}】${item1 ? `：${item1.description}` : ''}`,
    `道具2：【${item2?.name || '无'}】${item2 ? `：${item2.description}` : ''}`,
    `护符：【${amulet?.name || '囚者颈环'}】${traits.length ? `：${traits.map((trait) => `${trait!.name}（${trait!.description}）`).join('、')}` : ''}`,
  ].join('\n')
}

export function explorationText(result: ExplorationResult): string {
  const lines = [
    `本次探索到：${result.reached.map((name, index) => `【${index + 1}】${name}`).join(' → ')}`,
    `地图基础细胞：${result.baseCells}`,
    `Boss基础奖励：${result.bossReward}`,
    `细胞等级倍率：×${result.multiplier}`,
    `本次获得细胞：${result.cellsGained}`,
  ]
  for (const boss of result.bosses) {
    lines.push(boss.won
      ? `成功击败${boss.bossName}，获得基础细胞 ${boss.reward}！`
      : `抵达${boss.mapName}，但没能战胜${boss.bossName}。`)
  }
  lines.push(result.comment)
  return lines.join('\n')
}

export function eventText(events: BattleEvent[]): string {
  return events.map((event) => event.text).join('\n')
}
