/**
 * ターン進行パネル
 * 週間方針選択とターン進行ボタン
 */

import { useState } from 'react';
import { Button } from '../../common';

export type WeeklyPolicy = 'NORMAL' | 'QUALITY' | 'RUSH';

interface TurnControlPanelProps {
    currentWeek: number;
    totalWeeks: number;
    isProcessing: boolean;
    onNextTurn: (policy: WeeklyPolicy) => void;
    onOpenLog?: () => void;
}

const POLICY_INFO: Record<WeeklyPolicy, { label: string; desc: string; icon: string; color: string }> = {
    NORMAL: {
        label: '通常',
        desc: 'バランスの取れた進行',
        icon: '⚖️',
        color: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-800)]',
    },
    QUALITY: {
        label: '品質重視',
        desc: '品質↑ / 進捗↓ / スタミナ消費小',
        icon: '✨',
        color: 'bg-purple-600 hover:bg-purple-700',
    },
    RUSH: {
        label: '突貫',
        desc: '進捗↑ / 品質↓ / スタミナ消費大',
        icon: '🔥',
        color: 'bg-orange-600 hover:bg-orange-700',
    },
};

export function TurnControlPanel({
    currentWeek,
    totalWeeks,
    isProcessing,
    onNextTurn,
    onOpenLog,
}: TurnControlPanelProps) {
    const [selectedPolicy, setSelectedPolicy] = useState<WeeklyPolicy>('NORMAL');
    const [showPolicySelect, setShowPolicySelect] = useState(false);

    const progress = (currentWeek / totalWeeks) * 100;
    const remainingWeeks = totalWeeks - currentWeek;

    const handleNextTurn = () => {
        onNextTurn(selectedPolicy);
        setShowPolicySelect(false);
    };

    return (
        <div className="bg-surface-glass border-t border-gray-700 p-4">
            <div className="flex items-center justify-between gap-4">
                {/* 週数表示 */}
                <div className="flex-shrink-0">
                    <div className="text-sm text-muted">プロジェクト進捗</div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">Week {currentWeek}</span>
                        <span className="text-gray-500">/ {totalWeeks}</span>
                    </div>
                </div>

                {/* 進捗バー */}
                <div className="flex-1 max-w-md">
                    <div className="h-3 bg-surface-light rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress >= 80 ? 'bg-[var(--color-danger)]' : progress >= 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>開始</span>
                        <span>残り {remainingWeeks} 週</span>
                        <span>納期</span>
                    </div>
                </div>

                {/* 方針選択 */}
                <div className="relative">
                    <button
                        onClick={() => setShowPolicySelect(!showPolicySelect)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${POLICY_INFO[selectedPolicy].color} text-white`}
                    >
                        <span>{POLICY_INFO[selectedPolicy].icon}</span>
                        <span>{POLICY_INFO[selectedPolicy].label}</span>
                        <span className="text-xs opacity-70">▼</span>
                    </button>

                    {showPolicySelect && (
                        <div className="absolute bottom-full right-0 mb-2 bg-surface border border-gray-700 rounded-lg shadow-xl p-2 w-64 z-10">
                            {(Object.keys(POLICY_INFO) as WeeklyPolicy[]).map(policy => (
                                <button
                                    key={policy}
                                    onClick={() => {
                                        setSelectedPolicy(policy);
                                        setShowPolicySelect(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 transition ${selectedPolicy === policy
                                        ? 'bg-gray-700'
                                        : 'hover:bg-gray-700/50'
                                        }`}
                                >
                                    <span className="text-xl">{POLICY_INFO[policy].icon}</span>
                                    <div>
                                        <div className="font-medium text-white">{POLICY_INFO[policy].label}</div>
                                        <div className="text-xs text-gray-400">{POLICY_INFO[policy].desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ターン進行ボタン */}
                <Button
                    onClick={handleNextTurn}
                    variant="primary"
                    size="lg"
                    disabled={isProcessing || currentWeek >= totalWeeks}
                    className="min-w-[140px]"
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            処理中...
                        </span>
                    ) : currentWeek >= totalWeeks ? (
                        '完了'
                    ) : (
                        <span className="flex items-center gap-2">
                            1週間進める
                            <span>→</span>
                        </span>
                    )}
                </Button>

                {/* ログボタン */}
                {onOpenLog && (
                    <Button onClick={onOpenLog} variant="ghost" size="sm">
                        📋
                    </Button>
                )}
            </div>
        </div>
    );
}
