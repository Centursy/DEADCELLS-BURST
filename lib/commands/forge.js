"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerForgeCommand = registerForgeCommand;
const equipment_1 = require("../data/equipment");
const amulets_1 = require("../data/amulets");
const player_1 = require("../utils/player");
const image_1 = require("../output/image");
const activity_1 = require("../core/activity");
function choiceIndex(value, length) {
    const index = Number.parseInt(value?.trim() || '', 10) - 1;
    return Number.isInteger(index) && index >= 0 && index < length ? index : undefined;
}
function craftCount(value, maxCount) {
    if (value === undefined || value === null || value === '')
        return 1;
    const count = Number(value);
    return Number.isInteger(count) && count >= 1 && count <= maxCount ? count : undefined;
}
function registerForgeCommand(ctx, config, busy) {
    ctx.command(`${config.commandForge} [count:number]`)
        .action(async ({ session }, countInput) => {
        if (!session?.userId)
            return '当前消息缺少用户身份，无法锻造装备。';
        const count = craftCount(countInput, config.forgeMaxCount);
        if (!count)
            return `装备锻造次数必须是 1-${config.forgeMaxCount} 的整数。`;
        const player = await (0, player_1.getPlayer)(ctx, session.userId);
        if (!player)
            return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！';
        if ((0, activity_1.isActivityActive)(player.userId))
            return '你正在参加死斗，结束前不能进行装备锻造。';
        const totalCost = config.forgeCost * count;
        if (player.cells < totalCost)
            return `当前细胞数不足，需要 ${totalCost} 个细胞才能锻造 ${count} 次。`;
        if (busy.has(player.userId))
            return '你当前正在进行其他操作，请稍后再试。';
        busy.add(player.userId);
        try {
            await ctx.database.set('deadcells_players', { userId: player.userId }, { cells: player.cells - totalCost });
            const choices = Array.from({ length: count }, () => (0, equipment_1.randomEquipmentChoices)(Math.random, 3)
                .map((item) => (0, equipment_1.createEquipmentReward)(item, Math.random, (0, amulets_1.activeTraitIds)(player)))).flat();
            const card = config.enableImages ? await (0, image_1.renderForgeCard)(ctx, player, choices, count, totalCost) : undefined;
            if (card)
                await session.send(card);
            else
                await session.send(`【装备锻造】已消耗 ${totalCost} 个细胞，生成 ${count} 组装备！\n${choices.map((item, index) => `第${Math.floor(index / 3) + 1}组-${index % 3 + 1}（总选项${index + 1}）【${item.type === 'weapon' ? `${(0, equipment_1.weaponQualityText)(item.weaponQuality)}·` : ''}${item.name}】（${(0, equipment_1.equipmentTypeText)(item.type)}）${item.description}${item.weaponTrait ? `｜无色词条：${item.weaponTrait}` : ''}`).join('\n')}\n回复 1-${choices.length} 选择装备，其他内容放弃。`);
            const selectedIndex = choiceIndex(await session.prompt(config.equipmentConfirmTimeout * 1000), choices.length);
            if (selectedIndex === undefined)
                return '已放弃锻造装备，消耗的细胞不返还。';
            const selected = choices[selectedIndex];
            let field;
            if (selected.type === 'weapon')
                field = 'weaponId';
            else if (selected.type === 'offhand')
                field = 'shieldId';
            else {
                if (!player.item1Id || !player.item2Id) {
                    field = !player.item1Id ? 'item1Id' : 'item2Id';
                    await ctx.database.set('deadcells_players', { userId: player.userId }, { [field]: selected.id });
                    return `已选择装备【${selected.name}】，当前存在空道具槽，已自动装备到${field === 'item1Id' ? '道具1' : '道具2'}！`;
                }
                await session.send(`已选择装备【${selected.name}】，请选择替换哪一个道具：\n1. 道具1：【${equipmentName(player.item1Id)}】\n2. 道具2：【${equipmentName(player.item2Id)}】\n请回复 1 或 2。`);
                const slot = await session.prompt(config.equipmentConfirmTimeout * 1000);
                if (!['1', '2'].includes(slot?.trim() || ''))
                    return '未选择有效道具槽位，锻造装备放弃。';
                field = slot.trim() === '1' ? 'item1Id' : 'item2Id';
            }
            await ctx.database.set('deadcells_players', { userId: player.userId }, selected.type === 'weapon'
                ? { weaponId: selected.id, weaponQuality: selected.weaponQuality || 'normal', weaponTrait: selected.weaponQuality === 'colorless' ? selected.weaponTrait || null : null }
                : { [field]: selected.id });
            return `已锻造并装备【${selected.name}】！`;
        }
        finally {
            busy.delete(player.userId);
        }
    });
}
function equipmentName(id) {
    return (0, equipment_1.getEquipment)(id)?.name || '无';
}
