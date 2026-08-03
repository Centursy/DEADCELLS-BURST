import type { Context } from 'koishi';
import type { MysteryShopItem, MysteryShopRecord, Random } from '../types';
export declare function shopRefreshKey(now?: number, intervalSeconds?: number): string;
export declare function parseShopItems(value: string | undefined): MysteryShopItem[];
export declare function parsePurchasedSlots(value: string | undefined): number[];
export declare function serializeShopItems(items: MysteryShopItem[]): string;
export declare function serializePurchasedSlots(slots: number[]): string;
export declare function generateMysteryShopItems(random?: Random): MysteryShopItem[];
export declare function getOrCreateMysteryShop(ctx: Context, refreshSeconds: number, random?: Random): Promise<MysteryShopRecord>;
