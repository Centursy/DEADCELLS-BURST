"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAlchemyCommand = registerAlchemyCommand;
const amulets_1 = require("../data/amulets");
const player_1 = require("../utils/player");
const image_1 = require("../output/image");
function craftCount(value) {
    if (value === undefined || value === null || value === '')
        return 1;
    const count = Number(value);
    return Number.isInteger(count) && count >= 1 && count <= 5 ? count : undefined;
}
function registerAlchemyCommand(ctx, config, busy) {
    ctx.command(`${config.commandAlchemy} [count:number]`)
        .action(async ({ session }, countInput) => {
        if (!session?.userId)
            return '当前消息缺少用户身份，无法炼化护符。';
        const count = craftCount(countInput);
        if (!count)
            return '护符炼化次数必须是 1-5 的整数。';
        const player = await (0, player_1.getPlayer)(ctx, session.userId);
        if (!player)
            return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！';
        const totalCost = config.alchemyCost * count;
        if (player.cells < totalCost)
            return `当前细胞数不足，需要 ${totalCost} 个细胞才能炼化 ${count} 次。`;
        if (busy.has(player.userId))
            return '你当前正在进行其他操作，请稍后再试。';
        busy.add(player.userId);
        try {
            await ctx.database.set('deadcells_players', { userId: player.userId }, { cells: player.cells - totalCost });
            const generated = Array.from({ length: count }, () => (0, amulets_1.rollAmulet)(Math.random));
            const selected = count === 1 ? generated[0] : undefined;
            const card = config.enableImages
                ? selected
                    ? await (0, image_1.renderAmuletCard)(ctx, player, selected, totalCost)
                    : await (0, image_1.renderAmuletChoicesCard)(ctx, player, generated, totalCost)
                : undefined;
            const text = count === 1
                ? `【护符炼化】已消耗 ${totalCost} 个细胞！\n新护符词条：${selected.traits.join('、')}\n回复 y 替换当前护符，其他内容或超时则放弃。`
                : `【护符炼化】已消耗 ${totalCost} 个细胞，生成 ${count} 个护符候选！\n${generated.map((amulet, index) => `${index + 1}. 词条：${amulet.traits.join('、')}`).join('\n')}\n回复 1-${count} 选择护符，其他内容或超时则放弃。`;
            if (card)
                await session.send(card);
            else
                await session.send(text);
            const answer = await session.prompt(config.equipmentConfirmTimeout * 1000);
            const selectedIndex = count === 1 ? 0 : Number.parseInt(answer?.trim() || '', 10) - 1;
            if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= generated.length)
                return count === 1 ? '已放弃替换，炼化护符消失。' : '未选择有效护符，炼化结果消失。';
            const selectedAmulet = generated[selectedIndex];
            if (count > 1) {
                await session.send(`已选择第 ${selectedIndex + 1} 个护符（词条：${selectedAmulet.traits.join('、')}），回复 y 替换当前护符，其他内容或超时则放弃。`);
            }
            const confirmation = count === 1 ? answer : await session.prompt(config.equipmentConfirmTimeout * 1000);
            if (!confirmation || !['y', 'yes'].includes(confirmation.trim().toLowerCase()))
                return '已放弃替换，炼化护符消失。';
            await ctx.database.set('deadcells_players', { userId: player.userId }, {
                amuletId: selectedAmulet.id,
                amuletTraits: (0, amulets_1.serializeAmuletTraits)(selectedAmulet.traits),
            });
            return '护符已替换成功！';
        }
        finally {
            busy.delete(player.userId);
        }
    });
}
