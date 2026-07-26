import { getAmuletTrait, parseAmuletTraits } from '../data/amulets'
import { getEquipment } from '../data/equipment'
import type { BattleEvent, BattleResult, Combatant, DeadcellsPlayer, GameConfig, Random } from '../types'
import { getPlayerStats } from './progression'

type DamageResult = 'survived' | 'dead' | 'restarted'

function percent(random: Random, value: number): boolean {
  return random() * 100 < value
}

function at(value: number): string {
  return Math.max(0, Math.round(value)).toString()
}

function addEvent(events: BattleEvent[], text: string, combatant?: Combatant) {
  events.push({ text, actorId: combatant?.userId, actorName: combatant?.username })
}

function traitIds(combatant: Combatant): string[] {
  return combatant.amuletTraits
}

function hasTrait(combatant: Combatant, id: string): boolean {
  return traitIds(combatant).includes(id)
}

function traitEffect(combatant: Combatant, effectId: string): boolean {
  return traitIds(combatant).some((id) => getAmuletTrait(id)?.effectId === effectId)
}

function critDamageMultiplier(traits: string[]): number {
  return 1 + traits.reduce((total, id) => total + (getAmuletTrait(id)?.critDamageBonus || 0), 0)
}

function thornRatio(traits: string[]): number {
  return traits.reduce((ratio, id) => Math.max(ratio, getAmuletTrait(id)?.thornRatio || 0), 0)
}

function initiativeWeight(combatant: Combatant): number {
  const weight = combatant.amuletTraits
    .map(getAmuletTrait)
    .find((trait) => trait?.initiativeWeight)?.initiativeWeight
  return weight || 50
}

function greedMultiplier(combatant: Combatant): number {
  return combatant.amuletTraits
    .map(getAmuletTrait)
    .reduce((multiplier, trait) => {
      if (trait?.effectId === 'greed-2') return multiplier * 2
      if (trait?.effectId === 'greed-3') return multiplier * 3
      if (trait?.effectId === 'greed-4') return multiplier * 4
      return multiplier
    }, 1)
}

function createCombatant(player: DeadcellsPlayer): Combatant {
  const stats = getPlayerStats(player)
  const weapon = getEquipment(player.weaponId)
  const amuletTraits = parseAmuletTraits(player.amuletTraits)
  return {
    userId: player.userId,
    username: player.username,
    cells: player.cells,
    stats,
    baseAttack: stats.attack,
    hp: stats.maxHp,
    attackCount: 0,
    balancedBonus: 0,
    item1Id: player.item1Id || null,
    item2Id: player.item2Id || null,
    item1Used: false,
    item2Used: false,
    amuletTraits,
    initiativeWeight: 50,
    actionCount: 0,
    bleeding: 0,
    bleedAttack: 0,
    chargeReady: false,
    charging: false,
    firstDamageReduced: false,
    firstDamageBoosted: false,
    damageTakenMultiplier: getEquipment(player.shieldId)?.effectId === 'damage-reduction' ? 0.7 : 1,
    damageDealtMultiplier: 1,
    extraCritDamageMultiplier: critDamageMultiplier(amuletTraits),
    deathProtectionUsed: false,
    nightSongActive: false,
    nightSongUsed: false,
    owlActive: false,
    owlCritBelowHalf: false,
    riftAuraTurns: 0,
    markedDamageMultiplier: 1,
    nextAttackMultiplier: 1,
    preempted: false,
    hunterReady: false,
    turretEffect: null,
    turretTurns: 0,
    decoyHp: 0,
    decoyActive: false,
    frontlineTurns: 0,
    frontlineBoostActive: false,
    heavyChargeUsed: false,
    warSpearCharged: false,
    stunned: false,
    frozen: false,
    invincible: false,
    retaliationReady: false,
    lastAttackBlocked: false,
    offhandCooldown: 0,
    passiveDamageChecked: false,
    coldForgingUsed: false,
    meteorFlash: amuletTraits.some((id) => getAmuletTrait(id)?.effectId === 'meteor-flash'),
    thornRatio: thornRatio(amuletTraits),
  }
}

function stateText(first: Combatant, second: Combatant): string {
  return `【状态】${first.username} HP:${at(first.hp)}/${first.stats.maxHp} | ${second.username} HP:${at(second.hp)}/${second.stats.maxHp}`
}

function cloneCombatant(combatant: Combatant): Combatant {
  return { ...combatant, stats: { ...combatant.stats }, amuletTraits: [...combatant.amuletTraits] }
}

function applySnakeEye(combatant: Combatant, random: Random, events: BattleEvent[]) {
  if (!traitEffect(combatant, 'snake-eye')) return
  const multiplied = random() < 0.5
  const factor = multiplied ? 2 : 0.5
  combatant.stats = {
    ...combatant.stats,
    maxHp: Math.max(1, Math.round(combatant.stats.maxHp * factor)),
    attack: Math.max(1, Math.round(combatant.stats.attack * factor)),
    critChance: Math.min(100, Math.max(0, combatant.stats.critChance * factor)),
  }
  combatant.baseAttack = combatant.stats.attack
  combatant.hp = combatant.stats.maxHp
  addEvent(events, `【蛇眼】${combatant.username} 的生命、攻击和暴击率${multiplied ? '翻倍' : '减半'}！`, combatant)
}

function statusImmune(combatant: Combatant, random: Random): boolean {
  return traitEffect(combatant, 'endurance') && percent(random, 50)
}

function addBleed(target: Combatant, source: Combatant, events: BattleEvent[], random: Random) {
  if (statusImmune(target, random)) {
    addEvent(events, `${target.username} 通过【耐力】免疫了流血！`, target)
    return
  }
  target.bleeding = 3
  target.bleedAttack = source.stats.attack
  addEvent(events, `${target.username} 进入流血状态，持续3回合！`, source)
}

function applyStun(target: Combatant, events: BattleEvent[], random: Random, source: Combatant, text: string) {
  if (statusImmune(target, random)) {
    addEvent(events, `${target.username} 通过【耐力】免疫了${text}！`, target)
    return
  }
  target.stunned = true
  addEvent(events, `${target.username} 被${text}眩晕一回合！`, source)
}

function applyFreeze(target: Combatant, events: BattleEvent[], random: Random, source: Combatant, text = '冰冻') {
  if (statusImmune(target, random)) {
    addEvent(events, `${target.username} 通过【耐力】免疫了冰冻！`, target)
    return
  }
  target.frozen = true
  addEvent(events, `${target.username} 被${text}冰冻一回合！`, source)
}

function heal(combatant: Combatant, amount: number, events: BattleEvent[], label: string) {
  const before = combatant.hp
  combatant.hp = Math.min(combatant.stats.maxHp, combatant.hp + amount)
  addEvent(events, `${combatant.username} 通过【${label}】回复 ${at(combatant.hp - before)} 点生命！`, combatant)
}

function resetForRestart(target: Combatant, opening: Combatant) {
  Object.assign(target, cloneCombatant(opening))
}

function pickItem(combatant: Combatant, random: Random): { id: string; slot: 1 | 2 } | undefined {
  const available = [
    !combatant.item1Used && combatant.item1Id ? { id: combatant.item1Id, slot: 1 as const } : undefined,
    !combatant.item2Used && combatant.item2Id ? { id: combatant.item2Id, slot: 2 as const } : undefined,
  ].filter(Boolean) as { id: string; slot: 1 | 2 }[]
  return available.length ? available[Math.min(available.length - 1, Math.floor(random() * available.length))] : undefined
}

function hasAvailableItem(combatant: Combatant): boolean {
  return Boolean((combatant.item1Id && !combatant.item1Used) || (combatant.item2Id && !combatant.item2Used))
}

function useItem(
  combatant: Combatant,
  defender: Combatant,
  random: Random,
  events: BattleEvent[],
  deal: (raw: number, critical?: boolean) => DamageResult,
): DamageResult | false {
  const picked = pickItem(combatant, random)
  if (!picked) return false
  if (picked.slot === 1) combatant.item1Used = true
  else combatant.item2Used = true
  const item = getEquipment(picked.id)
  if (!item) return false
  addEvent(events, `${combatant.username} 使用道具【${item.name}】！`, combatant)

  switch (item.effectId) {
    case 'circular-turret':
      combatant.turretEffect = 'circular'
      combatant.turretTurns = 1000
      addEvent(events, `${combatant.username} 召唤了圆斩箭塔！`, combatant)
      return 'survived'
    case 'heavy-turret':
      combatant.turretEffect = 'heavy'
      combatant.turretTurns = 1000
      combatant.damageDealtMultiplier *= 1.2
      addEvent(events, `${combatant.username} 召唤了重型箭塔，伤害提升20%！`, combatant)
      return 'survived'
    case 'bear-trap':
      applyStun(defender, events, random, combatant, '捕兽夹')
      return 'survived'
    case 'explosive-decoy':
      combatant.decoyActive = true
      combatant.decoyHp = 20
      addEvent(events, `${combatant.username} 放置了20点生命的爆炸诱饵！`, combatant)
      return 'survived'
    case 'powerful-grenade':
      return deal(combatant.stats.attack * 1.5)
    case 'cluster-grenade':
      for (let index = 0; index < 6; index++) {
        const result = deal(10, percent(random, 20))
        addEvent(events, `${combatant.username} 的集束手雷第${index + 1}枚命中！`, combatant)
        if (result !== 'survived') return result
      }
      return 'survived'
    case 'flashbang':
      applyStun(defender, events, random, combatant, '闪光弹')
      return 'survived'
    case 'frost-grenade':
      applyFreeze(defender, events, random, combatant, '冰冻手雷')
      return 'survived'
    case 'hunter-grenade':
      combatant.hunterReady = true
      addEvent(events, '猎人手雷已标记对手，胜利后将复制一件装备！', combatant)
      return 'survived'
    case 'whirlwind-knife':
      {
        const result = deal(15)
        if (result !== 'survived') return result
        addBleed(defender, combatant, events, random)
        return 'survived'
      }
    case 'corrupted-power':
      combatant.stats.critChance = 100
      combatant.damageTakenMultiplier *= 1.5
      addEvent(events, `${combatant.username} 的暴击率提升至100%，但受到额外50%伤害！`, combatant)
      return 'survived'
    case 'vampirism-item':
      {
        const defenderHp = defender.hp
        const result = deal(combatant.stats.attack)
        const dealt = Math.max(0, defenderHp - defender.hp)
        if (dealt > 0) heal(combatant, dealt, events, '吸血（道具）')
        return result
      }
    case 'displacement':
      combatant.nextAttackMultiplier = 2
      addEvent(events, '下一次攻击伤害翻倍！', combatant)
      return 'survived'
    case 'rift-aura':
      combatant.riftAuraTurns = 3
      addEvent(events, '撕裂光环将在接下来3回合持续造成伤害！', combatant)
      return 'survived'
    case 'war-owl':
      combatant.owlActive = true
      combatant.owlCritBelowHalf = true
      addEvent(events, '战争巨枭加入战斗！', combatant)
      return 'survived'
    case 'serenade':
      combatant.owlActive = true
      combatant.nightSongActive = true
      addEvent(events, '夜歌加入战斗，并准备抵挡一次死亡！', combatant)
      return 'survived'
    case 'health-flask':
      heal(combatant, combatant.stats.maxHp * 0.5, events, '血瓶')
      return 'survived'
    default:
      return 'survived'
  }
}

export function simulateBattle(
  first: DeadcellsPlayer,
  second: DeadcellsPlayer,
  config: GameConfig,
  random: Random = Math.random,
): BattleResult {
  const left = createCombatant(first)
  const right = createCombatant(second)
  const events: BattleEvent[] = []
  applySnakeEye(left, random, events)
  applySnakeEye(right, random, events)
  left.initiativeWeight = initiativeWeight(left)
  right.initiativeWeight = initiativeWeight(right)
  const leftFirst = random() < left.initiativeWeight / (left.initiativeWeight + right.initiativeWeight)
  let attacker = leftFirst ? left : right
  let defender = leftFirst ? right : left
  const openingLeft = cloneCombatant(left)
  const openingRight = cloneCombatant(right)
  const openingAttackerId = attacker.userId
  let turns = 0
  let restartUsed = false

  addEvent(events, '已进入王座之间，准备决一死战！')
  addEvent(events, `${left.username}：HP ${left.stats.maxHp} | 攻击 ${left.stats.attack} |【${getEquipment(first.weaponId)?.name || '无'}】|【${getEquipment(first.shieldId)?.name || '无副手'}】`, left)
  addEvent(events, `${right.username}：HP ${right.stats.maxHp} | 攻击 ${right.stats.attack} |【${getEquipment(second.weaponId)?.name || '无'}】|【${getEquipment(second.shieldId)?.name || '无副手'}】`, right)
  addEvent(events, `🎲${attacker.username} 获得了先手！`, attacker)

  const restart = () => {
    resetForRestart(left, openingLeft)
    resetForRestart(right, openingRight)
    attacker = openingAttackerId === left.userId ? left : right
    defender = attacker === left ? right : left
    turns = 0
    addEvent(events, '【时光之末】触发，所有状态回到对局开始！')
  }

  const takeDamage = (source: Combatant, target: Combatant, raw: number, options: { bypassDecoy?: boolean; bypassBlock?: boolean; nonLethal?: boolean; damageDealtMultiplier?: number; fixedDamage?: number; critical?: boolean; weaponDamage?: boolean; reflected?: boolean } = {}): DamageResult => {
    if (!options.bypassDecoy && target.decoyActive) {
      target.decoyHp = Math.max(0, target.decoyHp - raw)
      addEvent(events, `${target.username} 的爆炸诱饵承受 ${at(raw)} 点伤害，剩余 ${at(target.decoyHp)} 点！`, target)
      if (target.decoyHp <= 0) {
        target.decoyActive = false
        addEvent(events, `${target.username} 的爆炸诱饵爆炸！`, target)
        return takeDamage(target, target === left ? right : left, target.stats.attack * 0.5, { bypassDecoy: true, weaponDamage: false })
      }
      return 'survived'
    }
    const targetPlayer = target === left ? first : second
    const sourcePlayer = source === left ? first : second
    const targetShield = getEquipment(targetPlayer.shieldId)
    if (target.invincible) {
      target.invincible = false
      addEvent(events, `${target.username} 的护盾效果使本次攻击无效！`, target)
      return 'survived'
    }
    if (!options.bypassBlock && options.weaponDamage !== false && targetShield?.blockRate && !getEquipment(sourcePlayer.weaponId)?.ignoreShield) {
      const blockTrait = target.amuletTraits
        .map(getAmuletTrait)
        .reduce((total, trait) => total + (trait?.offhandBlockBonus || 0), 0)
      const blockRate = Math.min(100, targetShield.blockRate + blockTrait)
      if (percent(random, blockRate)) {
        addEvent(events, `${target.username} 使用【${targetShield.name}】成功格挡攻击！`, target)
        if (getEquipment(sourcePlayer.weaponId)?.effectId === 'blocked-crit') {
          const blockedCritDamage = options.critical ? raw : raw * 2
          addEvent(events, `${source.username} 的钉入矛穿透格挡并造成暴击！`, source)
          return takeDamage(source, target, blockedCritDamage, {
            bypassDecoy: true,
            bypassBlock: true,
            damageDealtMultiplier: options.damageDealtMultiplier,
            critical: true,
            weaponDamage: true,
          })
        }
        if (targetShield.shieldEffect === 'stun') applyStun(source, events, random, target, '击晕盾')
        if (targetShield.shieldEffect === 'freeze') applyFreeze(source, events, random, target, '寒冰盾')
        if (targetShield.shieldEffect === 'reflect') {
          addEvent(events, `${target.username} 的尖刺盾反弹本次最终伤害！`, target)
          const finalDamage = raw
            * (options.damageDealtMultiplier ?? source.damageDealtMultiplier)
            * target.damageTakenMultiplier
            * source.markedDamageMultiplier
          return takeDamage(target, source, 0, { bypassDecoy: true, bypassBlock: true, fixedDamage: finalDamage, weaponDamage: false, reflected: true })
        }
        if (targetShield.shieldEffect === 'invincible') {
          target.invincible = true
          addEvent(events, `${target.username} 获得下一次受击无敌！`, target)
        }
        if (targetShield.shieldEffect === 'steal') {
          const stolen = Math.min(source.cells, Math.ceil(source.cells * 0.1))
          source.cells -= stolen
          target.cells += stolen
          addEvent(events, `${target.username} 通过贪婪盾偷取 ${stolen} 个细胞！`, target)
        }
        if (targetShield.effectId === 'frontline') {
          target.frontlineTurns = 3
          if (!target.frontlineBoostActive) {
            target.frontlineBoostActive = true
            target.damageDealtMultiplier *= 1.5
          }
          addEvent(events, `${target.username} 的前线盾使接下来3回合伤害提升50%！`, target)
        }
        if (targetShield.effectId === 'assault') {
          const assault = takeDamage(target, source, 20, { bypassDecoy: true, bypassBlock: true, weaponDamage: false })
          applyStun(source, events, random, target, '盾牌突击')
          if (assault !== 'survived') return assault
        }
        return 'survived'
      }
    }
    let damage = options.fixedDamage !== undefined
      ? options.fixedDamage
      : raw
        * (options.damageDealtMultiplier ?? source.damageDealtMultiplier)
        * target.damageTakenMultiplier
        * source.markedDamageMultiplier
    const firstAttacker = leftFirst ? left : right
    if (hasTrait(target, 'counterattack') && target !== firstAttacker && !target.firstDamageReduced) {
      target.firstDamageReduced = true
      damage *= 0.5
      addEvent(events, `${target.username} 的【后发制人】使首次受伤降低50%！`, target)
    }
    if (!options.reflected && !source.coldForgingUsed && traitEffect(source, 'cold-forging') && damage > 0) {
      damage *= 2
      source.coldForgingUsed = true
      addEvent(events, `${source.username} 触发【寒气练成】，本次伤害翻倍！`, source)
    }
    target.hp = Math.max(0, target.hp - damage)
    addEvent(events, `${target.username} 受到 ${at(damage)} 点伤害！`, target)
    if (options.weaponDamage && !options.reflected && target.thornRatio > 0 && damage > 0) {
      const reflectedDamage = damage * target.thornRatio
      addEvent(events, `${target.username} 的【荆棘】反弹 ${at(reflectedDamage)} 点伤害！`, target)
      const reflected = takeDamage(target, source, reflectedDamage, {
        bypassDecoy: true,
        bypassBlock: true,
        fixedDamage: reflectedDamage,
        reflected: true,
      })
      if (reflected !== 'survived') return reflected
    }
    if (targetShield?.effectId === 'damage-reduction') {
      // The multiplier is initialized on the combatant; this branch keeps the log explicit.
      addEvent(events, `${target.username} 的力场盾已降低所受伤害30%！`, target)
    }
    if (getEquipment(targetPlayer.weaponId)?.effectId === 'retaliation-crit') target.retaliationReady = true
    if (target.hp > 0) return 'survived'
    if (options.nonLethal) {
      target.hp = 1
      return 'survived'
    }
    if (target.nightSongActive && !target.nightSongUsed) {
      target.nightSongUsed = true
      target.nightSongActive = false
      target.hp = 1
      addEvent(events, `${target.username} 的夜歌抵挡了致命伤害，保留1点生命！`, target)
      return 'survived'
    }
    if (hasTrait(target, 'last-stand') && !target.deathProtectionUsed) {
      target.deathProtectionUsed = true
      target.hp = 1
      addEvent(events, `${target.username} 的【死里逃生】触发，保留1点生命！`, target)
      return 'survived'
    }
    if (traitEffect(target, 'end-of-time') && !restartUsed) {
      restartUsed = true
      restart()
      return 'restarted'
    }
    return 'dead'
  }

  const hit = (source: Combatant, target: Combatant, attackPower: number, critical: boolean, damageDealtMultiplier?: number, weaponDamage = true): DamageResult => {
    if (!source.passiveDamageChecked) {
      source.passiveDamageChecked = true
    if (traitEffect(source, 'instant-death') && percent(random, 10)) {
      target.hp = 0
      addEvent(events, `${source.username} 的【直死魔眼】触发，即死！`, source)
      return 'dead'
    }
    }
    const critMultiplier = critical ? 2 * source.extraCritDamageMultiplier : 1
    const result = takeDamage(source, target, attackPower * critMultiplier * source.nextAttackMultiplier, { damageDealtMultiplier, critical, weaponDamage })
    if (result === 'restarted' || result === 'dead') return result
    if (critical && source.extraCritDamageMultiplier !== critDamageMultiplier(source.amuletTraits)) source.extraCritDamageMultiplier = critDamageMultiplier(source.amuletTraits)
    if (critical && traitEffect(target, 'war-cry')) target.extraCritDamageMultiplier = critDamageMultiplier(target.amuletTraits) * 2
    if (traitEffect(source, 'amulet-vampirism')) heal(source, attackPower * critMultiplier * 0.5, events, '吸血（词条）')
    return result
  }

  let meteorWinnerId: string | undefined
  if (left.meteorFlash || right.meteorFlash) {
    addEvent(events, '【流星一闪】开局爆发，敌我双方各受到90点伤害！')
    left.hp = Math.max(0, left.hp - 90)
    right.hp = Math.max(0, right.hp - 90)
    if (left.hp <= 0 && right.hp <= 0) meteorWinnerId = left.meteorFlash ? left.userId : right.userId
  }

  const applyOngoing = (source: Combatant, target: Combatant): DamageResult => {
    if (source.bleeding > 0) {
      const result = takeDamage(source, source, source.bleedAttack * 0.5, { bypassDecoy: true, bypassBlock: true, nonLethal: true, weaponDamage: false })
      source.bleeding--
      if (result !== 'survived') return result
    }
    if (source.riftAuraTurns > 0) {
      const result = takeDamage(source, target, 20, { weaponDamage: false })
      source.riftAuraTurns--
      if (result !== 'survived') return result
    }
    if (source.turretEffect && source.turretTurns > 0) {
      const result = takeDamage(source, target, source.baseAttack * (source.turretEffect === 'circular' ? 0.5 : 1), { weaponDamage: false })
      source.turretTurns--
      if (result !== 'survived') return result
      if (source.turretEffect === 'circular') addBleed(target, source, events, random)
    }
    if (source.owlActive) {
      const critical = source.owlCritBelowHalf && source.hp < source.stats.maxHp * 0.5
      const result = hit(source, target, source.baseAttack, critical, undefined, false)
      if (result !== 'survived') return result
    }
    return 'survived'
  }

  const action = (source: Combatant, target: Combatant): DamageResult => {
    source.actionCount++
    source.passiveDamageChecked = false
    const offhandCooling = source.offhandCooldown > 0
    if (offhandCooling) source.offhandCooldown--
    const ongoing = applyOngoing(source, target)
    if (ongoing !== 'survived') return ongoing
    if (source.stunned || source.frozen) {
      const status = source.frozen ? '冰冻' : '眩晕'
      addEvent(events, `${source.username} 处于${status}状态，无法行动！`, source)
      source.stunned = false
      source.frozen = false
      return 'survived'
    }

    const weapon = getEquipment(source === left ? first.weaponId : second.weaponId)
    const mustCharge = weapon?.effectId === 'heavy-charge' && !source.heavyChargeUsed
    const firstSpearCharge = weapon?.effectId === 'charge' && !source.warSpearCharged
    if (mustCharge || firstSpearCharge) {
      if (mustCharge) source.heavyChargeUsed = true
      if (firstSpearCharge) source.warSpearCharged = true
      source.charging = true
      addEvent(events, `${source.username} 进行蓄力，本回合无法攻击或使用道具！`, source)
      return 'survived'
    }
    source.charging = false

    if (weapon?.effectId === 'preemptive-stun' && source !== (leftFirst ? left : right) && percent(random, 30)) {
      source.attackCount++
      const preemptiveCritical = percent(random, Math.min(100, source.stats.critChance))
      addEvent(events, `${source.username} 使用斯巴达草鞋提前攻击！${preemptiveCritical ? '触发暴击！' : ''}`, source)
      const result = hit(source, target, source.stats.attack + source.balancedBonus, preemptiveCritical)
      if (result !== 'survived') return result
      applyStun(target, events, random, source, '斯巴达草鞋')
      return 'survived'
    }

    const offhand = getEquipment(source === left ? first.shieldId : second.shieldId)
    if (!offhandCooling && offhand?.type === 'offhand') {
      let useOffhand = false
      if (offhand.effectId === 'ice-bow' || offhand.effectId === 'bleed') useOffhand = true
      if (offhand.skill === 'north-star' && source.markedDamageMultiplier === 1) {
        useOffhand = percent(random, config.skillRate)
      }
      if (useOffhand) {
        source.offhandCooldown = 3
        addEvent(events, `${source.username} 使用副手【${offhand.name}】，本回合不进行主武器攻击！`, source)
        if (offhand.effectId === 'ice-bow') {
          const result = takeDamage(source, target, 10, { weaponDamage: false })
          if (result !== 'survived') return result
          applyFreeze(target, events, random, source, '冰之弓')
        } else if (offhand.effectId === 'bleed') {
          addBleed(target, source, events, random)
        } else if (offhand.skill === 'north-star') {
          source.markedDamageMultiplier = 1.5
          addEvent(events, `${source.username} 触发【北斗标记】，本局伤害提升50%！`, source)
        }
        return 'survived'
      }
    }

    if (hasAvailableItem(source) && percent(random, config.itemUseRate)) {
      const used = useItem(source, target, random, events, (raw, critical = false) => hit(source, target, raw, critical, undefined, false))
      if (used !== false) return used
    }

    source.attackCount++
    const lowHpBruteForce = traitEffect(source, 'brute-force') && source.hp < source.stats.maxHp * 0.5
    let attackPower = source.stats.attack + source.balancedBonus
    if (lowHpBruteForce) attackPower *= 2
    let guaranteedCrit = Boolean(weapon?.alwaysCrit)
    if (weapon?.guaranteedCritAttacks?.includes(source.attackCount)) guaranteedCrit = true
    if (weapon?.lowHpCrit && source.hp < source.stats.maxHp * 0.5) guaranteedCrit = true
    if (weapon?.frozenTargetCrit && target.frozen) guaranteedCrit = true
    if (weapon?.effectId === 'even-crit' && turns % 2 === 0) guaranteedCrit = true
    if (weapon?.effectId === 'third-turn-crit' && turns === 3) guaranteedCrit = true
    if (weapon?.effectId === 'first-turn-crit' && turns === 1) guaranteedCrit = true
    if (weapon?.effectId === 'lightning-beam' && turns >= 2) guaranteedCrit = true
    if (weapon?.effectId === 'retaliation-crit' && source.retaliationReady) guaranteedCrit = true
    source.retaliationReady = false
    if (source.warSpearCharged) {
      guaranteedCrit = true
      source.warSpearCharged = false
    }
    if (weapon?.skill && percent(random, config.skillRate)) {
      guaranteedCrit = true
      addEvent(events, `${source.username} 触发技能【${weapon.skill}】！`, source)
    }
    let attackDamageMultiplier: number | undefined
    if (hasTrait(source, 'first-strike') && source === (leftFirst ? left : right) && !source.firstDamageBoosted) {
      source.firstDamageBoosted = true
      attackDamageMultiplier = source.damageDealtMultiplier * 1.5
    }
    const critChance = lowHpBruteForce ? Math.min(100, source.stats.critChance * 2) : source.stats.critChance
    const critical = guaranteedCrit || percent(random, Math.min(100, critChance))
    const hitCount = weapon?.effectId === 'double-hit' ? 2 : weapon?.effectId === 'triple-hit' ? 3 : 1
    let result: DamageResult = 'survived'
    for (let index = 0; index < hitCount; index++) {
      const separateCritical = index === 0 ? critical : guaranteedCrit || percent(random, Math.min(100, critChance))
      addEvent(events, `${source.username} 发动第${index + 1}段攻击！${separateCritical ? '触发暴击！' : ''} 攻击力：${at(attackPower)}`, source)
      result = hit(source, target, attackPower, separateCritical, attackDamageMultiplier)
      if (result !== 'survived') return result
      if (weapon?.effectId === 'blood-blade' || weapon?.effectId === 'bleed') addBleed(target, source, events, random)
      if (weapon?.stunRate && percent(random, weapon.stunRate)) applyStun(target, events, random, source, '胡桃夹子')
    }
    if (weapon?.effectId === 'electric-damage') {
      const roll = random()
      const extraHits = roll < 0.1 ? 3 : roll < 0.3 ? 1 : 0
      for (let index = 0; index < extraHits; index++) {
        result = hit(source, target, attackPower, critical, attackDamageMultiplier)
        if (result !== 'survived') return result
      }
    }
    if (weapon?.effectId === 'lightning-beam') {
      result = takeDamage(source, source, attackPower * 0.5, { bypassDecoy: true, bypassBlock: true, weaponDamage: false })
      if (result !== 'survived') return result
    }
    if (weapon?.effectId === 'heavy-charge') source.heavyChargeUsed = false
    if (weapon?.balancedStack) {
      source.balancedBonus += weapon.balancedStack
      addEvent(events, `【均衡之刃】攻击力叠加！当前额外攻击 +${source.balancedBonus}`, source)
    }
    if (source.nextAttackMultiplier !== 1) source.nextAttackMultiplier = 1
    return 'survived'
  }

  while (left.hp > 0 && right.hp > 0 && turns < config.maxBattleTurns) {
    turns++
    addEvent(events, `【第 ${turns} 回合】`, attacker)
    const result = action(attacker, defender)
    if (result === 'restarted') continue
    // Keep the status line in the original left/right order even when initiative swaps.
    addEvent(events, stateText(left, right))
    if (left.hp <= 0 || right.hp <= 0) break
    if (attacker.frontlineTurns > 0) attacker.frontlineTurns--
    if (attacker.frontlineTurns === 0 && attacker.frontlineBoostActive) {
      attacker.damageDealtMultiplier /= 1.5
      attacker.frontlineBoostActive = false
    }
    ;[attacker, defender] = [defender, attacker]
  }

  if (left.hp > 0 && right.hp > 0) {
    const leftScore = left.hp / left.stats.maxHp
    const rightScore = right.hp / right.stats.maxHp
    if (leftScore === rightScore) {
      if (random() < 0.5) left.hp = 0
      else right.hp = 0
    } else if (leftScore > rightScore) right.hp = 0
    else left.hp = 0
    addEvent(events, '战斗达到最大回合数，按剩余生命比例判定胜负！')
  }

  const winner = meteorWinnerId === left.userId ? left : meteorWinnerId === right.userId ? right : left.hp > 0 ? left : right
  const loser = winner === left ? right : left
  const cellSafe = traitEffect(loser, 'cell-safe')
  const greedCellMultiplier = greedMultiplier(winner)
  const baseTransfer = Math.ceil(loser.cells * config.cellTransferRate / 100)
  const cellTransfer = cellSafe ? 0 : baseTransfer * greedCellMultiplier
  const bonusCells = 1000 * greedCellMultiplier
  loser.cells = Math.max(0, loser.cells - (cellSafe ? 0 : baseTransfer))
  winner.cells += cellTransfer + bonusCells
  addEvent(events, '====================')
  addEvent(events, `【战斗结束】${winner.username} 获胜！`)
  addEvent(events, `获得细胞 ${cellTransfer} 个，额外奖励 ${bonusCells} 个，战败者剩余细胞 ${loser.cells} 个。`, winner)

  let droppedEquipment: BattleResult['droppedEquipment']
  if (winner.hunterReady) {
    const loserPlayer = loser === left ? first : second
    const candidates: NonNullable<BattleResult['droppedEquipment']>[] = []
    if (loserPlayer.weaponId) candidates.push({ type: 'weapon', id: loserPlayer.weaponId })
    if (loserPlayer.shieldId) candidates.push({ type: 'offhand', id: loserPlayer.shieldId })
    if (loserPlayer.item1Id) candidates.push({ type: 'item', id: loserPlayer.item1Id })
    if (loserPlayer.item2Id) candidates.push({ type: 'item', id: loserPlayer.item2Id })
    if (loserPlayer.amuletId) candidates.push({ type: 'amulet', id: loserPlayer.amuletId, traits: parseAmuletTraits(loserPlayer.amuletTraits) })
    if (candidates.length) droppedEquipment = candidates[Math.floor(random() * candidates.length)]
  }

  return {
    attacker: left,
    defender: right,
    winnerId: winner.userId,
    loserId: loser.userId,
    events,
    turns,
    cellTransfer,
    bonusCells,
    droppedEquipment,
  }
}
