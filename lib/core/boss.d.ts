import type { Config } from '../config';
import type { BossChoiceState, DailyBossRecord, DeadcellsPlayer, Random } from '../types';
import { type MapDefinition } from '../data/maps';
export interface BossRaidResult {
    damage: number;
    turns: number;
    playerHp: number;
    killed: boolean;
    events: string[];
}
export declare function parseBossChoiceState(value: string | null | undefined): BossChoiceState | undefined;
export declare function serializeBossChoiceState(state: BossChoiceState): string;
export declare function raidBossMaps(): MapDefinition[];
export declare function getOrCreateDailyBoss(ctx: any, random?: Random): Promise<DailyBossRecord>;
export declare function calculateBossReward(player: DeadcellsPlayer, damage: number, rewardMultiplier: number): number;
export declare function parseBossRankings(value: string | null | undefined): Array<{
    userId: string;
    username: string;
    damage: number;
}>;
export declare function serializeBossRankings(rankings: Array<{
    userId: string;
    username: string;
    damage: number;
}>): string;
export declare function randomTraitChoices(random: Random, count?: number): string[];
export declare function simulateBossRaid(player: DeadcellsPlayer, boss: DailyBossRecord, config: Config, random?: Random): BossRaidResult;
