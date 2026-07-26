"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const character_1 = require("./character");
const explore_1 = require("./explore");
const upgrade_1 = require("./upgrade");
const duel_1 = require("./duel");
const alchemy_1 = require("./alchemy");
const forge_1 = require("./forge");
const boss_1 = require("./boss");
function registerCommands(ctx, config) {
    const busy = new Set();
    (0, character_1.registerCharacterCommand)(ctx, config);
    (0, explore_1.registerExploreCommand)(ctx, config, busy);
    (0, upgrade_1.registerUpgradeCommand)(ctx, config, busy);
    (0, duel_1.registerDuelCommand)(ctx, config, busy);
    (0, alchemy_1.registerAlchemyCommand)(ctx, config, busy);
    (0, forge_1.registerForgeCommand)(ctx, config, busy);
    (0, boss_1.registerBossCommand)(ctx, config, busy);
}
