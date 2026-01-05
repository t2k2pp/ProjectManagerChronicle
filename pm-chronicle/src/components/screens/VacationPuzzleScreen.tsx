/**
 * 休暇調整パズル画面
 * GW・お盆・年末年始などの休暇スケジュール調整ミニゲーム
 */

import { useState } from 'react';
import { CalendarGrid } from '../game/VacationPuzzle';
import type { Character } from '../../types';

interface VacationSlot {
    characterId: string;
    week: number;
    day: number;
    type: 'PLANNED' | 'REQUESTED' | 'APPROVED' | 'BLOCKED';
}

interface VacationPuzzleScreenProps {
    /** チームメンバー */
    characters: Character[];
    /** プロジェクト週数 */
    projectWeeks: number;
    /** 現在週 */
    currentWeek: number;
    /** パズル完了時のコールバック */
    onComplete: (slots: VacationSlot[]) => void;
    /** キャンセル時のコールバック */
    onCancel: () => void;
}

export function VacationPuzzleScreen({
    characters,
    projectWeeks,
    currentWeek,
    onComplete,
    onCancel,
}: VacationPuzzleScreenProps) {
    // 休暇スロット
    const [vacationSlots, setVacationSlots] = useState<VacationSlot[]>([]);

    // スロットクリック
    const handleSlotClick = (characterId: string, week: number, day: number) => {
        setVacationSlots(prev => {
            const existing = prev.find(
                s => s.characterId === characterId && s.week === week && s.day === day
            );
            if (existing) {
                // 削除
                return prev.filter(s => s !== existing);
            } else {
                // 追加
                return [...prev, { characterId, week, day, type: 'REQUESTED' as const }];
            }
        });
    };

    // 承認
    const handleApprove = (slots: VacationSlot[]) => {
        onComplete(slots);
    };

    return (
        <CalendarGrid
            characters={characters}
            projectWeeks={projectWeeks}
            currentWeek={currentWeek}
            vacationSlots={vacationSlots}
            onSlotClick={handleSlotClick}
            onApprove={handleApprove}
            onCancel={onCancel}
        />
    );
}
