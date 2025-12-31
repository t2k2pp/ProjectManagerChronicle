/**
 * 品質計算ロジック
 */

import type { Task, Character } from '../../types';

/** 品質計算パラメータ */
interface QualityParams {
    task: Task;
    assignees: Character[];
    /** レビュー実施有無 */
    hasReview?: boolean;
    /** テストカバレッジ（0-100） */
    testCoverage?: number;
}

/** 品質計算結果 */
interface QualityResult {
    qualityScore: number;
    defectProbability: number;
    reworkRisk: number;
}

/**
 * タスクの品質スコアを計算
 */
export function calculateQuality(params: QualityParams): QualityResult {
    const { task, assignees, hasReview = false, testCoverage = 50 } = params;

    if (assignees.length === 0) {
        return { qualityScore: 0, defectProbability: 100, reworkRisk: 100 };
    }

    // チームの評価スキル平均
    const avgTestSkill = assignees.reduce((sum, c) => sum + c.statsBlue.test, 0) / assignees.length;
    // チームの設計スキル平均
    const avgDesignSkill = assignees.reduce((sum, c) => sum + c.statsBlue.design, 0) / assignees.length;

    // 基本品質スコア（スキルベース）
    let qualityScore = (avgTestSkill + avgDesignSkill) * 5;

    // レビュー補正（+15%）
    if (hasReview) {
        qualityScore *= 1.15;
    }

    // テストカバレッジ補正
    qualityScore *= 0.7 + (testCoverage / 100) * 0.3;

    // スケジュール圧迫による品質低下
    const scheduleStress = task.progress > 80 ? 0.9 : 1.0;
    qualityScore *= scheduleStress;

    // 最大100に制限
    qualityScore = Math.min(100, Math.max(0, qualityScore));

    // 欠陥発生確率（品質が低いほど高い）
    const defectProbability = Math.max(0, 100 - qualityScore);

    // 手戻りリスク
    const reworkRisk = defectProbability * 0.3;

    return { qualityScore, defectProbability, reworkRisk };
}

/**
 * プロジェクト全体の品質スコアを計算
 */
export function calculateProjectQuality(
    tasks: Task[],
    getAssignees: (taskId: string) => Character[]
): number {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(t => t.progress >= 100);
    if (completedTasks.length === 0) return 50; // デフォルト

    const totalQuality = completedTasks.reduce((sum, task) => {
        const result = calculateQuality({
            task,
            assignees: getAssignees(task.id),
        });
        return sum + result.qualityScore;
    }, 0);

    return totalQuality / completedTasks.length;
}
