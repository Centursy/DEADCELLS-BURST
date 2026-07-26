import { h, type Context } from 'koishi'
import { playerStatus, equipmentDescription } from '../output/text'
import { renderPlayerCard } from '../output/image'
import { getOrCreatePlayer } from '../utils/player'
import type { Config } from '../config'

export function registerCharacterCommand(ctx: Context, config: Config) {
  ctx.command(config.commandCharacter)
    .action(async ({ session }) => {
      if (!session?.userId) return '当前消息缺少用户身份，无法创建角色。'
      const userId = session.userId
      const username = session.username || userId
      const { player, created } = await getOrCreatePlayer(ctx, userId, username)
      const prefix = created ? '未检测到数据，将创建角色……\n创建成功！' : '查询数据中……\n查到了！'
      if (config.enableImages) {
        const card = await renderPlayerCard(ctx, player)
        if (card) {
          return h('message', {}, [
            h('text', { content: `${prefix}\n` }),
            card,
          ])
        }
      }
      return `${prefix}\n${playerStatus(player)}\n${equipmentDescription(player)}`
    })
}
