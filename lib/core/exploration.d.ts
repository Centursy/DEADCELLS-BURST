import type { DeadcellsPlayer, Random } from '../types';
export type ExplorationStrategy = 'cells' | 'depth';
export interface ExplorationDispatchState {
    strategy: ExplorationStrategy;
    reached: string[];
    rewards: number[];
    bosses: ExplorationBossResult[];
    currentMap: string;
    nextAt: number;
    startedAt: number;
    channelId?: string;
    guildId?: string;
}
export interface ExplorationBossResult {
    mapName: string;
    bossName: string;
    won: boolean;
    reward: number;
}
export interface ExplorationResult {
    reached: string[];
    rewards: number[];
    baseCells: number;
    bossReward: number;
    multiplier: number;
    cellsGained: number;
    bossAttempted: boolean;
    bossWon: boolean;
    bossName?: string;
    finalBossName?: string;
    finalBossMap?: string;
    completed: boolean;
    bosses: ExplorationBossResult[];
    comment: string;
}
export declare function parseExplorationState(value: string | null | undefined): ExplorationDispatchState | undefined;
export declare function serializeExplorationState(state: ExplorationDispatchState): string;
export declare function createExplorationState(strategy: ExplorationStrategy, now: number, durationSeconds: number, channelId?: string, guildId?: string): ExplorationDispatchState;
export declare function advanceExplorationState(player: DeadcellsPlayer, state: ExplorationDispatchState, random: Random, now: number, durationSeconds: number): {
    state: ExplorationDispatchState;
    finished: boolean;
    result?: ExplorationResult;
};
export declare function dispatchExplorationResult(player: DeadcellsPlayer, state: ExplorationDispatchState, comment: string, finalBossMap?: string, finalBossName?: string): ExplorationResult;
export declare function explore(player: DeadcellsPlayer, random: Random): ExplorationResult;
