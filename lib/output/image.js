"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPlayerCard = renderPlayerCard;
exports.renderExploreCard = renderExploreCard;
exports.renderBattleCard = renderBattleCard;
exports.renderEquipmentDropCard = renderEquipmentDropCard;
exports.renderAmuletCard = renderAmuletCard;
exports.renderAmuletChoicesCard = renderAmuletChoicesCard;
exports.renderAmuletDropCard = renderAmuletDropCard;
exports.renderForgeCard = renderForgeCard;
exports.renderBossRaidCard = renderBossRaidCard;
exports.renderBossTraitChoiceCard = renderBossTraitChoiceCard;
exports.renderDeathmatchTraitChoiceCard = renderDeathmatchTraitChoiceCard;
exports.renderDeathmatchCard = renderDeathmatchCard;
exports.renderMysteryShopCard = renderMysteryShopCard;
exports.renderWeeklyCard = renderWeeklyCard;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const koishi_1 = require("koishi");
const equipment_1 = require("../data/equipment");
const amulets_1 = require("../data/amulets");
const maps_1 = require("../data/maps");
const progression_1 = require("../core/progression");
const assetDirectory = (0, node_path_1.resolve)(__dirname, '../../pic');
const avatarCache = new Map();
const mapImages = {
    被囚者的牢房: 'mapandboss/牢房.webp',
    有罪者的大道: 'mapandboss/有罪者的大道.webp',
    猛毒下水道: 'mapandboss/猛毒下水道.webp',
    荒废植物园: 'mapandboss/荒废植物园.webp',
    监狱深处: 'mapandboss/监狱深处.webp',
    腐化牢房: 'mapandboss/腐化牢房.webp',
    壁垒: 'mapandboss/壁垒（场景）.webp',
    藏骨堂: 'mapandboss/藏骨堂.webp',
    旧下水道: 'mapandboss/旧下水道.webp',
    被弃者沼泽: 'mapandboss/被弃者沼泽.webp',
    黑色大桥: 'mapandboss/黑色大桥.webp',
    作呕地窖: 'mapandboss/作呕地窖.webp',
    巢穴: 'mapandboss/巢穴.webp',
    雾萦港湾: 'mapandboss/雾萦港湾.webp',
    沉睡的庇护所: 'mapandboss/沉睡庇护所.webp',
    墓地: 'mapandboss/墓地.webp',
    崩坏神庙: 'mapandboss/崩坏神庙.webp',
    钟楼: 'mapandboss/钟楼.webp',
    被遗忘的陵墓: 'mapandboss/被遗忘的陵墓.webp',
    山洞: 'mapandboss/山洞.webp',
    不死海滩: 'mapandboss/不死海滩.webp',
    时钟室: 'mapandboss/时钟室.webp',
    守护者的居所: 'mapandboss/守护者的居所.webp',
    阴森墓园: 'mapandboss/阴森墓园.webp',
    山巅城堡: 'mapandboss/山巅城堡.webp',
    废弃酿酒厂: 'mapandboss/废弃酿酒厂.webp',
    感染船骸: 'mapandboss/Infested_Shipwreck.png',
    王座之间: 'mapandboss/王座之间.webp',
    灯塔: 'mapandboss/灯塔.webp',
    塔顶: 'mapandboss/塔顶.webp',
    观星实验所: 'mapandboss/观星实验所.webp',
    观星台: 'mapandboss/观星台.webp',
};
const mapBosses = {
    黑色大桥: { name: '大桥守卫', image: 'mapandboss/大桥守卫.webp' },
    作呕地窖: { name: '大眼', image: 'mapandboss/大眼.webp' },
    巢穴: { name: '多眼怪', image: 'mapandboss/多眼怪.webp' },
    墓地: { name: '稻草人', image: 'mapandboss/稻草人.webp' },
    时钟室: { name: '时间守护者', image: 'mapandboss/时间守护者.webp' },
    守护者的居所: { name: '巨人', image: 'mapandboss/巨人.webp' },
    王座之间: { name: '国王之手', image: 'mapandboss/国王之手.webp' },
    灯塔: { name: '仆人', image: 'mapandboss/仆人.webp' },
    塔顶: { name: '女王', image: 'mapandboss/女王.webp' },
    观星台: { name: '收藏家', image: 'mapandboss/收藏家.webp' },
};
const equipmentImages = {
    'rusty-knife': 'Rusty_Sword_Icon.webp',
    'balanced-blade': 'Balanced_Blade_Icon.webp',
    'assassins-dagger': "Assassin's_Dagger_Icon.webp",
    'great-sword': '大剑.webp',
    'cursed-sword': '诅咒之刃.webp',
    nutcracker: '胡桃夹子.webp',
    'crackling-whip': '缠绕鞭.webp',
    'berserker-blade': '狂暴之刃.webp',
    katana: '武士刀.webp',
    'resentment-blade': '怨恨之刃.webp',
    'blood-blade': '血之刃.webp',
    'twin-daggers': '双匕首.webp',
    'war-spear': '战矛.webp',
    'impaling-spear': '钉入矛.webp',
    'symmetrical-lance': '对称长枪.webp',
    'spartan-sandals': '斯巴达草鞋.webp',
    'falcon-boots': '隼之靴.webp',
    'valmont-whip': '瓦尔蒙特长鞭.webp',
    'multi-bow': '多头弓.webp',
    'infinite-bow': '无限箭制弓.webp',
    'infantry-bow': '步兵短弓.png',
    'heavy-crossbow': '重型弩弓.webp',
    'explosive-crossbow': '爆炸十字弓.png',
    'electric-whip': '电鞭.webp',
    'lightning-beam': '闪电光束.webp',
    'old-wooden-shield': '老木盾.webp',
    'stun-shield': '击晕盾.webp',
    'spiked-shield': '尖刺盾.webp',
    'rampart-shield': '壁垒（盾牌）.webp',
    'greed-shield': '贪婪盾.png',
    'ice-shield': '寒冰盾.webp',
    'ice-bow': '冰之弓.webp',
    'north-star-bow': '北斗之弓.webp',
    'throwing-knife': '飞刀.webp',
    'frontline-shield': '前线盾.webp',
    'assault-shield': '突击盾.png',
    'force-shield': '力场盾.png',
    'circular-turret': '圆斩箭塔.webp',
    'heavy-turret': '重型箭塔.webp',
    'bear-trap': '捕兽夹.webp',
    'explosive-decoy': '爆炸诱饵.webp',
    'powerful-grenade': '强力手雷.webp',
    'cluster-grenade': '集束手雷.webp',
    flashbang: '闪光弹.png',
    'frost-grenade': '冰冻手雷.webp',
    'hunter-grenade': '猎人手雷.webp',
    'whirlwind-knife': '圆舞飞刀.webp',
    'corrupted-power': '堕落力量.webp',
    'vampirism-item': '吸血.webp',
    displacement: '位移.webp',
    'rift-aura': '撕裂光环.webp',
    'war-owl': '战争巨枭.webp',
    serenade: '夜歌.webp',
    'health-flask': '血瓶.webp',
};
const shopImages = {
    'super-carrot': 'shop/超级萝卜.webp',
    'original-chicken': 'shop/原味鸡.webp',
    'power-scroll': 'shop/威力卷轴.webp',
};
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function assetData(fileName) {
    if (!fileName)
        return undefined;
    const filePath = (0, node_path_1.join)(assetDirectory, fileName);
    if (!(0, node_fs_1.existsSync)(filePath))
        return undefined;
    const extension = fileName.toLowerCase().endsWith('.png') ? 'png' : 'webp';
    return `data:image/${extension};base64,${(0, node_fs_1.readFileSync)(filePath).toString('base64')}`;
}
async function avatarData(userId) {
    if (avatarCache.has(userId))
        return avatarCache.get(userId);
    if (!/^\d+$/.test(userId)) {
        avatarCache.set(userId, undefined);
        return undefined;
    }
    try {
        const response = await fetch(`https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(userId)}&s=640`, {
            signal: AbortSignal.timeout(5000),
        });
        const mime = response.headers.get('content-type')?.split(';', 1)[0];
        if (!response.ok || !mime?.startsWith('image/'))
            throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length === 0 || buffer.length > 4 * 1024 * 1024)
            throw new Error('头像文件大小异常');
        const data = `data:${mime};base64,${buffer.toString('base64')}`;
        avatarCache.set(userId, data);
        return data;
    }
    catch {
        avatarCache.set(userId, undefined);
        return undefined;
    }
}
function avatarTag(source, username, className = 'avatar') {
    if (source)
        return `<img class="${className}" src="${escapeHtml(source)}" alt="" />`;
    const initial = escapeHtml(username.trim().slice(0, 1) || '?');
    return `<div class="${className} avatar-fallback">${initial}</div>`;
}
function imageTag(id, className = 'equipment-image') {
    const source = assetData(id ? equipmentImages[id] : undefined);
    return source
        ? `<img class="${className}" src="${source}" alt="" />`
        : `<div class="${className} empty-image">EMPTY</div>`;
}
function weaponQualityClass(quality) {
    return quality === 'gold' ? 'weapon-gold' : quality === 'colorless' ? 'weapon-colorless' : 'weapon-normal';
}
function weaponImageTag(id, quality, className = 'equipment-image') {
    return imageTag(id, `${className} ${weaponQualityClass(quality)}`);
}
function amuletImageTag(id, className = 'equipment-image') {
    const source = assetData((0, amulets_1.getAmulet)(id)?.image);
    return source
        ? `<img class="${className}" src="${source}" alt="" />`
        : `<div class="${className} empty-image">EMPTY</div>`;
}
function amuletTraitText(player) {
    const traits = (0, amulets_1.parseAmuletTraits)(player.amuletTraits)
        .map(amulets_1.getAmuletTrait)
        .filter(Boolean)
        .map((trait) => `${trait.name}：${trait.description}`);
    return traits.join(' / ') || '暂无词条';
}
function bossCellTag(level) {
    const source = assetData('boss细胞.webp');
    return source
        ? `<img class="cell-image" src="${source}" alt="" /> <span>${level} CELL</span>`
        : `<span>${level} CELL</span>`;
}
function weaponDescriptionText(description, quality, traitId) {
    const trait = traitId ? (0, amulets_1.getAmuletTrait)(traitId) : undefined;
    return [description, (0, equipment_1.weaponQualityEffectText)(quality), trait ? `无色词条：${trait.name}（${trait.description}）` : '']
        .filter(Boolean)
        .join('｜');
}
function equipmentPanel(label, id, slot, quality, weaponTrait) {
    const equipment = (0, equipment_1.getEquipment)(id);
    const isWeapon = label === 'WEAPON';
    const description = isWeapon
        ? weaponDescriptionText(equipment?.description || slot, quality, weaponTrait)
        : equipment?.description || slot;
    return `
    <div class="equipment-slot${isWeapon ? ` ${weaponQualityClass(quality)}` : ''}">
      <div class="slot-label">${escapeHtml(label)}${isWeapon ? ` // ${(0, equipment_1.weaponQualityText)(quality).toUpperCase()}` : ''}</div>
      ${isWeapon ? weaponImageTag(id, quality) : imageTag(id)}
      <div class="slot-name">${escapeHtml(equipment?.name || '无')}</div>
      <div class="slot-effect">${escapeHtml(description)}</div>
    </div>`;
}
function amuletPanel(player) {
    const amulet = (0, amulets_1.getAmulet)(player.amuletId);
    return `
    <div class="equipment-slot amulet-slot">
      <div class="slot-label">AMULET</div>
      ${amuletImageTag(player.amuletId)}
      <div class="slot-name">${escapeHtml(amulet?.name || '囚者颈环')}</div>
      <div class="slot-effect"><div class="trait-line">${escapeHtml(amuletTraitText(player))}</div></div>
    </div>`;
}
function cardStyle() {
    return `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #0a0f1c; }
    body {
      color: #e9edf3;
      font-family: "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif;
      font-size: 18px;
      line-height: 1.35;
    }
    .card {
      position: relative;
      overflow: hidden;
      width: 840px;
      padding: 30px;
      background: #10182b;
      border: 3px solid #b84e3d;
      box-shadow: inset 0 0 0 3px #17243b, 0 0 0 2px #4e2a32;
    }
    .card::before, .card::after {
      position: absolute;
      content: "";
      pointer-events: none;
    }
    .card::before {
      inset: 14px;
      border: 1px solid rgba(242, 196, 85, .52);
    }
    .card::after {
      top: 0;
      right: 0;
      width: 220px;
      height: 6px;
      background: #f2c455;
      box-shadow: -32px 10px 0 #57c8d4, -86px 20px 0 #b84e3d;
    }
    .content { position: relative; z-index: 1; }
    .eyebrow {
      color: #65d8e2;
      font-family: Consolas, "Courier New", monospace;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .brand {
      color: #f3cf67;
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 1px;
      text-shadow: 3px 3px 0 #6c2e35;
    }
    .brand span { color: #f4f5ed; }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 4px 18px 20px;
      border-bottom: 2px solid #ad4c3b;
    }
    .cell-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      color: #f3cf67;
      background: #18253b;
      border: 1px solid #55708c;
      font-family: Consolas, monospace;
      font-weight: 700;
    }
    .cell-image { width: 34px; height: 34px; image-rendering: pixelated; object-fit: contain; }
    .hero {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 22px;
      align-items: center;
      padding: 22px 18px;
    }
    .player-name { color: #fff5d0; font-size: 32px; font-weight: 800; }
    .player-subtitle { margin-top: 4px; color: #9aa8bd; font-family: Consolas, monospace; font-size: 14px; }
    .hero-mark { width: 96px; height: 96px; image-rendering: pixelated; object-fit: contain; }
    .avatar { width: 88px; height: 88px; flex: 0 0 88px; object-fit: cover; border: 2px solid #f3cf67; background: #18253b; }
    .avatar-fallback { display: grid; place-items: center; color: #f3cf67; font: 800 38px Consolas, monospace; }
    .avatar-small,
    .avatar-small.avatar-fallback {
      display: inline-flex;
      flex: 0 0 34px;
      width: 34px;
      height: 34px;
      min-width: 34px;
      min-height: 34px;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
      border: 1px solid #55708c;
      border-radius: 50%;
      background: #18253b;
      object-fit: cover;
      object-position: center;
      vertical-align: middle;
    }
    .avatar-small.avatar-fallback { color: #f3cf67; font: 800 16px Consolas, monospace; }
    .hero-profile { display: flex; align-items: center; gap: 18px; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 8px 18px 12px;
      color: #f3cf67;
      font-family: Consolas, monospace;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .section-title::after { flex: 1; height: 1px; content: ""; background: #3b526c; }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding: 0 18px 18px;
    }
    .stat {
      min-height: 76px;
      padding: 12px;
      background: #151f34;
      border: 1px solid #334761;
    }
    .stat-label { color: #8ca0b8; font-family: Consolas, monospace; font-size: 13px; text-transform: uppercase; }
    .stat-value { margin-top: 5px; color: #f4f5ed; font-family: Consolas, monospace; font-size: 24px; font-weight: 800; }
    .stat-value.accent { color: #65d8e2; }
    .equipment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 18px 18px; }
    .equipment-slot {
      display: grid;
      grid-template-columns: 74px 1fr;
      grid-template-rows: auto auto 1fr;
      column-gap: 14px;
      min-height: 116px;
      padding: 13px;
      background: #151f34;
      border: 1px solid #334761;
    }
    .slot-label { grid-column: 1 / -1; color: #65d8e2; font-family: Consolas, monospace; font-size: 13px; font-weight: 700; }
    .equipment-image { grid-row: 2 / 4; width: 64px; height: 64px; image-rendering: pixelated; object-fit: contain; }
    .weapon-gold { border-color: #d9b45b !important; box-shadow: inset 0 0 0 1px #fff0a2; }
    .weapon-colorless { border-top-color: #73d9e6 !important; border-right-color: #f0c76b !important; border-bottom-color: #e56d72 !important; border-left-color: #b99adf !important; box-shadow: inset 0 0 0 1px #f4f5ed; }
    .equipment-slot.weapon-gold { border-width: 3px; box-shadow: inset 0 0 0 2px rgba(255, 240, 162, .48); }
    .equipment-slot.weapon-colorless { border-width: 3px; box-shadow: inset 0 0 0 2px rgba(244, 245, 237, .58); }
    .equipment-image.weapon-gold, .loot-image.weapon-gold { padding: 4px; border: 4px solid #d9b45b; background: #252117; box-shadow: inset 0 0 0 1px #fff0a2; }
    .equipment-image.weapon-colorless, .loot-image.weapon-colorless { padding: 4px; border-width: 4px; background: #1d2030; box-shadow: inset 0 0 0 1px #f4f5ed; }
    .mini-image.weapon-gold { padding: 2px; border: 3px solid #d9b45b; box-shadow: inset 0 0 0 1px #fff0a2; }
    .mini-image.weapon-colorless { padding: 2px; border-width: 3px; box-shadow: inset 0 0 0 1px #f4f5ed; }
    .empty-image { display: grid; place-items: center; color: #69788b; border: 1px dashed #4b6079; font: 11px Consolas, monospace; }
    .slot-name { align-self: end; color: #fff5d0; font-size: 20px; font-weight: 800; }
    .slot-effect { align-self: start; color: #9aa8bd; font-size: 14px; }
    .amulet-slot { border-color: #9b6f36; }
    .amulet-slot .slot-label { color: #f3cf67; }
    .trait-line { color: #65d8e2; font-size: 13px; line-height: 1.5; }
    .footer { display: flex; justify-content: space-between; margin: 0 18px; padding-top: 15px; border-top: 1px solid #334761; color: #71829b; font: 12px Consolas, monospace; }
    .battle-header { padding-bottom: 18px; }
    .battle-arena { display: grid; grid-template-columns: 1fr 100px 1fr; gap: 16px; align-items: stretch; padding: 22px 18px; }
    .fighter { padding: 18px; background: #151f34; border: 1px solid #334761; }
    .fighter-profile { display: flex; align-items: center; gap: 12px; }
    .fighter .avatar { width: 56px; height: 56px; flex-basis: 56px; }
    .fighter .avatar-fallback { font-size: 24px; }
    .fighter.winner { border-color: #f3cf67; box-shadow: inset 0 -3px #f3cf67; }
    .fighter-name { color: #fff5d0; font-size: 24px; font-weight: 800; }
    .crown { margin-left: 8px; color: #f3cf67; font-size: 22px; text-shadow: 1px 1px 0 #6c2e35; }
    .fighter-equip { display: flex; gap: 8px; margin: 14px 0; }
    .mini-image { width: 42px; height: 42px; image-rendering: pixelated; object-fit: contain; border: 1px solid #405772; background: #0d1525; }
    .fighter-equip .amulet-mini { border-color: #9b6f36; }
    .fighter-equip .empty-image { width: 42px; height: 42px; }
    .fighter-stat { display: flex; justify-content: space-between; padding: 6px 0; color: #a9b7c9; border-bottom: 1px solid #2b3c55; font-family: Consolas, monospace; font-size: 14px; }
    .fighter-stat strong { color: #f4f5ed; }
    .versus { display: grid; place-items: center; color: #d95549; font: 900 24px Consolas, monospace; }
    .result {
      margin: 0 18px 18px;
      padding: 16px;
      text-align: center;
      color: #151b2b;
      background: #f3cf67;
      border: 2px solid #fff1af;
      font-size: 24px;
      font-weight: 900;
    }
    .result small { display: block; margin-top: 5px; color: #57462a; font: 14px Consolas, monospace; }
    .battle-log { margin: 0 18px 18px; padding: 14px; background: #0d1525; border: 1px solid #334761; }
    .log-title { margin-bottom: 8px; color: #65d8e2; font: 700 13px Consolas, monospace; letter-spacing: 1px; }
    .log-line { padding: 6px 8px; color: #b8c4d4; border-top: 1px solid #23344d; font-family: Consolas, "Microsoft YaHei", monospace; font-size: 14px; overflow-wrap: anywhere; }
    .log-line:first-of-type { border-top: 0; }
    .log-line.critical { color: #ff8d7d; font-size: 16px; font-weight: 800; }
    .log-line.skill { color: #d6a7ff; font-weight: 700; }
    .log-line.defense { color: #79d9ed; font-weight: 700; }
    .log-line.status { color: #f2cf72; font-weight: 700; }
    .log-line.danger { color: #ff9c9c; }
    .log-line.victory { color: #ffe28a; font-size: 16px; font-weight: 900; }
    .log-line.item { color: #9de6b0; font-weight: 700; }
    .round-state { display: grid; gap: 8px; padding: 8px; border-top: 1px solid #23344d; background: #111c30; }
    .hp-state { display: grid; grid-template-columns: minmax(90px, 1fr) 2fr auto; gap: 10px; align-items: center; color: #d7e0e9; font-family: Consolas, "Microsoft YaHei", monospace; font-size: 13px; }
    .hp-track { height: 12px; overflow: hidden; background: #26344a; border: 1px solid #405772; }
    .hp-fill { height: 100%; min-width: 2px; background: #65d8e2; }
    .hp-fill.low { background: #d95549; }
    .hp-value { color: #f4f5ed; white-space: nowrap; }
    .loot-owner { display: flex; align-items: center; gap: 16px; padding: 22px 18px 12px; }
    .loot-owner .avatar { width: 64px; height: 64px; flex-basis: 64px; }
    .loot-owner .avatar-fallback { font-size: 28px; }
    .loot-owner-name { color: #fff5d0; font-size: 24px; font-weight: 800; }
    .loot-owner-label { margin-top: 3px; color: #8ca0b8; font: 13px Consolas, monospace; }
    .loot-panel { display: grid; grid-template-columns: 180px 1fr; gap: 22px; align-items: center; margin: 0 18px 18px; padding: 22px; background: #151f34; border: 1px solid #f3cf67; }
    .loot-image { width: 156px; height: 156px; image-rendering: pixelated; object-fit: contain; background: #0d1525; border: 1px solid #405772; }
    .loot-kind { color: #65d8e2; font: 700 13px Consolas, monospace; letter-spacing: 1px; }
    .loot-name { margin-top: 8px; color: #f3cf67; font-size: 30px; font-weight: 900; }
    .loot-description { margin-top: 10px; color: #c0ccda; font-size: 16px; }
    .loot-status { margin: 0 18px 18px; padding: 14px 16px; color: #151b2b; background: #f3cf67; border: 2px solid #fff1af; font-size: 18px; font-weight: 800; }
    .loot-status small { display: block; margin-top: 5px; color: #57462a; font: 13px Consolas, monospace; }
    .choice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0 18px 18px; }
    .choice-card { min-height: 188px; padding: 14px; background: #151f34; border: 1px solid #55708c; }
    .choice-number { color: #d95549; font: 900 24px Consolas, monospace; }
    .choice-card .mini-image { display: block; width: 78px; height: 78px; margin: 8px auto; }
    .shop-item-image { display: block; width: 72px; height: 72px; margin: 8px auto; image-rendering: pixelated; object-fit: contain; background: #0d1525; border: 1px solid #405772; }
    .choice-card.sold { opacity: .58; filter: saturate(.55); }
    .choice-group { color: #65d8e2; font: 700 11px Consolas, monospace; text-align: center; }
    .choice-name { color: #fff5d0; font-size: 18px; font-weight: 800; text-align: center; }
    .choice-type { margin-top: 3px; color: #65d8e2; font: 12px Consolas, monospace; text-align: center; }
    .choice-description { margin-top: 8px; color: #a9b7c9; font-size: 13px; }
    .amulet-result { margin: 0 18px 18px; padding: 20px; background: #151f34; border: 2px solid #f3cf67; }
    .amulet-result-layout { display: grid; grid-template-columns: 150px 1fr; gap: 20px; align-items: center; }
    .amulet-result-image { width: 140px; height: 140px; image-rendering: pixelated; object-fit: contain; background: #0d1525; border: 1px solid #9b6f36; }
    .amulet-result-name { color: #f3cf67; font-size: 30px; font-weight: 900; }
    .amulet-result-traits { margin-top: 10px; display: grid; gap: 6px; }
    .amulet-result-trait { padding: 8px 10px; color: #d7e0e9; background: #0d1525; border-left: 3px solid #65d8e2; font-size: 14px; }
    .amulet-choice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0 18px 18px; }
    .amulet-choice-card { min-height: 230px; padding: 12px; background: #151f34; border: 1px solid #55708c; }
    .amulet-choice-card .amulet-result-image { display: block; width: 105px; height: 105px; margin: 8px auto; }
    .amulet-choice-name { color: #f3cf67; font-size: 17px; font-weight: 800; text-align: center; }
    .amulet-choice-traits { display: grid; gap: 4px; margin-top: 8px; }
    .amulet-choice-trait { padding: 5px 6px; color: #c0ccda; background: #0d1525; border-left: 2px solid #65d8e2; font-size: 12px; }
    .explore-hero { display: grid; grid-template-columns: 1fr 210px; gap: 18px; align-items: stretch; padding: 22px 18px 16px; }
    .map-art { position: relative; min-height: 190px; overflow: hidden; background: #0d1525; border: 1px solid #55708c; }
    .map-art img { display: block; width: 100%; height: 190px; object-fit: cover; }
    .map-art::after { position: absolute; inset: 0; content: ""; background: linear-gradient(90deg, rgba(8, 14, 27, .1), rgba(8, 14, 27, .65)); pointer-events: none; }
    .map-art-caption { position: absolute; right: 16px; bottom: 14px; left: 16px; z-index: 1; }
    .map-art-label { color: #65d8e2; font: 700 13px Consolas, monospace; letter-spacing: 1px; }
    .map-art-name { margin-top: 4px; color: #fff5d0; font-size: 30px; font-weight: 900; text-shadow: 2px 2px 0 #151b2b; }
    .explore-summary { display: grid; grid-template-rows: auto 1fr auto; padding: 16px; background: #151f34; border: 1px solid #f3cf67; }
    .explore-avatar { display: flex; align-items: center; gap: 12px; }
    .explore-avatar .avatar { width: 56px; height: 56px; flex-basis: 56px; }
    .explore-avatar .avatar-fallback { font-size: 24px; }
    .explore-player { color: #fff5d0; font-size: 20px; font-weight: 800; }
    .explore-player-subtitle { margin-top: 3px; color: #8ca0b8; font: 12px Consolas, monospace; }
    .explore-gain { align-self: end; color: #65d8e2; font: 700 16px Consolas, monospace; }
    .explore-gain strong { display: block; margin-top: 3px; color: #f3cf67; font-size: 34px; }
    .route-title { margin: 8px 18px 12px; color: #f3cf67; font: 700 16px Consolas, monospace; letter-spacing: 1px; }
    .route-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 18px 18px; }
    .route-node { position: relative; overflow: hidden; min-height: 126px; background: #151f34; border: 1px solid #334761; }
    .route-node.reached { border-color: #55708c; }
    .route-node.current { border-color: #f3cf67; box-shadow: inset 0 -3px #f3cf67; }
    .route-thumb { display: block; width: 100%; height: 62px; object-fit: cover; }
    .route-node-info { padding: 7px 9px 8px; }
    .route-index { color: #65d8e2; font: 700 11px Consolas, monospace; }
    .route-name { margin-top: 2px; color: #f4f5ed; font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .route-reward { margin-top: 3px; color: #8ca0b8; font: 12px Consolas, monospace; }
    .route-boss { margin-top: 4px; color: #d95549; font: 700 11px "Microsoft YaHei", sans-serif; }
    .boss-title { margin: 4px 18px 10px; color: #f3cf67; font: 700 16px Consolas, monospace; letter-spacing: 1px; }
    .boss-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 18px 18px; }
    .boss-card { display: grid; grid-template-columns: 82px 1fr; gap: 10px; align-items: center; min-height: 94px; padding: 9px; background: #151f34; border: 1px solid #334761; }
    .boss-image { width: 82px; height: 76px; object-fit: contain; background: #0d1525; }
    .boss-label { color: #d95549; font: 700 11px Consolas, monospace; }
    .boss-name { margin-top: 4px; color: #fff5d0; font-size: 16px; font-weight: 800; }
    .boss-state { margin-top: 4px; color: #9aa8bd; font-size: 12px; }
    .explore-comment { margin: 0 18px 18px; padding: 13px 15px; color: #d7e0e9; background: #1a263b; border-left: 4px solid #65d8e2; font-size: 15px; }
    .completion-card { padding: 24px 30px 30px; background: #0b1222; }
    .completion-card.final-red { background: #220d16; border-color: #e2554b; }
    .final-red .completion-header { border-bottom-color: #e2554b; }
    .final-red .completion-badge, .final-red .clear-message { color: #fff5e6; background: #a92f3a; border-color: #ffb27d; }
    .final-red .clear-stage { border-color: #ffb27d; box-shadow: inset 0 0 0 3px #451b2a, 0 0 0 2px #762936; }
    .final-red .clear-title, .final-red .clear-reward-value { color: #ffb27d; }
    .final-red .clear-seal { background: #a92f3a; border-color: #ffb27d; outline-color: #e2554b; color: #fff5e6; }
    .final-red .clear-reward-item { border-color: #8f3c47; background: #321521; }
    .completion-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; padding: 4px 18px 18px; border-bottom: 2px solid #b84e3d; }
    .completion-badge { padding: 9px 13px; color: #151b2b; background: #f3cf67; border: 2px solid #fff1af; font: 800 13px Consolas, monospace; }
    .clear-stage { position: relative; min-height: 470px; margin: 20px 18px 18px; overflow: hidden; border: 3px solid #f3cf67; box-shadow: inset 0 0 0 3px #17243b, 0 0 0 2px #4e2a32; }
    .clear-background { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .58; }
    .clear-stage::after { position: absolute; inset: 0; content: ""; background: rgba(8, 13, 28, .48); pointer-events: none; }
    .clear-content { position: relative; z-index: 1; padding: 24px 26px 22px; }
    .clear-kicker { color: #65d8e2; font: 700 13px Consolas, monospace; letter-spacing: 2px; }
    .clear-title { margin-top: 5px; color: #f3cf67; font-size: 42px; font-weight: 900; text-shadow: 3px 3px 0 #6c2e35; }
    .clear-subtitle { color: #f4f5ed; font: 700 15px Consolas, "Microsoft YaHei", monospace; letter-spacing: 1px; }
    .clear-duel { display: grid; grid-template-columns: 1fr 112px 1fr; gap: 12px; align-items: center; margin-top: 24px; }
    .clear-fighter { min-height: 190px; padding: 14px; background: rgba(16, 24, 43, .86); border: 1px solid #55708c; text-align: center; }
    .clear-fighter.winner { border-color: #f3cf67; box-shadow: inset 0 -3px #f3cf67; }
    .clear-fighter .avatar { width: 112px; height: 112px; margin: 0 auto 8px; border-width: 3px; }
    .clear-fighter .avatar-fallback { font-size: 48px; }
    .clear-boss-image { display: block; width: 180px; height: 150px; margin: 0 auto; object-fit: contain; }
    .clear-fighter-label { color: #65d8e2; font: 700 12px Consolas, monospace; letter-spacing: 1px; }
    .clear-fighter-name { margin-top: 4px; color: #fff5d0; font-size: 23px; font-weight: 900; }
    .clear-fighter-status { margin-top: 3px; color: #f3cf67; font: 700 13px Consolas, "Microsoft YaHei", monospace; }
    .clear-seal { display: grid; place-items: center; width: 104px; height: 104px; color: #151b2b; background: #f3cf67; border: 4px solid #fff1af; outline: 2px solid #b84e3d; font: 900 19px Consolas, monospace; transform: rotate(-5deg); }
    .clear-message { margin-top: 22px; padding: 14px 16px; color: #151b2b; background: #f3cf67; border: 2px solid #fff1af; text-align: center; font-size: 25px; font-weight: 900; }
    .clear-message small { display: block; margin-top: 4px; color: #57462a; font: 14px "Microsoft YaHei", sans-serif; }
    .clear-reward { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 0 18px 18px; }
    .clear-reward-item { padding: 12px; background: #151f34; border: 1px solid #55708c; text-align: center; }
    .clear-reward-label { color: #8ca0b8; font: 12px Consolas, monospace; }
    .clear-reward-value { margin-top: 4px; color: #f3cf67; font: 900 25px Consolas, monospace; }
    .clear-route { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0 18px 18px; }
    .clear-route-node { padding: 9px 10px; color: #f4f5ed; background: #151f34; border: 1px solid #3b526c; font-size: 14px; }
    .clear-route-node::before { margin-right: 7px; color: #65d8e2; content: "✓"; font-family: Consolas, monospace; }
    .boss-raid-card { padding-bottom: 18px; }
    .boss-raid-hero { position: relative; min-height: 310px; margin: 18px; overflow: hidden; border: 2px solid #b84e3d; }
    .boss-raid-background { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .38; }
    .boss-raid-hero::after { position: absolute; inset: 0; content: ""; background: rgba(7, 12, 25, .46); }
    .boss-raid-content { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; align-items: center; min-height: 310px; padding: 22px 26px; }
    .boss-raid-meta { align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
    .boss-raid-kicker { color: #65d8e2; font: 700 13px Consolas, monospace; letter-spacing: 2px; }
    .boss-raid-name { margin-top: 7px; color: #fff5d0; font-size: 38px; font-weight: 900; text-shadow: 3px 3px 0 #5b2331; }
    .boss-raid-map { margin-top: 4px; color: #d7e0e9; font-size: 17px; }
    .boss-raid-difficulty { display: inline-block; margin-top: 15px; padding: 6px 10px; color: #151b2b; background: #f3cf67; font: 800 13px Consolas, monospace; }
    .boss-raid-difficulty.veteran { background: #b98cff; }
    .boss-raid-difficulty.veteran-king { color: #fff5e6; background: #c94c57; }
    .boss-raid-image { display: block; width: 270px; height: 250px; margin: auto; object-fit: contain; filter: drop-shadow(0 10px 12px rgba(0, 0, 0, .65)); }
    .boss-hp-panel { margin: 0 18px 16px; padding: 15px 17px; background: #151f34; border: 1px solid #55708c; }
    .boss-hp-heading { display: flex; justify-content: space-between; gap: 10px; color: #fff5d0; font-size: 17px; font-weight: 800; }
    .boss-hp-track { height: 18px; margin-top: 9px; overflow: hidden; background: #0c1425; border: 1px solid #334761; }
    .boss-hp-fill { height: 100%; background: #d95549; }
    .boss-hp-fill.cleared { background: #f3cf67; }
    .boss-raid-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 0 18px 16px; }
    .boss-raid-stat { padding: 10px; background: #151f34; border: 1px solid #334761; text-align: center; }
    .boss-raid-stat-label { color: #8ca0b8; font: 11px Consolas, monospace; }
    .boss-raid-stat-value { margin-top: 4px; color: #f3cf67; font: 900 22px Consolas, monospace; }
    .boss-raid-log { max-height: 260px; margin: 0 18px 16px; padding: 12px 15px; overflow: hidden; color: #d7e0e9; background: #101a2d; border-left: 3px solid #65d8e2; font-size: 13px; line-height: 1.65; white-space: pre-line; }
    .boss-ranking-title { margin: 10px 18px 8px; color: #f3cf67; font: 700 15px Consolas, monospace; letter-spacing: 1px; }
    .boss-ranking { display: grid; gap: 5px; margin: 0 18px 16px; }
    .boss-ranking-row { display: grid; grid-template-columns: 34px 1fr auto; gap: 8px; padding: 7px 10px; color: #d7e0e9; background: #151f34; border: 1px solid #334761; }
    .boss-ranking-row span { display: flex; min-width: 0; align-items: center; gap: 8px; overflow: hidden; }
    .boss-ranking-row span .avatar-small { margin-right: 2px; }
    .boss-ranking-row strong { color: #f3cf67; }
    .boss-choice-card { margin: 18px; padding: 18px; background: #151f34; border: 1px solid #f3cf67; }
    .boss-choice-title { color: #f3cf67; font-size: 22px; font-weight: 900; }
    .boss-choice-subtitle { margin-top: 4px; color: #d7e0e9; font-size: 14px; }
    .boss-choice-list { display: grid; gap: 8px; margin-top: 16px; }
    .boss-choice-item { display: grid; grid-template-columns: 34px 1fr; gap: 9px; padding: 9px 10px; background: #101a2d; border: 1px solid #334761; }
    .boss-choice-number { color: #65d8e2; font: 900 18px Consolas, monospace; }
    .boss-choice-name { color: #fff5d0; font-weight: 800; }
    .boss-choice-description { margin-top: 2px; color: #9aa8bd; font-size: 12px; }

    /* Shared visual language: restrained parchment text and rust-red combat accents. */
    :root {
      --ink: #0c0d0f;
      --surface: #151719;
      --surface-raised: #1b1e21;
      --line: #343a3c;
      --line-soft: #272c2f;
      --paper: #f1ead8;
      --muted: #a7afb2;
      --rust: #c4503c;
      --rust-dark: #742e2b;
      --gold: #d9b45b;
      --cyan: #73c8c9;
    }
    html, body { background: var(--ink); }
    body { color: var(--paper); font-size: 17px; line-height: 1.45; }
    .card {
      width: 840px;
      padding: 24px;
      background: var(--surface);
      border: 1px solid #4a3937;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .045), 0 12px 28px rgba(0, 0, 0, .3);
    }
    .card::before { inset: 0; border: 0; border-top: 3px solid var(--rust); }
    .card::after { width: 92px; height: 3px; background: var(--gold); box-shadow: none; }
    .header { gap: 16px; padding: 4px 18px 16px; border-bottom: 1px solid #54413d; }
    .brand { color: var(--paper); font-size: 32px; text-shadow: 2px 2px 0 #502b29; }
    .brand span { color: var(--gold); }
    .eyebrow, .slot-label, .choice-group, .route-index, .boss-raid-kicker { color: var(--cyan); }
    .cell-badge { color: var(--paper); background: #1e2224; border-color: #454c4d; }
    .section-title { color: var(--paper); margin-top: 12px; }
    .section-title::after { background: #3a4142; }
    .stat, .equipment-slot, .fighter, .choice-card, .amulet-choice-card, .boss-card, .boss-raid-stat, .boss-ranking-row, .clear-reward-item {
      background: var(--surface-raised);
      border-color: var(--line);
    }
    .stat-label, .player-subtitle, .slot-effect, .loot-owner-label, .choice-description, .boss-state, .boss-choice-description { color: var(--muted); }
    .stat-value, .fighter-stat strong, .hp-value { color: var(--paper); }
    .stat-value.accent, .trait-line { color: var(--cyan); }
    .avatar { border-color: #b7914b; background: #202426; }
    .equipment-slot { min-height: 112px; }
    .amulet-slot { border-color: #806338; }
    .battle-arena { gap: 12px; padding-top: 18px; padding-bottom: 18px; }
    .fighter { padding: 15px; }
    .fighter.winner { border-color: #b9954c; box-shadow: inset 0 -2px 0 var(--gold); }
    .fighter-name, .player-name, .loot-owner-name, .boss-raid-name { color: var(--paper); }
    .versus { color: var(--rust); font-size: 22px; }
    .result, .loot-status {
      color: #fff7e5;
      background: var(--rust-dark);
      border: 1px solid #d6765d;
      box-shadow: none;
    }
    .result small, .loot-status small { color: #efd9be; }
    .battle-log { padding: 12px; background: #101214; border-color: #303638; }
    .log-title { color: var(--cyan); }
    .log-line { padding: 7px 8px; color: #cbd1d0; border-color: #272d2f; }
    .log-line.critical, .log-line.danger { color: #ef927f; }
    .log-line.skill { color: #d9b45b; }
    .log-line.defense { color: var(--cyan); }
    .log-line.status, .log-line.victory { color: #eed58b; }
    .log-line.item { color: #a9d8a0; }
    .round-state { gap: 7px; padding: 9px; border-color: #353b3d; background: #181b1d; }
    .hp-state { color: #d7dcda; }
    .hp-track { height: 10px; border: 0; background: #303436; }
    .hp-fill { background: #6fbfc0; }
    .hp-fill.low { background: var(--rust); }
    .loot-panel, .amulet-result, .boss-choice-card, .explore-summary, .boss-hp-panel {
      background: var(--surface-raised);
      border-color: #68513d;
    }
    .loot-name, .amulet-result-name, .choice-number, .clear-reward-value { color: var(--gold); }
    .map-art, .route-node, .clear-fighter { border-color: var(--line); }
    .route-node.current { border-color: #ba9148; box-shadow: inset 0 -2px 0 var(--gold); }
    .explore-comment { background: #1b2022; border-left-color: var(--cyan); }
    .completion-card { background: #111315; }
    .completion-card.final-red { background: #211416; border-color: #87423a; }
    .clear-stage { border-width: 1px; border-color: #936047; box-shadow: 0 10px 22px rgba(0, 0, 0, .3); }
    .clear-title { color: var(--paper); text-shadow: 2px 2px 0 #522b29; }
    .clear-message, .completion-badge { border-width: 1px; box-shadow: none; }
    .boss-raid-hero { border-width: 1px; border-color: #895044; }
    .boss-raid-background { opacity: .3; }
    .boss-raid-hero::after { background: rgba(9, 10, 12, .62); }
    .boss-raid-name { font-size: 40px; text-shadow: 2px 2px 0 #532925; }
    .boss-raid-difficulty { color: #171514; background: var(--gold); }
    .boss-raid-difficulty.veteran { background: #8ab9b6; }
    .boss-raid-difficulty.veteran-king { background: var(--rust); }
    .boss-hp-track { height: 14px; border: 0; background: #303233; }
    .boss-hp-fill { background: var(--rust); }
    .boss-hp-fill.cleared { background: var(--gold); }
    .boss-raid-log { background: #121517; border-left-color: var(--rust); }
    .boss-ranking-row strong, .boss-raid-stat-value { color: var(--gold); }

    /* Wiki data-page layer. Kept last so every render shares the same visual language. */
    :root {
      --wiki-body: #302830;
      --wiki-surface: #131b33;
      --wiki-surface-alt: #090e21;
      --wiki-border: #414f6a;
      --wiki-blue: #3761af;
      --wiki-blue-line: #527fd0;
      --wiki-text: #e8e8e8;
      --wiki-muted: #aeb5c0;
      --wiki-gold: #ffe280;
      --wiki-link: #ffbe32;
      --wiki-danger: #ff576a;
      --wiki-success: #13aa45;
    }
    html, body { background: var(--wiki-body); }
    body {
      color: var(--wiki-text);
      font-family: Arial, "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
      font-size: 17px;
      line-height: 1.45;
    }
    .wiki-page.card {
      width: 840px;
      padding: 22px;
      background: var(--wiki-surface);
      border: 1px solid var(--wiki-border);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04), 0 10px 24px rgba(0, 0, 0, .28);
    }
    .wiki-page.card::before { inset: 0; border: 0; border-top: 3px solid var(--wiki-blue-line); }
    .wiki-page.card::after { display: none; }
    .wiki-page .header, .wiki-page .completion-header {
      padding: 5px 16px 15px;
      border-bottom: 1px solid var(--wiki-border);
    }
    .wiki-page .eyebrow, .wiki-page .slot-label, .wiki-page .choice-group,
    .wiki-page .route-index, .wiki-page .boss-raid-kicker, .wiki-page .log-title,
    .wiki-page .clear-kicker, .wiki-page .fighter-stat span, .wiki-page .loot-kind {
      color: #8fb5ff;
      font-family: Consolas, "Courier New", monospace;
      letter-spacing: 1px;
    }
    .wiki-page .brand { color: var(--wiki-gold); font-size: 31px; text-shadow: none; }
    .wiki-page .brand span { color: var(--wiki-text); }
    .wiki-page .cell-badge {
      color: var(--wiki-gold);
      background: var(--wiki-surface-alt);
      border-color: var(--wiki-blue-line);
      border-radius: 2px;
    }
    .wiki-page .hero, .wiki-page .explore-hero, .wiki-page .loot-owner { padding-left: 16px; padding-right: 16px; }
    .wiki-page .hero, .wiki-page .explore-hero { margin: 16px; padding: 0; }
    .wiki-page .hero { min-height: 118px; padding: 16px; background: var(--wiki-surface-alt); border: 1px solid var(--wiki-border); }
    .wiki-page .player-name, .wiki-page .fighter-name, .wiki-page .loot-owner-name,
    .wiki-page .explore-player, .wiki-page .boss-raid-name { color: var(--wiki-text); }
    .wiki-page .player-subtitle, .wiki-page .stat-label, .wiki-page .slot-effect,
    .wiki-page .loot-owner-label, .wiki-page .choice-description, .wiki-page .boss-state,
    .wiki-page .boss-choice-description, .wiki-page .route-reward { color: var(--wiki-muted); }
    .wiki-page .avatar { border-color: var(--wiki-blue-line); background: var(--wiki-surface-alt); }
    .wiki-page .section-title, .wiki-page .route-title, .wiki-page .boss-title,
    .wiki-page .boss-ranking-title {
      margin: 16px 16px 8px;
      padding: 7px 10px;
      color: var(--wiki-gold);
      background: var(--wiki-surface-alt);
      border: 1px solid var(--wiki-border);
      font-family: Arial, "Microsoft YaHei", sans-serif;
      font-size: 15px;
      letter-spacing: 0;
    }
    .wiki-page .section-title::after { background: var(--wiki-border); }
    .wiki-page .stats {
      gap: 0;
      margin: 0 16px 16px;
      padding: 0;
      border: 1px solid var(--wiki-border);
      background: var(--wiki-surface-alt);
    }
    .wiki-page .stat {
      min-height: 66px;
      padding: 10px 12px;
      background: transparent;
      border: 0;
      border-right: 1px solid var(--wiki-border);
    }
    .wiki-page .stat:last-child { border-right: 0; }
    .wiki-page .stat-label { font-size: 12px; }
    .wiki-page .stat-value { margin-top: 4px; color: var(--wiki-text); font-size: 22px; }
    .wiki-page .stat-value.accent, .wiki-page .trait-line, .wiki-page .explore-gain { color: var(--wiki-link); }
    .wiki-page .equipment-grid {
      grid-template-columns: 1fr;
      gap: 0;
      margin: 0 16px 16px;
      padding: 0;
      border: 1px solid var(--wiki-border);
      background: var(--wiki-surface-alt);
    }
    .wiki-page .equipment-slot {
      grid-template-columns: 68px 150px 1fr;
      grid-template-rows: 1fr;
      min-height: 76px;
      padding: 6px 10px;
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--wiki-border);
    }
    .wiki-page .equipment-slot:last-child { border-bottom: 0; }
    .wiki-page .equipment-slot .slot-label { grid-column: auto; align-self: center; font-size: 12px; }
    .wiki-page .equipment-image { grid-row: auto; width: 58px; height: 58px; }
    .wiki-page .slot-name { align-self: center; color: var(--wiki-gold); font-size: 18px; }
    .wiki-page .slot-effect { align-self: center; font-size: 13px; }
    .wiki-page .weapon-gold { border-color: var(--wiki-gold) !important; box-shadow: inset 0 0 0 1px #fff5b3; }
    .wiki-page .weapon-colorless { border-color: #b98cff !important; box-shadow: inset 0 0 0 1px #73d9e6; }
    .wiki-page .amulet-slot { background: rgba(55, 97, 175, .12); }
    .wiki-page .footer { margin: 0 16px; border-top-color: var(--wiki-border); color: var(--wiki-muted); }
    .wiki-page .battle-arena { gap: 10px; padding: 16px; }
    .wiki-page .fighter, .wiki-page .choice-card, .wiki-page .amulet-choice-card,
    .wiki-page .boss-card, .wiki-page .boss-raid-stat, .wiki-page .boss-ranking-row,
    .wiki-page .clear-reward-item {
      background: var(--wiki-surface-alt);
      border-color: var(--wiki-border);
    }
    .wiki-page .fighter { padding: 13px; }
    .wiki-page .fighter.winner { border-color: var(--wiki-gold); box-shadow: inset 3px 0 0 var(--wiki-gold); }
    .wiki-page .fighter-stat { border-bottom-color: var(--wiki-border); color: var(--wiki-muted); }
    .wiki-page .fighter-stat strong { color: var(--wiki-text); }
    .wiki-page .versus { color: var(--wiki-link); }
    .wiki-page .result, .wiki-page .loot-status, .wiki-page .clear-message {
      color: var(--wiki-text);
      background: #1c2948;
      border: 1px solid var(--wiki-blue-line);
      box-shadow: none;
    }
    .wiki-page .result small, .wiki-page .loot-status small, .wiki-page .clear-message small { color: var(--wiki-muted); }
    .wiki-page .battle-log, .wiki-page .boss-raid-log {
      background: var(--wiki-surface-alt);
      border-color: var(--wiki-border);
      border-left: 3px solid var(--wiki-blue-line);
    }
    .wiki-page .log-line { color: #d6dbe4; border-color: rgba(65, 79, 106, .7); }
    .wiki-page .log-line.critical, .wiki-page .log-line.danger { color: #ff9ca8; }
    .wiki-page .log-line.skill, .wiki-page .log-line.status, .wiki-page .log-line.victory { color: var(--wiki-gold); }
    .wiki-page .log-line.defense { color: #8ecfff; }
    .wiki-page .round-state { background: #10162a; border-color: var(--wiki-border); }
    .wiki-page .hp-track { background: #2d3852; }
    .wiki-page .hp-fill { background: var(--wiki-blue-line); }
    .wiki-page .hp-fill.low { background: var(--wiki-danger); }
    .wiki-page .loot-panel, .wiki-page .amulet-result, .wiki-page .boss-choice-card,
    .wiki-page .explore-summary, .wiki-page .boss-hp-panel {
      background: var(--wiki-surface-alt);
      border-color: var(--wiki-border);
    }
    .wiki-page .loot-panel, .wiki-page .amulet-result, .wiki-page .boss-choice-card { border-left: 3px solid var(--wiki-blue-line); }
    .wiki-page .loot-name, .wiki-page .amulet-result-name, .wiki-page .choice-number,
    .wiki-page .clear-reward-value, .wiki-page .boss-raid-stat-value { color: var(--wiki-gold); }
    .wiki-page .map-art, .wiki-page .route-node, .wiki-page .clear-fighter { border-color: var(--wiki-border); }
    .wiki-page .map-art::after { background: rgba(9, 14, 33, .52); }
    .wiki-page .route-node.current { border-color: var(--wiki-gold); box-shadow: inset 0 -2px 0 var(--wiki-gold); }
    .wiki-page .explore-comment { background: #17233d; border-left-color: var(--wiki-blue-line); }
    .wiki-page .completion-card { background: var(--wiki-surface); }
    .wiki-page .completion-card.final-red { background: #211622; border-color: #945164; }
    .wiki-page .clear-stage, .wiki-page .boss-raid-hero { border-color: var(--wiki-border); box-shadow: none; }
    .wiki-page .clear-stage::after, .wiki-page .boss-raid-hero::after { background: rgba(9, 14, 33, .6); }
    .wiki-page .clear-title { color: var(--wiki-gold); text-shadow: 2px 2px 0 #22172c; }
    .wiki-page .completion-badge, .wiki-page .clear-seal { color: #18203a; background: var(--wiki-gold); border-color: #fff0a8; }
    .wiki-page .boss-raid-difficulty { color: #10162a; background: var(--wiki-gold); }
    .wiki-page .boss-raid-difficulty.veteran { background: #9ec9ff; }
    .wiki-page .boss-raid-difficulty.veteran-king { color: #fff; background: var(--wiki-danger); }
    .wiki-page .boss-hp-track { background: #253149; }
    .wiki-page .boss-hp-fill { background: var(--wiki-danger); }
    .wiki-page .boss-hp-fill.cleared { background: var(--wiki-success); }
    .wiki-page .boss-ranking-row strong { color: var(--wiki-gold); }
  `;
}
async function renderCard(ctx, html) {
    const puppeteer = ctx.puppeteer;
    if (!puppeteer?.page)
        return undefined;
    let page;
    try {
        page = await puppeteer.page();
        await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        const card = await page.$('#card');
        if (!card)
            return undefined;
        const buffer = await card.screenshot({ type: 'png' });
        return koishi_1.h.image(buffer, 'image/png');
    }
    catch (error) {
        ctx.logger.warn('DEADCELLS BURST 图片渲染失败，回退文字输出', error);
        return undefined;
    }
    finally {
        await page?.close?.();
    }
}
function pageHtml(content, cardClass = 'card') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${cardStyle()}</style></head><body><div id="card" class="${cardClass}"><div class="content">${content}</div></div></body></html>`;
}
async function renderPlayerCard(ctx, player) {
    const stats = (0, progression_1.getPlayerStats)(player);
    const bossCell = assetData('boss细胞.webp');
    const avatar = await avatarData(player.userId);
    const html = pageHtml(`
    <div class="header">
      <div><div class="eyebrow">DEADCELLS BURST // PLAYER PROFILE</div><div class="brand">DEAD<span>CELLS</span></div></div>
      <div class="cell-badge">${bossCell ? `<img class="cell-image" src="${bossCell}" alt="" />` : ''}${player.bossCellLevel} CELL</div>
    </div>
    <div class="hero">
      <div class="hero-profile">${avatarTag(avatar, player.username)}<div><div class="player-name">${escapeHtml(player.username)}</div><div class="player-subtitle">SURVIVOR DOSSIER / ACTIVE PROFILE</div></div></div>
      ${bossCell ? `<img class="hero-mark" src="${bossCell}" alt="" />` : ''}
    </div>
    <div class="section-title">CORE STATUS</div>
    <div class="stats">
      <div class="stat"><div class="stat-label">CELLS</div><div class="stat-value accent">${player.cells}</div></div>
      <div class="stat"><div class="stat-label">MAX HP</div><div class="stat-value">${stats.maxHp}</div></div>
      <div class="stat"><div class="stat-label">ATTACK</div><div class="stat-value">${stats.attack}</div></div>
      <div class="stat"><div class="stat-label">CRIT</div><div class="stat-value">${stats.critChance}%</div></div>
    </div>
    <div class="section-title">EQUIPMENT LOADOUT</div>
    <div class="equipment-grid">
      ${equipmentPanel('WEAPON', player.weaponId, '武器', player.weaponQuality, player.weaponTrait)}
      ${equipmentPanel('OFFHAND', player.shieldId, '副手')}
      ${equipmentPanel('ITEM 1', player.item1Id, '道具 1')}
      ${equipmentPanel('ITEM 2', player.item2Id, '道具 2')}
      ${amuletPanel(player)}
    </div>
    <div class="footer"><span>BATTLES ${player.battleCount}</span><span>WIN RATE ${(0, progression_1.formatWinRate)(player)}</span><span>BURST // 0.1</span></div>
  `);
    return renderCard(ctx, html);
}
function routeNode(mapName, index, currentMap) {
    const map = maps_1.maps.find((item) => item.name === mapName);
    const source = assetData(mapImages[mapName]);
    const boss = mapBosses[mapName];
    const state = mapName === currentMap ? 'current' : 'reached';
    return `
    <div class="route-node ${state}">
      ${source ? `<img class="route-thumb" src="${source}" alt="" />` : '<div class="route-thumb empty-image">NO IMAGE</div>'}
      <div class="route-node-info"><div class="route-index">ZONE ${String(index + 1).padStart(2, '0')} // ${state.toUpperCase()}</div><div class="route-name">${escapeHtml(mapName)}</div><div class="route-reward">+${map?.reward || 0} CELLS</div>${boss ? `<div class="route-boss">BOSS NODE · ${escapeHtml(boss.name)}</div>` : ''}</div>
    </div>`;
}
function bossCard(encounter, result) {
    const boss = mapBosses[encounter.mapName];
    const source = assetData(boss?.image);
    const finalBoss = result.completed && encounter.mapName === result.finalBossMap;
    const state = encounter.won ? '讨伐成功' : '未能击败';
    const reward = encounter.won ? ` · +${encounter.reward} 细胞` : '';
    return `
    <div class="boss-card">
      ${source ? `<img class="boss-image" src="${source}" alt="" />` : '<div class="boss-image empty-image">NO IMAGE</div>'}
      <div><div class="boss-label">${finalBoss ? 'FINAL BOSS' : 'REGION BOSS'}</div><div class="boss-name">${escapeHtml(encounter.bossName)}</div><div class="boss-state">${state}${reward}</div></div>
    </div>`;
}
async function renderCompletionCard(ctx, player, result) {
    const avatar = await avatarData(player.userId);
    const finalMap = result.finalBossMap || '塔顶';
    const finalBoss = mapBosses[finalMap];
    const finalBossName = result.finalBossName || finalBoss?.name || '最终 Boss';
    const background = assetData(mapImages[finalMap]);
    const finalBossImage = assetData(finalBoss?.image);
    const finalReward = result.bosses.find((encounter) => encounter.mapName === finalMap)?.reward || 0;
    const html = pageHtml(`
    <div class="completion-header">
      <div><div class="eyebrow">DEADCELLS BURST // FINAL CLEAR</div><div class="brand">RUN<span> COMPLETE</span></div></div>
      <div class="completion-badge">100% CLEARED</div>
    </div>
    <div class="clear-stage">
      ${background ? `<img class="clear-background" src="${background}" alt="" />` : ''}
      <div class="clear-content">
        <div class="clear-kicker">${escapeHtml(finalMap)} // FINAL ENCOUNTER</div>
        <div class="clear-title">通关庆祝</div>
        <div class="clear-subtitle">你已抵达终局，并成功讨伐最终 Boss</div>
        <div class="clear-duel">
          <div class="clear-fighter winner">${avatarTag(avatar, player.username)}<div class="clear-fighter-label">SURVIVOR</div><div class="clear-fighter-name">${escapeHtml(player.username)} <span class="crown" aria-label="胜者">♛</span></div><div class="clear-fighter-status">真正的强者</div></div>
          <div class="clear-seal">VICTORY</div>
          <div class="clear-fighter">${finalBossImage ? `<img class="clear-boss-image" src="${finalBossImage}" alt="" />` : '<div class="clear-boss-image empty-image">NO IMAGE</div>'}<div class="clear-fighter-label">FINAL BOSS</div><div class="clear-fighter-name">${escapeHtml(finalBossName)}</div><div class="clear-fighter-status">DEFEATED</div></div>
        </div>
        <div class="clear-message">成功通关！<small>你是真正的强者，撒花庆祝！</small></div>
      </div>
    </div>
    <div class="clear-reward">
      <div class="clear-reward-item"><div class="clear-reward-label">BASE CELLS</div><div class="clear-reward-value">${result.baseCells}</div></div>
      <div class="clear-reward-item"><div class="clear-reward-label">FINAL BOSS REWARD</div><div class="clear-reward-value">+${finalReward}</div></div>
      <div class="clear-reward-item"><div class="clear-reward-label">TOTAL CELLS</div><div class="clear-reward-value">${player.cells}</div></div>
    </div>
    <div class="route-title">COMPLETED ROUTE // ${result.reached.length} MAPS CONQUERED</div>
    <div class="clear-route">${result.reached.map((mapName) => `<div class="clear-route-node">${escapeHtml(mapName)}</div>`).join('')}</div>
    <div class="footer"><span>${escapeHtml(finalMap)}</span><span>FINAL CLEAR</span><span>DEAD CELLS BURST</span></div>
  `, 'card completion-card final-red');
    return renderCard(ctx, html);
}
async function renderExploreCard(ctx, player, result) {
    if (result.completed)
        return renderCompletionCard(ctx, player, result);
    const avatar = await avatarData(player.userId);
    const currentMap = result.reached[result.reached.length - 1] || maps_1.maps[0].name;
    const mapSource = assetData(mapImages[currentMap]);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // EXPEDITION LOG</div><div class="brand">MAP<span> EXPLORATION</span></div></div>
      <div class="cell-badge">${player.bossCellLevel} CELL</div>
    </div>
    <div class="explore-hero">
      <div class="map-art">
        ${mapSource ? `<img src="${mapSource}" alt="" />` : '<div class="map-art empty-image">NO MAP IMAGE</div>'}
        <div class="map-art-caption"><div class="map-art-label">CURRENT REGION // ROUTE MAP ${result.reached.length}</div><div class="map-art-name">${escapeHtml(currentMap)}</div></div>
      </div>
      <div class="explore-summary">
        <div class="explore-avatar">${avatarTag(avatar, player.username)}<div><div class="explore-player">${escapeHtml(player.username)}</div><div class="explore-player-subtitle">EXPEDITION STATUS</div></div></div>
        <div></div>
        <div class="explore-gain">CELLS GAINED<strong>+${result.cellsGained}</strong></div>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-label">BASE CELLS</div><div class="stat-value">${result.baseCells}</div></div>
      <div class="stat"><div class="stat-label">MULTIPLIER</div><div class="stat-value accent">×${result.multiplier}</div></div>
      <div class="stat"><div class="stat-label">TOTAL CELLS</div><div class="stat-value">${player.cells}</div></div>
      <div class="stat"><div class="stat-label">ROUTE MAPS</div><div class="stat-value">${result.reached.length}</div></div>
    </div>
    <div class="route-title">EXPEDITION ROUTE // MAP NODES</div>
    <div class="route-grid">${result.reached.map((mapName, index) => routeNode(mapName, index, currentMap)).join('')}</div>
    ${result.bosses.length ? `<div class="boss-title">BOSS ENCOUNTERS // AREA INTELLIGENCE</div><div class="boss-grid">${result.bosses.map((encounter) => bossCard(encounter, result)).join('')}</div>` : ''}
    <div class="explore-comment">${escapeHtml(result.comment)}</div>
    <div class="footer"><span>EXPEDITION LOG</span><span>MAP ROUTE ${result.reached.length} MAPS</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
function fighterCard(player, hp, maxHp, winner, avatar) {
    const stats = (0, progression_1.getPlayerStats)(player);
    const weapon = (0, equipment_1.getEquipment)(player.weaponId);
    const shield = (0, equipment_1.getEquipment)(player.shieldId);
    const item1 = (0, equipment_1.getEquipment)(player.item1Id);
    const item2 = (0, equipment_1.getEquipment)(player.item2Id);
    const amulet = (0, amulets_1.getAmulet)(player.amuletId);
    return `
    <div class="fighter${winner ? ' winner' : ''}">
      <div class="fighter-profile">${avatarTag(avatar, player.username)}<div class="fighter-name">${escapeHtml(player.username)}${winner ? '<span class="crown" aria-label="胜者">♛</span>' : ''}</div></div>
      <div class="fighter-equip">${weaponImageTag(player.weaponId, player.weaponQuality, 'mini-image')}${imageTag(player.shieldId, 'mini-image')}${imageTag(player.item1Id, 'mini-image')}${imageTag(player.item2Id, 'mini-image')}${amuletImageTag(player.amuletId, 'mini-image amulet-mini')}</div>
      <div class="fighter-stat"><span>HP</span><strong>${Math.max(0, Math.round(hp))} / ${maxHp}</strong></div>
      <div class="fighter-stat"><span>ATTACK</span><strong>${stats.attack}</strong></div>
      <div class="fighter-stat"><span>WEAPON</span><strong>${escapeHtml(`${(0, equipment_1.weaponQualityText)(player.weaponQuality)}·${weapon?.name || '无'}`)}</strong></div>
      <div class="fighter-stat"><span>OFFHAND</span><strong>${escapeHtml(shield?.name || '无')}</strong></div>
      <div class="fighter-stat"><span>ITEMS</span><strong>${escapeHtml([item1?.name, item2?.name].filter(Boolean).join(' / ') || '无')}</strong></div>
      <div class="fighter-stat"><span>AMULET</span><strong>${escapeHtml(amulet?.name || '囚者颈环')}</strong></div>
      <div class="fighter-stat"><span>TRAITS</span><strong>${escapeHtml(amuletTraitText(player))}</strong></div>
    </div>`;
}
function logClass(text) {
    const classes = [];
    if (/暴击|即死/.test(text))
        classes.push('critical');
    if (/技能|发动|触发|标记|蓄力|箭塔|召唤/.test(text))
        classes.push('skill');
    if (/格挡|护盾|无敌|反弹|抵挡|保留1点生命|免疫/.test(text))
        classes.push('defense');
    if (/眩晕|冰冻|流血|充能|沉默/.test(text))
        classes.push('status');
    if (/受到\s*\d+\s*点伤害|死亡|战败|击败/.test(text))
        classes.push('danger');
    if (/获胜|胜利|WINS|战斗结束/.test(text))
        classes.push('victory');
    if (/使用道具|使用副手/.test(text))
        classes.push('item');
    return classes.join(' ');
}
function hpBar(name, hp, maxHp) {
    const safeMax = Math.max(1, maxHp);
    const percent = Math.max(0, Math.min(100, (hp / safeMax) * 100));
    return `<div class="hp-state"><span>${escapeHtml(name)}</span><div class="hp-track"><div class="hp-fill${percent <= 30 ? ' low' : ''}" style="width:${percent}%"></div></div><strong class="hp-value">${hp} / ${safeMax}</strong></div>`;
}
function battleLogLine(text, firstName, secondName) {
    const state = text.match(/^【状态】(.+?) HP:(\d+)\/(\d+) \| (.+?) HP:(\d+)\/(\d+)$/);
    if (state) {
        const entries = [
            { name: state[1], hp: Number(state[2]), maxHp: Number(state[3]) },
            { name: state[4], hp: Number(state[5]), maxHp: Number(state[6]) },
        ];
        const firstIndex = firstName ? entries.findIndex((entry) => entry.name === firstName) : -1;
        const secondIndex = secondName ? entries.findIndex((entry, index) => entry.name === secondName && index !== firstIndex) : -1;
        const ordered = firstIndex >= 0 && secondIndex >= 0
            ? [entries[firstIndex], entries[secondIndex]]
            : entries;
        return `<div class="round-state">${ordered.map((entry) => hpBar(entry.name, entry.hp, entry.maxHp)).join('')}</div>`;
    }
    return `<div class="log-line ${logClass(text)}">${escapeHtml(text)}</div>`;
}
async function renderBattleCard(ctx, first, second, result) {
    const winner = result.winnerId === first.userId ? first : second;
    const [firstAvatar, secondAvatar] = await Promise.all([avatarData(first.userId), avatarData(second.userId)]);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // THRONE ROOM</div><div class="brand">BATTLE<span> RESULT</span></div></div>
      <div class="cell-badge">TURN ${result.turns}</div>
    </div>
    <div class="battle-arena">
      ${fighterCard(first, result.attacker.hp, result.attacker.stats.maxHp, result.winnerId === first.userId, firstAvatar)}
      <div class="versus">VS</div>
      ${fighterCard(second, result.defender.hp, result.defender.stats.maxHp, result.winnerId === second.userId, secondAvatar)}
    </div>
    <div class="result">${escapeHtml(winner.username)} <span class="crown" aria-label="胜者">♛</span> WINS<small>获得 ${result.cellTransfer} 个细胞</small></div>
    <div class="battle-log"><div class="log-title">COMBAT LOG // FULL RECORD</div>${result.events.map((event) => battleLogLine(event.text, first.username, second.username)).join('')}</div>
    <div class="footer"><span>THRONE ROOM</span><span>RANDOMIZED COMBAT</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderEquipmentDropCard(ctx, winner, equipment, autoEquipped, currentEquipment, promptText) {
    const avatar = await avatarData(winner.userId);
    const status = autoEquipped
        ? '已自动装备'
        : promptText || `当前装备：${currentEquipment?.name || '无'}，回复 y 可替换`;
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // REWARD CACHE</div><div class="brand">EQUIPMENT<span> ACQUIRED</span></div></div>
      <div class="cell-badge">LOOT</div>
    </div>
    <div class="loot-owner">
      ${avatarTag(avatar, winner.username)}
      <div><div class="loot-owner-name">${escapeHtml(winner.username)}</div><div class="loot-owner-label">SURVIVOR REWARD // DROP CONFIRMED</div></div>
    </div>
    <div class="loot-panel">
      ${equipment.type === 'weapon' ? weaponImageTag(equipment.id, equipment.weaponQuality, 'loot-image') : imageTag(equipment.id, 'loot-image')}
      <div><div class="loot-kind">${equipment.type === 'weapon' ? `${(0, equipment_1.weaponQualityText)(equipment.weaponQuality).toUpperCase()} WEAPON DROP` : equipment.type === 'offhand' ? 'OFFHAND DROP' : 'ITEM DROP'}</div><div class="loot-name">${escapeHtml(equipment.name)}</div><div class="loot-description">${escapeHtml(equipment.type === 'weapon' ? weaponDescriptionText(equipment.description, equipment.weaponQuality, equipment.weaponTrait) : equipment.description)}</div></div>
    </div>
    <div class="loot-status">${escapeHtml(status)}<small>${autoEquipped ? '装备已写入角色数据。' : '回复 y 确认替换，其他内容或超时则放弃。'}</small></div>
    <div class="footer"><span>REWARD CACHE</span><span>RANDOM DROP</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderAmuletCard(ctx, player, generated, cost = 3000) {
    const avatar = await avatarData(player.userId);
    const amulet = (0, amulets_1.getAmulet)(generated.id);
    const traits = generated.traits.map(amulets_1.getAmuletTrait).filter(Boolean);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // ALCHEMY LAB</div><div class="brand">AMULET<span> REFORGED</span></div></div>
      <div class="cell-badge">-${cost} CELLS</div>
    </div>
    <div class="loot-owner">
      ${avatarTag(avatar, player.username)}
      <div><div class="loot-owner-name">${escapeHtml(player.username)}</div><div class="loot-owner-label">NEW AMULET // RARITY TRAITS GENERATED</div></div>
    </div>
    <div class="amulet-result">
      <div class="amulet-result-layout">
        ${amuletImageTag(generated.id, 'amulet-result-image')}
        <div>
          <div class="loot-kind">AMULET DROP</div>
          <div class="amulet-result-name">${escapeHtml(amulet?.name || '炼化护符')}</div>
          <div class="amulet-result-traits">${traits.length ? traits.map((trait) => `<div class="amulet-result-trait">${escapeHtml(trait.name)}：${escapeHtml(trait.description)}</div>`).join('') : '<div class="amulet-result-trait">暂无词条</div>'}</div>
        </div>
      </div>
    </div>
    <div class="loot-status">回复 y 替换当前护符<small>其他内容或超时则放弃，已消耗的细胞不返还。</small></div>
    <div class="footer"><span>ALCHEMY LAB</span><span>RANDOM TRAITS</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderAmuletChoicesCard(ctx, player, generated, cost) {
    const avatar = await avatarData(player.userId);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // ALCHEMY LAB</div><div class="brand">AMULET<span> REFORGE BATCH</span></div></div>
      <div class="cell-badge">-${cost} CELLS</div>
    </div>
    <div class="loot-owner">
      ${avatarTag(avatar, player.username)}
      <div><div class="loot-owner-name">${escapeHtml(player.username)}</div><div class="loot-owner-label">${generated.length} RANDOM AMULETS // CHOOSE ONE</div></div>
    </div>
    <div class="amulet-choice-grid">${generated.map((item, index) => {
        const amulet = (0, amulets_1.getAmulet)(item.id);
        const traits = item.traits.map(amulets_1.getAmuletTrait).filter(Boolean);
        return `<div class="amulet-choice-card"><div class="choice-number">${String(index + 1).padStart(2, '0')}</div>${amuletImageTag(item.id, 'amulet-result-image')}<div class="amulet-choice-name">${escapeHtml(amulet?.name || '炼化护符')}</div><div class="amulet-choice-traits">${traits.map((trait) => `<div class="amulet-choice-trait">${escapeHtml(trait.name)}：${escapeHtml(trait.description)}</div>`).join('')}</div></div>`;
    }).join('')}</div>
    <div class="loot-status">回复 1-${generated.length} 选择护符<small>选择后还需回复 y 确认替换；其他内容或超时则放弃，已消耗的细胞不返还。</small></div>
    <div class="footer"><span>ALCHEMY LAB</span><span>BATCH ROLL</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderAmuletDropCard(ctx, winner, amuletId, traits, autoEquipped) {
    const avatar = await avatarData(winner.userId);
    const amulet = (0, amulets_1.getAmulet)(amuletId);
    const traitDefinitions = traits.map(amulets_1.getAmuletTrait).filter(Boolean);
    const status = autoEquipped ? '已自动装备' : '当前护符已存在，回复 y 替换';
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // HUNTER CACHE</div><div class="brand">AMULET<span> COPIED</span></div></div>
      <div class="cell-badge">LOOT</div>
    </div>
    <div class="loot-owner">
      ${avatarTag(avatar, winner.username)}
      <div><div class="loot-owner-name">${escapeHtml(winner.username)}</div><div class="loot-owner-label">HUNTER GRENADE // FULL TRAIT COPY</div></div>
    </div>
    <div class="amulet-result">
      <div class="amulet-result-layout">
        ${amuletImageTag(amuletId, 'amulet-result-image')}
        <div><div class="loot-kind">AMULET COPY</div><div class="amulet-result-name">${escapeHtml(amulet?.name || '炼化护符')}</div><div class="amulet-result-traits">${traitDefinitions.map((trait) => `<div class="amulet-result-trait">${escapeHtml(trait.name)}：${escapeHtml(trait.description)}</div>`).join('')}</div></div>
      </div>
    </div>
    <div class="loot-status">${escapeHtml(status)}<small>${autoEquipped ? '护符词条已完整复制。' : '回复 y 确认替换，其他内容或超时则放弃。'}</small></div>
    <div class="footer"><span>HUNTER CACHE</span><span>FULL COPY</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderForgeCard(ctx, player, choices, count = 1, cost = 1000) {
    const avatar = await avatarData(player.userId);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // FORGE ROOM</div><div class="brand">FORGE<span> EQUIPMENT</span></div></div>
      <div class="cell-badge">-${cost} CELLS</div>
    </div>
    <div class="loot-owner">
      ${avatarTag(avatar, player.username)}
      <div><div class="loot-owner-name">${escapeHtml(player.username)}</div><div class="loot-owner-label">${count} GROUP${count > 1 ? 'S' : ''} // ${choices.length} BLUEPRINTS // CHOOSE ONE</div></div>
    </div>
    <div class="choice-grid">${choices.map((choice, index) => `
      <div class="choice-card">
        <div class="choice-number">${String(index + 1).padStart(2, '0')}</div>
        ${count > 1 ? `<div class="choice-group">GROUP ${Math.floor(index / 3) + 1}</div>` : ''}
        ${choice.type === 'weapon' ? weaponImageTag(choice.id, choice.weaponQuality, 'mini-image') : imageTag(choice.id, 'mini-image')}
        <div class="choice-name">${escapeHtml(choice.name)}</div>
        <div class="choice-type">${choice.type === 'weapon' ? `${(0, equipment_1.weaponQualityText)(choice.weaponQuality).toUpperCase()} WEAPON` : choice.type === 'offhand' ? 'OFFHAND' : 'ITEM'}</div>
        <div class="choice-description">${escapeHtml(choice.type === 'weapon' ? weaponDescriptionText(choice.description, choice.weaponQuality, choice.weaponTrait) : choice.description)}</div>
      </div>`).join('')}</div>
    <div class="loot-status">回复 1-${choices.length} 选择装备<small>如果选择道具，之后还需回复 1 或 2 选择替换的道具槽；其他内容放弃。</small></div>
    <div class="footer"><span>FORGE ROOM</span><span>NO DUPLICATES</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
function bossDifficultyName(difficulty) {
    return difficulty === 'veteran-king' ? '历战王' : difficulty === 'veteran' ? '历战' : '普通';
}
async function renderBossRaidCard(ctx, player, boss, result, rankings, completed = boss.completed) {
    const avatar = await avatarData(player.userId);
    const background = assetData(mapImages[boss.mapName]);
    const bossImage = assetData(mapBosses[boss.mapName]?.image);
    const hp = Math.max(0, Math.round(boss.currentHp));
    const hpPercent = boss.maxHp ? Math.max(0, Math.min(100, (hp / boss.maxHp) * 100)) : 0;
    const difficulty = bossDifficultyName(boss.difficulty);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // DAILY RAID</div><div class="brand">BOSS<span> ASSAULT</span></div></div>
      <div class="cell-badge">${escapeHtml(difficulty)}</div>
    </div>
    <div class="boss-raid-hero">
      ${background ? `<img class="boss-raid-background" src="${background}" alt="" />` : ''}
      <div class="boss-raid-content">
        <div class="boss-raid-meta">
          <div class="boss-raid-kicker">SHARED DAILY TARGET // ${escapeHtml(boss.date)}</div>
          <div class="boss-raid-name">${escapeHtml(boss.bossName)}</div>
          <div class="boss-raid-map">${escapeHtml(boss.mapName)} · 全服共享生命池</div>
          <div class="boss-raid-difficulty ${boss.difficulty}">${escapeHtml(difficulty)} · 奖励 ×${boss.rewardMultiplier}</div>
        </div>
        ${bossImage ? `<img class="boss-raid-image" src="${bossImage}" alt="" />` : '<div class="boss-raid-image empty-image">NO BOSS IMAGE</div>'}
      </div>
    </div>
    <div class="boss-hp-panel">
      <div class="boss-hp-heading"><span>世界 Boss 生命</span><strong>${hp} / ${boss.maxHp}</strong></div>
      <div class="boss-hp-track"><div class="boss-hp-fill${completed ? ' cleared' : ''}" style="width:${hpPercent}%"></div></div>
    </div>
    ${result ? `<div class="boss-raid-stats"><div class="boss-raid-stat"><div class="boss-raid-stat-label">本次伤害</div><div class="boss-raid-stat-value">${result.damage}</div></div><div class="boss-raid-stat"><div class="boss-raid-stat-label">战斗回合</div><div class="boss-raid-stat-value">${result.turns}</div></div><div class="boss-raid-stat"><div class="boss-raid-stat-label">讨伐者</div><div class="boss-raid-stat-value">${result.killed ? 'LAST HIT' : 'RAID'}</div></div></div><div class="boss-raid-log">${result.events.map((event) => escapeHtml(event)).join('<br />')}</div>` : ''}
    <div class="boss-ranking-title">DAMAGE RANKING // TOP 10</div>
    <div class="boss-ranking">${rankings.slice(0, 10).map((entry, index) => `<div class="boss-ranking-row"><strong>#${index + 1}</strong><span>${escapeHtml(entry.username)}${entry.userId === player.userId ? ` · ${escapeHtml(avatar ? 'YOU' : '')}` : ''}</span><strong>${Math.round(entry.damage)}</strong></div>`).join('') || '<div class="boss-ranking-row"><span></span><span>暂无讨伐记录</span><strong>0</strong></div>'}</div>
    <div class="explore-comment">${completed ? `今日 Boss 已被 ${escapeHtml(boss.killerName || '勇者')} 讨伐，之后只能查看结算与排行榜。` : `${escapeHtml(player.username)} 本次对 Boss 造成了 ${result?.damage || 0} 点伤害。`}</div>
    <div class="footer"><span>DAILY RAID</span><span>GLOBAL HP POOL</span><span>DEAD CELLS BURST</span></div>
  `, 'card boss-raid-card');
    return renderCard(ctx, html);
}
async function renderBossTraitChoiceCard(ctx, player, boss, choices, rewardCells, timeoutSeconds = 30) {
    const avatar = await avatarData(player.userId);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // LAST HIT REWARD</div><div class="brand">TRAIT<span> SELECTION</span></div></div>
      <div class="cell-badge">+${rewardCells} CELLS</div>
    </div>
    <div class="loot-owner">${avatarTag(avatar, player.username)}<div><div class="loot-owner-name">${escapeHtml(player.username)}</div><div class="loot-owner-label">击破 ${escapeHtml(boss.bossName)} · 选择一个词条</div></div></div>
    <div class="boss-choice-card"><div class="boss-choice-title">最后一击奖励</div><div class="boss-choice-subtitle">从以下五个不重复词条中选择一个；护符最多容纳三个词条，满位后选择替换槽位。</div><div class="boss-choice-list">${choices.map((id, index) => { const trait = (0, amulets_1.getAmuletTrait)(id); return `<div class="boss-choice-item"><div class="boss-choice-number">${index + 1}</div><div><div class="boss-choice-name">${escapeHtml(trait?.name || id)}</div><div class="boss-choice-description">${escapeHtml(trait?.description || '')}</div></div></div>`; }).join('')}</div></div>
    <div class="loot-status">请回复 1-${choices.length} 选择词条<small>奖励选择将在 ${Math.max(1, Math.ceil(timeoutSeconds))} 秒内有效。</small></div>
    <div class="footer"><span>LAST HIT</span><span>RANDOM TRAIT POOL</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderDeathmatchTraitChoiceCard(ctx, player, choices, timeoutSeconds = 30) {
    const avatar = await avatarData(player.userId);
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // DEATHMATCH REWARD</div><div class="brand">TRAIT<span> SELECTION</span></div></div>
      <div class="cell-badge">10 OPTIONS</div>
    </div>
    <div class="loot-owner">${avatarTag(avatar, player.username)}<div><div class="loot-owner-name">${escapeHtml(player.username)}</div><div class="loot-owner-label">死斗胜者奖励 · 选择一个护符词条</div></div></div>
    <div class="boss-choice-card"><div class="boss-choice-title">死斗胜者奖励</div><div class="boss-choice-subtitle">从以下十个不重复词条中选择一个；当前护符和无色武器已有的词条不会重复出现。</div><div class="boss-choice-list">${choices.map((id, index) => { const trait = (0, amulets_1.getAmuletTrait)(id); return `<div class="boss-choice-item"><div class="boss-choice-number">${index + 1}</div><div><div class="boss-choice-name">${escapeHtml(trait?.name || id)}</div><div class="boss-choice-description">${escapeHtml(trait?.description || '')}</div></div></div>`; }).join('')}</div></div>
    <div class="loot-status">请回复 1-${choices.length} 选择词条<small>奖励选择将在 ${Math.max(1, Math.ceil(timeoutSeconds))} 秒内有效。</small></div>
    <div class="footer"><span>DEATHMATCH WINNER</span><span>RANDOM TRAIT POOL</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderDeathmatchCard(ctx, result, totalReward = 0) {
    const bossBackground = assetData(mapImages[result.bossMapName]);
    const bossImage = assetData(mapBosses[result.bossMapName]?.image);
    const avatars = await Promise.all(result.participants.map((participant) => avatarData(participant.userId)));
    const winnerId = result.winnerId;
    const html = pageHtml(`
    <div class="header battle-header">
      <div><div class="eyebrow">DEADCELLS BURST // ARENA EVENT</div><div class="brand">DEATH<span>MATCH</span></div></div>
      <div class="cell-badge">${result.bossKilled ? `POOL ${totalReward}` : 'BOSS FAILED'}</div>
    </div>
    <div class="boss-raid-hero">
      ${bossBackground ? `<img class="boss-raid-background" src="${bossBackground}" alt="" />` : ''}
      <div class="boss-raid-content"><div class="boss-raid-meta"><div class="boss-raid-kicker">CO-OP BOSS // LAST HIT STARTS THE ARENA</div><div class="boss-raid-name">${escapeHtml(result.bossName)}</div><div class="boss-raid-map">${escapeHtml(result.bossMapName)} · ${result.bossKilled ? 'BOSS DEFEATED' : 'BOSS SURVIVED'}</div></div>${bossImage ? `<img class="boss-raid-image" src="${bossImage}" alt="" />` : ''}</div>
    </div>
    <div class="section-title">SURVIVORS // ${result.participants.length}</div>
    <div class="boss-ranking">${result.participants.map((participant, index) => `<div class="boss-ranking-row${participant.userId === winnerId ? ' victory' : ''}"><strong>#${index + 1}</strong><span>${avatarTag(avatars[index], participant.username, 'avatar-small')} ${escapeHtml(participant.username)}${participant.userId === winnerId ? ' ♛' : ''}</span><strong>${participant.eliminated ? 'ELIMINATED' : `${participant.hp}/${participant.maxHp}`}</strong></div>`).join('')}</div>
    <div class="result">${winnerId ? `${escapeHtml(result.winnerName || '胜者')} <span class="crown">♛</span> WINS<small>获得 ${totalReward} 个细胞</small>` : 'NO WINNER<small>下注细胞消失</small>'}</div>
    <div class="battle-log"><div class="log-title">DEATHMATCH LOG // FULL RECORD</div>${result.events.map((event) => battleLogLine(event.text)).join('')}</div>
    <div class="footer"><span>${escapeHtml(result.bossMapName)}</span><span>RANDOMIZED ARENA</span><span>DEAD CELLS BURST</span></div>
  `, 'card boss-raid-card');
    return renderCard(ctx, html);
}
async function renderMysteryShopCard(ctx, items, purchased, price) {
    const shopItemImage = (item) => {
        if (item.kind === 'weapon')
            return weaponImageTag(item.equipmentId, item.weaponQuality, 'shop-item-image');
        if (item.kind === 'amulet')
            return amuletImageTag(item.equipmentId, 'shop-item-image');
        const source = assetData(shopImages[item.kind]);
        return source ? `<img class="shop-item-image" src="${source}" alt="" />` : '<div class="shop-item-image empty-image">NO IMAGE</div>';
    };
    const html = pageHtml(`
    <div class="header battle-header"><div><div class="eyebrow">DEADCELLS BURST // GLOBAL MARKET</div><div class="brand">MYSTERY<span> SHOP</span></div></div><div class="cell-badge">${price} CELLS / ITEM</div></div>
    <div class="choice-grid">${items.map((item) => { const traitNames = item.traits?.map((id) => (0, amulets_1.getAmuletTrait)(id)?.name || id).join('、'); const weaponTrait = item.weaponTrait ? (0, amulets_1.getAmuletTrait)(item.weaponTrait) : undefined; const traitText = weaponTrait ? `无色词条：${weaponTrait.name}${weaponTrait.description ? `（${weaponTrait.description}）` : ''}` : traitNames ? `词条：${traitNames}` : ''; return `<div class="choice-card${purchased.includes(item.slot) ? ' sold' : ''}"><div class="choice-number">${String(item.slot).padStart(2, '0')}</div>${shopItemImage(item)}<div class="choice-name">${escapeHtml(item.name)}</div><div class="choice-type">${purchased.includes(item.slot) ? 'SOLD OUT' : 'AVAILABLE'}</div><div class="choice-description">${escapeHtml(item.description)}${traitText ? `<br />${escapeHtml(traitText)}` : ''}</div></div>`; }).join('')}</div>
    <div class="loot-status">请直接回复 1-9 选择商品<small>购买前会再次确认，商店全服共享。</small></div>
    <div class="footer"><span>GLOBAL MARKET</span><span>9 SLOTS</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
async function renderWeeklyCard(ctx, scores) {
    const avatars = await Promise.all(scores.map((score) => avatarData(score.userId)));
    const html = pageHtml(`
    <div class="header battle-header"><div><div class="eyebrow">DEADCELLS BURST // WEEKLY RANKING</div><div class="brand">WEEK<span>LY SCORE</span></div></div><div class="cell-badge">${scores.length} PLAYERS</div></div>
    <div class="boss-ranking">${scores.map((score, index) => `<div class="boss-ranking-row"><strong>#${index + 1}</strong><span>${avatarTag(avatars[index], score.username, 'avatar-small')} ${escapeHtml(score.username)}</span><strong>${score.points} PTS</strong></div>`).join('')}</div>
    <div class="loot-status">本群本周积分<small>每周一东八区 0:00 刷新。</small></div>
    <div class="footer"><span>WEEKLY SCORE</span><span>GROUP RANKING</span><span>DEAD CELLS BURST</span></div>
  `);
    return renderCard(ctx, html);
}
