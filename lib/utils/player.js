"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePlayer = normalizePlayer;
exports.getPlayer = getPlayer;
exports.getOrCreatePlayer = getOrCreatePlayer;
exports.resolveUsername = resolveUsername;
exports.parseAtTarget = parseAtTarget;
exports.cooldownRemaining = cooldownRemaining;
exports.confirm = confirm;
exports.confirmFromUser = confirmFromUser;
const koishi_1 = require("koishi");
const progression_1 = require("../core/progression");
function normalizePlayer(player) {
    return {
        ...player,
        weaponQuality: player.weaponQuality === 'gold' || player.weaponQuality === 'colorless' ? player.weaponQuality : 'normal',
        weaponTrait: player.weaponQuality === 'colorless' && player.weaponTrait ? player.weaponTrait : null,
        item1Id: player.item1Id || null,
        item2Id: player.item2Id || null,
        amuletId: player.amuletId || 'prisoner-necklace',
        amuletTraits: player.amuletTraits || '[]',
        exploreState: player.exploreState || null,
        dailyExploreDate: player.dailyExploreDate || '',
        dailyExploreCount: player.dailyExploreCount || 0,
        lastBossRaidAt: player.lastBossRaidAt || 0,
        bossChoiceState: player.bossChoiceState || null,
        shopMaxHpBonus: player.shopMaxHpBonus || 0,
        shopCritBonus: player.shopCritBonus || 0,
        powerScrollReady: Boolean(player.powerScrollReady),
    };
}
async function getPlayer(ctx, userId) {
    const [player] = await ctx.database.get('deadcells_players', { userId });
    return player ? normalizePlayer(player) : undefined;
}
async function getOrCreatePlayer(ctx, userId, username) {
    const existing = await getPlayer(ctx, userId);
    if (existing)
        return { player: existing, created: false };
    const player = (0, progression_1.createPlayer)(userId, username);
    await ctx.database.create('deadcells_players', player);
    return { player, created: true };
}
async function resolveUsername(session, userId, fallback) {
    if (fallback)
        return fallback;
    if (typeof session.bot.getUser === 'function') {
        const user = await session.bot.getUser(userId).catch(() => undefined);
        if (user?.name)
            return user.name;
    }
    return userId;
}
async function parseAtTarget(session, input) {
    const element = koishi_1.h.parse(input || '').find((item) => item.type === 'at');
    if (!element?.attrs?.id)
        return undefined;
    return {
        userId: element.attrs.id,
        username: await resolveUsername(session, element.attrs.id, element.attrs.name),
    };
}
function cooldownRemaining(lastAt, cooldownSeconds, now = Date.now()) {
    return Math.max(0, lastAt + cooldownSeconds * 1000 - now);
}
async function confirm(session, timeoutMs) {
    const answer = await session.prompt(timeoutMs);
    return Boolean(answer && ['y', 'yes'].includes(answer.trim().toLowerCase()));
}
function confirmFromUser(ctx, channelId, userId, timeoutMs) {
    return new Promise((resolve) => {
        let finished = false;
        let dispose;
        const finish = (value) => {
            if (finished)
                return;
            finished = true;
            dispose?.();
            resolve(value);
        };
        dispose = ctx.on('message', (incoming) => {
            if (incoming.userId !== userId)
                return;
            if (channelId && incoming.channelId !== channelId)
                return;
            const answer = incoming.content?.trim().toLowerCase();
            finish(answer === 'y' || answer === 'yes');
        });
        setTimeout(() => finish(false), timeoutMs);
    });
}
