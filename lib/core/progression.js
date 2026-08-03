"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelConfig = exports.MAX_BOSS_CELL_LEVEL = void 0;
exports.createPlayer = createPlayer;
exports.getLevelConfig = getLevelConfig;
exports.getPlayerStats = getPlayerStats;
exports.formatWinRate = formatWinRate;
exports.getAmuletCellMultiplier = getAmuletCellMultiplier;
const equipment_1 = require("../data/equipment");
const amulets_1 = require("../data/amulets");
const equipment_2 = require("../data/equipment");
exports.MAX_BOSS_CELL_LEVEL = 5;
exports.levelConfig = [
    { cost: 0, multiplier: 1, hp: 0, attack: 0, crit: 0 },
    { cost: 1000, multiplier: 2, hp: 10, attack: 3, crit: 5 },
    { cost: 2000, multiplier: 3, hp: 10, attack: 3, crit: 5 },
    { cost: 3000, multiplier: 4, hp: 10, attack: 3, crit: 5 },
    { cost: 4000, multiplier: 5, hp: 10, attack: 3, crit: 5 },
    { cost: 5000, multiplier: 5, hp: 10, attack: 3, crit: 5 },
];
function createPlayer(userId, username) {
    return {
        userId,
        username,
        cells: 0,
        bossCellLevel: 0,
        weaponId: 'rusty-knife',
        weaponQuality: 'normal',
        weaponTrait: null,
        shieldId: null,
        item1Id: null,
        item2Id: null,
        amuletId: 'prisoner-necklace',
        amuletTraits: '[]',
        battleCount: 0,
        winCount: 0,
        lastExploreAt: 0,
        lastBattleAt: 0,
        exploreState: null,
        dailyExploreDate: '',
        dailyExploreCount: 0,
        lastBossRaidAt: 0,
        bossChoiceState: null,
        shopMaxHpBonus: 0,
        shopCritBonus: 0,
        powerScrollReady: false,
    };
}
function getLevelConfig(level) {
    return exports.levelConfig[Math.max(0, Math.min(exports.MAX_BOSS_CELL_LEVEL, level))];
}
function getPlayerStats(player, includePowerScroll = false) {
    const levelIndex = Math.max(0, Math.min(exports.MAX_BOSS_CELL_LEVEL, player.bossCellLevel));
    const cumulativeBonus = exports.levelConfig.slice(1, levelIndex + 1).reduce((total, current) => ({
        hp: total.hp + current.hp,
        attack: total.attack + current.attack,
        crit: total.crit + current.crit,
    }), { hp: 0, attack: 0, crit: 0 });
    const weapon = (0, equipment_1.getEquipment)(player.weaponId);
    const shield = (0, equipment_1.getEquipment)(player.shieldId);
    const amulet = (0, amulets_1.getAmulet)(player.amuletId);
    const qualityBonus = (0, equipment_2.weaponQualityBonus)(player.weaponQuality);
    const traitStats = (0, amulets_1.activeTraitIds)(player).map(amulets_1.getAmuletTrait).filter(Boolean).reduce((total, current) => ({
        attack: total.attack + (current?.attackBonus || 0),
        crit: total.crit + (current?.critBonus || 0),
        maxHp: total.maxHp + (current?.maxHpBonus || 0),
    }), { attack: 0, crit: 0, maxHp: 0 });
    const maxHpBonus = traitStats.maxHp + (player.shopMaxHpBonus || 0) + (includePowerScroll && player.powerScrollReady ? 20 : 0);
    const maxHp = weapon?.cursed ? 1 : 50 + cumulativeBonus.hp + maxHpBonus;
    return {
        maxHp,
        attack: 10 + cumulativeBonus.attack + (weapon?.attackBonus || 0) + qualityBonus.attack + traitStats.attack + (includePowerScroll && player.powerScrollReady ? 10 : 0),
        critChance: Math.min(100, cumulativeBonus.crit + (weapon?.critBonus || 0) + qualityBonus.crit + traitStats.crit + (player.shopCritBonus || 0) + (includePowerScroll && player.powerScrollReady ? 10 : 0)),
        weaponName: weapon?.name || '无武器',
        shieldName: shield?.name || '无盾牌',
        amuletName: amulet?.name || '囚者颈环',
    };
}
function formatWinRate(player) {
    return player.battleCount ? `${((player.winCount / player.battleCount) * 100).toFixed(2)}%` : '0%';
}
function getAmuletCellMultiplier(player) {
    return (0, amulets_1.activeTraitIds)(player)
        .map(amulets_1.getAmuletTrait)
        .reduce((multiplier, trait) => {
        if (trait?.effectId === 'greed-2')
            return multiplier * 2;
        if (trait?.effectId === 'greed-3')
            return multiplier * 3;
        if (trait?.effectId === 'greed-4')
            return multiplier * 4;
        return multiplier;
    }, 1);
}
