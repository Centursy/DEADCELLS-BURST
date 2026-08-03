"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDuelCommand = registerDuelCommand;
const koishi_1 = require("koishi");
const equipment_1 = require("../data/equipment");
const amulets_1 = require("../data/amulets");
const battle_1 = require("../core/battle");
const player_1 = require("../utils/player");
const image_1 = require("../output/image");
const activity_1 = require("../core/activity");
const weekly_1 = require("../core/weekly");
function lockKeys(a, b) {
    return [a, b].sort();
}
function registerDuelCommand(ctx, config, busy) {
    ctx.command(`${config.commandDuel} <target:text>`)
        .example(`${config.commandDuel} @用户`)
        .action(async ({ session }, targetInput) => {
        if (!session?.userId)
            return '当前消息缺少用户身份，无法发起对战。';
        const userId = session.userId;
        if ((0, activity_1.isActivityActive)(userId))
            return '你正在参加死斗，结束前不能进行普通对战。';
        const target = await (0, player_1.parseAtTarget)(session, targetInput || '');
        if (!target)
            return '请使用 @用户 指定对战目标。';
        if (target.userId === userId)
            return '不可以和自己对战。';
        const keys = lockKeys(userId, target.userId);
        if (keys.some((key) => busy.has(key)))
            return '你或对方正在进行其他操作，请稍后再试。';
        keys.forEach((key) => busy.add(key));
        try {
            const first = await (0, player_1.getPlayer)(ctx, userId);
            const second = await (0, player_1.getPlayer)(ctx, target.userId);
            if (!first)
                return '未找到你的角色数据，请先使用 deadcells 指令创建角色。';
            if (!second)
                return `未找到 ${target.username} 的角色数据，对方需要先使用 deadcells 指令。`;
            const remaining = Math.max((0, player_1.cooldownRemaining)(first.lastBattleAt, config.battleCooldownSeconds), (0, player_1.cooldownRemaining)(second.lastBattleAt, config.battleCooldownSeconds));
            if (remaining > 0)
                return `你或对方处于对战冷却中，还需等待 ${Math.ceil(remaining / 1000)} 秒。`;
            const result = (0, battle_1.simulateBattle)(first, second, config);
            const now = Date.now();
            const finalCells = new Map([
                [result.attacker.userId, result.attacker.cells],
                [result.defender.userId, result.defender.cells],
            ]);
            await ctx.database.set('deadcells_players', { userId: first.userId }, {
                cells: finalCells.get(first.userId) ?? first.cells,
                battleCount: first.battleCount + 1,
                winCount: first.winCount + (result.winnerId === first.userId ? 1 : 0),
                lastBattleAt: now,
            });
            await ctx.database.set('deadcells_players', { userId: second.userId }, {
                cells: finalCells.get(second.userId) ?? second.cells,
                battleCount: second.battleCount + 1,
                winCount: second.winCount + (result.winnerId === second.userId ? 1 : 0),
                lastBattleAt: now,
            });
            await ctx.database.set('deadcells_players', { userId: first.userId }, { powerScrollReady: false });
            await ctx.database.set('deadcells_players', { userId: second.userId }, { powerScrollReady: false });
            const winner = result.winnerId === first.userId ? first : second;
            await (0, weekly_1.addWeeklyPoints)(ctx, session.channelId, winner.userId, winner.username, 30);
            const copied = result.droppedEquipment;
            const equipment = copied && copied.type !== 'amulet'
                ? (() => {
                    const item = (0, equipment_1.getEquipment)(copied.id);
                    return item ? {
                        ...item,
                        weaponQuality: copied.type === 'weapon' ? copied.weaponQuality || 'normal' : undefined,
                        weaponTrait: copied.type === 'weapon' ? copied.weaponTrait || null : undefined,
                    } : undefined;
                })()
                : !copied && Math.random() * 100 < config.equipmentDropRate
                    ? (0, equipment_1.createEquipmentReward)((0, equipment_1.randomEquipment)(Math.random), Math.random, (0, amulets_1.activeTraitIds)(winner))
                    : undefined;
            const copiedAmulet = copied?.type === 'amulet' ? copied : undefined;
            let currentEquipment;
            let autoEquipped = false;
            if (equipment) {
                const currentId = equipment.type === 'weapon'
                    ? winner.weaponId
                    : equipment.type === 'offhand'
                        ? winner.shieldId
                        : winner.item1Id || winner.item2Id;
                currentEquipment = (0, equipment_1.getEquipment)(currentId);
                const field = equipment.type === 'weapon'
                    ? 'weaponId'
                    : equipment.type === 'offhand'
                        ? 'shieldId'
                        : !winner.item1Id
                            ? 'item1Id'
                            : !winner.item2Id
                                ? 'item2Id'
                                : undefined;
                const canAutoEquip = equipment.type === 'item'
                    ? !winner.item1Id || !winner.item2Id
                    : !currentId;
                if (field && canAutoEquip) {
                    await ctx.database.set('deadcells_players', { userId: winner.userId }, equipment.type === 'weapon'
                        ? { weaponId: equipment.id, weaponQuality: equipment.weaponQuality || 'normal', weaponTrait: equipment.weaponQuality === 'colorless' ? equipment.weaponTrait || null : null }
                        : { [field]: equipment.id });
                    autoEquipped = true;
                }
            }
            const battleCard = config.enableImages
                ? await (0, image_1.renderBattleCard)(ctx, first, second, result)
                : undefined;
            if (battleCard) {
                await session.send(battleCard);
            }
            else {
                await session.send(`${result.events.map((event) => event.text).join('\n')}\n【战斗结算】${winner.username} 获胜！获得细胞【${result.cellTransfer}】。`);
            }
            if (!equipment && !copiedAmulet)
                return;
            if (equipment) {
                const prompt = equipment.type === 'item' && !autoEquipped
                    ? '当前两个道具槽均有装备，回复 1 替换道具1，回复 2 替换道具2，其他内容或超时放弃。'
                    : undefined;
                const equipmentCard = config.enableImages
                    ? await (0, image_1.renderEquipmentDropCard)(ctx, winner, equipment, autoEquipped, currentEquipment, prompt)
                    : undefined;
                if (equipmentCard) {
                    await session.send(equipmentCard);
                }
                else {
                    await session.send(`【装备获取】恭喜 ${koishi_1.h.at(winner.userId)} 获得装备【${equipment.type === 'weapon' ? `${(0, equipment_1.weaponQualityText)(equipment.weaponQuality)}·` : ''}${equipment.name}】！\n${equipment.description}${equipment.weaponTrait ? `\n无色词条：${equipment.weaponTrait}` : ''}\n${autoEquipped ? '已自动装备。' : prompt || '回复 y 替换当前装备，其他内容或超时放弃。'}`);
                }
                if (autoEquipped)
                    return;
                let field;
                if (equipment.type === 'weapon')
                    field = 'weaponId';
                else if (equipment.type === 'offhand')
                    field = 'shieldId';
                else {
                    const answer = await new Promise((resolve) => {
                        let finished = false;
                        const dispose = ctx.on('message', (incoming) => {
                            if (incoming.userId !== winner.userId || incoming.channelId !== session.channelId)
                                return;
                            const value = incoming.content?.trim();
                            if (value !== '1' && value !== '2')
                                return;
                            finished = true;
                            dispose();
                            resolve(value);
                        });
                        setTimeout(() => {
                            if (finished)
                                return;
                            dispose();
                            resolve(undefined);
                        }, config.equipmentConfirmTimeout * 1000);
                    });
                    if (!answer)
                        return '已放弃替换，掉落装备消失。';
                    field = answer === '1' ? 'item1Id' : 'item2Id';
                }
                const accepted = equipment.type === 'item'
                    ? true
                    : await (0, player_1.confirmFromUser)(ctx, session.channelId, winner.userId, config.equipmentConfirmTimeout * 1000);
                if (!accepted)
                    return '已放弃替换，掉落装备消失。';
                await ctx.database.set('deadcells_players', { userId: winner.userId }, equipment.type === 'weapon'
                    ? { weaponId: equipment.id, weaponQuality: equipment.weaponQuality || 'normal', weaponTrait: equipment.weaponQuality === 'colorless' ? equipment.weaponTrait || null : null }
                    : { [field]: equipment.id });
                return `装备已替换为【${equipment.type === 'weapon' ? `${(0, equipment_1.weaponQualityText)(equipment.weaponQuality)}·` : ''}${equipment.name}】！`;
            }
            if (copiedAmulet) {
                const traits = copiedAmulet.traits || [];
                const amuletCard = config.enableImages
                    ? await (0, image_1.renderAmuletDropCard)(ctx, winner, copiedAmulet.id, traits, false)
                    : undefined;
                if (amuletCard) {
                    await session.send(amuletCard);
                }
                else {
                    const amulet = (0, amulets_1.getAmulet)(copiedAmulet.id);
                    await session.send(`【护符获取】${koishi_1.h.at(winner.userId)} 复制了【${amulet?.name || '炼化护符'}】及完整词条：${traits.join('、') || '无'}\n回复 y 替换当前护符，其他内容或超时放弃。`);
                }
                const accepted = await (0, player_1.confirmFromUser)(ctx, session.channelId, winner.userId, config.equipmentConfirmTimeout * 1000);
                if (!accepted)
                    return '已放弃替换，复制的护符消失。';
                await ctx.database.set('deadcells_players', { userId: winner.userId }, {
                    amuletId: copiedAmulet.id,
                    amuletTraits: (0, amulets_1.serializeAmuletTraits)(traits),
                });
                return '护符及其完整词条已复制并装备！';
            }
        }
        finally {
            keys.forEach((key) => busy.delete(key));
        }
    });
}
