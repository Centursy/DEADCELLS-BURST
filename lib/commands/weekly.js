"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWeeklyCommand = registerWeeklyCommand;
const weekly_1 = require("../core/weekly");
const image_1 = require("../output/image");
function registerWeeklyCommand(ctx, _config) {
    ctx.command('本周排行').action(async ({ session }) => {
        if (!session?.channelId)
            return '本周排行只能在群聊中查看。';
        const scores = await (0, weekly_1.getWeeklyScores)(ctx, session.channelId);
        if (!scores.length)
            return '本群本周还没有积分记录。';
        const card = await (0, image_1.renderWeeklyCard)(ctx, scores);
        if (card) {
            await session.send(card);
            return;
        }
        return `【本周排行】\n${scores.map((entry, index) => `${index + 1}. ${entry.username}：${entry.points} 分`).join('\n')}\n每周一东八区0点刷新。`;
    });
}
