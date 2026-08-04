"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOSS_MUTATIONS = void 0;
exports.parseBossChoiceState = parseBossChoiceState;
exports.serializeBossChoiceState = serializeBossChoiceState;
exports.randomBossMutation = randomBossMutation;
exports.bossMutationName = bossMutationName;
exports.bossMutationDescription = bossMutationDescription;
exports.raidBossMaps = raidBossMaps;
exports.createDailyBossRecord = createDailyBossRecord;
exports.getOrCreateDailyBoss = getOrCreateDailyBoss;
exports.calculateBossReward = calculateBossReward;
exports.parseBossRankings = parseBossRankings;
exports.serializeBossRankings = serializeBossRankings;
exports.randomTraitChoices = randomTraitChoices;
exports.simulateBossRaid = simulateBossRaid;
const equipment_1 = require("../data/equipment");
const amulets_1 = require("../data/amulets");
const progression_1 = require("./progression");
const maps_1 = require("../data/maps");
const exploration_dispatch_1 = require("./exploration-dispatch");
function parseBossChoiceState(value) {
    if (!value)
        return undefined;
    try {
        const state = JSON.parse(value);
        if (!state || !Array.isArray(state.choices) || typeof state.rewardCells !== 'number' || typeof state.expiresAt !== 'number')
            return undefined;
        return state;
    }
    catch {
        return undefined;
    }
}
function serializeBossChoiceState(state) {
    return JSON.stringify(state);
}
const FINAL_BOSS_MAPS = new Set(['王座之间', '塔顶', '观星台']);
const DIFFICULTIES = ['normal', 'veteran', 'veteran-king'];
const BOSS_HP_SCALE = 1.5;
exports.BOSS_MUTATIONS = ['berserk', 'frozen', 'bleeding', 'greed', 'mediocre'];
function randomBossMutation(random = Math.random) {
    return exports.BOSS_MUTATIONS[Math.min(exports.BOSS_MUTATIONS.length - 1, Math.floor(random() * exports.BOSS_MUTATIONS.length))];
}
function bossMutationName(mutation) {
    switch (mutation) {
        case 'berserk': return '狂暴';
        case 'frozen': return '冰冻';
        case 'bleeding': return '出血';
        case 'greed': return '贪婪';
        case 'mediocre': return '平庸';
        default: return '无变异';
    }
}
function bossMutationDescription(mutation) {
    switch (mutation) {
        case 'berserk': return '每 2 回合攻击一次';
        case 'frozen': return '攻击有 50% 概率使玩家冰冻 1 回合';
        case 'bleeding': return '攻击使玩家进入流血状态';
        case 'greed': return 'Boss 奖励细胞按削减生命值的 2 倍计算';
        case 'mediocre': return '攻击力减半，但每回合攻击一次';
        default: return '';
    }
}
function normalizeBossMutation(mutation, random) {
    return typeof mutation === 'string' && exports.BOSS_MUTATIONS.includes(mutation)
        ? mutation
        : randomBossMutation(random);
}
function randomInt(random, min, max) {
    return min + Math.floor(random() * (max - min + 1));
}
function bossConfig(difficulty, random) {
    if (difficulty === 'veteran')
        return { maxHp: randomInt(random, 46000 * BOSS_HP_SCALE, 62000 * BOSS_HP_SCALE), attackMultiplier: 1.5, rewardMultiplier: 2 };
    if (difficulty === 'veteran-king')
        return { maxHp: randomInt(random, 70000 * BOSS_HP_SCALE, 100000 * BOSS_HP_SCALE), attackMultiplier: 2, rewardMultiplier: 3 };
    return { maxHp: randomInt(random, 12000 * BOSS_HP_SCALE, 24000 * BOSS_HP_SCALE), attackMultiplier: 1, rewardMultiplier: 1 };
}
function raidBossMaps() {
    return maps_1.maps.filter((map) => map.boss && !FINAL_BOSS_MAPS.has(map.name));
}
function createDailyBossRecord(date, random = Math.random, previousMapName) {
    const pool = raidBossMaps();
    const eligiblePool = pool.filter((map) => map.name !== previousMapName);
    const mapsForToday = eligiblePool.length ? eligiblePool : pool;
    const map = mapsForToday[Math.min(mapsForToday.length - 1, Math.floor(random() * mapsForToday.length))];
    const difficulty = DIFFICULTIES[Math.min(DIFFICULTIES.length - 1, Math.floor(random() * DIFFICULTIES.length))];
    const config = bossConfig(difficulty, random);
    return {
        date,
        mapName: map.name,
        bossName: map.boss,
        difficulty,
        maxHp: config.maxHp,
        currentHp: config.maxHp,
        attackMultiplier: config.attackMultiplier,
        rewardMultiplier: config.rewardMultiplier,
        mutation: randomBossMutation(random),
        completed: false,
        killerId: null,
        killerName: null,
        rankings: '[]',
    };
}
async function getOrCreateDailyBoss(ctx, random = Math.random) {
    const date = (0, exploration_dispatch_1.beijingDate)();
    const [existing] = await ctx.database.get('deadcells_daily_bosses', { date });
    if (existing) {
        const mutation = normalizeBossMutation(existing.mutation, random);
        if (existing.mutation !== mutation) {
            await ctx.database.set('deadcells_daily_bosses', { date }, { mutation });
            return { ...existing, mutation };
        }
        return existing;
    }
    const [previous] = await ctx.database.get('deadcells_daily_bosses', { date: (0, exploration_dispatch_1.beijingDate)(Date.now() - 24 * 60 * 60 * 1000) });
    const record = createDailyBossRecord(date, random, previous?.mapName);
    try {
        await ctx.database.create('deadcells_daily_bosses', record);
        return record;
    }
    catch {
        const [created] = await ctx.database.get('deadcells_daily_bosses', { date });
        if (!created)
            throw new Error('今日 Boss 创建失败');
        return created;
    }
}
function critMultiplier(traits) {
    return 1 + traits.reduce((total, id) => total + ((0, amulets_1.getAmuletTrait)(id)?.critDamageBonus || 0), 0);
}
function bossDamageMultiplier(traits) {
    return traits.reduce((total, id) => total * ((0, amulets_1.getAmuletTrait)(id)?.bossDamageMultiplier || 1), 1);
}
function greedMultiplier(traits) {
    return traits.reduce((total, id) => {
        const effect = (0, amulets_1.getAmuletTrait)(id)?.effectId;
        return effect === 'greed-2' ? total * 2 : effect === 'greed-3' ? total * 3 : effect === 'greed-4' ? total * 4 : total;
    }, 1);
}
function calculateBossReward(player, damage, rewardMultiplier, mutation) {
    const levelMultiplier = [1, 2, 3, 4, 5, 5][Math.max(0, Math.min(5, player.bossCellLevel))];
    const mutationMultiplier = mutation === 'greed' ? 2 : 1;
    return Math.round(damage * 10 * rewardMultiplier * levelMultiplier * greedMultiplier((0, amulets_1.activeTraitIds)(player)) * mutationMultiplier);
}
function parseBossRankings(value) {
    if (!value)
        return [];
    try {
        const result = JSON.parse(value);
        return Array.isArray(result) ? result.filter((item) => item && typeof item.userId === 'string' && typeof item.damage === 'number') : [];
    }
    catch {
        return [];
    }
}
function serializeBossRankings(rankings) {
    return JSON.stringify(rankings.sort((a, b) => b.damage - a.damage || a.userId.localeCompare(b.userId)).slice(0, 50));
}
function randomTraitChoices(random, count = 5, excluded = []) {
    const pool = amulets_1.amuletTraitList.filter((trait) => !excluded.includes(trait.id));
    const choices = [];
    while (choices.length < count && pool.length) {
        const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
        choices.push(pool.splice(index, 1)[0].id);
    }
    return choices;
}
function simulateBossRaid(player, boss, config, random = Math.random) {
    const stats = (0, progression_1.getPlayerStats)(player);
    const traits = (0, amulets_1.activeTraitIds)(player);
    const weapon = (0, equipment_1.getEquipment)(player.weaponId);
    const shield = (0, equipment_1.getEquipment)(player.shieldId);
    let playerHp = stats.maxHp;
    let remaining = boss.currentHp;
    let damage = 0;
    let turns = 0;
    let attackCount = 0;
    let coldUsed = false;
    let item1Used = false;
    let item2Used = false;
    let critChance = traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'giant-slayer') ? 100 : stats.critChance;
    let damageTakenMultiplier = shield?.effectId === 'damage-reduction' ? 0.7 : 1;
    let barrierHp = traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'orichalcum') ? stats.maxHp * 0.2 : 0;
    let retaliationReady = false;
    let weaponAttack = stats.attack;
    let penNibReady = false;
    let playerFrozen = false;
    let playerBleeding = 0;
    let playerBleedAttack = 0;
    const mutation = boss.mutation;
    const bossAttackInterval = mutation === 'mediocre' ? 1 : mutation === 'berserk' ? 2 : 3;
    const bossAttackPower = 30 * boss.attackMultiplier * (mutation === 'mediocre' ? 0.5 : 1);
    const events = [];
    const deal = (raw, forcedCrit = false, weaponDamage = false, allowExtras = true) => {
        if (remaining <= 0)
            return;
        const critical = forcedCrit || random() * 100 < critChance;
        const penNibMultiplier = weaponDamage && penNibReady ? 2 : 1;
        if (weaponDamage && penNibReady) {
            penNibReady = false;
            events.push('【笔尖】使本次主武器伤害翻倍！');
        }
        let amount = raw * penNibMultiplier * (critical ? 2 * critMultiplier(traits) : 1) * bossDamageMultiplier(traits);
        if (!coldUsed && traits.includes('cold-forging')) {
            amount *= 2;
            coldUsed = true;
            events.push('【寒气练成】本次 Boss 伤害翻倍！');
        }
        amount = Math.min(remaining, Math.max(0, Math.round(amount)));
        remaining -= amount;
        damage += amount;
        events.push(`对 Boss 造成 ${Math.round(amount)} 点${critical ? '暴击' : ''}伤害！`);
        if (weaponDamage && critical && allowExtras && traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'starfury') && remaining > 0) {
            events.push('【星怒】追加一次独立攻击！');
            deal(raw, false, true, false);
        }
    };
    if (traits.includes('meteor-flash')) {
        playerHp = Math.max(0, playerHp - 90);
        deal(90);
        events.push('【流星一闪】开局自爆！');
    }
    if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'offering')) {
        playerHp = Math.max(1, playerHp - stats.maxHp * 0.99);
        events.push('【祭品】开局献祭99%生命。');
    }
    if (barrierHp > 0)
        events.push(`【奥利哈刚】获得 ${Math.round(barrierHp)} 点护盾！`);
    while (playerHp > 0 && remaining > 0 && turns < config.maxBattleTurns) {
        turns++;
        coldUsed = false;
        attackCount++;
        penNibReady = turns % 3 === 0 && traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'pen-nib');
        if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'golden-order')) {
            const before = playerHp;
            playerHp = Math.min(stats.maxHp, playerHp + stats.maxHp * 0.15);
            events.push(`【黄金律法】回复 ${Math.round(playerHp - before)} 点生命！`);
        }
        if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'demon-form')) {
            weaponAttack += 3;
            events.push('【恶魔形态】攻击力提高3点！');
        }
        if (playerBleeding > 0) {
            const bleedDamage = Math.max(0, Math.round(playerBleedAttack * 0.5));
            const before = playerHp;
            playerHp = Math.max(1, playerHp - bleedDamage);
            playerBleeding--;
            events.push(`玩家受到流血伤害 ${Math.round(before - playerHp)} 点！`);
        }
        const frozenThisTurn = playerFrozen;
        playerFrozen = false;
        const useSkill = Boolean(!frozenThisTurn && weapon?.skill && random() * 100 < config.skillRate);
        const availableItems = [
            !item1Used && player.item1Id ? { id: player.item1Id, slot: 1 } : undefined,
            !item2Used && player.item2Id ? { id: player.item2Id, slot: 2 } : undefined,
        ].filter(Boolean);
        const forceFirstItem = turns === 1 && traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'bottled-lightning') && !item1Used && player.item1Id;
        const useItem = Boolean(!frozenThisTurn && (forceFirstItem || (availableItems.length && random() * 100 < config.itemUseRate)));
        if (frozenThisTurn) {
            events.push('玩家被冰冻，无法行动！');
        }
        else if (useItem) {
            const picked = forceFirstItem
                ? availableItems.find((item) => item.slot === 1)
                : availableItems[Math.min(availableItems.length - 1, Math.floor(random() * availableItems.length))];
            if (picked.slot === 1)
                item1Used = true;
            else
                item2Used = true;
            const item = (0, equipment_1.getEquipment)(picked.id);
            if (item?.effectId === 'powerful-grenade')
                deal(weaponAttack * 1.5);
            else if (item?.effectId === 'cluster-grenade')
                for (let index = 0; index < 6 && remaining > 0; index++)
                    deal(10);
            else if (item?.effectId === 'whirlwind-knife')
                deal(15);
            else if (item?.effectId === 'vampirism-item')
                deal(weaponAttack);
            else if (item?.effectId === 'displacement')
                deal(weaponAttack * 2);
            else
                events.push(`使用道具【${item?.name || '未知道具'}】，本回合不攻击。`);
        }
        else {
            const hits = weapon?.effectId === 'double-hit' ? 2 : weapon?.effectId === 'triple-hit' ? 3 : 1;
            let guaranteedCrit = Boolean(weapon?.alwaysCrit || useSkill);
            if (weapon?.guaranteedCritAttacks?.includes(attackCount))
                guaranteedCrit = true;
            if (weapon?.effectId === 'even-crit' && turns % 2 === 0)
                guaranteedCrit = true;
            if (weapon?.effectId === 'third-turn-crit' && turns === 3)
                guaranteedCrit = true;
            if (weapon?.effectId === 'first-turn-crit' && turns === 1)
                guaranteedCrit = true;
            for (let index = 0; index < hits && remaining > 0; index++)
                deal(weaponAttack, guaranteedCrit || retaliationReady, true);
            retaliationReady = false;
            if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'prism-mirror') && random() * 100 < 30 && remaining > 0) {
                events.push('【棱镜之镜】追加一次独立攻击！');
                deal(weaponAttack, false, true, false);
            }
            if (weapon?.effectId === 'electric-damage' && remaining > 0) {
                const extraHits = random() < 0.1 ? 3 : random() < 0.2 ? 1 : 0;
                for (let index = 0; index < extraHits; index++)
                    deal(weaponAttack, guaranteedCrit, true);
            }
            if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'combo')) {
                weaponAttack += 5;
                events.push('【连击】主武器攻击力提高5点！');
            }
        }
        if (remaining <= 0)
            break;
        if (turns % bossAttackInterval === 0) {
            let bossDamage = bossAttackPower * (random() < 0.5 ? 2 : 1);
            if (shield?.blockRate && random() * 100 < shield.blockRate)
                bossDamage = 0;
            bossDamage *= damageTakenMultiplier;
            if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'scales') && bossDamage > 50) {
                bossDamage *= 0.5;
                events.push('【鳞甲】使本次 Boss 伤害降低50%！');
            }
            if (barrierHp > 0 && bossDamage > 0) {
                const absorbed = Math.min(barrierHp, bossDamage);
                barrierHp -= absorbed;
                bossDamage -= absorbed;
                events.push(`【奥利哈刚】吸收 ${Math.round(absorbed)} 点伤害，剩余护盾 ${Math.round(barrierHp)} 点！`);
            }
            playerHp = Math.max(0, playerHp - bossDamage);
            events.push(`Boss 发动攻击，造成 ${Math.round(bossDamage)} 点伤害！`);
            if (bossDamage > 0 && traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'counter-stance'))
                retaliationReady = true;
            if (bossDamage > 0 && mutation === 'frozen') {
                if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'endurance') && random() < 0.5) {
                    events.push('【耐力】免疫了 Boss 的冰冻！');
                }
                else if (random() < 0.5) {
                    playerFrozen = true;
                    events.push('Boss 使玩家冰冻一回合！');
                }
            }
            if (bossDamage > 0 && mutation === 'bleeding') {
                if (traits.some((id) => (0, amulets_1.getAmuletTrait)(id)?.effectId === 'endurance') && random() < 0.5) {
                    events.push('【耐力】免疫了 Boss 的流血！');
                }
                else {
                    playerBleeding = 3;
                    playerBleedAttack = bossAttackPower;
                    events.push('玩家进入流血状态！');
                }
            }
        }
        else {
            events.push('Boss 正在蓄力……');
        }
    }
    return { damage: Math.round(damage), turns, playerHp: Math.round(playerHp), killed: remaining <= 0, events };
}
