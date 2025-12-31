/**
 * 振り返りレポート画面
 * プロジェクト完了後のAI分析レポートを表示
 */

import { useState } from 'react';
import type { Project, Character, WeeklyLog } from '../../types';
import { Button, Card, CardHeader, CardBody, Badge } from '../common';
import { aiService } from '../../services';

interface ReportScreenProps {
    project: Project;
    player: Character;
    logs?: WeeklyLog[];
    onBack: () => void;
    onExport?: () => void;
}

export function ReportScreen({
    project,
    player,
    logs: _logs = [],
    onBack,
    onExport,
}: ReportScreenProps) {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI分析リクエスト
    const generateReport = async () => {
        setIsLoading(true);
        setError(null);

        const context = `
プロジェクト名: ${project.name}
クライアント: ${project.client}
予算: ${project.budget.toLocaleString()}万円
期間: ${project.schedule.endWeek - project.schedule.startWeek}週間

EVM指標:
- SPI: ${project.evm.spi.toFixed(2)}
- CPI: ${project.evm.cpi.toFixed(2)}
- PV: ${project.evm.pv}
- EV: ${project.evm.ev}
- AC: ${project.evm.ac}

プロジェクト状態: ${project.status}
現在の週: ${project.schedule.currentWeek}

プレイヤー:
- 名前: ${player.name}
- 役職: ${player.position.title}
- スタミナ: ${player.stamina.current}/${player.stamina.max}
    `.trim();

        try {
            const result = await aiService.analyzeProject({
                type: 'PROJECT_REVIEW',
                context,
            });

            if (result.success && result.analysis) {
                setReport(result.analysis);
            } else {
                setError(result.error || 'レポート生成に失敗しました');
            }
        } catch (e) {
            setError('AI接続エラー: プロバイダー設定を確認してください');
        } finally {
            setIsLoading(false);
        }
    };

    // ステータス判定
    const getProjectGrade = (): { grade: string; color: string } => {
        const spi = project.evm.spi;
        const cpi = project.evm.cpi;

        if (spi >= 1.0 && cpi >= 1.0) return { grade: 'A', color: 'text-green-400' };
        if (spi >= 0.9 && cpi >= 0.9) return { grade: 'B', color: 'text-blue-400' };
        if (spi >= 0.8 && cpi >= 0.8) return { grade: 'C', color: 'text-yellow-400' };
        if (spi >= 0.7 && cpi >= 0.7) return { grade: 'D', color: 'text-orange-400' };
        return { grade: 'F', color: 'text-red-400' };
    };

    const { grade, color } = getProjectGrade();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>← 戻る</Button>
                    <h1 className="text-2xl font-bold text-white">プロジェクト振り返り</h1>
                </div>
                <div className="flex gap-2">
                    {onExport && (
                        <Button variant="secondary" onClick={onExport}>
                            📄 エクスポート
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
                {/* サマリカード */}
                <div className="col-span-4">
                    <Card variant="glass" padding="md">
                        <CardHeader title="プロジェクト概要" />
                        <CardBody>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-6xl font-bold ${color}`}>{grade}</div>
                                    <div className="text-gray-400 mt-1">総合評価</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <div className="text-gray-400">SPI</div>
                                        <div className={`text-xl font-bold ${project.evm.spi >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                                            {project.evm.spi.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <div className="text-gray-400">CPI</div>
                                        <div className={`text-xl font-bold ${project.evm.cpi >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                                            {project.evm.cpi.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">プロジェクト名</span>
                                        <span className="text-white">{project.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">予算</span>
                                        <span className="text-white">{project.budget.toLocaleString()}万円</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">実績期間</span>
                                        <span className="text-white">{project.schedule.currentWeek}/{project.schedule.endWeek - project.schedule.startWeek}週</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">ステータス</span>
                                        <Badge variant={project.status === 'COMPLETED' ? 'success' : project.status === 'FAILED' ? 'danger' : 'info'}>
                                            {project.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* AIレポート */}
                <div className="col-span-8">
                    <Card variant="glass" padding="md" className="h-full">
                        <CardHeader
                            title="AI振り返りレポート"
                            action={
                                !report && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={generateReport}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '生成中...' : '🤖 AI分析を実行'}
                                    </Button>
                                )
                            }
                        />
                        <CardBody className="overflow-y-auto max-h-[60vh]">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
                                    <p className="text-red-400">{error}</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        AI設定を確認するか、手動でレポートを作成してください。
                                    </p>
                                </div>
                            )}

                            {report ? (
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-300">
                                        {report}
                                    </div>
                                </div>
                            ) : !isLoading && !error ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="text-lg mb-4">AI分析を実行してレポートを生成します</p>
                                    <p className="text-sm">
                                        AIプロバイダーが設定されていない場合は、手動でのレビューをお勧めします。
                                    </p>
                                </div>
                            ) : isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin text-4xl mb-4">🤖</div>
                                    <p className="text-gray-400">AI分析中...</p>
                                </div>
                            ) : null}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
