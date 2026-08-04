import type { Context } from 'koishi';
export interface DeadcellsPlayer {
    userId: string;
    username: string;
    cells: number;
    bossCellLevel: number;
    weaponId: string;
    weaponQuality: WeaponQuality;
    weaponTrait: string | null;
    shieldId: string | null;
    item1Id: string | null;
    item2Id: string | null;
    amuletId: string;
    amuletTraits: string;
    battleCount: number;
    winCount: number;
    lastExploreAt: number;
    lastBattleAt: number;
    exploreState: string | null;
    dailyExploreDate: string;
    dailyExploreCount: number;
    lastBossRaidAt: number;
    bossChoiceState: string | null;
    shopMaxHpBonus: number;
    shopCritBonus: number;
    powerScrollReady: boolean;
}
export interface DailyBossRecord {
    date: string;
    mapName: string;
    bossName: string;
    difficulty: 'normal' | 'veteran' | 'veteran-king';
    maxHp: number;
    currentHp: number;
    attackMultiplier: number;
    rewardMultiplier: number;
    mutation: BossMutation;
    completed: boolean;
    killerId: string | null;
    killerName: string | null;
    rankings: string;
}
export type BossMutation = 'berserk' | 'frozen' | 'bleeding' | 'greed' | 'mediocre';
export interface BossRankingEntry {
    userId: string;
    username: string;
    damage: number;
    channelId?: string;
}
export interface BossChoiceState {
    date: string;
    choices: string[];
    rewardCells: number;
    expiresAt: number;
}
export interface PlayerStats {
    maxHp: number;
    attack: number;
    critChance: number;
    weaponName: string;
    shieldName: string;
    amuletName: string;
}
export type WeaponQuality = 'normal' | 'gold' | 'colorless';
export interface Combatant {
    userId: string;
    username: string;
    cells: number;
    stats: PlayerStats;
    baseAttack: number;
    hp: number;
    attackCount: number;
    balancedBonus: number;
    item1Id: string | null;
    item2Id: string | null;
    item1Used: boolean;
    item2Used: boolean;
    amuletTraits: string[];
    initiativeWeight: number;
    actionCount: number;
    bleeding: number;
    bleedAttack: number;
    chargeReady: boolean;
    charging: boolean;
    firstDamageReduced: boolean;
    firstDamageBoosted: boolean;
    damageTakenMultiplier: number;
    damageDealtMultiplier: number;
    extraCritDamageMultiplier: number;
    preempted: boolean;
    hunterReady: boolean;
    turretEffect: string | null;
    turretTurns: number;
    decoyHp: number;
    decoyActive: boolean;
    frontlineTurns: number;
    frontlineBoostActive: boolean;
    heavyChargeUsed: boolean;
    warSpearCharged: boolean;
    deathProtectionUsed: boolean;
    nightSongActive: boolean;
    nightSongUsed: boolean;
    owlActive: boolean;
    owlCritBelowHalf: boolean;
    riftAuraTurns: number;
    markedDamageMultiplier: number;
    nextAttackMultiplier: number;
    stunned: boolean;
    frozen: boolean;
    invincible: boolean;
    retaliationReady: boolean;
    lastAttackBlocked: boolean;
    offhandCooldown: number;
    passiveDamageChecked: boolean;
    coldForgingUsed: boolean;
    barrierHp: number;
    consecutiveActions: number;
    prismMirrorChecked: boolean;
    starFuryChecked: boolean;
    frenziedFlameChecked: boolean;
    assassinationChecked: boolean;
    penNibReady: boolean;
    meteorFlash: boolean;
    thornRatio: number;
}
export interface BattleEvent {
    text: string;
    actorId?: string;
    actorName?: string;
}
export interface BattleResult {
    attacker: Combatant;
    defender: Combatant;
    winnerId: string;
    loserId: string;
    events: BattleEvent[];
    turns: number;
    cellTransfer: number;
    bonusCells: number;
    droppedEquipmentId?: string;
    droppedEquipment?: {
        type: 'weapon' | 'offhand' | 'item' | 'amulet';
        id: string;
        traits?: string[];
        weaponQuality?: WeaponQuality;
        weaponTrait?: string | null;
    };
}
export interface WeeklyScore {
    week: string;
    channelId: string;
    userId: string;
    username: string;
    points: number;
}
export type MysteryShopItemKind = 'super-carrot' | 'original-chicken' | 'power-scroll' | 'amulet' | 'weapon';
export interface MysteryShopItem {
    slot: number;
    kind: MysteryShopItemKind;
    name: string;
    description: string;
    equipmentId?: string;
    traits?: string[];
    weaponQuality?: WeaponQuality;
    weaponTrait?: string | null;
}
export interface MysteryShopRecord {
    id: number;
    refreshKey: string;
    items: string;
    purchased: string;
}
export interface DeathmatchParticipant {
    userId: string;
    username: string;
    stake: number;
    allIn: boolean;
}
export interface DeathmatchSessionState {
    channelId: string;
    guildId?: string;
    creatorId: string;
    allIn: boolean;
    status: 'waiting' | 'started';
    participants: DeathmatchParticipant[];
    chargedStakes: Record<string, number>;
    createdAt: number;
}
export interface DeathmatchResult {
    bossMapName: string;
    bossName: string;
    bossHp: number;
    bossKilled: boolean;
    bossReward: number;
    turns: number;
    winnerId?: string;
    winnerName?: string;
    events: BattleEvent[];
    participants: Array<{
        userId: string;
        username: string;
        hp: number;
        maxHp: number;
        eliminated: boolean;
    }>;
}
export interface GameConfig {
    exploreCooldownSeconds: number;
    battleCooldownSeconds: number;
    upgradeConfirmTimeout: number;
    equipmentConfirmTimeout: number;
    equipmentDropRate: number;
    cellTransferRate: number;
    nutcrackerStunRate: number;
    skillRate: number;
    maxBattleTurns: number;
    forwardBattleLog: boolean;
    enableImages: boolean;
    alchemyCost: number;
    forgeCost: number;
    itemUseRate: number;
    exploreDurationSeconds: number;
    dailyExploreLimit: number;
    bossRaidCooldownSeconds: number;
    alchemyMaxCount: number;
    forgeMaxCount: number;
    deathmatchMinCells: number;
    deathmatchWaitSeconds: number;
    shopRefreshSeconds: number;
    shopPrice: number;
}
export type Random = () => number;
export interface KoishiContext extends Context {
    puppeteer?: {
        page(): Promise<any>;
    };
}
declare module 'koishi' {
    interface Tables {
        deadcells_players: DeadcellsPlayer;
        deadcells_daily_bosses: DailyBossRecord;
        deadcells_weekly_scores: WeeklyScore;
        deadcells_mystery_shop: MysteryShopRecord;
    }
    interface Context {
        puppeteer?: {
            page(): Promise<any>;
        };
    }
}
