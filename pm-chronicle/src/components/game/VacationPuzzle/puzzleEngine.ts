/**
 * 休暇パズルエンジン
 * 休暇スケジュールの妥当性検証と最適化
 */

import type { Character, Task } from '../../../types';

interface VacationSlot {
    characterId: string;
    week: number;
    day: number;
    type: 'PLANNED' | 'REQUESTED' | 'APPROVED' | 'BLOCKED';
}

interface PuzzleValidationResult {
    isValid: boolean;
    conflicts: VacationConflict[];
    warnings: string[];
    score: number;
}

interface VacationConflict {
    type: 'CRITICAL_PATH' | 'UNDERSTAFFED' | 'CONSECUTIVE' | 'DEADLINE';
    message: string;
    severity: 'error' | 'warning';
    affectedSlots: VacationSlot[];
}

/**
 * 休暇スケジュールを検証
 */
export function validateVacationSchedule(
    slots: VacationSlot[],
    characters: Character[],
    _tasks: Task[],
    criticalWeeks: number[] = []
): PuzzleValidationResult {
    const conflicts: VacationConflict[] = [];
    const warnings: string[] = [];

    // 1. クリティカルパス週のチェック
    const criticalConflicts = slots.filter(s =>
        s.type !== 'BLOCKED' && criticalWeeks.includes(s.week)
    );
    if (criticalConflicts.length > 0) {
        conflicts.push({
            type: 'CRITICAL_PATH',
            message: `クリティカルパス期間中の休暇: ${criticalConflicts.length}件`,
            severity: 'error',
            affectedSlots: criticalConflicts,
        });
    }

    // 2. 同日複数休暇（人手不足）チェック
    const weekDayMap = new Map<string, VacationSlot[]>();
    for (const slot of slots.filter(s => s.type !== 'BLOCKED')) {
        const key = `${slot.week}-${slot.day}`;
        const existing = weekDayMap.get(key) || [];
        existing.push(slot);
        weekDayMap.set(key, existing);
    }

    for (const [key, daySlots] of weekDayMap) {
        const ratio = daySlots.length / characters.length;
        if (ratio > 0.3) {
            conflicts.push({
                type: 'UNDERSTAFFED',
                message: `${key}: 稼働率70%未満（${daySlots.length}/${characters.length}人休暇）`,
                severity: ratio > 0.5 ? 'error' : 'warning',
                affectedSlots: daySlots,
            });
        }
    }

    // 3. 連続休暇チェック（3日以上）
    const characterSlots = new Map<string, VacationSlot[]>();
    for (const slot of slots.filter(s => s.type !== 'BLOCKED')) {
        const existing = characterSlots.get(slot.characterId) || [];
        existing.push(slot);
        characterSlots.set(slot.characterId, existing);
    }

    for (const [charId, charSlots] of characterSlots) {
        const sorted = charSlots.sort((a, b) =>
            a.week * 5 + a.day - (b.week * 5 + b.day)
        );

        let consecutive = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prevTotal = sorted[i - 1].week * 5 + sorted[i - 1].day;
            const currTotal = sorted[i].week * 5 + sorted[i].day;

            if (currTotal - prevTotal === 1) {
                consecutive++;
                if (consecutive >= 3) {
                    const char = characters.find(c => c.id === charId);
                    warnings.push(`${char?.name || charId}: ${consecutive}日連続休暇`);
                }
            } else {
                consecutive = 1;
            }
        }
    }

    // スコア計算
    const errorCount = conflicts.filter(c => c.severity === 'error').length;
    const warningCount = conflicts.filter(c => c.severity === 'warning').length + warnings.length;
    const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10);

    return {
        isValid: errorCount === 0,
        conflicts,
        warnings,
        score,
    };
}

/**
 * ブロック日を生成（デッドライン前、クリティカルパス）
 */
export function generateBlockedDays(
    _tasks: Task[],
    projectEndWeek: number
): { week: number; day: number }[] {
    const blocked: { week: number; day: number }[] = [];

    // デッドライン週の全日をブロック
    blocked.push(...[0, 1, 2, 3, 4].map(day => ({
        week: projectEndWeek,
        day,
    })));

    // クリティカルパスタスクの期間をブロック（将来拡張用）
    // ここでは簡略化

    return blocked;
}

/**
 * 推奨休暇日を提案
 */
export function suggestVacationDays(
    character: Character,
    _tasks: Task[],
    _existingSlots: VacationSlot[],
    weeks: number[]
): { week: number; day: number; reason: string }[] {
    const suggestions: { week: number; day: number; reason: string }[] = [];

    // スタミナ低下時は早めの休暇を推奨
    if (character.stamina.current / character.stamina.max < 0.5) {
        const nextAvailableWeek = weeks[0];
        suggestions.push({
            week: nextAvailableWeek,
            day: 4, // 金曜日
            reason: 'スタミナ回復のため週末前の休暇を推奨',
        });
    }

    return suggestions;
}
