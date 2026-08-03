import type { Context } from 'koishi'
import { getAmulet, randomAmuletTrait } from '../data/amulets'
import { randomEquipment } from '../data/equipment'
import type { MysteryShopItem, MysteryShopRecord, Random, WeaponQuality } from '../types'

const SHOP_SLOT_COUNT = 9
const SHOP_RECORD_ID = 1
const SHOP_KINDS: MysteryShopItem['kind'][] = ['super-carrot', 'original-chicken', 'power-scroll', 'amulet', 'weapon']

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function shopRefreshKey(now = Date.now(), intervalSeconds = 10800): string {
  return String(Math.floor(now / (intervalSeconds * 1000)))
}

export function parseShopItems(value: string | undefined): MysteryShopItem[] {
  const parsed = parseJson<unknown[]>(value, [])
  return parsed.filter((item): item is MysteryShopItem => Boolean(item && typeof item === 'object' && typeof (item as MysteryShopItem).slot === 'number' && typeof (item as MysteryShopItem).kind === 'string'))
}

export function parsePurchasedSlots(value: string | undefined): number[] {
  return parseJson<unknown[]>(value, []).filter((slot): slot is number => typeof slot === 'number')
}

export function serializeShopItems(items: MysteryShopItem[]): string {
  return JSON.stringify(items)
}

export function serializePurchasedSlots(slots: number[]): string {
  return JSON.stringify([...new Set(slots)].sort((a, b) => a - b))
}

function fixedAmuletTraits(random: Random, excluded: string[]): string[] {
  const traits: string[] = []
  while (traits.length < 3) {
    const trait = randomAmuletTrait(random, [...excluded, ...traits])
    if (!trait) break
    traits.push(trait)
  }
  return traits
}

export function generateMysteryShopItems(random: Random = Math.random): MysteryShopItem[] {
  const items: MysteryShopItem[] = []
  const usedTraits: string[] = []
  for (let slot = 1; slot <= SHOP_SLOT_COUNT; slot++) {
    const kind = SHOP_KINDS[Math.min(SHOP_KINDS.length - 1, Math.floor(random() * SHOP_KINDS.length))]
    if (kind === 'super-carrot') {
      items.push({ slot, kind, name: '超级萝卜', description: '生命上限永久+5' })
    } else if (kind === 'original-chicken') {
      items.push({ slot, kind, name: '原味鸡', description: '暴击率永久+3%' })
    } else if (kind === 'power-scroll') {
      items.push({ slot, kind, name: '威力卷轴', description: '下一场普通玩家对战攻击力+10、暴击率+10%、最大生命+20' })
    } else if (kind === 'weapon') {
      const weapon = randomEquipment(random, 'weapon')
      const trait = randomAmuletTrait(random, usedTraits)
      if (trait) usedTraits.push(trait)
      items.push({
        slot,
        kind,
        name: `${weapon.name}（无色）`,
        description: weapon.description,
        equipmentId: weapon.id,
        weaponQuality: 'colorless' as WeaponQuality,
        weaponTrait: trait || null,
      })
    } else {
      const traits = fixedAmuletTraits(random, usedTraits)
      usedTraits.push(...traits)
      const amuletId = ['amulet-1', 'amulet-2', 'amulet-3', 'amulet-4'][Math.min(3, Math.floor(random() * 4))]
      const amuletName = getAmulet(amuletId)?.name || '炼化护符'
      items.push({
        slot,
        kind,
        name: amuletName,
        description: '固定拥有三个不重复词条',
        equipmentId: amuletId,
        traits,
      })
    }
  }
  return items
}

export async function getOrCreateMysteryShop(ctx: Context, refreshSeconds: number, random: Random = Math.random): Promise<MysteryShopRecord> {
  const refreshKey = shopRefreshKey(Date.now(), refreshSeconds)
  const [existing] = await ctx.database.get('deadcells_mystery_shop', { id: SHOP_RECORD_ID })
  if (existing?.refreshKey === refreshKey) return existing
  const record: MysteryShopRecord = {
    id: SHOP_RECORD_ID,
    refreshKey,
    items: serializeShopItems(generateMysteryShopItems(random)),
    purchased: '[]',
  }
  if (existing) {
    await ctx.database.set('deadcells_mystery_shop', { id: SHOP_RECORD_ID }, {
      refreshKey: record.refreshKey,
      items: record.items,
      purchased: record.purchased,
    })
    return record
  }
  try {
    await ctx.database.create('deadcells_mystery_shop', record)
    return record
  } catch {
    const [created] = await ctx.database.get('deadcells_mystery_shop', { id: SHOP_RECORD_ID })
    if (!created) throw new Error('神秘商店初始化失败')
    return created
  }
}
