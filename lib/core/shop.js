"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopRefreshKey = shopRefreshKey;
exports.parseShopItems = parseShopItems;
exports.parsePurchasedSlots = parsePurchasedSlots;
exports.serializeShopItems = serializeShopItems;
exports.serializePurchasedSlots = serializePurchasedSlots;
exports.generateMysteryShopItems = generateMysteryShopItems;
exports.getOrCreateMysteryShop = getOrCreateMysteryShop;
const amulets_1 = require("../data/amulets");
const equipment_1 = require("../data/equipment");
const SHOP_SLOT_COUNT = 9;
const SHOP_RECORD_ID = 1;
const SHOP_KINDS = ['super-carrot', 'original-chicken', 'power-scroll', 'amulet', 'weapon'];
function parseJson(value, fallback) {
    if (!value)
        return fallback;
    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    }
    catch {
        return fallback;
    }
}
function shopRefreshKey(now = Date.now(), intervalSeconds = 10800) {
    return String(Math.floor(now / (intervalSeconds * 1000)));
}
function parseShopItems(value) {
    const parsed = parseJson(value, []);
    return parsed.filter((item) => Boolean(item && typeof item === 'object' && typeof item.slot === 'number' && typeof item.kind === 'string'));
}
function parsePurchasedSlots(value) {
    return parseJson(value, []).filter((slot) => typeof slot === 'number');
}
function serializeShopItems(items) {
    return JSON.stringify(items);
}
function serializePurchasedSlots(slots) {
    return JSON.stringify([...new Set(slots)].sort((a, b) => a - b));
}
function fixedAmuletTraits(random, excluded) {
    const traits = [];
    while (traits.length < 3) {
        const trait = (0, amulets_1.randomAmuletTrait)(random, [...excluded, ...traits]);
        if (!trait)
            break;
        traits.push(trait);
    }
    return traits;
}
function generateMysteryShopItems(random = Math.random) {
    const items = [];
    const usedTraits = [];
    for (let slot = 1; slot <= SHOP_SLOT_COUNT; slot++) {
        const kind = SHOP_KINDS[Math.min(SHOP_KINDS.length - 1, Math.floor(random() * SHOP_KINDS.length))];
        if (kind === 'super-carrot') {
            items.push({ slot, kind, name: '超级萝卜', description: '生命上限永久+5' });
        }
        else if (kind === 'original-chicken') {
            items.push({ slot, kind, name: '原味鸡', description: '暴击率永久+3%' });
        }
        else if (kind === 'power-scroll') {
            items.push({ slot, kind, name: '威力卷轴', description: '下一场普通玩家对战攻击力+10、暴击率+10%、最大生命+20' });
        }
        else if (kind === 'weapon') {
            const weapon = (0, equipment_1.randomEquipment)(random, 'weapon');
            const trait = (0, amulets_1.randomAmuletTrait)(random, usedTraits);
            if (trait)
                usedTraits.push(trait);
            items.push({
                slot,
                kind,
                name: `${weapon.name}（无色）`,
                description: weapon.description,
                equipmentId: weapon.id,
                weaponQuality: 'colorless',
                weaponTrait: trait || null,
            });
        }
        else {
            const traits = fixedAmuletTraits(random, usedTraits);
            usedTraits.push(...traits);
            const amuletId = ['amulet-1', 'amulet-2', 'amulet-3', 'amulet-4'][Math.min(3, Math.floor(random() * 4))];
            const amuletName = (0, amulets_1.getAmulet)(amuletId)?.name || '炼化护符';
            items.push({
                slot,
                kind,
                name: amuletName,
                description: '固定拥有三个不重复词条',
                equipmentId: amuletId,
                traits,
            });
        }
    }
    return items;
}
async function getOrCreateMysteryShop(ctx, refreshSeconds, random = Math.random) {
    const refreshKey = shopRefreshKey(Date.now(), refreshSeconds);
    const [existing] = await ctx.database.get('deadcells_mystery_shop', { id: SHOP_RECORD_ID });
    if (existing?.refreshKey === refreshKey)
        return existing;
    const record = {
        id: SHOP_RECORD_ID,
        refreshKey,
        items: serializeShopItems(generateMysteryShopItems(random)),
        purchased: '[]',
    };
    if (existing) {
        await ctx.database.set('deadcells_mystery_shop', { id: SHOP_RECORD_ID }, {
            refreshKey: record.refreshKey,
            items: record.items,
            purchased: record.purchased,
        });
        return record;
    }
    try {
        await ctx.database.create('deadcells_mystery_shop', record);
        return record;
    }
    catch {
        const [created] = await ctx.database.get('deadcells_mystery_shop', { id: SHOP_RECORD_ID });
        if (!created)
            throw new Error('神秘商店初始化失败');
        return created;
    }
}
