"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDeathmatchCommand = registerDeathmatchCommand;
const player_1 = require("../utils/player");
const activity_1 = require("../core/activity");
const deathmatch_1 = require("../core/deathmatch");
const boss_1 = require("../core/boss");
const amulets_1 = require("../data/amulets");
const weekly_1 = require("../core/weekly");
const image_1 = require("../output/image");
const sessions = new Map();
const timers = new Map();
const traitRewards = new Map();
const traitRewardTimers = new Map();
function channelKey(session) {
    return session?.channelId;
}
function parseStake(value) {
    return String(value || '').trim().toLowerCase() === 'all';
}
function stakeFor(cells, allIn) {
    return allIn ? Math.max(0, cells) : Math.ceil(cells * 0.5);
}
function clearSession(channelId) {
    const state = sessions.get(channelId);
    if (!state)
        return;
    const timer = timers.get(channelId);
    if (timer)
        clearTimeout(timer);
    timers.delete(channelId);
    sessions.delete(channelId);
    state.participants.forEach((participant) => (0, activity_1.clearActivityActive)(participant.userId));
}
function waitingText(state, allIn) {
    return `当前死斗人数：${state.participants.length}\n${state.participants.map((item, index) => `${index + 1}. ${item.username}`).join('\n')}\n${allIn ? '所有参与者将在开始时押注全部细胞。' : '所有参与者将在开始时押注当前细胞的50%（向上取整）。'}\n请直接回复【加入】加入死斗；发起者回复【开始】开始死斗。`;
}
function choiceIndex(value, length) {
    const index = Number.parseInt(value?.trim() || '', 10) - 1;
    return Number.isInteger(index) && index >= 0 && index < length ? index : undefined;
}
function clearTraitReward(channelId) {
    traitRewards.delete(channelId);
    const timer = traitRewardTimers.get(channelId);
    if (timer)
        clearTimeout(timer);
    traitRewardTimers.delete(channelId);
}
async function applyDeathmatchTraitChoice(ctx, reward, player, selectedTrait, slot) {
    const currentTraits = (0, amulets_1.parseAmuletTraits)(player.amuletTraits);
    let nextTraits = [...currentTraits];
    let amuletId = player.amuletId;
    if (currentTraits.length >= 3) {
        if (!slot || slot < 1 || slot > 3)
            return '请选择 1、2 或 3 替换护符词条。';
        nextTraits[slot - 1] = selectedTrait;
    }
    else if (currentTraits.length > 0) {
        nextTraits.push(selectedTrait);
    }
    else {
        amuletId = amuletId === 'prisoner-necklace' ? 'amulet-1' : amuletId;
        nextTraits = [selectedTrait];
    }
    await ctx.database.set('deadcells_players', { userId: player.userId }, {
        amuletId,
        amuletTraits: (0, amulets_1.serializeAmuletTraits)(nextTraits),
    });
    const trait = (0, amulets_1.getAmuletTrait)(selectedTrait);
    return `已获得死斗词条【${trait?.name || selectedTrait}】。${currentTraits.length >= 3 ? '已替换选择的词条槽位。' : currentTraits.length > 0 ? `已装入第${currentTraits.length + 1}个词条槽位。` : `已获得护符【${(0, amulets_1.getAmulet)(amuletId)?.name || '炼化护符'}】。`}`;
}
async function cancelWaiting(ctx, channelId, message) {
    const state = sessions.get(channelId);
    if (!state)
        return;
    clearSession(channelId);
    const bot = ctx.bots?.find((candidate) => candidate?.status !== 'offline') || ctx.bots?.[0];
    if (bot?.sendMessage)
        await bot.sendMessage(channelId, message, state.guildId);
}
async function startDeathmatch(ctx, config, session, state) {
    const players = [];
    const charged = {};
    const deducted = {};
    try {
        for (const participant of state.participants) {
            const player = await (0, player_1.getPlayer)(ctx, participant.userId);
            if (!player)
                return `${participant.username} 的角色数据不存在，死斗已取消。`;
            if (player.cells < config.deathmatchMinCells)
                return `${participant.username} 当前细胞不足 ${config.deathmatchMinCells}，死斗已取消。`;
            const stake = stakeFor(player.cells, state.allIn);
            if (stake < config.deathmatchMinCells)
                return `${participant.username} 本次下注不足 ${config.deathmatchMinCells}，死斗已取消。`;
            charged[player.userId] = stake;
            players.push(player);
        }
        for (const player of players) {
            await ctx.database.set('deadcells_players', { userId: player.userId }, { cells: player.cells - charged[player.userId] });
            deducted[player.userId] = charged[player.userId];
        }
        const result = (0, deathmatch_1.simulateDeathmatch)(players, config);
        const pool = Object.values(charged).reduce((sum, value) => sum + value, 0);
        const totalReward = result.bossKilled ? pool + result.bossReward : 0;
        let winnerPlayer;
        if (result.winnerId && totalReward > 0) {
            winnerPlayer = await (0, player_1.getPlayer)(ctx, result.winnerId);
            if (winnerPlayer) {
                await ctx.database.set('deadcells_players', { userId: winnerPlayer.userId }, { cells: winnerPlayer.cells + totalReward });
                await (0, weekly_1.addWeeklyPoints)(ctx, state.channelId, winnerPlayer.userId, winnerPlayer.username, 50);
            }
        }
        const lines = result.events.map((event) => event.text);
        const participants = result.participants.map((item) => `${item.username}：${item.eliminated ? '已淘汰' : `${item.hp}/${item.maxHp}`}`).join('\n');
        const summary = result.winnerName
            ? `【死斗结算】${result.winnerName} 获得奖池 ${totalReward} 细胞！`
            : result.bossKilled ? `Boss 已击败，但未决出最终胜者，下注细胞消失。` : '未能击败 Boss，所有下注细胞消失。';
        const card = config.enableImages ? await (0, image_1.renderDeathmatchCard)(ctx, result, totalReward) : undefined;
        if (card)
            await session.send(card);
        else
            await session.send(`${summary}\nBoss：${result.bossName}（${result.bossMapName}）\n${participants}\n\n${lines.join('\n')}`);
        if (result.winnerId && winnerPlayer) {
            const choices = (0, boss_1.randomTraitChoices)(Math.random, 10, (0, amulets_1.activeTraitIds)(winnerPlayer));
            const rewardState = {
                channelId: state.channelId,
                guildId: state.guildId,
                winnerId: winnerPlayer.userId,
                choices,
                expiresAt: Date.now() + config.equipmentConfirmTimeout * 1000,
                stage: 'trait',
            };
            traitRewards.set(state.channelId, rewardState);
            const traitCard = config.enableImages ? await (0, image_1.renderDeathmatchTraitChoiceCard)(ctx, winnerPlayer, choices, config.equipmentConfirmTimeout) : undefined;
            if (traitCard)
                await session.send(traitCard);
            else
                await session.send(`死斗胜者词条奖励：\n${choices.map((id, index) => `${index + 1}. ${(0, amulets_1.getAmuletTrait)(id)?.name || id}：${(0, amulets_1.getAmuletTrait)(id)?.description || ''}`).join('\n')}\n请回复 1-${choices.length} 选择词条。`);
            traitRewardTimers.set(state.channelId, setTimeout(() => {
                const pending = traitRewards.get(state.channelId);
                if (!pending)
                    return;
                clearTraitReward(state.channelId);
                (0, activity_1.clearActivityActive)(pending.winnerId);
                const bot = ctx.bots?.find((candidate) => candidate?.status !== 'offline') || ctx.bots?.[0];
                if (bot?.sendMessage)
                    void bot.sendMessage(state.channelId, '死斗胜者词条奖励已超时，奖励失效。', state.guildId);
            }, config.equipmentConfirmTimeout * 1000));
        }
        return '';
    }
    catch (error) {
        for (const [userId, stake] of Object.entries(deducted)) {
            const player = await (0, player_1.getPlayer)(ctx, userId);
            if (player)
                await ctx.database.set('deadcells_players', { userId }, { cells: player.cells + stake });
        }
        return `死斗执行失败，已尝试退还下注细胞：${error instanceof Error ? error.message : '未知错误'}`;
    }
    finally {
        clearSession(state.channelId);
        if (traitRewards.has(state.channelId))
            (0, activity_1.markActivityActive)(traitRewards.get(state.channelId).winnerId);
    }
}
function registerDeathmatchCommand(ctx, config) {
    ctx.command('死斗 [mode:text]').action(async ({ session }, mode) => {
        const channelId = channelKey(session);
        if (!channelId || !session?.userId)
            return '死斗只能在群聊中发起。';
        if (sessions.has(channelId))
            return '当前群已经有一场死斗，请加入当前死斗或等待结束。';
        const player = await (0, player_1.getPlayer)(ctx, session.userId);
        if (!player)
            return '未找到你的角色数据，请先使用 deadcells 指令创建角色。';
        if ((0, activity_1.isActivityActive)(player.userId))
            return '你正在参加其他活动，暂时不能发起死斗。';
        if (player.cells < config.deathmatchMinCells)
            return `参加死斗至少需要 ${config.deathmatchMinCells} 个细胞。`;
        const allIn = parseStake(mode);
        const state = {
            channelId,
            guildId: session.guildId,
            creatorId: player.userId,
            allIn,
            status: 'waiting',
            participants: [{ userId: player.userId, username: player.username || session.username || player.userId, stake: 0, allIn }],
            chargedStakes: {},
            createdAt: Date.now(),
        };
        sessions.set(channelId, state);
        (0, activity_1.markActivityActive)(player.userId);
        timers.set(channelId, setTimeout(() => { void cancelWaiting(ctx, channelId, '死斗等待时间已结束，本场死斗自动取消。'); }, config.deathmatchWaitSeconds * 1000));
        return `${player.username} 拿出了${allIn ? '全部的' : '一半的'}细胞发起死斗！\n${waitingText(state, allIn)}`;
    });
    ctx.middleware(async (session, next) => {
        const channelId = channelKey(session);
        const content = session.content?.trim();
        const traitReward = channelId ? traitRewards.get(channelId) : undefined;
        if (traitReward) {
            if (Date.now() > traitReward.expiresAt) {
                clearTraitReward(channelId);
                (0, activity_1.clearActivityActive)(traitReward.winnerId);
                return session.userId === traitReward.winnerId ? '死斗胜者词条奖励已超时，奖励失效。' : next();
            }
            if (session.userId === traitReward.winnerId && /^\d+$/.test(content || '')) {
                const player = await (0, player_1.getPlayer)(ctx, traitReward.winnerId);
                if (!player)
                    return '未找到胜者角色数据，词条奖励暂时无法装备。';
                if (traitReward.stage === 'trait') {
                    const selectedIndex = choiceIndex(content, traitReward.choices.length);
                    if (selectedIndex === undefined)
                        return `请选择 1-${traitReward.choices.length} 其中一个词条。`;
                    const selectedTrait = traitReward.choices[selectedIndex];
                    const currentTraits = (0, amulets_1.parseAmuletTraits)(player.amuletTraits);
                    if (currentTraits.length >= 3) {
                        traitReward.selectedTrait = selectedTrait;
                        traitReward.stage = 'slot';
                        return `已选择词条【${(0, amulets_1.getAmuletTrait)(selectedTrait)?.name || selectedTrait}】，请选择替换第几个护符词条：\n1. 词条1\n2. 词条2\n3. 词条3`;
                    }
                    const message = await applyDeathmatchTraitChoice(ctx, traitReward, player, selectedTrait);
                    clearTraitReward(channelId);
                    (0, activity_1.clearActivityActive)(traitReward.winnerId);
                    return message;
                }
                const slot = Number.parseInt(content || '', 10);
                if (![1, 2, 3].includes(slot) || !traitReward.selectedTrait)
                    return '请选择 1、2 或 3 替换护符词条。';
                const message = await applyDeathmatchTraitChoice(ctx, traitReward, player, traitReward.selectedTrait, slot);
                clearTraitReward(channelId);
                (0, activity_1.clearActivityActive)(traitReward.winnerId);
                return message;
            }
        }
        const state = channelId ? sessions.get(channelId) : undefined;
        if (!state || state.status !== 'waiting')
            return next();
        if (content === '加入' || content === '加入死斗') {
            if (!session.userId)
                return next();
            if (state.participants.some((item) => item.userId === session.userId))
                return '你已经加入当前死斗了。';
            const player = await (0, player_1.getPlayer)(ctx, session.userId);
            if (!player)
                return '未找到你的角色数据，请先使用 deadcells 指令创建角色。';
            if ((0, activity_1.isActivityActive)(player.userId))
                return '你正在参加其他活动，暂时不能加入死斗。';
            if (player.cells < config.deathmatchMinCells)
                return `参加死斗至少需要 ${config.deathmatchMinCells} 个细胞。`;
            const username = await (0, player_1.resolveUsername)(session, player.userId, player.username || session.username);
            state.participants.push({ userId: player.userId, username, stake: 0, allIn: state.allIn });
            (0, activity_1.markActivityActive)(player.userId);
            return `${username} 已加入斗兽场！\n${waitingText(state, state.allIn)}`;
        }
        if (content !== '开始')
            return next();
        if (session.userId !== state.creatorId)
            return '只有死斗发起者可以回复【开始】。';
        if (state.status !== 'waiting')
            return '死斗已经开始。';
        state.status = 'started';
        const result = await startDeathmatch(ctx, config, session, state);
        return result || undefined;
    });
    ctx.on('dispose', () => {
        for (const timer of timers.values())
            clearTimeout(timer);
        timers.clear();
        for (const timer of traitRewardTimers.values())
            clearTimeout(timer);
        traitRewardTimers.clear();
        traitRewards.clear();
        for (const state of sessions.values())
            state.participants.forEach((participant) => (0, activity_1.clearActivityActive)(participant.userId));
        sessions.clear();
    });
}
