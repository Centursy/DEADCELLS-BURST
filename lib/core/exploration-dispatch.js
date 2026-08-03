"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beijingDate = beijingDate;
exports.dispatchStatus = dispatchStatus;
exports.startExploration = startExploration;
exports.processDueExplorations = processDueExplorations;
exports.registerExplorationDispatcher = registerExplorationDispatcher;
exports.dailyExploreAvailable = dailyExploreAvailable;
const koishi_1 = require("koishi");
const exploration_1 = require("./exploration");
const text_1 = require("../output/text");
const image_1 = require("../output/image");
const player_1 = require("../utils/player");
const weekly_1 = require("./weekly");
const activeUsers = new Set();
function beijingDate(timestamp = Date.now()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(timestamp));
}
function resetDailyCount(player, now = Date.now()) {
    const date = beijingDate(now);
    return player.dailyExploreDate === date
        ? { date, count: player.dailyExploreCount || 0 }
        : { date, count: 0 };
}
function dispatchStatus(player, now = Date.now()) {
    const state = (0, exploration_1.parseExplorationState)(player.exploreState);
    if (!state)
        return undefined;
    const remaining = Math.max(0, state.nextAt - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.ceil((remaining % 60000) / 1000);
    return `探索进行中……\n当前地图：【${state.currentMap}】\n已探索地图数：【${state.reached.length}】\n当前策略：【${state.strategy === 'cells' ? '更多细胞' : '更深层数'}】\n下一张地图预计在：【${minutes}分${seconds}秒】后结算。`;
}
async function startExploration(ctx, config, player, strategy, channelId, guildId) {
    const now = Date.now();
    const state = (0, exploration_1.createExplorationState)(strategy, now, config.exploreDurationSeconds, channelId, guildId);
    const daily = resetDailyCount(player, now);
    await ctx.database.set('deadcells_players', { userId: player.userId }, {
        dailyExploreDate: daily.date,
        dailyExploreCount: daily.count,
        exploreState: (0, exploration_1.serializeExplorationState)(state),
        lastExploreAt: now,
    });
    return { ...player, dailyExploreDate: daily.date, dailyExploreCount: daily.count, exploreState: (0, exploration_1.serializeExplorationState)(state), lastExploreAt: now };
}
async function sendCompletion(ctx, player, state, result) {
    if (!state?.channelId)
        return;
    const bot = ctx.bots?.find((candidate) => candidate?.status !== 'offline') || ctx.bots?.[0];
    if (!bot?.sendMessage)
        return;
    const outputPlayer = { ...player, cells: player.cells + result.cellsGained };
    const card = await (0, image_1.renderExploreCard)(ctx, outputPlayer, result);
    const content = card
        ? (0, koishi_1.h)('message', {}, [(0, koishi_1.h)('at', { id: player.userId }), (0, koishi_1.h)('text', { content: ' 探索已结束！' }), card])
        : (0, koishi_1.h)('message', {}, [(0, koishi_1.h)('at', { id: player.userId }), (0, koishi_1.h)('text', { content: ` 探索已结束！\n${(0, text_1.explorationText)(result)}` })]);
    await bot.sendMessage(state.channelId, content, state.guildId);
}
async function processDueExplorations(ctx, config, now = Date.now()) {
    const players = await ctx.database.get('deadcells_players', {});
    for (const raw of players) {
        const player = await (0, player_1.getPlayer)(ctx, raw.userId);
        if (!player || !player.exploreState || activeUsers.has(player.userId))
            continue;
        const initial = (0, exploration_1.parseExplorationState)(player.exploreState);
        if (!initial || initial.nextAt > now)
            continue;
        activeUsers.add(player.userId);
        try {
            let state = initial;
            let finished = false;
            let result;
            while (!finished && state.nextAt <= now) {
                const advanced = (0, exploration_1.advanceExplorationState)(player, state, Math.random, state.nextAt, config.exploreDurationSeconds);
                state = advanced.state;
                finished = advanced.finished;
                result = advanced.result;
            }
            if (!finished) {
                await ctx.database.set('deadcells_players', { userId: player.userId }, { exploreState: (0, exploration_1.serializeExplorationState)(state) });
                continue;
            }
            if (!result)
                continue;
            const daily = resetDailyCount(player, now);
            const updated = {
                cells: player.cells + result.cellsGained,
                exploreState: null,
                dailyExploreDate: daily.date,
                dailyExploreCount: daily.count + 1,
            };
            await ctx.database.set('deadcells_players', { userId: player.userId }, updated);
            await (0, weekly_1.addWeeklyPoints)(ctx, state.channelId, player.userId, player.username, result.reached.length * 10);
            await sendCompletion(ctx, player, state, result);
        }
        finally {
            activeUsers.delete(player.userId);
        }
    }
}
function registerExplorationDispatcher(ctx, config) {
    const run = () => { void processDueExplorations(ctx, config); };
    ctx.on('ready', run);
    ctx.setInterval(run, 15000);
}
function dailyExploreAvailable(player, config, now = Date.now()) {
    return resetDailyCount(player, now).count < config.dailyExploreLimit;
}
