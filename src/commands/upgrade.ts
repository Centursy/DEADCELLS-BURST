import type { Context } from 'koishi'
import type { Config } from '../config'
import { getLevelConfig, MAX_BOSS_CELL_LEVEL } from '../core/progression'
import { confirm, getPlayer } from '../utils/player'
import { isActivityActive } from '../core/activity'

export function registerUpgradeCommand(ctx: Context, config: Config, busy: Set<string>) {
  ctx.command(config.commandUpgrade)
    .action(async ({ session }) => {
      if (!session?.userId) return '当前消息缺少用户身份，无法升级。'
      const userId = session.userId
      const player = await getPlayer(ctx, userId)
      if (!player) return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！'
      if (isActivityActive(userId)) return '你正在参加死斗，结束前不能升级细胞等级。'
      if (player.bossCellLevel >= MAX_BOSS_CELL_LEVEL) return '当前已经是最高的 5 细胞等级。'

      const nextLevel = player.bossCellLevel + 1
      const cost = getLevelConfig(nextLevel).cost
      if (player.cells < cost) return `当前细胞等级【${player.bossCellLevel}】\n持有细胞数【${player.cells}】\n需要【${cost}】细胞才能升级到【${nextLevel}】细胞等级！`
      if (busy.has(player.userId)) return '你当前正在进行其他操作，请稍后再试。'

      busy.add(player.userId)
      try {
        await session.send(`当前细胞等级【${player.bossCellLevel}】\n持有细胞数【${player.cells}】\n是否使用【${cost}】细胞来升级到【${nextLevel}】细胞等级？\n回复 y 确定，回复其他内容取消。`)
        if (!await confirm(session, config.upgradeConfirmTimeout * 1000)) return '已取消升级或确认超时。'

        const latest = await getPlayer(ctx, userId)
        if (!latest || latest.bossCellLevel !== player.bossCellLevel || latest.cells < cost) {
          return '角色数据在确认期间发生变化，本次升级未执行。'
        }
        await ctx.database.set('deadcells_players', { userId }, {
          cells: latest.cells - cost,
          bossCellLevel: nextLevel,
        })
        return `已使用【${cost}】细胞来提升细胞等级！\n当前细胞等级【${player.bossCellLevel}】>>>【${nextLevel}】\n剩余细胞【${latest.cells - cost}】`
      } finally {
        busy.delete(player.userId)
      }
    })
}
