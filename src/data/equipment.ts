import { randomAmuletTrait } from './amulets'
import type { WeaponQuality } from '../types'

export type EquipmentType = 'weapon' | 'offhand' | 'item'

export interface EquipmentReward extends EquipmentDefinition {
  weaponQuality?: WeaponQuality
  weaponTrait?: string | null
}

export interface EquipmentDefinition {
  id: string
  name: string
  type: EquipmentType
  description: string
  attackBonus?: number
  critBonus?: number
  blockRate?: number
  balancedStack?: number
  skill?: string
  alwaysCrit?: boolean
  guaranteedCritAttacks?: number[]
  cursed?: boolean
  stunRate?: number
  frozenTargetCrit?: boolean
  ignoreShield?: boolean
  lowHpCrit?: boolean
  shieldEffect?: 'stun' | 'reflect' | 'invincible' | 'steal' | 'freeze'
  effectId?: string
}

export const equipmentList: EquipmentDefinition[] = [
  { id: 'rusty-knife', name: '生锈的刀', type: 'weapon', description: '攻击力+5', attackBonus: 5 },
  { id: 'balanced-blade', name: '均衡之刃', type: 'weapon', description: '攻击力+5，每次攻击后额外攻击力+5', attackBonus: 5, balancedStack: 5 },
  { id: 'assassins-dagger', name: '刺客匕首', type: 'weapon', description: '攻击力+5，30%概率使用背刺并必定暴击', attackBonus: 5, skill: 'backstab' },
  { id: 'great-sword', name: '大剑', type: 'weapon', description: '攻击力+8，第二和第三次攻击必定暴击', attackBonus: 8, guaranteedCritAttacks: [2, 3] },
  { id: 'cursed-sword', name: '诅咒之刃', type: 'weapon', description: '攻击力+50，攻击必定暴击，最大生命值变为1', attackBonus: 50, alwaysCrit: true, cursed: true },
  { id: 'nutcracker', name: '胡桃夹子', type: 'weapon', description: '攻击力+8，命中后30%概率眩晕，攻击冰冻目标必定暴击', attackBonus: 8, stunRate: 30, frozenTargetCrit: true },
  { id: 'crackling-whip', name: '缠绕鞭', type: 'weapon', description: '攻击力+5，无视对手盾牌', attackBonus: 5, ignoreShield: true },
  { id: 'berserker-blade', name: '狂暴之刃', type: 'weapon', description: '攻击力+8，生命值低于50%时必定暴击', attackBonus: 8, lowHpCrit: true },
  { id: 'katana', name: '武士刀', type: 'weapon', description: '攻击力+8，30%概率使用穿刺并必定暴击', attackBonus: 8, skill: 'pierce' },
  { id: 'resentment-blade', name: '怨恨之刃', type: 'weapon', description: '攻击力+8，受到攻击后的攻击必定暴击', attackBonus: 8, effectId: 'retaliation-crit' },
  { id: 'blood-blade', name: '血之刃', type: 'weapon', description: '攻击力+8，攻击造成流血，持续3回合', attackBonus: 8, effectId: 'bleed' },
  { id: 'twin-daggers', name: '双匕首', type: 'weapon', description: '攻击力-5，每次攻击造成两次独立伤害', attackBonus: -5, effectId: 'double-hit' },
  { id: 'war-spear', name: '战矛', type: 'weapon', description: '攻击力+10，蓄力后下一次攻击必定暴击', attackBonus: 10, effectId: 'charge' },
  { id: 'impaling-spear', name: '钉入矛', type: 'weapon', description: '攻击力+8，对方格挡时无视格挡并造成暴击', attackBonus: 8, effectId: 'blocked-crit' },
  { id: 'symmetrical-lance', name: '对称长枪', type: 'weapon', description: '攻击力+10，暴击率+10%', attackBonus: 10, critBonus: 10 },
  { id: 'spartan-sandals', name: '斯巴达草鞋', type: 'weapon', description: '攻击力+5，后手回合30%概率提前攻击并眩晕', attackBonus: 5, effectId: 'preemptive-stun' },
  { id: 'falcon-boots', name: '隼之靴', type: 'weapon', description: '攻击力+8，第2、4、6等双数回合必定暴击', attackBonus: 8, effectId: 'even-crit' },
  { id: 'valmont-whip', name: '瓦尔蒙特长鞭', type: 'weapon', description: '攻击力+8，无视护盾，30%概率触发极限距离并暴击', attackBonus: 8, ignoreShield: true, skill: 'extreme-range' },
  { id: 'multi-bow', name: '多头弓', type: 'weapon', description: '攻击力-8，每次攻击造成3次独立伤害', attackBonus: -8, effectId: 'triple-hit' },
  { id: 'infinite-bow', name: '无限箭制弓', type: 'weapon', description: '攻击力+10，暴击率+10%，第三回合必定暴击', attackBonus: 10, critBonus: 10, effectId: 'third-turn-crit' },
  { id: 'infantry-bow', name: '步兵短弓', type: 'weapon', description: '攻击力+5，第1回合必定暴击', attackBonus: 5, effectId: 'first-turn-crit' },
  { id: 'heavy-crossbow', name: '重型弩弓', type: 'weapon', description: '攻击力+20，暴击率+25%，需要蓄力1回合', attackBonus: 20, critBonus: 25, effectId: 'heavy-charge' },
  { id: 'explosive-crossbow', name: '爆炸十字弓', type: 'weapon', description: '攻击必定暴击', alwaysCrit: true },
  { id: 'electric-whip', name: '电鞭', type: 'weapon', description: '无视护盾，20%伤害×2，10%伤害×4', ignoreShield: true, effectId: 'electric-damage' },
  { id: 'lightning-beam', name: '闪电光束', type: 'weapon', description: '攻击力+8，第二回合起必定暴击，自身承受攻击力50%伤害', attackBonus: 8, effectId: 'lightning-beam' },
  { id: 'old-wooden-shield', name: '老木盾', type: 'offhand', description: '20%概率格挡攻击', blockRate: 20 },
  { id: 'stun-shield', name: '击晕盾', type: 'offhand', description: '20%概率格挡，成功后眩晕对手一回合', blockRate: 20, shieldEffect: 'stun' },
  { id: 'spiked-shield', name: '尖刺盾', type: 'offhand', description: '20%概率格挡，反弹本次最终伤害', blockRate: 20, shieldEffect: 'reflect' },
  { id: 'rampart-shield', name: '壁垒盾', type: 'offhand', description: '20%概率格挡，成功后下一次受到攻击时无敌', blockRate: 20, shieldEffect: 'invincible' },
  { id: 'greed-shield', name: '贪婪盾', type: 'offhand', description: '20%概率格挡，成功后偷取对手当前10%的细胞', blockRate: 20, shieldEffect: 'steal' },
  { id: 'ice-shield', name: '寒冰盾', type: 'offhand', description: '20%概率格挡，成功后冰冻对手一回合', blockRate: 20, shieldEffect: 'freeze' },
  { id: 'ice-bow', name: '冰之弓', type: 'offhand', description: '造成10伤害，冰冻对手一回合', effectId: 'ice-bow' },
  { id: 'north-star-bow', name: '北斗之弓', type: 'offhand', description: '30%概率使用北斗标记，使本局伤害提升至150%', skill: 'north-star' },
  { id: 'throwing-knife', name: '飞刀', type: 'offhand', description: '攻击造成流血', effectId: 'bleed' },
  { id: 'frontline-shield', name: '前线盾', type: 'offhand', description: '20%概率格挡，成功后3回合伤害提升至150%', blockRate: 20, effectId: 'frontline' },
  { id: 'assault-shield', name: '突击盾', type: 'offhand', description: '20%概率格挡，成功后盾牌突击造成20伤害并眩晕', blockRate: 20, effectId: 'assault' },
  { id: 'force-shield', name: '力场盾', type: 'offhand', description: '无法格挡，受到伤害降低30%', effectId: 'damage-reduction' },
  { id: 'circular-turret', name: '圆斩箭塔', type: 'item', description: '召唤箭塔，每回合造成基础攻击50%伤害并流血', effectId: 'circular-turret' },
  { id: 'heavy-turret', name: '重型箭塔', type: 'item', description: '召唤箭塔，每回合造成基础攻击伤害，自身伤害提升20%', effectId: 'heavy-turret' },
  { id: 'bear-trap', name: '捕兽夹', type: 'item', description: '使敌人定身一回合', effectId: 'bear-trap' },
  { id: 'explosive-decoy', name: '爆炸诱饵', type: 'item', description: '召唤20点生命诱饵，死亡后造成攻击力50%伤害', effectId: 'explosive-decoy' },
  { id: 'powerful-grenade', name: '强力手雷', type: 'item', description: '造成攻击力150%的伤害', effectId: 'powerful-grenade' },
  { id: 'cluster-grenade', name: '集束手雷', type: 'item', description: '造成6次10点伤害，每次20%概率暴击', effectId: 'cluster-grenade' },
  { id: 'flashbang', name: '闪光弹', type: 'item', description: '眩晕敌人一回合', effectId: 'flashbang' },
  { id: 'frost-grenade', name: '冰冻手雷', type: 'item', description: '冰冻敌人一回合', effectId: 'frost-grenade' },
  { id: 'hunter-grenade', name: '猎人手雷', type: 'item', description: '使用后击败对手必定复制对手一件装备', effectId: 'hunter-grenade' },
  { id: 'whirlwind-knife', name: '圆舞飞刀', type: 'item', description: '造成15伤害并流血', effectId: 'whirlwind-knife' },
  { id: 'corrupted-power', name: '堕落力量', type: 'item', description: '暴击率提升到100%，自身承受额外50%伤害', effectId: 'corrupted-power' },
  { id: 'vampirism-item', name: '吸血（道具）', type: 'item', description: '吸收对手相当于当前攻击力的伤害', effectId: 'vampirism-item' },
  { id: 'displacement', name: '位移', type: 'item', description: '下次攻击造成双倍伤害', effectId: 'displacement' },
  { id: 'rift-aura', name: '撕裂光环', type: 'item', description: '持续3回合每回合额外造成20伤害', effectId: 'rift-aura' },
  { id: 'war-owl', name: '战争巨枭', type: 'item', description: '召唤巨枭，每回合造成当前基础攻击力伤害', effectId: 'war-owl' },
  { id: 'serenade', name: '夜歌', type: 'item', description: '召唤夜歌，每回合造成基础攻击伤害并抵挡一次死亡', effectId: 'serenade' },
  { id: 'health-flask', name: '血瓶', type: 'item', description: '回复最大生命值的50%', effectId: 'health-flask' },
]

export const equipmentById = new Map(equipmentList.map((equipment) => [equipment.id, equipment]))

export function getEquipment(id: string | null | undefined): EquipmentDefinition | undefined {
  return id ? equipmentById.get(id) : undefined
}

export function randomEquipment(random: () => number, type?: EquipmentType): EquipmentDefinition {
  const pool = type ? equipmentList.filter((equipment) => equipment.type === type) : equipmentList
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
}

export function randomEquipmentChoices(random: () => number, count = 3): EquipmentDefinition[] {
  const pool = [...equipmentList]
  const result: EquipmentDefinition[] = []
  while (result.length < count && pool.length) {
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
    result.push(pool.splice(index, 1)[0])
  }
  return result
}

export function randomWeaponQuality(random: () => number): WeaponQuality {
  const roll = random()
  return roll < 0.75 ? 'normal' : roll < 0.95 ? 'gold' : 'colorless'
}

export function weaponQualityText(quality: WeaponQuality | null | undefined): string {
  return quality === 'gold' ? '金色' : quality === 'colorless' ? '无色' : '普通'
}

export function weaponQualityBonus(quality: WeaponQuality | null | undefined): { attack: number; crit: number } {
  return quality === 'gold' ? { attack: 5, crit: 5 } : { attack: 0, crit: 0 }
}

export function weaponQualityEffectText(quality: WeaponQuality | null | undefined): string {
  if (quality === 'gold') return '金色加成：攻击力+5，暴击率+5%'
  if (quality === 'colorless') return '无色品质：附带一个护符词条'
  return ''
}

export function createEquipmentReward(equipment: EquipmentDefinition, random: () => number, excludedTraits: string[] = []): EquipmentReward {
  if (equipment.type !== 'weapon') return equipment
  const weaponQuality = randomWeaponQuality(random)
  return {
    ...equipment,
    weaponQuality,
    weaponTrait: weaponQuality === 'colorless' ? randomAmuletTrait(random, excludedTraits) || null : null,
  }
}

export function equipmentTypeText(type: EquipmentType): string {
  return type === 'weapon' ? '武器' : type === 'offhand' ? '副手' : '道具'
}
