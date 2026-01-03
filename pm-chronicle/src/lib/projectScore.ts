/**
 * プロジェクト完了・スコア算出ロジック
 */

import type { Project, Task, Character } from '../types';

/** プロジェクト評価結果 */
export interface ProjectScore {
    // QCD評価（各0-100）
    quality: number;      // 品質達成度
    cost: number;         // コスト達成度
    delivery: number;     // 納期達成度

    // 総合評価
    totalScore: number;   // 総合スコア（0-100）
    grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

    // 詳細
    issues: string[];     // 問題点
    achievements: string[]; // 達成事項

    // 報酬
    revenueEarned: number;  // 受け取り金額（万円）
    profitLoss: number;     // 利益/損失（万円）
    experienceGained: number; // 経験値
}

/** グレード閾値 */
const GRADE_THRESHOLDS = {
    S: 90,
    A: 75,
    B: 60,
    C: 45,
    D: 30,
    F: 0,
};

/**
 * タスク完了状態をチェック
 */
export function checkProjectCompletion(tasks: Task[]): {
    isComplete: boolean;
    completionRate: number;
    incompleteCount: number;
} {
    const completed = tasks.filter(t => t.progress >= 100).length;
    return {
        isComplete: completed === tasks.length,
        completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
        incompleteCount: tasks.length - completed,
    };
}

/**
 * 品質スコア計算
 */
function calculateQualityScore(tasks: Task[]): number {
    if (tasks.length === 0) return 0;

    // 各タスクの品質平均
    const avgQuality = tasks.reduce((sum, t) => sum + t.quality, 0) / tasks.length;

    // クリティカルパスタスクの品質加重
    const criticalTasks = tasks.filter(t => t.isCriticalPath);
    const criticalAvg = criticalTasks.length > 0
        ? criticalTasks.reduce((sum, t) => sum + t.quality, 0) / criticalTasks.length
        : avgQuality;

    // 加重平均（クリティカルパスを重視）
    return avgQuality * 0.6 + criticalAvg * 0.4;
}

/**
 * コストスコア計算
 */
function calculateCostScore(project: Project): number {
    const { initial, current } = project.budget;

    if (current <= initial * 0.9) {
        return 100; // 予算10%以上削減
    } else if (current <= initial) {
        return 80 + (1 - current / initial) * 200; // 予算内
    } else if (current <= initial * 1.1) {
        return 60 - (current / initial - 1) * 200; // 10%超過
    } else if (current <= initial * 1.25) {
        return 40 - (current / initial - 1.1) * 133; // 25%超過
    } else {
        return Math.max(0, 20 - (current / initial - 1.25) * 80); // それ以上
    }
}

/**
 * 納期スコア計算
 */
function calculateDeliveryScore(project: Project, tasks: Task[]): number {
    const { endWeek, currentWeek } = project.schedule;

    // 全タスク完了チェック
    const completion = checkProjectCompletion(tasks);

    if (!completion.isComplete) {
        // 未完了ペナルティ
        return Math.max(0, 50 - (100 - completion.completionRate));
    }

    // 完了週との比較
    if (currentWeek <= endWeek) {
        // 予定通りまたは早期完了
        const earlyBonus = Math.min(20, (endWeek - currentWeek) * 5);
        return 80 + earlyBonus;
    } else {
        // 遅延
        const delayWeeks = currentWeek - endWeek;
        return Math.max(0, 70 - delayWeeks * 10);
    }
}

/**
 * 総合スコアからグレード算出
 */
function calculateGrade(score: number): ProjectScore['grade'] {
    if (score >= GRADE_THRESHOLDS.S) return 'S';
    if (score >= GRADE_THRESHOLDS.A) return 'A';
    if (score >= GRADE_THRESHOLDS.B) return 'B';
    if (score >= GRADE_THRESHOLDS.C) return 'C';
    if (score >= GRADE_THRESHOLDS.D) return 'D';
    return 'F';
}

/**
 * プロジェクトスコア算出
 */
export function calculateProjectScore(
    project: Project,
    tasks: Task[],
    _teamMembers: Character[]
): ProjectScore {
    const quality = calculateQualityScore(tasks);
    const cost = calculateCostScore(project);
    const delivery = calculateDeliveryScore(project, tasks);

    // 総合スコア（QCDバランス）
    const totalScore = quality * 0.35 + cost * 0.30 + delivery * 0.35;
    const grade = calculateGrade(totalScore);

    // 問題点・達成事項
    const issues: string[] = [];
    const achievements: string[] = [];

    if (quality >= 80) achievements.push('高品質な成果物');
    if (quality < 50) issues.push('品質に課題あり');

    if (cost >= 80) achievements.push('予算内完了');
    if (cost < 50) issues.push('コスト超過');

    if (delivery >= 80) achievements.push('納期遵守');
    if (delivery < 50) issues.push('納期遅延');

    // 報酬計算
    const baseRevenue = project.budget.initial;
    const gradeMultiplier = { S: 1.2, A: 1.1, B: 1.0, C: 0.9, D: 0.8, F: 0.5 }[grade];
    const revenueEarned = Math.round(baseRevenue * gradeMultiplier);
    const profitLoss = revenueEarned - project.budget.current;

    // 経験値
    const experienceGained = Math.round(totalScore * 10);

    return {
        quality: Math.round(quality),
        cost: Math.round(cost),
        delivery: Math.round(delivery),
        totalScore: Math.round(totalScore),
        grade,
        issues,
        achievements,
        revenueEarned,
        profitLoss,
        experienceGained,
    };
}

/**
 * グレードラベル
 */
export const GRADE_LABELS: Record<ProjectScore['grade'], { label: string; color: string }> = {
    S: { label: '最優秀', color: 'text-yellow-400' },
    A: { label: '優秀', color: 'text-green-400' },
    B: { label: '良好', color: 'text-blue-400' },
    C: { label: '普通', color: 'text-gray-400' },
    D: { label: '要改善', color: 'text-orange-400' },
    F: { label: '失敗', color: 'text-red-400' },
};
