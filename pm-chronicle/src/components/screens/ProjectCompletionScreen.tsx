/**
 * プロジェクト完了・検収画面
 * プロジェクト終了時のスコア表示と報酬受け取り
 */

import { useState, useEffect } from 'react';
import { Button, Card } from '../common';
import type { Project, Task, Character } from '../../types';
import { calculateProjectScore, GRADE_LABELS, type ProjectScore } from '../../lib/projectScore';

interface ProjectCompletionScreenProps {
    project: Project;
    tasks: Task[];
    teamMembers: Character[];
    onComplete: (score: ProjectScore) => void;
    onBack: () => void;
}

export function ProjectCompletionScreen({
    project,
    tasks,
    teamMembers,
    onComplete,
    onBack,
}: ProjectCompletionScreenProps) {
    const [score, setScore] = useState<ProjectScore | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        // スコア計算
        const result = calculateProjectScore(project, tasks, teamMembers);
        setScore(result);

        // アニメーション遅延
        setTimeout(() => setAnimationComplete(true), 1500);
    }, [project, tasks, teamMembers]);

    if (!score) return null;

    const gradeInfo = GRADE_LABELS[score.grade];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">🎉 プロジェクト完了</h1>
                    <p className="text-gray-400">{project.name}</p>
                </div>
                <Button variant="ghost" onClick={onBack}>← 戻る</Button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* グレード表示 */}
                <Card variant="glass" padding="lg" className="text-center">
                    <div className="mb-4">
                        <span className="text-gray-400">総合評価</span>
                    </div>
                    <div
                        className={`text-8xl font-bold mb-2 transition-all duration-1000 ${animationComplete ? gradeInfo.color : 'text-gray-600'
                            }`}
                    >
                        {score.grade}
                    </div>
                    <div className={`text-xl ${gradeInfo.color}`}>
                        {gradeInfo.label}
                    </div>
                    <div className="text-3xl font-bold text-white mt-4">
                        {score.totalScore}点
                    </div>
                </Card>

                {/* QCD詳細 */}
                <Card variant="glass" padding="md">
                    <h2 className="text-lg font-bold text-white mb-4">📊 QCD評価</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {/* 品質 */}
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Quality（品質）</div>
                            <div className="text-3xl font-bold text-blue-400">{score.quality}</div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000"
                                    style={{ width: animationComplete ? `${score.quality}%` : '0%' }}
                                />
                            </div>
                        </div>

                        {/* コスト */}
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Cost（コスト）</div>
                            <div className="text-3xl font-bold text-green-400">{score.cost}</div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-green-500 transition-all duration-1000"
                                    style={{ width: animationComplete ? `${score.cost}%` : '0%' }}
                                />
                            </div>
                        </div>

                        {/* 納期 */}
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-1">Delivery（納期）</div>
                            <div className="text-3xl font-bold text-orange-400">{score.delivery}</div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-orange-500 transition-all duration-1000"
                                    style={{ width: animationComplete ? `${score.delivery}%` : '0%' }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 報酬 */}
                <Card variant="glass" padding="md">
                    <h2 className="text-lg font-bold text-white mb-4">💰 報酬</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">受取金額</div>
                            <div className="text-2xl font-bold text-green-400">
                                {score.revenueEarned.toLocaleString()}万円
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">利益/損失</div>
                            <div className={`text-2xl font-bold ${score.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {score.profitLoss >= 0 ? '+' : ''}{score.profitLoss.toLocaleString()}万円
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">獲得経験値</div>
                            <div className="text-2xl font-bold text-yellow-400">
                                +{score.experienceGained} EXP
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 達成事項・問題点 */}
                <Card variant="glass" padding="md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-white">📝 詳細</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? '閉じる' : '表示'}
                        </Button>
                    </div>

                    {showDetails && (
                        <div className="grid grid-cols-2 gap-4">
                            {/* 達成事項 */}
                            <div>
                                <h3 className="text-sm text-green-400 mb-2">✅ 達成事項</h3>
                                {score.achievements.length > 0 ? (
                                    <ul className="space-y-1">
                                        {score.achievements.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-300">
                                                • {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">なし</p>
                                )}
                            </div>

                            {/* 問題点 */}
                            <div>
                                <h3 className="text-sm text-red-400 mb-2">⚠️ 問題点</h3>
                                {score.issues.length > 0 ? (
                                    <ul className="space-y-1">
                                        {score.issues.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-300">
                                                • {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">なし</p>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* プロジェクト概要 */}
                <Card variant="glass" padding="md">
                    <h2 className="text-lg font-bold text-white mb-4">📋 プロジェクト概要</h2>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">クライアント</span>
                            <div className="text-white">{project.client}</div>
                        </div>
                        <div>
                            <span className="text-gray-400">予算</span>
                            <div className="text-white">{project.budget.initial}万円</div>
                        </div>
                        <div>
                            <span className="text-gray-400">実績コスト</span>
                            <div className="text-white">{project.budget.current}万円</div>
                        </div>
                        <div>
                            <span className="text-gray-400">タスク数</span>
                            <div className="text-white">{tasks.length}件</div>
                        </div>
                    </div>
                </Card>

                {/* 完了ボタン */}
                <Button
                    variant="primary"
                    onClick={() => onComplete(score)}
                    className="w-full"
                    disabled={!animationComplete}
                >
                    報酬を受け取る →
                </Button>
            </div>
        </div>
    );
}
