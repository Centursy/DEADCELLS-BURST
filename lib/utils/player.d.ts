import { type Context, type Session } from 'koishi';
import type { DeadcellsPlayer } from '../types';
export declare function normalizePlayer(player: DeadcellsPlayer): DeadcellsPlayer;
export declare function getPlayer(ctx: Context, userId: string): Promise<DeadcellsPlayer | undefined>;
export declare function getOrCreatePlayer(ctx: Context, userId: string, username: string): Promise<{
    player: DeadcellsPlayer;
    created: boolean;
}>;
export declare function resolveUsername(session: Session, userId: string, fallback?: string): Promise<string>;
export declare function parseAtTarget(session: Session, input: string): Promise<{
    userId: string;
    username: string;
} | undefined>;
export declare function cooldownRemaining(lastAt: number, cooldownSeconds: number, now?: number): number;
export declare function confirm(session: Session, timeoutMs: number): Promise<boolean>;
export declare function confirmFromUser(ctx: Context, channelId: string | undefined, userId: string, timeoutMs: number): Promise<boolean>;
