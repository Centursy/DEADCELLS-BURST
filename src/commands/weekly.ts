import type { Context } from 'koishi'
import type { Config } from '../config'
import { getWeeklyScores } from '../core/weekly'
import { renderWeeklyCard } from '../output/image'

export function registerWeeklyCommand(ctx: Context, _config: Config): void {
  ctx.command('本周排行').action(async ({ session }) => {
    if (!session?.channelId) return '本周排行只能在群聊中查看。'
    const scores = await getWeeklyScores(ctx, session.channelId)
    if (!scores.length) return '本群本周还没有积分记录。'
    const card = await renderWeeklyCard(ctx, scores)
    if (card) {
      await session.send(card)
      return
    }
    return `【本周排行】\n${scores.map((entry, index) => `${index + 1}. ${entry.username}：${entry.points} 分`).join('\n')}\n每周一东八区0点刷新。`
  })
}
