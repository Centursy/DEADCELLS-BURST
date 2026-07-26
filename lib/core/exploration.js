"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExplorationState = parseExplorationState;
exports.serializeExplorationState = serializeExplorationState;
exports.createExplorationState = createExplorationState;
exports.advanceExplorationState = advanceExplorationState;
exports.dispatchExplorationResult = dispatchExplorationResult;
exports.explore = explore;
const maps_1 = require("../data/maps");
const progression_1 = require("./progression");
const BOSS_RATE = 0.6;
const DISPATCH_MAP_REWARD_MULTIPLIER = 20;
function nextMap(current, random) {
    if (!current.next.length || random() >= current.arrivalRate)
        return undefined;
    const name = current.next[Math.min(current.next.length - 1, Math.floor(random() * current.next.length))];
    return maps_1.maps.find((map) => map.name === name);
}
function nextDispatchMap(current, strategy, random) {
    const arrivalRate = strategy === 'depth' ? Math.min(0.9, current.arrivalRate + 0.1) : current.arrivalRate;
    if (!current.next.length || random() >= arrivalRate)
        return undefined;
    const name = current.next[Math.min(current.next.length - 1, Math.floor(random() * current.next.length))];
    return maps_1.maps.find((map) => map.name === name);
}
function parseExplorationState(value) {
    if (!value)
        return undefined;
    try {
        const state = JSON.parse(value);
        if (!state || !Array.isArray(state.reached) || !Array.isArray(state.rewards) || !Array.isArray(state.bosses))
            return undefined;
        return state;
    }
    catch {
        return undefined;
    }
}
function serializeExplorationState(state) {
    return JSON.stringify(state);
}
function createExplorationState(strategy, now, durationSeconds, channelId, guildId) {
    return {
        strategy,
        reached: [maps_1.maps[0].name],
        rewards: [maps_1.maps[0].reward],
        bosses: [],
        currentMap: maps_1.maps[0].name,
        nextAt: now + durationSeconds * 1000,
        startedAt: now,
        channelId,
        guildId,
    };
}
function advanceExplorationState(player, state, random, now, durationSeconds) {
    const current = maps_1.maps.find((map) => map.name === state.currentMap) || maps_1.maps[0];
    const nextState = {
        ...state,
        reached: [...state.reached],
        rewards: [...state.rewards],
        bosses: state.bosses.map((boss) => ({ ...boss })),
    };
    const fail = (comment = current.comment) => ({
        state: nextState,
        finished: true,
        result: dispatchExplorationResult(player, nextState, comment),
    });
    if (current.boss) {
        const defeated = random() < BOSS_RATE;
        if (!defeated) {
            nextState.bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 });
            return fail();
        }
        const following = nextDispatchMap(current, state.strategy, random);
        if (!following && current.next.length) {
            nextState.bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 });
            return fail();
        }
        nextState.bosses.push({ mapName: current.name, bossName: current.boss, won: true, reward: current.bossReward || 0 });
        if (!following)
            return {
                state: nextState,
                finished: true,
                result: dispatchExplorationResult(player, nextState, maps_1.bossComment, current.name, current.boss),
            };
        nextState.currentMap = following.name;
        nextState.reached.push(following.name);
        nextState.rewards.push(following.reward);
        nextState.nextAt = now + durationSeconds * 1000;
        return { state: nextState, finished: false };
    }
    const following = nextDispatchMap(current, state.strategy, random);
    if (!following)
        return fail();
    nextState.currentMap = following.name;
    nextState.reached.push(following.name);
    nextState.rewards.push(following.reward);
    nextState.nextAt = now + durationSeconds * 1000;
    return { state: nextState, finished: false };
}
function dispatchExplorationResult(player, state, comment, finalBossMap, finalBossName) {
    const baseCells = state.rewards.reduce((sum, reward) => sum + reward, 0) * DISPATCH_MAP_REWARD_MULTIPLIER;
    const bossReward = state.bosses.reduce((sum, boss) => sum + boss.reward, 0);
    const strategyMultiplier = state.strategy === 'cells' ? 1.5 : 1;
    const multiplier = (0, progression_1.getLevelConfig)(player.bossCellLevel).multiplier;
    const greedMultiplier = (0, progression_1.getAmuletCellMultiplier)(player);
    const cellsGained = Math.round((baseCells + bossReward) * strategyMultiplier * multiplier * greedMultiplier);
    const lastBoss = state.bosses[state.bosses.length - 1];
    const completed = Boolean(finalBossMap);
    return {
        reached: state.reached,
        rewards: state.rewards,
        baseCells,
        bossReward,
        multiplier,
        cellsGained,
        bossAttempted: state.bosses.length > 0,
        bossWon: lastBoss?.won || false,
        bossName: lastBoss?.bossName,
        finalBossName,
        finalBossMap,
        completed,
        bosses: state.bosses,
        comment,
    };
}
function explore(player, random) {
    const reached = [maps_1.maps[0].name];
    const rewards = [maps_1.maps[0].reward];
    const bosses = [];
    let current = maps_1.maps[0];
    let bossAttempted = false;
    let bossWon = false;
    let bossReward = 0;
    let finalBossName;
    let finalBossMap;
    let completed = false;
    while (true) {
        if (current.boss) {
            bossAttempted = true;
            const defeated = random() < BOSS_RATE;
            const reward = current.bossReward || 0;
            if (!defeated) {
                bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 });
                bossWon = false;
                break;
            }
            const following = nextMap(current, random);
            if (!following && current.next.length) {
                // Regional bosses require the next map to be reached before they count as cleared.
                bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 });
                bossWon = false;
                break;
            }
            bosses.push({ mapName: current.name, bossName: current.boss, won: true, reward });
            bossWon = true;
            bossReward += reward;
            if (!following) {
                completed = true;
                finalBossName = current.boss;
                finalBossMap = current.name;
                break;
            }
            current = following;
            reached.push(current.name);
            rewards.push(current.reward);
            continue;
        }
        const following = nextMap(current, random);
        if (!following)
            break;
        current = following;
        reached.push(current.name);
        rewards.push(current.reward);
    }
    const baseCells = rewards.reduce((sum, reward) => sum + reward, 0);
    const multiplier = (0, progression_1.getLevelConfig)(player.bossCellLevel).multiplier;
    const greedMultiplier = (0, progression_1.getAmuletCellMultiplier)(player);
    const cellsGained = Math.round((baseCells + bossReward) * multiplier * greedMultiplier);
    const lastBoss = bosses[bosses.length - 1];
    return {
        reached,
        rewards,
        baseCells,
        bossReward,
        multiplier,
        cellsGained,
        bossAttempted,
        bossWon,
        bossName: lastBoss?.bossName,
        finalBossName,
        finalBossMap,
        completed,
        bosses,
        comment: completed ? maps_1.bossComment : current.comment,
    };
}
