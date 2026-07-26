import { type Context } from 'koishi';
import type { Config } from '../config';
import type { DeadcellsPlayer } from '../types';
export declare function beijingDate(timestamp?: number): string;
export declare function dispatchStatus(player: DeadcellsPlayer, now?: number): string | undefined;
export declare function startExploration(ctx: Context, config: Config, player: DeadcellsPlayer, strategy: 'cells' | 'depth', channelId?: string, guildId?: string): Promise<DeadcellsPlayer>;
export declare function processDueExplorations(ctx: Context, config: Config, now?: number): Promise<void>;
export declare function registerExplorationDispatcher(ctx: Context, config: Config): void;
export declare function dailyExploreAvailable(player: DeadcellsPlayer, config: Config, now?: number): boolean;
