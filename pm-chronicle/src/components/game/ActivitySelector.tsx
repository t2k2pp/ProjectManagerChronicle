/**
 * 日常活動選択コンポーネント
 * 研修、飲み会、チームビルディングなどを選択・実行
 */

import { useState } from 'react';
import { Button, Card, Badge } from '../common';
import { ACTIVITIES, executeActivity, type ActivityDefinition, type ActivityResult } from '../../lib/activities';
import type { Character } from '../../types';

interface ActivitySelectorProps {
    player: Character;
    teammates: Character[];
    onActivityComplete: (result: ActivityResult) => void;
}

export function ActivitySelector({
    player,
    teammates,
    onActivityComplete,
}: ActivitySelectorProps) {
    const [selectedActivity, setSelectedActivity] = useState<ActivityDefinition | null>(null);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [result, setResult] = useState<ActivityResult | null>(null);

    const handleExecute = () => {
        if (!selectedActivity) return;

        const participants = teammates.filter(t => selectedParticipants.includes(t.id));
        const activityResult = executeActivity(player, selectedActivity, participants);

        setResult(activityResult);

        if (activityResult.success) {
            onActivityComplete(activityResult);
        }
    };

    const toggleParticipant = (id: string) => {
        setSelectedParticipants(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const canExecute = selectedActivity &&
        player.stamina.current >= selectedActivity.staminaCost &&
        player.money >= selectedActivity.cost;

    return (
        <Card variant="glass" padding="md">
            <h2 className="text-lg font-bold text-white mb-4">🎉 日常活動</h2>

            {/* 活動リスト */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {ACTIVITIES.map(activity => {
                    const isSelected = selectedActivity?.id === activity.id;
                    const canAfford = player.money >= activity.cost;
                    const hasStamina = player.stamina.current >= activity.staminaCost;
                    const isAvailable = canAfford && hasStamina;

                    return (
                        <button
                            key={activity.id}
                            onClick={() => setSelectedActivity(activity)}
                            disabled={!isAvailable}
                            className={`text-left p-3 rounded-lg border transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : isAvailable
                                        ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                                        : 'border-gray-800 bg-gray-900 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-white text-sm">{activity.label}</span>
                                <div className="flex gap-1">
                                    {activity.cost > 0 && (
                                        <Badge variant="warning" className="text-xs">
                                            {activity.cost}万
                                        </Badge>
                                    )}
                                    {activity.cost === 0 && (
                                        <Badge variant="success" className="text-xs">
                                            無料
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{activity.description}</p>
                            <div className="flex gap-2 text-xs text-gray-500">
                                <span>⏱ {activity.duration}h</span>
                                <span>💪 {activity.staminaCost > 0 ? `-${activity.staminaCost}` : `+${-activity.staminaCost}`}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 参加者選択 */}
            {selectedActivity && selectedActivity.effects.relationshipBonus && (
                <div className="mb-4">
                    <h3 className="text-sm text-gray-400 mb-2">参加者を選択</h3>
                    <div className="flex flex-wrap gap-2">
                        {teammates.slice(0, 8).map(teammate => (
                            <button
                                key={teammate.id}
                                onClick={() => toggleParticipant(teammate.id)}
                                className={`px-3 py-1 text-sm rounded-full transition-all ${selectedParticipants.includes(teammate.id)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {teammate.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 結果表示 */}
            {result && (
                <div className={`mb-4 p-3 rounded-lg ${result.success
                        ? 'bg-green-500/20 border border-green-500'
                        : 'bg-red-500/20 border border-red-500'
                    }`}>
                    <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.message}
                    </p>
                    {result.skillGains.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                            スキル: {result.skillGains.map(s => `${s.skill}+${s.amount}`).join(', ')}
                        </p>
                    )}
                </div>
            )}

            {/* 実行ボタン */}
            <Button
                variant="primary"
                onClick={handleExecute}
                disabled={!canExecute}
                className="w-full"
            >
                {selectedActivity
                    ? `${selectedActivity.label}に参加する`
                    : '活動を選択してください'
                }
            </Button>
        </Card>
    );
}
