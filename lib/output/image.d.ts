import { type Context } from 'koishi';
import type { ExplorationResult } from '../core/exploration';
import type { BossRaidResult } from '../core/boss';
import { type EquipmentDefinition } from '../data/equipment';
import type { BattleResult, DailyBossRecord, DeadcellsPlayer } from '../types';
export declare function renderPlayerCard(ctx: Context, player: DeadcellsPlayer): Promise<any | undefined>;
export declare function renderExploreCard(ctx: Context, player: DeadcellsPlayer, result: ExplorationResult): Promise<any | undefined>;
export declare function renderBattleCard(ctx: Context, first: DeadcellsPlayer, second: DeadcellsPlayer, result: BattleResult): Promise<any | undefined>;
export declare function renderEquipmentDropCard(ctx: Context, winner: DeadcellsPlayer, equipment: EquipmentDefinition, autoEquipped: boolean, currentEquipment?: EquipmentDefinition, promptText?: string): Promise<any | undefined>;
export declare function renderAmuletCard(ctx: Context, player: DeadcellsPlayer, generated: {
    id: string;
    traits: string[];
}, cost?: number): Promise<any | undefined>;
export declare function renderAmuletChoicesCard(ctx: Context, player: DeadcellsPlayer, generated: Array<{
    id: string;
    traits: string[];
}>, cost: number): Promise<any | undefined>;
export declare function renderAmuletDropCard(ctx: Context, winner: DeadcellsPlayer, amuletId: string, traits: string[], autoEquipped: boolean): Promise<any | undefined>;
export declare function renderForgeCard(ctx: Context, player: DeadcellsPlayer, choices: EquipmentDefinition[], count?: number, cost?: number): Promise<any | undefined>;
export declare function renderBossRaidCard(ctx: Context, player: DeadcellsPlayer, boss: DailyBossRecord, result: BossRaidResult | undefined, rankings: Array<{
    userId: string;
    username: string;
    damage: number;
}>, completed?: boolean): Promise<any | undefined>;
export declare function renderBossTraitChoiceCard(ctx: Context, player: DeadcellsPlayer, boss: DailyBossRecord, choices: string[], rewardCells: number, timeoutSeconds?: number): Promise<any | undefined>;
