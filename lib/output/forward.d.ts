import { type Session } from 'koishi';
import type { BattleResult } from '../types';
export declare function sendBattleForward(session: Session, result: BattleResult): Promise<boolean>;
