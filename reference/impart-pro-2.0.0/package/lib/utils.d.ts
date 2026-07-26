import { Context, Session } from 'koishi';
import { Config } from './config';
export declare function updateUserCurrency(ctx: Context, uid: string, amount: number, currency: string): Promise<void>;
export declare function getUserCurrency(ctx: Context, uid: string, currency: string): Promise<number>;
export declare function updateChannelId(ctx: Context, userId: string, newChannelId: string): Promise<string[]>;
export declare function isUserAllowed(ctx: Context, userId: string, channelId: string): Promise<boolean>;
export declare function checkPermission(session: Session, scope: string, allowedList: string[]): boolean;
export declare function loggerinfo(ctx: Context, config: Config, message: string): void;
export declare function getFontStyles(ctx: Context, config: Config): Promise<{
    fontFaceStyle: string;
    customFontFamily: string;
}>;
