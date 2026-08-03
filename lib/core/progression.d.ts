import type { DeadcellsPlayer, PlayerStats } from '../types';
export declare const MAX_BOSS_CELL_LEVEL = 5;
export declare const levelConfig: {
    cost: number;
    multiplier: number;
    hp: number;
    attack: number;
    crit: number;
}[];
export declare function createPlayer(userId: string, username: string): DeadcellsPlayer;
export declare function getLevelConfig(level: number): {
    cost: number;
    multiplier: number;
    hp: number;
    attack: number;
    crit: number;
};
export declare function getPlayerStats(player: DeadcellsPlayer, includePowerScroll?: boolean): PlayerStats;
export declare function formatWinRate(player: DeadcellsPlayer): string;
export declare function getAmuletCellMultiplier(player: DeadcellsPlayer): number;
