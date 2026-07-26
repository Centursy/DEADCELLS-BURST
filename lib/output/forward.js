"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBattleForward = sendBattleForward;
const koishi_1 = require("koishi");
async function sendBattleForward(session, result) {
    const content = (0, koishi_1.h)('text', {
        content: result.events.map((event) => event.text).join('\n'),
    });
    try {
        await session.send((0, koishi_1.h)('message', { forward: true }, [content]));
        return true;
    }
    catch {
        return false;
    }
}
