export type EquipmentType = 'weapon' | 'offhand' | 'item';
export interface EquipmentDefinition {
    id: string;
    name: string;
    type: EquipmentType;
    description: string;
    attackBonus?: number;
    critBonus?: number;
    blockRate?: number;
    balancedStack?: number;
    skill?: string;
    alwaysCrit?: boolean;
    guaranteedCritAttacks?: number[];
    cursed?: boolean;
    stunRate?: number;
    frozenTargetCrit?: boolean;
    ignoreShield?: boolean;
    lowHpCrit?: boolean;
    shieldEffect?: 'stun' | 'reflect' | 'invincible' | 'steal' | 'freeze';
    effectId?: string;
}
export declare const equipmentList: EquipmentDefinition[];
export declare const equipmentById: Map<string, EquipmentDefinition>;
export declare function getEquipment(id: string | null | undefined): EquipmentDefinition | undefined;
export declare function randomEquipment(random: () => number, type?: EquipmentType): EquipmentDefinition;
export declare function randomEquipmentChoices(random: () => number, count?: number): EquipmentDefinition[];
export declare function equipmentTypeText(type: EquipmentType): string;
