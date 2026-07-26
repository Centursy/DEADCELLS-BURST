"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCharacterCommand = registerCharacterCommand;
const koishi_1 = require("koishi");
const text_1 = require("../output/text");
const image_1 = require("../output/image");
const player_1 = require("../utils/player");
function registerCharacterCommand(ctx, config) {
    ctx.command(config.commandCharacter)
        .action(async ({ session }) => {
        if (!session?.userId)
            return '当前消息缺少用户身份，无法创建角色。';
        const userId = session.userId;
        const username = session.username || userId;
        const { player, created } = await (0, player_1.getOrCreatePlayer)(ctx, userId, username);
        const prefix = created ? '未检测到数据，将创建角色……\n创建成功！' : '查询数据中……\n查到了！';
        if (config.enableImages) {
            const card = await (0, image_1.renderPlayerCard)(ctx, player);
            if (card) {
                return (0, koishi_1.h)('message', {}, [
                    (0, koishi_1.h)('text', { content: `${prefix}\n` }),
                    card,
                ]);
            }
        }
        return `${prefix}\n${(0, text_1.playerStatus)(player)}\n${(0, text_1.equipmentDescription)(player)}`;
    });
}
