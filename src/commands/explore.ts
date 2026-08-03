import type { Context } from 'koishi'
import type { Config } from '../config'
import { getPlayer } from '../utils/player'
import { dailyExploreAvailable, dispatchStatus, startExploration } from '../core/exploration-dispatch'
import { isActivityActive } from '../core/activity'

export function registerExploreCommand(ctx: Context, config: Config, busy: Set<string>) {
  ctx.command(config.commandExplore)
    .action(async ({ session }) => {
      if (!session?.userId) return '当前消息缺少用户身份，无法进行修炼。'
      const userId = session.userId
      const player = await getPlayer(ctx, userId)
      if (!player) return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！'
      if (isActivityActive(userId)) return '你正在参加死斗，结束前不能开始修炼。'
      const status = dispatchStatus(player)
      if (status) return status
      if (!dailyExploreAvailable(player, config)) return `今日修炼结算次数已达到上限（${config.dailyExploreLimit}次），请明天再来。`
      if (busy.has(player.userId)) return '你当前正在进行其他操作，请稍后再试。'

      busy.add(player.userId)
      try {
        await session.send('准备进行探索了！\n想要以什么方式进行探索呢？\n【1】更多细胞\n【2】更深层数')
        const answer = await session.prompt(config.equipmentConfirmTimeout * 1000)
        const strategy = answer?.trim() === '2' ? 'depth' : answer?.trim() === '1' ? 'cells' : undefined
        if (!strategy) return '已取消探索或策略选择超时。'
        await startExploration(ctx, config, player, strategy, session.channelId, session.guildId)
        return `开始探索了！\n当前在【被囚者的牢房】探索！\n当前策略【${strategy === 'cells' ? '更多细胞' : '更深层数'}】生效中！`
      } finally {
        busy.delete(player.userId)
      }
    })
}
