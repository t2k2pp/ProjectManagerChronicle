/**
 * 休暇調整パズル - カレンダーグリッド
 */

import { useState, useMemo } from 'react';
import type { Character } from '../../../types';
import { Button, Card, CardHeader, Badge } from '../../common';

interface VacationSlot {
    characterId: string;
    week: number;
    day: number; // 0-4 (月-金)
    type: 'PLANNED' | 'REQUESTED' | 'APPROVED' | 'BLOCKED';
}

interface CalendarGridProps {
    characters: Character[];
    projectWeeks: number;
    currentWeek: number;
    vacationSlots: VacationSlot[];
    onSlotClick: (characterId: string, week: number, day: number) => void;
    onApprove: (slots: VacationSlot[]) => void;
    onCancel: () => void;
}

const DAYS = ['月', '火', '水', '木', '金'];

export function CalendarGrid({
    characters,
    projectWeeks,
    currentWeek,
    vacationSlots,
    onSlotClick,
    onApprove,
    onCancel,
}: CalendarGridProps) {
    const [selectedSlots, setSelectedSlots] = useState<VacationSlot[]>([]);

    // 週ごとのスロットマップ
    const slotMap = useMemo(() => {
        const map = new Map<string, VacationSlot>();
        for (const slot of vacationSlots) {
            const key = `${slot.characterId}-${slot.week}-${slot.day}`;
            map.set(key, slot);
        }
        return map;
    }, [vacationSlots]);

    // スロットの色を取得
    const getSlotColor = (slot: VacationSlot | undefined, isSelected: boolean): string => {
        if (isSelected) return 'bg-blue-500';
        if (!slot) return 'bg-gray-700 hover:bg-gray-600';
        switch (slot.type) {
            case 'APPROVED': return 'bg-green-600';
            case 'REQUESTED': return 'bg-yellow-600';
            case 'BLOCKED': return 'bg-red-600 cursor-not-allowed';
            case 'PLANNED': return 'bg-purple-600';
            default: return 'bg-gray-700';
        }
    };

    // スロットクリック
    const handleSlotClick = (characterId: string, week: number, day: number) => {
        const key = `${characterId}-${week}-${day}`;
        const existing = slotMap.get(key);

        if (existing?.type === 'BLOCKED') return;

        const isSelected = selectedSlots.some(
            s => s.characterId === characterId && s.week === week && s.day === day
        );

        if (isSelected) {
            setSelectedSlots(prev => prev.filter(
                s => !(s.characterId === characterId && s.week === week && s.day === day)
            ));
        } else {
            setSelectedSlots(prev => [...prev, {
                characterId,
                week,
                day,
                type: 'REQUESTED',
            }]);
        }

        onSlotClick(characterId, week, day);
    };

    // 承認
    const handleApprove = () => {
        onApprove(selectedSlots);
        setSelectedSlots([]);
    };

    // 表示する週の範囲
    const displayWeeks = Array.from(
        { length: Math.min(8, projectWeeks - currentWeek + 1) },
        (_, i) => currentWeek + i
    );

    return (
        <Card variant="glass" padding="md">
            <CardHeader
                title="休暇調整カレンダー"
                action={
                    <div className="flex gap-2">
                        <Badge variant="success">承認済: {vacationSlots.filter(s => s.type === 'APPROVED').length}</Badge>
                        <Badge variant="warning">申請中: {selectedSlots.length}</Badge>
                    </div>
                }
            />

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="p-2 text-left text-gray-400 sticky left-0 bg-gray-900 z-10">担当者</th>
                            {displayWeeks.map(week => (
                                <th key={week} colSpan={5} className="p-2 text-center text-gray-400 border-l border-gray-700">
                                    {week}週目
                                </th>
                            ))}
                        </tr>
                        <tr>
                            <th className="p-2 sticky left-0 bg-gray-900 z-10"></th>
                            {displayWeeks.map(week => (
                                DAYS.map(day => (
                                    <th key={`${week}-${day}`} className="p-1 text-center text-gray-500 text-xs">
                                        {day}
                                    </th>
                                ))
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {characters.map(char => (
                            <tr key={char.id} className="border-t border-gray-800">
                                <td className="p-2 sticky left-0 bg-gray-900 z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{char.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {Math.round(char.stamina.current / char.stamina.max * 100)}%
                                        </span>
                                    </div>
                                </td>
                                {displayWeeks.map(week => (
                                    DAYS.map((_, dayIdx) => {
                                        const key = `${char.id}-${week}-${dayIdx}`;
                                        const slot = slotMap.get(key);
                                        const isSelected = selectedSlots.some(
                                            s => s.characterId === char.id && s.week === week && s.day === dayIdx
                                        );
                                        return (
                                            <td key={key} className="p-0.5">
                                                <button
                                                    onClick={() => handleSlotClick(char.id, week, dayIdx)}
                                                    className={`w-6 h-6 rounded ${getSlotColor(slot, isSelected)} transition-colors`}
                                                    title={slot ? slot.type : 'クリックで休暇申請'}
                                                />
                                            </td>
                                        );
                                    })
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 凡例 */}
            <div className="flex gap-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>承認済</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span>申請中</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-600 rounded"></div>
                    <span>取得不可</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>選択中</span>
                </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={onCancel}>キャンセル</Button>
                <Button
                    variant="primary"
                    onClick={handleApprove}
                    disabled={selectedSlots.length === 0}
                >
                    {selectedSlots.length}件を承認
                </Button>
            </div>
        </Card>
    );
}
