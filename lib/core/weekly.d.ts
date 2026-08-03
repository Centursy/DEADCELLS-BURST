import type { Context } from 'koishi';
import type { WeeklyScore } from '../types';
export declare function weeklyKey(timestamp?: number): string;
export declare function addWeeklyPoints(ctx: Context, channelId: string | undefined, userId: string, username: string, points: number): Promise<void>;
export declare function getWeeklyScores(ctx: Context, channelId: string | undefined): Promise<WeeklyScore[]>;
