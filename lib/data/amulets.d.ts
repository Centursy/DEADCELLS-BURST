export type AmuletRarity = 'common' | 'rare';
export interface AmuletDefinition {
    id: string;
    name: string;
    image: string;
}
export interface AmuletTraitDefinition {
    id: string;
    name: string;
    rarity: AmuletRarity;
    description: string;
    attackBonus?: number;
    critBonus?: number;
    initiativeWeight?: number;
    offhandBlockBonus?: number;
    maxHpBonus?: number;
    critDamageBonus?: number;
    bossDamageMultiplier?: number;
    thornRatio?: number;
    effectId?: string;
}
export declare const amuletList: AmuletDefinition[];
export declare const amuletTraitList: AmuletTraitDefinition[];
export declare function getAmulet(id: string | null | undefined): AmuletDefinition | undefined;
export declare function getAmuletTrait(id: string): AmuletTraitDefinition | undefined;
export declare function parseAmuletTraits(value: string | null | undefined): string[];
export declare function activeTraitIds(player: Pick<import('../types').DeadcellsPlayer, 'amuletTraits' | 'weaponQuality' | 'weaponTrait'>): string[];
export declare function randomAmuletTrait(random: () => number, excluded?: string[]): string | undefined;
export declare function serializeAmuletTraits(traits: string[]): string;
export declare function rollAmulet(random: () => number): {
    id: string;
    traits: string[];
};
