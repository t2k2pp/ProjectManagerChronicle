/**
 * 進捗計算ロジック
 */

import type { Task, Character, TaskPhase } from '../../types';

/** 進捗計算パラメータ */
interface ProgressParams {
    task: Task;
    assignees: Character[];
    /** スタミナ係数 (0.5-1.5) */
    staminaFactor?: number;
    /** 難易度補正 */
    difficultyModifier?: number;
}

/** 進捗計算結果 */
interface ProgressResult {
    dailyProgress: number;
    estimatedDaysRemaining: number;
    productivityScore: number;
}

/**
 * タスク担当者の総合能力値を計算
 */
function calculateTeamCapability(assignees: Character[], skillKey: keyof Character['statsBlue']): number {
    if (assignees.length === 0) return 0;

    const totalSkill = assignees.reduce((sum, char) => sum + char.statsBlue[skillKey], 0);
    // チーム効率: 人数が増えると効率は若干低下（ブルックスの法則）
    const teamEfficiency = 1 - (assignees.length - 1) * 0.05;

    return totalSkill * Math.max(0.7, teamEfficiency);
}

/**
 * タスクの1日あたりの進捗を計算
 */
export function calculateDailyProgress(params: ProgressParams): ProgressResult {
    const { task, assignees, staminaFactor = 1.0, difficultyModifier = 1.0 } = params;

    if (assignees.length === 0) {
        return { dailyProgress: 0, estimatedDaysRemaining: Infinity, productivityScore: 0 };
    }

    // フェーズに応じた主要スキルを決定
    const skillKey = getSkillForPhase(task.phase);
    const teamCapability = calculateTeamCapability(assignees, skillKey);

    // 基本工数を品質とリスクから推定（estimatedEffortがない場合の代替）
    const estimatedEffort = 100 * (1 + task.riskFactor * 0.5);

    // 基本進捗 = チーム能力 / タスク工数 * スタミナ係数 * 難易度補正
    const baseProgress = (teamCapability / estimatedEffort) * staminaFactor / difficultyModifier;

    // 1日あたり進捗（最大5%、最小0.5%）
    const dailyProgress = Math.min(5, Math.max(0.5, baseProgress * 100));

    // 残り日数推定
    const remainingProgress = 100 - task.progress;
    const estimatedDaysRemaining = Math.ceil(remainingProgress / dailyProgress);

    // 生産性スコア（計画vs実績）
    const productivityScore = dailyProgress > 2 ? 100 : dailyProgress * 50;

    return { dailyProgress, estimatedDaysRemaining, productivityScore };
}

/**
 * フェーズに応じたスキルキーを取得
 */
function getSkillForPhase(phase: TaskPhase): keyof Character['statsBlue'] {
    switch (phase) {
        case 'REQUIREMENT':
        case 'DESIGN':
            return 'design';
        case 'DEVELOP':
            return 'develop';
        case 'TEST':
            return 'test';
        default:
            return 'develop';
    }
}

/**
 * 週間進捗を計算（5営業日分）
 */
export function calculateWeeklyProgress(params: ProgressParams): number {
    const { dailyProgress } = calculateDailyProgress(params);
    return dailyProgress * 5;
}
