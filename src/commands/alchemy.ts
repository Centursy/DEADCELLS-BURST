import type { Context } from 'koishi'
import type { Config } from '../config'
import { rollAmulet, serializeAmuletTraits } from '../data/amulets'
import { getPlayer } from '../utils/player'
import { renderAmuletCard, renderAmuletChoicesCard } from '../output/image'
import { isActivityActive } from '../core/activity'

function craftCount(value: unknown, maxCount: number): number | undefined {
  if (value === undefined || value === null || value === '') return 1
  const count = Number(value)
  return Number.isInteger(count) && count >= 1 && count <= maxCount ? count : undefined
}

export function registerAlchemyCommand(ctx: Context, config: Config, busy: Set<string>) {
  ctx.command(`${config.commandAlchemy} [count:number]`)
    .action(async ({ session }, countInput) => {
      if (!session?.userId) return '当前消息缺少用户身份，无法炼化护符。'
      const count = craftCount(countInput, config.alchemyMaxCount)
      if (!count) return `护符炼化次数必须是 1-${config.alchemyMaxCount} 的整数。`
      const player = await getPlayer(ctx, session.userId)
      if (!player) return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！'
      if (isActivityActive(player.userId)) return '你正在参加死斗，结束前不能进行护符炼化。'
      const totalCost = config.alchemyCost * count
      if (player.cells < totalCost) return `当前细胞数不足，需要 ${totalCost} 个细胞才能炼化 ${count} 次。`
      if (busy.has(player.userId)) return '你当前正在进行其他操作，请稍后再试。'

      busy.add(player.userId)
      try {
        await ctx.database.set('deadcells_players', { userId: player.userId }, { cells: player.cells - totalCost })
        const generated = Array.from({ length: count }, () => rollAmulet(Math.random))
        const selected = count === 1 ? generated[0] : undefined
        const card = config.enableImages
          ? selected
            ? await renderAmuletCard(ctx, player, selected, totalCost)
            : await renderAmuletChoicesCard(ctx, player, generated, totalCost)
          : undefined
        const text = count === 1
          ? `【护符炼化】已消耗 ${totalCost} 个细胞！\n新护符词条：${selected!.traits.join('、')}\n回复 y 替换当前护符，其他内容或超时则放弃。`
          : `【护符炼化】已消耗 ${totalCost} 个细胞，生成 ${count} 个护符候选！\n${generated.map((amulet, index) => `${index + 1}. 词条：${amulet.traits.join('、')}`).join('\n')}\n回复 1-${count} 选择护符，其他内容或超时则放弃。`
        if (card) await session.send(card)
        else await session.send(text)
        const answer = await session.prompt(config.equipmentConfirmTimeout * 1000)
        const selectedIndex = count === 1 ? 0 : Number.parseInt(answer?.trim() || '', 10) - 1
        if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= generated.length) return count === 1 ? '已放弃替换，炼化护符消失。' : '未选择有效护符，炼化结果消失。'
        const selectedAmulet = generated[selectedIndex]
        if (count > 1) {
          await session.send(`已选择第 ${selectedIndex + 1} 个护符（词条：${selectedAmulet.traits.join('、')}），回复 y 替换当前护符，其他内容或超时则放弃。`)
        }
        const confirmation = count === 1 ? answer : await session.prompt(config.equipmentConfirmTimeout * 1000)
        if (!confirmation || !['y', 'yes'].includes(confirmation.trim().toLowerCase())) return '已放弃替换，炼化护符消失。'
        await ctx.database.set('deadcells_players', { userId: player.userId }, {
          amuletId: selectedAmulet.id,
          amuletTraits: serializeAmuletTraits(selectedAmulet.traits),
        })
        return '护符已替换成功！'
      } finally {
        busy.delete(player.userId)
      }
    })
}
