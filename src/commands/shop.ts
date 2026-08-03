import type { Context } from 'koishi'
import type { Config } from '../config'
import { getOrCreateMysteryShop, parsePurchasedSlots, parseShopItems, serializePurchasedSlots } from '../core/shop'
import { getPlayer } from '../utils/player'
import { isActivityActive } from '../core/activity'
import { getAmulet, getAmuletTrait } from '../data/amulets'
import { getEquipment } from '../data/equipment'
import { renderMysteryShopCard } from '../output/image'

const shopLock = '__mystery-shop__'

function slotIndex(value: unknown): number | undefined {
  const slot = Number(value)
  return Number.isInteger(slot) && slot >= 1 && slot <= 9 ? slot : undefined
}

function describe(item: ReturnType<typeof parseShopItems>[number], price: number): string {
  const traits = item.traits?.length
    ? `\n词条：${item.traits.map((id) => getAmuletTrait(id)?.name || id).join('、')}`
    : ''
  const weaponTrait = item.weaponTrait ? getAmuletTrait(item.weaponTrait) : undefined
  const weaponTraitText = item.weaponTrait
    ? `\n无色词条：${weaponTrait?.name || item.weaponTrait}${weaponTrait?.description ? `（${weaponTrait.description}）` : ''}`
    : ''
  return `【${item.slot}】${item.name}\n${item.description}${item.equipmentId ? `\n装备：${getEquipment(item.equipmentId)?.description || getAmulet(item.equipmentId)?.name || item.equipmentId}` : ''}${traits}${weaponTraitText}\n售价：${price} 细胞`
}

export function registerShopCommand(ctx: Context, config: Config, busy: Set<string>): void {
  ctx.command('神秘商店 [slot:number]').action(async ({ session }, slotInput) => {
    if (!session?.userId) return '当前消息缺少用户身份，无法使用神秘商店。'
    const player = await getPlayer(ctx, session.userId)
    if (!player) return '未找到你的角色数据，请先使用 deadcells 指令创建角色。'
    if (isActivityActive(player.userId)) return '你正在参加死斗，暂时不能使用神秘商店。'
    if (busy.has(player.userId) || busy.has(shopLock)) return '商店正在处理其他购买，请稍后再试。'
    const record = await getOrCreateMysteryShop(ctx, config.shopRefreshSeconds)
    const items = parseShopItems(record.items)
    const purchased = parsePurchasedSlots(record.purchased)
    let selected = slotIndex(slotInput)
    if (selected === undefined) {
      const card = config.enableImages ? await renderMysteryShopCard(ctx, items, purchased, config.shopPrice) : undefined
      if (card) {
        await session.send(card)
      } else {
        await session.send(`【神秘商店】每 ${Math.round(config.shopRefreshSeconds / 3600)} 小时刷新一次，单件售价 ${config.shopPrice} 细胞。\n${items.map((item) => `${item.slot}. ${item.name}｜${item.description}${purchased.includes(item.slot) ? '｜已售出' : ''}`).join('\n')}\n请直接回复 1-9 选择商品。`)
      }
      busy.add(player.userId)
      try {
        selected = slotIndex(await session.prompt(config.equipmentConfirmTimeout * 1000))
      } finally {
        if (selected === undefined) busy.delete(player.userId)
      }
      if (selected === undefined) return '未选择有效商品，已取消购买。'
    }
    try {
      const item = items.find((entry) => entry.slot === selected)
      if (!item) return '当前商店没有这个商品。'
      if (purchased.includes(selected)) return '这个商品已经被购买了，请等待商店刷新。'
      if (player.cells < config.shopPrice) return `购买该商品需要 ${config.shopPrice} 个细胞，你当前只有 ${player.cells} 个。`
      if (item.kind === 'power-scroll' && player.powerScrollReady) return '你已经拥有一张待生效的威力卷轴，不能重复购买。'
      if (!busy.has(player.userId)) busy.add(player.userId)
      await session.send(`${describe(item, config.shopPrice)}\n回复 y 确认购买，其他内容或超时取消。`)
      const answer = await session.prompt(config.equipmentConfirmTimeout * 1000)
      if (!answer || !['y', 'yes'].includes(answer.trim().toLowerCase())) return '已取消购买。'

      busy.add(shopLock)
      const fresh = await getOrCreateMysteryShop(ctx, config.shopRefreshSeconds)
      const freshPurchased = parsePurchasedSlots(fresh.purchased)
      if (freshPurchased.includes(selected)) return '这个商品刚刚已被其他人购买，请重新查看商店。'
      const current = await getPlayer(ctx, player.userId)
      if (!current || current.cells < config.shopPrice) return '你的细胞数已不足，购买失败。'
      const patch: Record<string, unknown> = { cells: current.cells - config.shopPrice }
      if (item.kind === 'super-carrot') patch.shopMaxHpBonus = (current.shopMaxHpBonus || 0) + 5
      else if (item.kind === 'original-chicken') patch.shopCritBonus = (current.shopCritBonus || 0) + 3
      else if (item.kind === 'power-scroll') patch.powerScrollReady = true
      else if (item.kind === 'weapon') {
        patch.weaponId = item.equipmentId
        patch.weaponQuality = 'colorless'
        patch.weaponTrait = item.weaponTrait || null
      } else if (item.kind === 'amulet') {
        patch.amuletId = item.equipmentId
        patch.amuletTraits = JSON.stringify(item.traits || [])
      }
      await ctx.database.set('deadcells_players', { userId: current.userId }, patch)
      await ctx.database.set('deadcells_mystery_shop', { id: fresh.id }, { purchased: serializePurchasedSlots([...freshPurchased, selected]) })
      return `购买成功！已获得【${item.name}】，消耗 ${config.shopPrice} 个细胞。`
    } finally {
      busy.delete(shopLock)
      busy.delete(player.userId)
    }
  })
}
