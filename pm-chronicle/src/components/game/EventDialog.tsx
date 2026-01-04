/**
 * プロジェクトイベントダイアログ
 * 仕様変更などのイベント発生時に表示
 */

import { Card } from '../common';
import type { ProjectEvent } from '../../lib/projectEvents';
import { EVENT_TYPE_LABELS, SEVERITY_LABELS } from '../../lib/projectEvents';

interface EventDialogProps {
    event: ProjectEvent;
    onAccept: () => void;
    onReject: () => void;
    onNegotiate?: () => void;
}

export function EventDialog({
    event,
    onAccept,
    onReject,
    onNegotiate,
}: EventDialogProps) {
    const severityInfo = SEVERITY_LABELS[event.severity];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card variant="glass" padding="lg" className="max-w-lg w-full animate-fade-in">
                {/* ヘッダー */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${severityInfo.color} bg-gray-800`}>
                        {severityInfo.label}
                    </div>
                    <span className="text-sm text-gray-400">
                        {EVENT_TYPE_LABELS[event.type]}
                    </span>
                </div>

                {/* タイトル */}
                <h2 className="text-xl font-bold text-white mb-2">
                    ⚠️ {event.title}
                </h2>

                {/* 説明 */}
                <p className="text-gray-300 mb-6">
                    {event.description}
                </p>

                {/* オプション */}
                <div className="space-y-3">
                    {/* 受け入れ */}
                    <button
                        onClick={onAccept}
                        className="w-full p-3 bg-green-600/20 border border-green-500 rounded-lg text-left hover:bg-green-600/30 transition-colors"
                    >
                        <div className="font-medium text-green-400">
                            ✓ {event.options.accept.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {formatEffect(event.options.accept.effect)}
                        </div>
                    </button>

                    {/* 交渉（カードバトル） */}
                    {event.options.negotiate && onNegotiate && (
                        <button
                            onClick={onNegotiate}
                            className="w-full p-3 bg-blue-600/20 border border-blue-500 rounded-lg text-left hover:bg-blue-600/30 transition-colors"
                        >
                            <div className="font-medium text-blue-400">
                                🃏 {event.options.negotiate.label}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                カードバトルで有利な条件を勝ち取る
                            </div>
                        </button>
                    )}

                    {/* 拒否 */}
                    <button
                        onClick={onReject}
                        className="w-full p-3 bg-red-600/20 border border-red-500 rounded-lg text-left hover:bg-red-600/30 transition-colors"
                    >
                        <div className="font-medium text-red-400">
                            ✕ {event.options.reject.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {formatEffect(event.options.reject.effect)}
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
}

/** 効果をフォーマット */
function formatEffect(effect: {
    budgetChange?: number;
    scheduleChange?: number;
    qualityChange?: number;
    reputationChange?: number;
}): string {
    const parts: string[] = [];

    if (effect.budgetChange) {
        const sign = effect.budgetChange > 0 ? '+' : '';
        parts.push(`予算: ${sign}${effect.budgetChange}万円`);
    }
    if (effect.scheduleChange) {
        const sign = effect.scheduleChange > 0 ? '+' : '';
        parts.push(`期間: ${sign}${effect.scheduleChange}週`);
    }
    if (effect.qualityChange) {
        const sign = effect.qualityChange > 0 ? '+' : '';
        parts.push(`品質: ${sign}${effect.qualityChange}%`);
    }
    if (effect.reputationChange) {
        const sign = effect.reputationChange > 0 ? '+' : '';
        parts.push(`評判: ${sign}${effect.reputationChange}`);
    }

    return parts.length > 0 ? parts.join(', ') : '効果なし';
}
