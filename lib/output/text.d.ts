import type { ExplorationResult } from '../core/exploration';
import type { BattleEvent, DeadcellsPlayer } from '../types';
export declare function playerStatus(player: DeadcellsPlayer): string;
export declare function equipmentDescription(player: DeadcellsPlayer): string;
export declare function explorationText(result: ExplorationResult): string;
export declare function eventText(events: BattleEvent[]): string;
