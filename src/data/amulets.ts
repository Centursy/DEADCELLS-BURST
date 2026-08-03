export type AmuletRarity = 'common' | 'rare'

export interface AmuletDefinition {
  id: string
  name: string
  image: string
}

export interface AmuletTraitDefinition {
  id: string
  name: string
  rarity: AmuletRarity
  description: string
  attackBonus?: number
  critBonus?: number
  initiativeWeight?: number
  offhandBlockBonus?: number
  maxHpBonus?: number
  critDamageBonus?: number
  bossDamageMultiplier?: number
  thornRatio?: number
  effectId?: string
}

export const amuletList: AmuletDefinition[] = [
  { id: 'prisoner-necklace', name: '囚者颈环', image: '囚者颈环.webp' },
  { id: 'amulet-1', name: '炼化护符', image: '护符1.webp' },
  { id: 'amulet-2', name: '炼化护符', image: '护符2.webp' },
  { id: 'amulet-3', name: '炼化护符', image: '护符3.webp' },
  { id: 'amulet-4', name: '炼化护符', image: '护符4.webp' },
]

export const amuletTraitList: AmuletTraitDefinition[] = [
  { id: 'attack-1', name: '攻击1', rarity: 'common', description: '攻击+5', attackBonus: 5 },
  { id: 'attack-2', name: '攻击2', rarity: 'common', description: '攻击+8', attackBonus: 8 },
  { id: 'attack-3', name: '攻击3', rarity: 'rare', description: '攻击+10', attackBonus: 10 },
  { id: 'insight-1', name: '看破1', rarity: 'common', description: '暴击几率+5%', critBonus: 5 },
  { id: 'insight-2', name: '看破2', rarity: 'common', description: '暴击几率+10%', critBonus: 10 },
  { id: 'insight-3', name: '看破3', rarity: 'rare', description: '暴击几率+20%', critBonus: 20 },
  { id: 'initiative-1', name: '先攻1', rarity: 'common', description: '先攻权重60', initiativeWeight: 60 },
  { id: 'initiative-2', name: '先攻2', rarity: 'common', description: '先攻权重80', initiativeWeight: 80 },
  { id: 'initiative-3', name: '先攻3', rarity: 'rare', description: '先攻权重90', initiativeWeight: 90 },
  { id: 'offhand-1', name: '副手增强1', rarity: 'common', description: '副手格挡概率+10个百分点', offhandBlockBonus: 10 },
  { id: 'offhand-2', name: '副手增强2', rarity: 'common', description: '副手格挡概率+20个百分点', offhandBlockBonus: 20 },
  { id: 'offhand-3', name: '副手增强3', rarity: 'rare', description: '副手格挡概率+30个百分点', offhandBlockBonus: 30 },
  { id: 'endurance', name: '耐力', rarity: 'rare', description: '50%概率免疫眩晕、流血和冰冻', effectId: 'endurance' },
  { id: 'end-of-time', name: '时光之末', rarity: 'rare', description: '战败后仅一次回到对局开始重新开始本局', effectId: 'end-of-time' },
  { id: 'greed-1', name: '贪婪1', rarity: 'common', description: '细胞获取×2', effectId: 'greed-2' },
  { id: 'greed-2', name: '贪婪2', rarity: 'common', description: '细胞获取×3', effectId: 'greed-3' },
  { id: 'greed-3', name: '贪婪3', rarity: 'rare', description: '细胞获取×4', effectId: 'greed-4' },
  { id: 'amulet-vampirism', name: '吸血', rarity: 'rare', description: '攻击伤害的50%治疗自身', effectId: 'amulet-vampirism' },
  { id: 'cell-safe', name: '细胞保险箱', rarity: 'common', description: '对战失败不掉落细胞', effectId: 'cell-safe' },
  { id: 'snake-eye', name: '蛇眼', rarity: 'common', description: '战斗开始时随机翻倍或减半生命、攻击和暴击率', effectId: 'snake-eye' },
  { id: 'brute-force', name: '火场怪力', rarity: 'rare', description: '生命低于50%时攻击和暴击率翻倍', effectId: 'brute-force' },
  { id: 'instant-death', name: '直死魔眼', rarity: 'rare', description: '攻击有10%概率即死', effectId: 'instant-death' },
  { id: 'last-stand', name: '死里逃生', rarity: 'rare', description: '免疫一次致命伤害并保留1点生命', effectId: 'last-stand' },
  { id: 'counterattack', name: '后发制人', rarity: 'rare', description: '后手时首次受到的伤害降低50%', effectId: 'counterattack' },
  { id: 'first-strike', name: '先发制人', rarity: 'rare', description: '先手时首次造成的伤害提高50%', effectId: 'first-strike' },
  { id: 'war-cry', name: '宣战呼应', rarity: 'rare', description: '对方暴击后下一次暴击伤害×2', effectId: 'war-cry' },
  { id: 'storm-controller', name: '风暴管束者', rarity: 'common', description: 'Boss讨伐基础伤害×5', bossDamageMultiplier: 5 },
  { id: 'meteor-flash', name: '流星一闪', rarity: 'rare', description: '开局敌我双方各受到90点伤害，双方同时死亡时佩戴者获胜', effectId: 'meteor-flash' },
  { id: 'thorns-1', name: '荆棘1', rarity: 'common', description: '受到的武器伤害30%反弹给对手', thornRatio: 0.3 },
  { id: 'thorns-2', name: '荆棘2', rarity: 'common', description: '受到的武器伤害50%反弹给对手', thornRatio: 0.5 },
  { id: 'thorns-3', name: '荆棘3', rarity: 'rare', description: '受到的武器伤害70%反弹给对手', thornRatio: 0.7 },
  { id: 'elf-blessing-1', name: '精灵加护1', rarity: 'common', description: '最大生命值+10', maxHpBonus: 10 },
  { id: 'elf-blessing-2', name: '精灵加护2', rarity: 'common', description: '最大生命值+20', maxHpBonus: 20 },
  { id: 'elf-blessing-3', name: '精灵加护3', rarity: 'common', description: '最大生命值+30', maxHpBonus: 30 },
  { id: 'elf-blessing-4', name: '精灵加护4', rarity: 'common', description: '最大生命值+40', maxHpBonus: 40 },
  { id: 'elf-blessing-5', name: '精灵加护5', rarity: 'rare', description: '最大生命值+50', maxHpBonus: 50 },
  { id: 'super-crit-1', name: '超会心1', rarity: 'common', description: '暴击倍率提升至2.2倍', critDamageBonus: 0.2 },
  { id: 'super-crit-2', name: '超会心2', rarity: 'common', description: '暴击倍率提升至2.3倍', critDamageBonus: 0.3 },
  { id: 'super-crit-3', name: '超会心3', rarity: 'rare', description: '暴击倍率提升至2.5倍', critDamageBonus: 0.5 },
  { id: 'cold-forging', name: '寒气练成', rarity: 'rare', description: '每回合第一次造成伤害翻倍', effectId: 'cold-forging' },
  { id: 'prism-mirror', name: '棱镜之镜', rarity: 'rare', description: '主武器攻击有30%概率追加一次独立攻击', effectId: 'prism-mirror' },
  { id: 'shinobi-execution', name: '忍杀', rarity: 'rare', description: '主武器攻击生命低于20的对手时强制斩杀', effectId: 'shinobi-execution' },
  { id: 'golden-order', name: '黄金律法', rarity: 'common', description: '每回合回复最大生命值15%', effectId: 'golden-order' },
  { id: 'frenzied-flame', name: '癫火', rarity: 'rare', description: '暴击后25%概率同时眩晕敌我双方一回合', effectId: 'frenzied-flame' },
  { id: 'counter-stance', name: '反击架势', rarity: 'common', description: '受到伤害后下一次主武器攻击必定暴击', effectId: 'counter-stance' },
  { id: 'combo', name: '连击', rarity: 'common', description: '每次主武器攻击后攻击力+5', effectId: 'combo' },
  { id: 'starfury', name: '星怒', rarity: 'rare', description: '主武器暴击时追加一次独立攻击，暴击独立判定', effectId: 'starfury' },
  { id: 'offering', name: '祭品', rarity: 'rare', description: '开局失去99%最大生命，随后连续行动三回合', effectId: 'offering' },
  { id: 'wind-shadow', name: '风灵月影', rarity: 'rare', description: '开局1%概率直接胜利，99%概率直接死亡', effectId: 'wind-shadow' },
  { id: 'orichalcum', name: '奥利哈刚', rarity: 'common', description: '开局获得最大生命值20%的护盾', effectId: 'orichalcum' },
  { id: 'giant-slayer', name: '巨人杀手', rarity: 'rare', description: 'Boss讨伐中暴击率提升至100%', effectId: 'giant-slayer' },
  { id: 'bottled-lightning', name: '瓶装闪电', rarity: 'common', description: '自身第一回合必定使用1号位道具', effectId: 'bottled-lightning' },
  { id: 'scales', name: '鳞甲', rarity: 'common', description: '单次受到超过50点伤害时，伤害降低50%', effectId: 'scales' },
  { id: 'pen-nib', name: '笔尖', rarity: 'rare', description: '每3个自身回合，下一次主武器伤害翻倍', effectId: 'pen-nib' },
  { id: 'demon-form', name: '恶魔形态', rarity: 'rare', description: '每个自身回合开始时攻击力+3', effectId: 'demon-form' },
]

const amuletById = new Map(amuletList.map((item) => [item.id, item]))
const traitById = new Map(amuletTraitList.map((item) => [item.id, item]))

export function getAmulet(id: string | null | undefined): AmuletDefinition | undefined {
  return amuletById.get(id || 'prisoner-necklace')
}

export function getAmuletTrait(id: string): AmuletTraitDefinition | undefined {
  return traitById.get(id)
}

export function parseAmuletTraits(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function activeTraitIds(player: Pick<import('../types').DeadcellsPlayer, 'amuletTraits' | 'weaponQuality' | 'weaponTrait'>): string[] {
  const traits = parseAmuletTraits(player.amuletTraits)
  const weaponTrait = player.weaponQuality === 'colorless' ? player.weaponTrait : null
  return weaponTrait && !traits.includes(weaponTrait) ? [...traits, weaponTrait] : traits
}

export function randomAmuletTrait(random: () => number, excluded: string[] = []): string | undefined {
  const pool = amuletTraitList.filter((trait) => !excluded.includes(trait.id))
  return pool.length ? pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))].id : undefined
}

export function serializeAmuletTraits(traits: string[]): string {
  return JSON.stringify(traits)
}

export function rollAmulet(random: () => number): { id: string; traits: string[] } {
  const roll = random()
  const traitCount = roll < 0.7 ? 1 : roll < 0.95 ? 2 : 3
  const selected: string[] = []
  while (selected.length < traitCount) {
    const rarity: AmuletRarity = random() < 0.7 ? 'common' : 'rare'
    const pool = amuletTraitList.filter((trait) => trait.rarity === rarity && !selected.includes(trait.id))
    const trait = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
    if (trait) selected.push(trait.id)
  }
  const variants = ['amulet-1', 'amulet-2', 'amulet-3', 'amulet-4']
  return { id: variants[Math.floor(random() * variants.length)], traits: selected }
}
