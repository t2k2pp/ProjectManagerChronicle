/**
 * WBS（Work Breakdown Structure）計画画面
 * プロジェクトのタスクを分割・配置して計画を立てる
 */

import { useState, useMemo } from 'react';
import { Button, Card, Badge } from '../common';
import type { Task, TaskPhase, Project, Character } from '../../types';
import type { Proposal, Estimate } from '../../types/proposal';

interface WBSPlanningScreenProps {
    proposal: Proposal;
    estimate: Estimate;
    availableMembers?: Character[];
    onConfirmPlan: (project: Project, tasks: Task[]) => void;
    onBack: () => void;
}

/** フェーズ情報 */
const PHASES: { key: TaskPhase; label: string; color: string; ratio: number }[] = [
    { key: 'REQUIREMENT', label: '要件定義', color: 'bg-purple-500', ratio: 0.15 },
    { key: 'DESIGN', label: '設計', color: 'bg-blue-500', ratio: 0.25 },
    { key: 'DEVELOP', label: '開発', color: 'bg-green-500', ratio: 0.40 },
    { key: 'TEST', label: 'テスト', color: 'bg-orange-500', ratio: 0.20 },
];

/** タスクテンプレート */
const TASK_TEMPLATES: Record<TaskPhase, string[]> = {
    REQUIREMENT: ['ヒアリング', '要件整理', '要件定義書作成', 'レビュー'],
    DESIGN: ['基本設計', '詳細設計', 'DB設計', 'API設計', 'UI設計'],
    DEVELOP: ['環境構築', 'バックエンド開発', 'フロントエンド開発', 'API実装', '結合'],
    TEST: ['単体テスト', '結合テスト', 'システムテスト', '受入テスト準備'],
};

export function WBSPlanningScreen({
    proposal,
    estimate,
    availableMembers: _availableMembers,
    onConfirmPlan,
    onBack,
}: WBSPlanningScreenProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    // 今後のフェーズ選択用（将来拡張）
    // const [selectedPhase, setSelectedPhase] = useState<TaskPhase>('REQUIREMENT');

    // 期間計算
    const totalWeeks = estimate.duration;
    const phaseWeeks = useMemo(() => {
        return PHASES.reduce((acc, phase) => {
            acc[phase.key] = Math.round(totalWeeks * phase.ratio);
            return acc;
        }, {} as Record<TaskPhase, number>);
    }, [totalWeeks]);

    // 開始週計算
    const phaseStartWeeks = useMemo(() => {
        let start = 1;
        const result: Record<TaskPhase, number> = {} as Record<TaskPhase, number>;
        for (const phase of PHASES) {
            result[phase.key] = start;
            start += phaseWeeks[phase.key];
        }
        return result;
    }, [phaseWeeks]);

    // タスク追加
    const addTask = (name: string, phase: TaskPhase) => {
        const phaseStart = phaseStartWeeks[phase];
        const phaseDuration = phaseWeeks[phase];
        const existingTasks = tasks.filter(t => t.phase === phase).length;

        const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            projectId: proposal.id,
            name,
            assigneeId: null,
            phase,
            progress: 0,
            quality: 80,
            riskFactor: 0.1,
            dependencies: [],
            isCriticalPath: existingTasks === 0,
            startWeek: phaseStart,
            endWeek: phaseStart + phaseDuration - 1,
            estimatedWeeks: phaseDuration,
        };
        setTasks([...tasks, newTask]);
    };

    // タスク削除
    const removeTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    // クリティカルパス計算（PMBOK準拠：最長経路法）
    const criticalPath = useMemo(() => {
        if (tasks.length === 0) return [];

        // 1. フェーズ間の暗黙的な依存関係を構築
        // REQUIREMENT -> DESIGN -> DEVELOP -> TEST
        const phaseOrder: TaskPhase[] = ['REQUIREMENT', 'DESIGN', 'DEVELOP', 'TEST'];

        // 2. タスクの早期開始時刻 (ES) と早期終了時刻 (EF) を計算
        const taskData: Map<string, {
            es: number;  // Early Start
            ef: number;  // Early Finish
            ls: number;  // Late Start
            lf: number;  // Late Finish
            slack: number;  // スラック（余裕）
        }> = new Map();

        // フェーズでグループ化
        const tasksByPhase: Map<TaskPhase, Task[]> = new Map();
        for (const phase of phaseOrder) {
            tasksByPhase.set(phase, tasks.filter(t => t.phase === phase));
        }

        // 前進パス（Early Start, Early Finish計算）
        let currentStart = 0;
        for (const phase of phaseOrder) {
            const phaseTasks = tasksByPhase.get(phase) || [];
            let maxEndInPhase = currentStart;

            for (const task of phaseTasks) {
                const duration = task.estimatedWeeks || phaseWeeks[phase] / Math.max(1, phaseTasks.length);
                const es = currentStart;
                const ef = es + duration;

                taskData.set(task.id, {
                    es, ef,
                    ls: 0, lf: 0, slack: 0
                });

                maxEndInPhase = Math.max(maxEndInPhase, ef);
            }

            currentStart = maxEndInPhase;
        }

        // プロジェクト終了時刻
        const projectEnd = currentStart;

        // 後退パス（Late Start, Late Finish計算）
        let currentEnd = projectEnd;
        for (let i = phaseOrder.length - 1; i >= 0; i--) {
            const phase = phaseOrder[i];
            const phaseTasks = tasksByPhase.get(phase) || [];
            let minStartInPhase = currentEnd;

            for (const task of phaseTasks) {
                const data = taskData.get(task.id);
                if (!data) continue;

                const duration = data.ef - data.es;
                const lf = currentEnd;
                const ls = lf - duration;
                const slack = ls - data.es;

                taskData.set(task.id, { ...data, ls, lf, slack });
                minStartInPhase = Math.min(minStartInPhase, ls);
            }

            currentEnd = minStartInPhase;
        }

        // 3. スラックが0のタスクがクリティカルパス
        const criticalTasks: string[] = [];
        for (const [taskId, data] of taskData) {
            // スラックが0または非常に小さいタスクをクリティカルパスとする
            if (Math.abs(data.slack) < 0.01) {
                criticalTasks.push(taskId);
            }
        }

        // 4. クリティカルパスが空の場合、各フェーズの最長タスクを選択
        if (criticalTasks.length === 0) {
            for (const phase of phaseOrder) {
                const phaseTasks = tasksByPhase.get(phase) || [];
                if (phaseTasks.length > 0) {
                    // 期間が最長のタスクを選択
                    const longestTask = phaseTasks.reduce((longest, t) =>
                        (t.estimatedWeeks || 1) > (longest.estimatedWeeks || 1) ? t : longest
                        , phaseTasks[0]);
                    criticalTasks.push(longestTask.id);
                }
            }
        }

        return criticalTasks;
    }, [tasks, phaseWeeks]);

    // 計画確定
    const handleConfirm = () => {
        if (tasks.length === 0) return;

        // プロジェクト生成
        const project: Project = {
            id: proposal.id,
            name: proposal.name,
            client: proposal.client.name,
            budget: {
                initial: estimate.budget,
                current: estimate.budget,
            },
            schedule: {
                startWeek: 1,
                endWeek: estimate.duration,
                currentWeek: 1,
            },
            evm: {
                pv: 0,
                ev: 0,
                ac: 0,
                spi: 1,
                cpi: 1,
            },
            status: 'PLANNING',
        };

        // クリティカルパスフラグ更新
        const finalTasks = tasks.map(t => ({
            ...t,
            isCriticalPath: criticalPath.includes(t.id),
        }));

        onConfirmPlan(project, finalTasks);
    };

    // フェーズ別タスク数
    const taskCountByPhase = useMemo(() => {
        return PHASES.reduce((acc, phase) => {
            acc[phase.key] = tasks.filter(t => t.phase === phase.key).length;
            return acc;
        }, {} as Record<TaskPhase, number>);
    }, [tasks]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">📊 WBS計画</h1>
                    <p className="text-gray-400">{proposal.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onBack}>← 戻る</Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={tasks.length === 0}
                    >
                        計画を確定 →
                    </Button>
                </div>
            </div>

            {/* プロジェクト概要 */}
            <Card variant="glass" padding="md" className="mb-6">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-400">予算</span>
                        <div className="text-white font-bold">{estimate.budget}万円</div>
                    </div>
                    <div>
                        <span className="text-gray-400">期間</span>
                        <div className="text-white font-bold">{estimate.duration}週間</div>
                    </div>
                    <div>
                        <span className="text-gray-400">想定人数</span>
                        <div className="text-white font-bold">{estimate.teamSize}人</div>
                    </div>
                    <div>
                        <span className="text-gray-400">登録タスク</span>
                        <div className="text-white font-bold">{tasks.length}件</div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* フェーズ別タスク一覧 */}
                {PHASES.map(phase => (
                    <div key={phase.key}>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${phase.color}`} />
                                <h3 className="text-white font-medium">{phase.label}</h3>
                            </div>
                            <Badge variant="default">{phaseWeeks[phase.key]}週</Badge>
                        </div>

                        {/* タスクリスト */}
                        <div className="space-y-2 mb-3">
                            {tasks
                                .filter(t => t.phase === phase.key)
                                .map(task => (
                                    <div
                                        key={task.id}
                                        className={`p-2 rounded border ${criticalPath.includes(task.id)
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-gray-700 bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-white text-sm">{task.name}</span>
                                            <button
                                                onClick={() => removeTask(task.id)}
                                                className="text-gray-500 hover:text-red-500 text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {criticalPath.includes(task.id) && (
                                            <span className="text-xs text-red-400">クリティカルパス</span>
                                        )}
                                    </div>
                                ))}
                        </div>

                        {/* タスク追加 */}
                        <div className="space-y-1">
                            {TASK_TEMPLATES[phase.key].map(template => {
                                const exists = tasks.some(t => t.name === template && t.phase === phase.key);
                                return (
                                    <button
                                        key={template}
                                        onClick={() => addTask(template, phase.key)}
                                        disabled={exists}
                                        className={`w-full text-left px-2 py-1 text-xs rounded ${exists
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        + {template}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ガントチャートプレビュー */}
            <Card variant="glass" padding="md" className="mt-6">
                <h3 className="text-white font-bold mb-4">📅 スケジュールプレビュー</h3>
                <div className="relative h-24">
                    {/* 週目盛り */}
                    <div className="flex absolute inset-x-0 top-0 h-6 border-b border-gray-700">
                        {Array.from({ length: totalWeeks }, (_, i) => (
                            <div
                                key={i}
                                className="flex-1 text-center text-xs text-gray-500 border-r border-gray-800"
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* フェーズバー */}
                    <div className="absolute inset-x-0 top-8 h-12 flex">
                        {PHASES.map(phase => (
                            <div
                                key={phase.key}
                                className={`${phase.color} opacity-80 flex items-center justify-center text-xs text-white font-medium`}
                                style={{ width: `${(phaseWeeks[phase.key] / totalWeeks) * 100}%` }}
                            >
                                {phase.label} ({taskCountByPhase[phase.key]})
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}
