"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateDeathmatch = simulateDeathmatch;
const equipment_1 = require("../data/equipment");
const progression_1 = require("./progression");
const boss_1 = require("./boss");
function percent(random, value) {
    return random() * 100 < value;
}
function at(value) {
    return Math.max(0, Math.round(value));
}
function addEvent(events, text, actor) {
    events.push({ text, actorId: actor?.userId, actorName: actor?.username });
}
function playerStatsForDeathmatch(player) {
    return (0, progression_1.getPlayerStats)({ ...player, amuletTraits: '[]', weaponTrait: null });
}
function createFighter(player) {
    const stats = playerStatsForDeathmatch(player);
    return {
        userId: player.userId,
        username: player.username,
        weaponId: player.weaponId,
        shieldId: player.shieldId,
        item1Id: player.item1Id,
        item2Id: player.item2Id,
        stats: { maxHp: stats.maxHp, attack: stats.attack, critChance: stats.critChance },
        hp: stats.maxHp,
        maxHp: stats.maxHp,
        attackCount: 0,
        actionCount: 0,
        item1Used: false,
        item2Used: false,
        offhandCooldown: 0,
        bleeding: 0,
        bleedAttack: 0,
        stunned: false,
        frozen: false,
        markedDamageMultiplier: 1,
        nextAttackMultiplier: 1,
        charging: false,
        nightSongActive: false,
        nightSongUsed: false,
        turretTurns: 0,
        owlActive: false,
        riftAuraTurns: 0,
        decoyHp: 0,
        decoyActive: false,
        damageTakenMultiplier: (0, equipment_1.getEquipment)(player.shieldId)?.effectId === 'damage-reduction' ? 0.7 : 1,
        damageDealtMultiplier: 1,
        retaliationReady: false,
        frontlineTurns: 0,
        frontlineBoostActive: false,
        warSpearCharged: false,
        heavyChargeUsed: false,
    };
}
function createBoss(name, hp) {
    return {
        userId: '__deathmatch_boss__',
        username: name,
        weaponId: null,
        shieldId: null,
        item1Id: null,
        item2Id: null,
        stats: { maxHp: hp, attack: 40, critChance: 50 },
        hp,
        maxHp: hp,
        attackCount: 0,
        actionCount: 0,
        item1Used: true,
        item2Used: true,
        offhandCooldown: 0,
        bleeding: 0,
        bleedAttack: 0,
        stunned: false,
        frozen: false,
        markedDamageMultiplier: 1,
        nextAttackMultiplier: 1,
        charging: false,
        nightSongActive: false,
        nightSongUsed: false,
        turretTurns: 0,
        owlActive: false,
        riftAuraTurns: 0,
        decoyHp: 0,
        decoyActive: false,
        damageTakenMultiplier: 1,
        damageDealtMultiplier: 1,
        retaliationReady: false,
        frontlineTurns: 0,
        frontlineBoostActive: false,
        warSpearCharged: false,
        heavyChargeUsed: false,
    };
}
function alive(fighter) {
    return fighter.hp > 0;
}
function weapon(source) {
    return (0, equipment_1.getEquipment)(source.weaponId);
}
function offhand(source) {
    return (0, equipment_1.getEquipment)(source.shieldId);
}
function itemAvailable(source, random) {
    const choices = [
        source.item1Id && !source.item1Used ? { id: source.item1Id, slot: 1 } : undefined,
        source.item2Id && !source.item2Used ? { id: source.item2Id, slot: 2 } : undefined,
    ].filter(Boolean);
    return choices.length ? choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))] : undefined;
}
function heal(source, amount, events, label) {
    const before = source.hp;
    source.hp = Math.min(source.maxHp, source.hp + amount);
    addEvent(events, `${source.username} 通过【${label}】回复 ${at(source.hp - before)} 点生命！`, source);
}
function addBleed(target, source, events) {
    target.bleeding = 3;
    target.bleedAttack = source.stats.attack;
    target.bleedSourceId = source.userId;
    addEvent(events, `${target.username} 进入流血状态，持续3回合！`, source);
}
function applyStatus(target, type, events, source, label) {
    target[type === 'stun' ? 'stunned' : 'frozen'] = true;
    addEvent(events, `${target.username} 被${label}${type === 'stun' ? '眩晕' : '冰冻'}一回合！`, source);
}
function takeDamage(source, target, raw, random, events, options = {}) {
    if (!alive(target))
        return 'dead';
    if (target.decoyActive && !options.reflected) {
        target.decoyHp = Math.max(0, target.decoyHp - raw);
        addEvent(events, `${target.username} 的爆炸诱饵承受 ${at(raw)} 点伤害，剩余 ${at(target.decoyHp)} 点！`, target);
        if (target.decoyHp > 0)
            return 'survived';
        target.decoyActive = false;
        addEvent(events, `${target.username} 的爆炸诱饵爆炸！`, target);
        return takeDamage(target, source, target.stats.attack * 0.5, random, events, { reflected: true });
    }
    const sourceWeapon = weapon(source);
    const targetShield = offhand(target);
    const shieldBlocked = Boolean(options.weaponDamage && targetShield?.blockRate && !sourceWeapon?.ignoreShield && percent(random, targetShield.blockRate));
    if (targetShield && shieldBlocked && sourceWeapon?.effectId === 'blocked-crit') {
        addEvent(events, `${source.username} 的钉入矛穿透格挡并造成暴击！`, source);
        options = { ...options, critical: true };
    }
    else if (targetShield && shieldBlocked) {
        addEvent(events, `${target.username} 使用【${targetShield.name}】成功格挡攻击！`, target);
        if (targetShield.shieldEffect === 'stun')
            applyStatus(source, 'stun', events, target, '击晕盾');
        if (targetShield.shieldEffect === 'freeze')
            applyStatus(source, 'freeze', events, target, '寒冰盾');
        if (targetShield.shieldEffect === 'reflect') {
            const finalDamage = raw * source.damageDealtMultiplier * target.damageTakenMultiplier * source.markedDamageMultiplier * (options.critical ? 2 : 1);
            addEvent(events, `${target.username} 的尖刺盾反弹本次最终伤害！`, target);
            return takeDamage(target, source, 0, random, events, { reflected: true, fixedDamage: finalDamage });
        }
        if (targetShield.shieldEffect === 'invincible')
            addEvent(events, `${target.username} 获得下一次受击无敌！`, target);
        if (targetShield.effectId === 'assault') {
            takeDamage(target, source, 20, random, events);
            applyStatus(source, 'stun', events, target, '盾牌突击');
        }
        if (targetShield.effectId === 'frontline' && !target.frontlineBoostActive) {
            target.frontlineBoostActive = true;
            target.damageDealtMultiplier *= 1.5;
            target.frontlineTurns = 3;
            addEvent(events, `${target.username} 的前线盾使接下来3回合伤害提升50%！`, target);
        }
        return 'survived';
    }
    let damage = options.fixedDamage !== undefined
        ? options.fixedDamage
        : raw * source.damageDealtMultiplier * target.damageTakenMultiplier * source.markedDamageMultiplier;
    if (options.critical)
        damage *= 2;
    damage = Math.max(0, Math.round(damage));
    target.hp = Math.max(0, target.hp - damage);
    addEvent(events, `${target.username} 受到 ${damage} 点${options.critical ? '暴击' : ''}伤害！`, source);
    if (target.hp <= 0) {
        if (options.nonLethal) {
            target.hp = 1;
            return 'survived';
        }
        if (target.nightSongActive && !target.nightSongUsed) {
            target.nightSongUsed = true;
            target.nightSongActive = false;
            target.hp = 1;
            addEvent(events, `${target.username} 的夜歌抵挡了致命伤害，保留1点生命！`, target);
            return 'survived';
        }
        return 'dead';
    }
    return 'survived';
}
function pickTarget(source, candidates, random) {
    const targets = candidates.filter((target) => target !== source && alive(target));
    return targets.length ? targets[Math.min(targets.length - 1, Math.floor(random() * targets.length))] : undefined;
}
function useItem(source, target, random, events, config) {
    const choices = [
        source.item1Id && !source.item1Used ? { id: source.item1Id, slot: 1 } : undefined,
        source.item2Id && !source.item2Used ? { id: source.item2Id, slot: 2 } : undefined,
    ].filter(Boolean);
    if (!choices.length)
        return false;
    const picked = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
    if (picked.slot === 1)
        source.item1Used = true;
    else
        source.item2Used = true;
    const item = (0, equipment_1.getEquipment)(picked.id);
    if (!item)
        return false;
    addEvent(events, `${source.username} 使用道具【${item.name}】，本回合不进行主武器攻击！`, source);
    if (item.effectId === 'powerful-grenade')
        return takeDamage(source, target, source.stats.attack * 1.5, random, events);
    if (item.effectId === 'cluster-grenade') {
        for (let index = 0; index < 6 && alive(target); index++) {
            const result = takeDamage(source, target, 10, random, events, { critical: percent(random, 20) });
            if (result === 'dead')
                return result;
        }
    }
    else if (item.effectId === 'flashbang' || item.effectId === 'bear-trap') {
        applyStatus(target, 'stun', events, source, item.name);
    }
    else if (item.effectId === 'frost-grenade') {
        applyStatus(target, 'freeze', events, source, item.name);
    }
    else if (item.effectId === 'whirlwind-knife') {
        const result = takeDamage(source, target, 15, random, events);
        if (result === 'dead')
            return result;
        addBleed(target, source, events);
    }
    else if (item.effectId === 'vampirism-item') {
        const before = target.hp;
        const result = takeDamage(source, target, source.stats.attack, random, events);
        heal(source, Math.max(0, before - target.hp), events, '吸血（道具）');
        if (result === 'dead')
            return result;
    }
    else if (item.effectId === 'displacement') {
        source.nextAttackMultiplier = 2;
        addEvent(events, `${source.username} 的下一次攻击伤害翻倍！`, source);
    }
    else if (item.effectId === 'rift-aura') {
        source.riftAuraTurns = 3;
    }
    else if (item.effectId === 'war-owl' || item.effectId === 'serenade') {
        source.owlActive = true;
        if (item.effectId === 'serenade')
            source.nightSongActive = true;
    }
    else if (item.effectId === 'health-flask') {
        heal(source, source.maxHp * 0.5, events, '血瓶');
    }
    else if (item.effectId === 'explosive-decoy') {
        source.decoyActive = true;
        source.decoyHp = 20;
    }
    else if (item.effectId === 'circular-turret') {
        source.turretEffect = 'circular';
        source.turretTurns = 1000;
    }
    else if (item.effectId === 'heavy-turret') {
        source.turretEffect = 'heavy';
        source.turretTurns = 1000;
        source.damageDealtMultiplier *= 1.2;
    }
    else if (item.effectId === 'corrupted-power') {
        source.stats.critChance = 100;
        source.damageTakenMultiplier *= 1.5;
    }
    return 'survived';
}
function tickOngoing(source, target, fighters, random, events, config) {
    if (source.bleeding > 0) {
        const origin = fighters.find((fighter) => fighter.userId === source.bleedSourceId) || source;
        const result = takeDamage(origin, source, source.bleedAttack * 0.5, random, events, { nonLethal: true });
        source.bleeding--;
        if (result === 'dead')
            return result;
    }
    if (target && source.riftAuraTurns > 0) {
        const result = takeDamage(source, target, 20, random, events);
        source.riftAuraTurns--;
        if (result === 'dead')
            return result;
    }
    if (target && source.turretEffect && source.turretTurns > 0) {
        const result = takeDamage(source, target, source.stats.attack * (source.turretEffect === 'circular' ? 0.5 : 1), random, events);
        source.turretTurns--;
        if (result === 'dead')
            return result;
        if (source.turretEffect === 'circular')
            addBleed(target, source, events);
    }
    if (target && source.owlActive) {
        const result = takeDamage(source, target, source.stats.attack, random, events, { critical: source.hp < source.maxHp * 0.5 });
        if (result === 'dead')
            return result;
    }
    return 'survived';
}
function playerAction(source, target, fighters, random, events, config) {
    source.actionCount++;
    if (source.offhandCooldown > 0)
        source.offhandCooldown--;
    if (tickOngoing(source, target, fighters, random, events, config) === 'dead')
        return 'dead';
    if (source.hp <= 0)
        return 'dead';
    if (source.stunned || source.frozen) {
        addEvent(events, `${source.username} 处于${source.frozen ? '冰冻' : '眩晕'}状态，无法行动！`, source);
        source.stunned = false;
        source.frozen = false;
        return 'survived';
    }
    const currentWeapon = weapon(source);
    if ((currentWeapon?.effectId === 'heavy-charge' && !source.heavyChargeUsed) || (currentWeapon?.effectId === 'charge' && !source.warSpearCharged)) {
        source.heavyChargeUsed = currentWeapon?.effectId === 'heavy-charge' ? true : source.heavyChargeUsed;
        source.warSpearCharged = currentWeapon?.effectId === 'charge' ? true : source.warSpearCharged;
        source.charging = true;
        addEvent(events, `${source.username} 进行蓄力，本回合无法攻击或使用道具！`, source);
        return 'survived';
    }
    source.charging = false;
    const currentOffhand = offhand(source);
    if (source.offhandCooldown === 0 && currentOffhand?.type === 'offhand' && (currentOffhand.effectId === 'ice-bow' || currentOffhand.effectId === 'bleed' || currentOffhand.skill === 'north-star') && percent(random, config.skillRate)) {
        source.offhandCooldown = 3;
        addEvent(events, `${source.username} 使用副手【${currentOffhand.name}】，本回合不进行主武器攻击！`, source);
        if (currentOffhand.effectId === 'ice-bow') {
            const result = takeDamage(source, target, 10, random, events);
            if (result === 'dead')
                return result;
            applyStatus(target, 'freeze', events, source, '冰之弓');
        }
        else if (currentOffhand.effectId === 'bleed')
            addBleed(target, source, events);
        else {
            source.markedDamageMultiplier = 1.5;
            addEvent(events, `${source.username} 触发【北斗标记】，本局伤害提升50%！`, source);
        }
        return 'survived';
    }
    if (itemAvailable(source, random) && percent(random, config.itemUseRate)) {
        const itemResult = useItem(source, target, random, events, config);
        if (itemResult)
            return itemResult;
    }
    source.attackCount++;
    const hits = currentWeapon?.effectId === 'double-hit' ? 2 : currentWeapon?.effectId === 'triple-hit' ? 3 : 1;
    let guaranteedCrit = Boolean(currentWeapon?.alwaysCrit || source.retaliationReady || (source.warSpearCharged && (source.warSpearCharged = false)));
    if (currentWeapon?.guaranteedCritAttacks?.includes(source.attackCount))
        guaranteedCrit = true;
    if (currentWeapon?.lowHpCrit && source.hp < source.maxHp * 0.5)
        guaranteedCrit = true;
    if (currentWeapon?.frozenTargetCrit && target.frozen)
        guaranteedCrit = true;
    if (currentWeapon?.effectId === 'first-turn-crit' && source.attackCount === 1)
        guaranteedCrit = true;
    if (currentWeapon?.effectId === 'even-crit' && source.actionCount % 2 === 0)
        guaranteedCrit = true;
    if (currentWeapon?.effectId === 'third-turn-crit' && source.actionCount === 3)
        guaranteedCrit = true;
    if (currentWeapon?.effectId === 'lightning-beam' && source.actionCount >= 2)
        guaranteedCrit = true;
    if (currentWeapon?.skill && percent(random, config.skillRate))
        guaranteedCrit = true;
    if (source.charging)
        guaranteedCrit = true;
    source.retaliationReady = false;
    for (let index = 0; index < hits && alive(target); index++) {
        const critical = guaranteedCrit || percent(random, source.stats.critChance);
        const multiplier = source.nextAttackMultiplier;
        source.nextAttackMultiplier = 1;
        const result = takeDamage(source, target, source.stats.attack * multiplier, random, events, { weaponDamage: true, critical });
        if (result === 'dead')
            return result;
        if (currentWeapon?.stunRate && percent(random, currentWeapon.stunRate) && alive(target)) {
            applyStatus(target, 'stun', events, source, currentWeapon.name);
        }
    }
    if (currentWeapon?.effectId === 'bleed' && alive(target))
        addBleed(target, source, events);
    if (currentWeapon?.effectId === 'electric-damage' && alive(target)) {
        const extraHits = random() < 0.1 ? 3 : random() < 0.2 ? 1 : 0;
        for (let index = 0; index < extraHits && alive(target); index++) {
            const result = takeDamage(source, target, source.stats.attack, random, events, { weaponDamage: true, critical: percent(random, source.stats.critChance) });
            if (result === 'dead')
                return result;
        }
    }
    if (currentWeapon?.effectId === 'lightning-beam' && alive(source)) {
        const result = takeDamage(source, source, source.stats.attack * 0.5, random, events, { reflected: true });
        if (result === 'dead')
            return result;
    }
    return 'survived';
}
function bossAction(boss, target, fighters, random, events, config) {
    const ongoing = tickOngoing(boss, target, [boss, ...fighters], random, events, config);
    if (ongoing === 'dead')
        return ongoing;
    const critical = percent(random, 50);
    addEvent(events, `Boss 攻击 ${target.username}！`, boss);
    return takeDamage(boss, target, 40, random, events, { critical });
}
function randomBoss(random) {
    const pool = (0, boss_1.raidBossMaps)();
    const map = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
    return { mapName: map.name, bossName: map.boss || '区域 Boss' };
}
function simulateDeathmatch(players, config, random = Math.random) {
    const bossMeta = randomBoss(random);
    const bossHp = 300 + Math.floor(random() * 401);
    const fighters = players.map(createFighter);
    const boss = createBoss(bossMeta.bossName, bossHp);
    const events = [];
    let turns = 0;
    let lastBossKillerId;
    addEvent(events, `死斗开始！${bossMeta.mapName} 的 ${bossMeta.bossName} 出现，生命 ${bossHp}，攻击力 40，暴击率 50%。`);
    addEvent(events, '护符词条和无色武器词条在死斗中失效。');
    while (alive(boss) && fighters.some(alive) && turns < config.maxBattleTurns * Math.max(1, fighters.length)) {
        for (const fighter of fighters) {
            if (!alive(fighter) || !alive(boss))
                continue;
            turns++;
            const before = boss.hp;
            const result = playerAction(fighter, boss, fighters, random, events, config);
            if (before > 0 && boss.hp <= 0)
                lastBossKillerId = fighter.userId;
            if (result === 'dead')
                addEvent(events, `${fighter.username} 被 Boss 击败！`, fighter);
            if (!alive(boss))
                break;
        }
        if (alive(boss)) {
            const target = pickTarget(boss, fighters, random);
            if (!target)
                break;
            turns++;
            const bleedSourceId = boss.bleedSourceId;
            const result = bossAction(boss, target, fighters, random, events, config);
            if (result === 'dead' && bleedSourceId)
                lastBossKillerId = bleedSourceId;
            if (result === 'dead')
                addEvent(events, `${target.username} 被 Boss 击败！`, target);
        }
    }
    const bossKilled = !alive(boss);
    const bossReward = bossKilled ? bossHp * 100 : 0;
    let winner;
    if (bossKilled) {
        const alivePlayers = fighters.filter(alive);
        if (alivePlayers.length > 0) {
            const startIndex = Math.max(0, fighters.findIndex((fighter) => fighter.userId === lastBossKillerId));
            const order = fighters.slice(startIndex).concat(fighters.slice(0, startIndex));
            addEvent(events, 'Boss 已被击败，死斗阶段开始！');
            let round = 0;
            while (!winner && round < config.maxBattleTurns * Math.max(1, fighters.length)) {
                round++;
                for (const fighter of order) {
                    if (!alive(fighter) || winner)
                        continue;
                    const targets = fighters.filter((candidate) => candidate !== fighter && alive(candidate));
                    if (!targets.length) {
                        winner = fighter;
                        break;
                    }
                    const target = targets[Math.min(targets.length - 1, Math.floor(random() * targets.length))];
                    turns++;
                    const result = playerAction(fighter, target, fighters, random, events, config);
                    if (result === 'dead')
                        addEvent(events, `${target.username} 被 ${fighter.username} 淘汰！`, fighter);
                    if (fighters.filter(alive).length === 1)
                        winner = fighters.find(alive);
                }
            }
        }
    }
    return {
        bossMapName: bossMeta.mapName,
        bossName: bossMeta.bossName,
        bossHp,
        bossKilled,
        bossReward,
        turns,
        winnerId: winner?.userId,
        winnerName: winner?.username,
        events,
        participants: fighters.map((fighter) => ({ userId: fighter.userId, username: fighter.username, hp: at(fighter.hp), maxHp: fighter.maxHp, eliminated: !alive(fighter) })),
    };
}
