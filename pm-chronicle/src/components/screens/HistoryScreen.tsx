import { useState } from 'react';
import { Card, Button, Badge } from '../common';
import type { HistoricalEvent } from '../../types';

interface HistoryScreenProps {
    pastEvents: HistoricalEvent[];
    currentYear: number;
    onBack: () => void;
}

export function HistoryScreen({ pastEvents, currentYear, onBack }: HistoryScreenProps) {
    const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');

    // 年のリスト作成（新しい順）
    const years = Array.from(new Set(pastEvents.map(e => e.year))).sort((a, b) => b - a);

    // イベントのフィルタリング
    const filteredEvents = selectedYear === 'ALL'
        ? [...pastEvents].sort((a, b) => b.year - a.year)
        : pastEvents.filter(e => e.year === selectedYear);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">📜 IT業界史</h1>
                    <p className="text-gray-400 mt-1">
                        1990年〜{currentYear}年までの軌跡
                    </p>
                </div>
                <Button variant="ghost" onClick={onBack}>
                    ← 戻る
                </Button>
            </div>

            {/* コンテンツエリア */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 年表サイドバー */}
                <div className="md:col-span-3">
                    <Card variant="glass" padding="md" className="sticky top-6">
                        <h3 className="text-gray-400 font-bold mb-4">年代別フィルター</h3>
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                            <Button
                                variant={selectedYear === 'ALL' ? 'primary' : 'ghost'}
                                onClick={() => setSelectedYear('ALL')}
                                className="w-full text-left justify-start"
                            >
                                全て表示 ({pastEvents.length})
                            </Button>
                            {years.map(year => (
                                <Button
                                    key={year}
                                    variant={selectedYear === year ? 'primary' : 'ghost'}
                                    onClick={() => setSelectedYear(year)}
                                    className="w-full text-left justify-start"
                                >
                                    {year}年 ({pastEvents.filter(e => e.year === year).length})
                                </Button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* イベントタイムライン */}
                <div className="md:col-span-9 space-y-4">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            まだ歴史的なイベントは記録されていません
                        </div>
                    ) : (
                        filteredEvents.map(event => (
                            <Card key={event.id} variant="default" className="relative pl-6 border-l-4 border-blue-500">
                                <div className="absolute -left-[11px] top-6 w-5 h-5 bg-blue-500 rounded-full border-4 border-gray-900"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <Badge variant="success" className="mb-1">{event.year}年</Badge>
                                        <h3 className="text-xl font-bold text-white">{event.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm ${event.effects.marketImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            市場影響: {event.effects.marketImpact > 0 ? '+' : ''}{event.effects.marketImpact}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-300 mb-4">{event.description}</p>

                                {event.effects.skillTrendChanges && event.effects.skillTrendChanges.length > 0 && (
                                    <div className="bg-gray-800/50 p-2 rounded">
                                        <span className="text-xs text-gray-400 mr-2">トレンド変化:</span>
                                        <div className="inline-flex gap-2 flex-wrap">
                                            {event.effects.skillTrendChanges.map(skill => (
                                                <Badge key={skill} variant="warning" size="sm">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
