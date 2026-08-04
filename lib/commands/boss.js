"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBossCommand = registerBossCommand;
const boss_1 = require("../core/boss");
const exploration_dispatch_1 = require("../core/exploration-dispatch");
const amulets_1 = require("../data/amulets");
const image_1 = require("../output/image");
const player_1 = require("../utils/player");
const activity_1 = require("../core/activity");
const weekly_1 = require("../core/weekly");
const DIFFICULTY_NAMES = {
    normal: '普通',
    veteran: '历战',
    'veteran-king': '历战王',
};
function choiceIndex(value, length) {
    const index = Number.parseInt(value?.trim() || '', 10) - 1;
    return Number.isInteger(index) && index >= 0 && index < length ? index : undefined;
}
function rankingForUser(rankings, userId, username, damage, channelId) {
    const existing = rankings.find((item) => item.userId === userId);
    if (existing) {
        existing.damage += damage;
        existing.username = username;
        existing.channelId = channelId || existing.channelId;
    }
    else {
        rankings.push({ userId, username, damage, channelId });
    }
    return rankings;
}
function bossText(boss) {
    const hp = Math.max(0, Math.round(boss.currentHp));
    const mutation = (0, boss_1.bossMutationName)(boss.mutation);
    const mutationText = mutation === '无变异' ? '' : `\n变异：【${mutation}】${(0, boss_1.bossMutationDescription)(boss.mutation)}`;
    return `今日 Boss：【${boss.bossName}】（${boss.mapName}，${DIFFICULTY_NAMES[boss.difficulty]}）${mutationText}\nBoss 生命：${hp} / ${boss.maxHp}`;
}
async function sendBossCard(ctx, session, player, boss, result, rankings = (0, boss_1.parseBossRankings)(boss.rankings), completed = boss.completed) {
    const card = await (0, image_1.renderBossRaidCard)(ctx, player, boss, result, rankings, completed);
    if (card)
        await session.send(card);
    else {
        const log = result?.events?.join('\n');
        await session.send(`${bossText(boss)}${result ? `\n本次造成伤害：${result.damage}\n${log || ''}` : ''}${completed ? '\nBoss 已被讨伐。' : ''}`);
    }
}
async function settleBossChoice(ctx, config, session, player, state, firstAnswer) {
    if (state.date !== (0, exploration_dispatch_1.beijingDate)() || Date.now() > state.expiresAt) {
        await ctx.database.set('deadcells_players', { userId: player.userId }, { bossChoiceState: null });
        return '词条选择已超时，Boss 最后一击奖励失效。';
    }
    const selectedIndex = choiceIndex(firstAnswer, state.choices.length);
    if (selectedIndex === undefined)
        return `请选择 1-${state.choices.length} 其中一个词条。`;
    const selectedTrait = state.choices[selectedIndex];
    const currentTraits = (0, amulets_1.parseAmuletTraits)(player.amuletTraits);
    let nextTraits;
    let amuletId = player.amuletId;
    if (currentTraits.length >= 3) {
        await session.send('请选择替换第几个护符词条：\n1. 词条1\n2. 词条2\n3. 词条3');
        const slotAnswer = await session.prompt(config.equipmentConfirmTimeout * 1000);
        if (!slotAnswer) {
            await ctx.database.set('deadcells_players', { userId: player.userId }, { bossChoiceState: null });
            return '词条选择已超时，Boss 最后一击奖励失效。';
        }
        if (!['1', '2', '3'].includes(slotAnswer.trim()))
            return '请选择 1、2 或 3 替换护符词条。';
        nextTraits = [...currentTraits];
        nextTraits[Number(slotAnswer.trim()) - 1] = selectedTrait;
    }
    else if (currentTraits.length > 0) {
        nextTraits = [...currentTraits, selectedTrait];
    }
    else {
        amuletId = amuletId === 'prisoner-necklace' ? 'amulet-1' : amuletId;
        nextTraits = [selectedTrait];
    }
    await ctx.database.set('deadcells_players', { userId: player.userId }, {
        cells: player.cells + state.rewardCells,
        amuletId,
        amuletTraits: (0, amulets_1.serializeAmuletTraits)(nextTraits),
        bossChoiceState: null,
    });
    const trait = (0, amulets_1.getAmuletTrait)(selectedTrait);
    return `已获得 ${state.rewardCells} 个细胞，并装备词条【${trait?.name || selectedTrait}】。${currentTraits.length >= 3 ? '已替换选择的词条槽位。' : currentTraits.length > 0 ? `已装入第${currentTraits.length + 1}个词条槽位。` : `已获得护符【${(0, amulets_1.getAmulet)(amuletId)?.name || '炼化护符'}】。`}`;
}
function registerBossCommand(ctx, config, busy) {
    const raidLock = '__daily-boss-raid__';
    const commandName = config.commandBoss || 'boss讨伐';
    ctx.command(`${commandName} [choice:text]`)
        .action(async ({ session }, choiceInput) => {
        if (!session?.userId)
            return '当前消息缺少用户身份，无法参加 Boss 讨伐。';
        const player = await (0, player_1.getPlayer)(ctx, session.userId);
        if (!player)
            return '未找到用户数据哦，请先使用 deadcells 指令来创建角色！';
        if ((0, activity_1.isActivityActive)(player.userId))
            return '你正在参加死斗，结束前不能进行 Boss 讨伐。';
        if (busy.has(player.userId))
            return '你当前正在进行其他操作，请稍后再试。';
        const pending = (0, boss_1.parseBossChoiceState)(player.bossChoiceState);
        if (pending) {
            busy.add(player.userId);
            try {
                let answer = choiceInput?.trim();
                if (!answer) {
                    const boss = await (0, boss_1.getOrCreateDailyBoss)(ctx);
                    const card = config.enableImages ? await (0, image_1.renderBossTraitChoiceCard)(ctx, player, boss, pending.choices, pending.rewardCells, config.equipmentConfirmTimeout) : undefined;
                    if (card)
                        await session.send(card);
                    else
                        await session.send(`Boss 最后一击奖励：${pending.rewardCells} 个细胞\n${pending.choices.map((id, index) => `${index + 1}. ${(0, amulets_1.getAmuletTrait)(id)?.name || id}：${(0, amulets_1.getAmuletTrait)(id)?.description || ''}`).join('\n')}\n请回复 1-${pending.choices.length} 选择词条。`);
                    answer = await session.prompt(config.equipmentConfirmTimeout * 1000);
                }
                return settleBossChoice(ctx, config, session, player, pending, answer);
            }
            finally {
                busy.delete(player.userId);
            }
        }
        const boss = await (0, boss_1.getOrCreateDailyBoss)(ctx);
        if (boss.completed) {
            await sendBossCard(ctx, session, player, boss, undefined, (0, boss_1.parseBossRankings)(boss.rankings), true);
            return;
        }
        if (choiceInput?.trim())
            return '当前没有待选择的 Boss 词条。';
        if (Date.now() < player.lastBossRaidAt + config.bossRaidCooldownSeconds * 1000) {
            const seconds = Math.ceil((player.lastBossRaidAt + config.bossRaidCooldownSeconds * 1000 - Date.now()) / 1000);
            return `你还在 Boss 讨伐冷却中，请 ${seconds} 秒后再试。`;
        }
        if (busy.has(raidLock))
            return '当前已有其他玩家正在讨伐今日 Boss，请稍后再试。';
        busy.add(player.userId);
        busy.add(raidLock);
        let updatedBoss = boss;
        try {
            const result = (0, boss_1.simulateBossRaid)(player, boss, config);
            const rankings = rankingForUser((0, boss_1.parseBossRankings)(boss.rankings), player.userId, player.username, result.damage, session.channelId);
            const currentHp = Math.max(0, boss.currentHp - result.damage);
            const killed = currentHp <= 0;
            updatedBoss = {
                ...boss,
                currentHp,
                completed: killed,
                killerId: killed ? player.userId : boss.killerId,
                killerName: killed ? player.username : boss.killerName,
                rankings: (0, boss_1.serializeBossRankings)(rankings),
            };
            await ctx.database.set('deadcells_daily_bosses', { date: boss.date }, {
                currentHp: updatedBoss.currentHp,
                completed: updatedBoss.completed,
                killerId: updatedBoss.killerId,
                killerName: updatedBoss.killerName,
                rankings: updatedBoss.rankings,
            });
            if (killed) {
                for (const [index, entry] of rankings.slice(0, 3).entries()) {
                    await (0, weekly_1.addWeeklyPoints)(ctx, entry.channelId, entry.userId, entry.username, [50, 40, 30][index]);
                }
            }
            await ctx.database.set('deadcells_players', { userId: player.userId }, { lastBossRaidAt: Date.now() });
            const reward = (0, boss_1.calculateBossReward)(player, result.damage, boss.rewardMultiplier, boss.mutation);
            if (killed) {
                const state = {
                    date: boss.date,
                    choices: (0, boss_1.randomTraitChoices)(Math.random),
                    rewardCells: reward,
                    expiresAt: Date.now() + config.equipmentConfirmTimeout * 1000,
                };
                await ctx.database.set('deadcells_players', { userId: player.userId }, { bossChoiceState: (0, boss_1.serializeBossChoiceState)(state) });
                const resultPlayer = { ...player, lastBossRaidAt: Date.now(), bossChoiceState: (0, boss_1.serializeBossChoiceState)(state) };
                await sendBossCard(ctx, session, resultPlayer, updatedBoss, result, rankings, true);
                const card = config.enableImages ? await (0, image_1.renderBossTraitChoiceCard)(ctx, resultPlayer, updatedBoss, state.choices, reward, config.equipmentConfirmTimeout) : undefined;
                if (card)
                    await session.send(card);
                else
                    await session.send(`最后一击奖励：${reward} 个细胞\n${state.choices.map((id, index) => `${index + 1}. ${(0, amulets_1.getAmuletTrait)(id)?.name || id}：${(0, amulets_1.getAmuletTrait)(id)?.description || ''}`).join('\n')}\n请回复 1-${state.choices.length} 选择词条。`);
                return settleBossChoice(ctx, config, session, resultPlayer, state, await session.prompt(config.equipmentConfirmTimeout * 1000));
            }
            await ctx.database.set('deadcells_players', { userId: player.userId }, { cells: player.cells + reward, bossChoiceState: null });
            const resultPlayer = { ...player, cells: player.cells + reward, lastBossRaidAt: Date.now() };
            await sendBossCard(ctx, session, resultPlayer, updatedBoss, result, rankings, false);
            return `本次获得 ${reward} 个细胞。`;
        }
        finally {
            busy.delete(player.userId);
            busy.delete(raidLock);
        }
    });
}
