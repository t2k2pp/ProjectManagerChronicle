/**
 * ガントチャートコンポーネント
 * プロジェクトタスクの進捗とスケジュールを表示
 */

import type { Task } from '../../../types';

interface GanttChartProps {
    tasks: Task[];
    currentWeek: number;
    totalWeeks: number;
    onTaskClick?: (taskId: string) => void;
}

/** フェーズ名を取得 */
const PHASE_NAMES: Record<string, string> = {
    REQUIREMENT: '要件定義',
    DESIGN: '設計',
    DEVELOP: '開発',
    TEST: 'テスト',
};

/** フェーズ色を取得 */
const PHASE_COLORS: Record<string, string> = {
    REQUIREMENT: '#3b82f6',
    DESIGN: '#8b5cf6',
    DEVELOP: '#10b981',
    TEST: '#f59e0b',
};

export function GanttChart({
    tasks,
    currentWeek,
    totalWeeks,
    onTaskClick,
}: GanttChartProps) {
    const weekWidth = 100 / totalWeeks;

    // 週のラベルを生成
    const weekLabels = Array.from({ length: totalWeeks }, (_, i) => i + 1);

    return (
        <div className="bg-surface rounded-lg p-4 overflow-x-auto">
            {/* ヘッダー（週数） */}
            <div className="flex border-b border-gray-700 pb-2 mb-2 min-w-max">
                <div className="w-32 flex-shrink-0 text-gray-400 text-sm font-medium">
                    タスク
                </div>
                <div className="flex flex-1">
                    {weekLabels.map(week => (
                        <div
                            key={week}
                            className={`text-center text-xs ${week === currentWeek
                                ? 'text-blue-400 font-bold'
                                : 'text-gray-500'
                                }`}
                            style={{ width: `${weekWidth}%`, minWidth: '30px' }}
                        >
                            {week}
                        </div>
                    ))}
                </div>
            </div>

            {/* タスク行 */}
            {tasks.map(task => {
                // タスクのスケジュールを使用（デフォルト値付き）
                const taskStartWeek = task.startWeek ?? 1;
                const taskEndWeek = task.endWeek ?? (taskStartWeek + (task.estimatedWeeks ?? 4));
                const duration = taskEndWeek - taskStartWeek + 1;
                const leftPercent = ((taskStartWeek - 1) / totalWeeks) * 100;
                const widthPercent = (duration / totalWeeks) * 100;

                return (
                    <div
                        key={task.id}
                        className="flex items-center py-1 hover:bg-gray-700/50 cursor-pointer min-w-max"
                        onClick={() => onTaskClick?.(task.id)}
                    >
                        {/* タスク名 */}
                        <div className="w-32 flex-shrink-0 text-sm text-white truncate pr-2">
                            {task.name || PHASE_NAMES[task.phase] || task.phase}
                        </div>

                        {/* ガントバー */}
                        <div className="flex-1 relative h-6">
                            {/* 現在週のライン */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                                style={{ left: `${((currentWeek - 0.5) / totalWeeks) * 100}%` }}
                            />

                            {/* タスクバー */}
                            <div
                                className="absolute top-1 h-4 rounded flex items-center justify-center text-xs text-white font-medium"
                                style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                    minWidth: '40px',
                                    backgroundColor: PHASE_COLORS[task.phase] || '#6b7280',
                                }}
                            >
                                {task.progress}%
                            </div>

                            {/* 進捗オーバーレイ */}
                            <div
                                className="absolute top-1 h-4 rounded-l bg-white/20"
                                style={{
                                    left: `${leftPercent}%`,
                                    width: `${(widthPercent * task.progress) / 100}%`,
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* タスクがない場合 */}
            {tasks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    タスクがありません
                </div>
            )}
        </div>
    );
}

/** ミニガントチャート（ダッシュボード用） */
export function MiniGanttChart({
    tasks,
    currentWeek: _currentWeek,
    totalWeeks: _totalWeeks,
}: Omit<GanttChartProps, 'onTaskClick'>) {
    const mainTasks = tasks.slice(0, 5); // 上位5タスクのみ

    return (
        <div className="bg-surface-glass rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">進捗状況</div>
            {mainTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 py-1">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PHASE_COLORS[task.phase] || '#6b7280' }}
                    />
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${task.progress}%`,
                                backgroundColor: PHASE_COLORS[task.phase] || '#6b7280',
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-400">{task.progress}%</span>
                </div>
            ))}
        </div>
    );
}
