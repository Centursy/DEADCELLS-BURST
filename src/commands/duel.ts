import { h, type Context } from 'koishi'
import type { Config } from '../config'
import { getEquipment, randomEquipment, type EquipmentDefinition } from '../data/equipment'
import { getAmulet, parseAmuletTraits, serializeAmuletTraits } from '../data/amulets'
import { simulateBattle } from '../core/battle'
import { getPlayer, parseAtTarget, confirmFromUser, cooldownRemaining } from '../utils/player'
import { renderAmuletDropCard, renderBattleCard, renderEquipmentDropCard } from '../output/image'

function lockKeys(a: string, b: string): string[] {
  return [a, b].sort()
}

export function registerDuelCommand(ctx: Context, config: Config, busy: Set<string>) {
  ctx.command(`${config.commandDuel} <target:text>`)
    .example(`${config.commandDuel} @用户`)
    .action(async ({ session }, targetInput) => {
      if (!session?.userId) return '当前消息缺少用户身份，无法发起对战。'
      const userId = session.userId
      const target = await parseAtTarget(session, targetInput || '')
      if (!target) return '请使用 @用户 指定对战目标。'
      if (target.userId === userId) return '不可以和自己对战。'

      const keys = lockKeys(userId, target.userId)
      if (keys.some((key) => busy.has(key))) return '你或对方正在进行其他操作，请稍后再试。'
      keys.forEach((key) => busy.add(key))

      try {
        const first = await getPlayer(ctx, userId)
        const second = await getPlayer(ctx, target.userId)
        if (!first) return '未找到你的角色数据，请先使用 deadcells 指令创建角色。'
        if (!second) return `未找到 ${target.username} 的角色数据，对方需要先使用 deadcells 指令。`

        const remaining = Math.max(
          cooldownRemaining(first.lastBattleAt, config.battleCooldownSeconds),
          cooldownRemaining(second.lastBattleAt, config.battleCooldownSeconds),
        )
        if (remaining > 0) return `你或对方处于对战冷却中，还需等待 ${Math.ceil(remaining / 1000)} 秒。`

        const result = simulateBattle(first, second, config)
        const now = Date.now()
        const finalCells = new Map([
          [result.attacker.userId, result.attacker.cells],
          [result.defender.userId, result.defender.cells],
        ])
        await ctx.database.set('deadcells_players', { userId: first.userId }, {
          cells: finalCells.get(first.userId) ?? first.cells,
          battleCount: first.battleCount + 1,
          winCount: first.winCount + (result.winnerId === first.userId ? 1 : 0),
          lastBattleAt: now,
        })
        await ctx.database.set('deadcells_players', { userId: second.userId }, {
          cells: finalCells.get(second.userId) ?? second.cells,
          battleCount: second.battleCount + 1,
          winCount: second.winCount + (result.winnerId === second.userId ? 1 : 0),
          lastBattleAt: now,
        })

        const winner = result.winnerId === first.userId ? first : second
        const copied = result.droppedEquipment
        const equipment = copied && copied.type !== 'amulet'
          ? getEquipment(copied.id)
          : !copied && Math.random() * 100 < config.equipmentDropRate
            ? randomEquipment(Math.random)
            : undefined
        const copiedAmulet = copied?.type === 'amulet' ? copied : undefined

        let currentEquipment: EquipmentDefinition | undefined
        let autoEquipped = false
        if (equipment) {
          const currentId = equipment.type === 'weapon'
            ? winner.weaponId
            : equipment.type === 'offhand'
              ? winner.shieldId
              : winner.item1Id || winner.item2Id
          currentEquipment = getEquipment(currentId)
          const field = equipment.type === 'weapon'
            ? 'weaponId'
            : equipment.type === 'offhand'
              ? 'shieldId'
              : !winner.item1Id
                ? 'item1Id'
                : !winner.item2Id
                  ? 'item2Id'
                  : undefined
          const canAutoEquip = equipment.type === 'item'
            ? !winner.item1Id || !winner.item2Id
            : !currentId
          if (field && canAutoEquip) {
            await ctx.database.set('deadcells_players', { userId: winner.userId }, { [field]: equipment.id })
            autoEquipped = true
          }
        }

        const battleCard = config.enableImages
          ? await renderBattleCard(ctx, first, second, result)
          : undefined
        if (battleCard) {
          await session.send(battleCard)
        } else {
          await session.send(`${result.events.map((event) => event.text).join('\n')}\n【战斗结算】${winner.username} 获胜！获得细胞【${result.cellTransfer}】。`)
        }

        if (!equipment && !copiedAmulet) return

        if (equipment) {
          const prompt = equipment.type === 'item' && !autoEquipped
            ? '当前两个道具槽均有装备，回复 1 替换道具1，回复 2 替换道具2，其他内容或超时放弃。'
            : undefined
          const equipmentCard = config.enableImages
            ? await renderEquipmentDropCard(ctx, winner, equipment, autoEquipped, currentEquipment, prompt)
            : undefined
          if (equipmentCard) {
            await session.send(equipmentCard)
          } else {
            await session.send(`【装备获取】恭喜 ${h.at(winner.userId)} 获得装备【${equipment.name}】！\n${equipment.description}\n${autoEquipped ? '已自动装备。' : prompt || '回复 y 替换当前装备，其他内容或超时放弃。'}`)
          }
          if (autoEquipped) return

          let field: 'weaponId' | 'shieldId' | 'item1Id' | 'item2Id'
          if (equipment.type === 'weapon') field = 'weaponId'
          else if (equipment.type === 'offhand') field = 'shieldId'
          else {
            const answer = await new Promise<string | undefined>((resolve) => {
              let finished = false
              const dispose = ctx.on('message', (incoming) => {
                if (incoming.userId !== winner.userId || incoming.channelId !== session.channelId) return
                const value = incoming.content?.trim()
                if (value !== '1' && value !== '2') return
                finished = true
                dispose()
                resolve(value)
              })
              setTimeout(() => {
                if (finished) return
                dispose()
                resolve(undefined)
              }, config.equipmentConfirmTimeout * 1000)
            })
            if (!answer) return '已放弃替换，掉落装备消失。'
            field = answer === '1' ? 'item1Id' : 'item2Id'
          }
          const accepted = equipment.type === 'item'
            ? true
            : await confirmFromUser(ctx, session.channelId, winner.userId, config.equipmentConfirmTimeout * 1000)
          if (!accepted) return '已放弃替换，掉落装备消失。'
          await ctx.database.set('deadcells_players', { userId: winner.userId }, { [field]: equipment.id })
          return `装备已替换为【${equipment.name}】！`
        }

        if (copiedAmulet) {
          const traits = copiedAmulet.traits || []
          const amuletCard = config.enableImages
            ? await renderAmuletDropCard(ctx, winner, copiedAmulet.id, traits, false)
            : undefined
          if (amuletCard) {
            await session.send(amuletCard)
          } else {
            const amulet = getAmulet(copiedAmulet.id)
            await session.send(`【护符获取】${h.at(winner.userId)} 复制了【${amulet?.name || '炼化护符'}】及完整词条：${traits.join('、') || '无'}\n回复 y 替换当前护符，其他内容或超时放弃。`)
          }
          const accepted = await confirmFromUser(ctx, session.channelId, winner.userId, config.equipmentConfirmTimeout * 1000)
          if (!accepted) return '已放弃替换，复制的护符消失。'
          await ctx.database.set('deadcells_players', { userId: winner.userId }, {
            amuletId: copiedAmulet.id,
            amuletTraits: serializeAmuletTraits(traits),
          })
          return '护符及其完整词条已复制并装备！'
        }
      } finally {
        keys.forEach((key) => busy.delete(key))
      }
    })
}
