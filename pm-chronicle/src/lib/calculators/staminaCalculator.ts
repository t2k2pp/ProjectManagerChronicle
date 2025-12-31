/**
 * スタミナ計算ロジック
 */

import type { Character } from '../../types';

/** スタミナ計算パラメータ */
interface StaminaParams {
    character: Character;
    /** 今週の労働日数（通常5） */
    workDays?: number;
    /** 残業有無 */
    overtime?: boolean;
    /** 休暇取得 */
    vacation?: boolean;
    /** プレッシャーレベル (0-100) */
    pressure?: number;
}

/** スタミナ消費結果 */
interface StaminaResult {
    staminaAfter: number;
    fatigue: number;
    burnoutRisk: boolean;
    recoveryDays: number;
}

/**
 * 週間スタミナ消費を計算
 */
export function calculateWeeklyStamina(params: StaminaParams): StaminaResult {
    const {
        character,
        workDays = 5,
        overtime = false,
        vacation = false,
        pressure = 50,
    } = params;

    // 休暇時は回復
    if (vacation) {
        const recovery = character.stamina.recoveryRate * 2;
        const staminaAfter = Math.min(character.stamina.max, character.stamina.current + recovery);
        return {
            staminaAfter,
            fatigue: 0,
            burnoutRisk: false,
            recoveryDays: 0,
        };
    }

    // 基本消費（1日あたり3-5）
    const baseDrain = 4 * workDays;

    // 残業消費（1日あたり追加2-3）
    const overtimeDrain = overtime ? 2.5 * workDays : 0;

    // プレッシャーによる追加消費
    const pressureDrain = (pressure / 100) * 5;

    // 総消費
    const totalDrain = baseDrain + overtimeDrain + pressureDrain;

    // 週末回復
    const weekendRecovery = character.stamina.recoveryRate;

    // 疲労度
    const fatigue = Math.max(0, totalDrain - weekendRecovery);

    // スタミナ計算
    const staminaAfter = Math.max(0, character.stamina.current - fatigue);

    // バーンアウトリスク判定
    const burnoutRisk = staminaAfter < 20;

    // 完全回復に必要な日数
    const deficit = character.stamina.max - staminaAfter;
    const recoveryDays = Math.ceil(deficit / (character.stamina.recoveryRate / 2));

    return { staminaAfter, fatigue, burnoutRisk, recoveryDays };
}

/**
 * スタミナに基づく作業効率を計算
 */
export function calculateStaminaEfficiency(stamina: number, maxStamina: number): number {
    const ratio = stamina / maxStamina;

    if (ratio >= 0.7) return 1.0;      // 高スタミナ: 100%効率
    if (ratio >= 0.4) return 0.8;      // 中スタミナ: 80%効率
    if (ratio >= 0.2) return 0.5;      // 低スタミナ: 50%効率
    return 0.2;                         // 限界: 20%効率
}

/**
 * キャラクターのスタミナ状態を評価
 */
export function evaluateStaminaStatus(character: Character): {
    status: 'EXCELLENT' | 'GOOD' | 'TIRED' | 'EXHAUSTED' | 'BURNOUT';
    emoji: string;
    message: string;
} {
    const ratio = character.stamina.current / character.stamina.max;

    if (ratio >= 0.8) return { status: 'EXCELLENT', emoji: '😊', message: '絶好調' };
    if (ratio >= 0.6) return { status: 'GOOD', emoji: '🙂', message: '良好' };
    if (ratio >= 0.4) return { status: 'TIRED', emoji: '😐', message: '疲れ気味' };
    if (ratio >= 0.2) return { status: 'EXHAUSTED', emoji: '😫', message: '疲労困憊' };
    return { status: 'BURNOUT', emoji: '🤒', message: 'バーンアウト寸前' };
}
