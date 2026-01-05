/**
 * 曜日単位PDCAサイクル処理
 * 月～金の日次処理ロジック
 */

import type { Character, Project, Task } from '../../types';
import { getProgressModifier, getRiskModifier, AGE_TYPES } from '../traits';

/** 曜日 */
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

/** PDCAフェーズ */
export type PDCAPhase = 'PLAN' | 'DO' | 'CHECK' | 'ACTION';

/** 曜日とPDCAフェーズの対応 */
export const DAY_PDCA_MAPPING: Record<DayOfWeek, PDCAPhase> = {
    MONDAY: 'PLAN',
    TUESDAY: 'DO',
    WEDNESDAY: 'DO',
    THURSDAY: 'CHECK',
    FRIDAY: 'ACTION',
};

/** 曜日インデックス */
export const DAY_INDEX: Record<DayOfWeek, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
};

/** 日次処理結果 */
export interface DailyResult {
    day: DayOfWeek;
    phase: PDCAPhase;
    progressMade: number;
    issues: string[];
    interventionRequired: boolean;
    interventionOptions?: InterventionOption[];
}

/** 介入オプション */
export interface InterventionOption {
    id: string;
    label: string;
    effect: string;
    cost: number;  // APコスト
}

/** 週次PDCAサイクル状態 */
export interface WeeklyPDCAState {
    week: number;
    currentDay: DayOfWeek;
    dailyResults: DailyResult[];
    mondayPlan?: WeeklyPlan;
}

/** 週間計画（月曜に設定） */
export interface WeeklyPlan {
    priority: 'PROGRESS' | 'QUALITY' | 'BALANCED';
    focusTasks: string[];
    overtimeAllowed: boolean;
}

// ========================
// 曜日別処理ロジック
// ========================

/**
 * 月曜日: 計画フェーズ
 * - 週間計画を策定
 * - リスク評価
 */
export function processMondayPlan(
    project: Project,
    _tasks: Task[],
    _plan: WeeklyPlan
): DailyResult {
    const issues: string[] = [];

    // 進捗遅延チェック（EVM SV = EV - PV）
    const sv = (project.evm?.ev || 0) - (project.evm?.pv || 0);
    if (sv < -10000) {  // SV負 = 遅延
        issues.push('スケジュール遅延を検知。対策が必要です。');
    }

    return {
        day: 'MONDAY',
        phase: 'PLAN',
        progressMade: 0,  // 計画日は進捗なし
        issues,
        interventionRequired: issues.length > 0,
        interventionOptions: issues.length > 0 ? [
            { id: 'add_overtime', label: '残業許可', effect: '進捗+20%', cost: 10 },
            { id: 'add_resource', label: '応援要請', effect: '翌日から増員', cost: 20 },
            { id: 'scope_cut', label: 'スコープ削減', effect: 'タスク減少', cost: 5 },
        ] : undefined,
    };
}

/**
 * 火～水曜日: 実行フェーズ
 * - タスク進捗
 * - 問題発生チェック
 */
export function processDoDay(
    day: DayOfWeek,
    tasks: Task[],
    assignees: Character[],
    plan: WeeklyPlan
): DailyResult {
    let totalProgress = 0;
    const issues: string[] = [];

    // アサイン済みタスク処理（進捗100未満 = IN_PROGRESS相当）
    for (const task of tasks.filter(t => t.progress < 100 && t.assigneeId)) {
        const assignee = assignees.find(a => a.id === task.assigneeId);
        if (!assignee) continue;

        // 進捗計算（1日分 = 週の1/5）
        const skillValue = assignee.statsBlue.develop;
        const traitBonus = getProgressModifier(assignee.traits);
        const ageTypeDef = AGE_TYPES.find(t => t.type === assignee.ageType);
        const ageBonus = ageTypeDef?.progressBonus || 1.0;

        const priorityBonus = plan.priority === 'PROGRESS' ? 1.2 :
            plan.priority === 'QUALITY' ? 0.9 : 1.0;

        const dailyProgress = (skillValue * 0.5 * traitBonus * ageBonus * priorityBonus);
        totalProgress += dailyProgress;

        // 問題発生チェック
        const riskModifier = getRiskModifier(assignee.traits);
        if (task.riskFactor > 60 && Math.random() < (task.riskFactor / 300) * riskModifier) {
            issues.push(`タスク「${task.name || task.id}」で技術的課題発生`);
        }
    }

    return {
        day,
        phase: 'DO',
        progressMade: totalProgress,
        issues,
        interventionRequired: issues.length > 0,
        interventionOptions: issues.length > 0 ? [
            { id: 'pair_work', label: 'ペア作業', effect: '課題解決補助', cost: 5 },
            { id: 'escalate', label: 'エスカレーション', effect: '即座に解決', cost: 15 },
        ] : undefined,
    };
}

/**
 * 木曜日: チェックフェーズ
 * - 進捗確認
 * - 品質レビュー
 */
export function processThursdayCheck(
    tasks: Task[],
    project: Project
): DailyResult {
    const issues: string[] = [];

    // 品質チェック
    const avgQuality = tasks.reduce((sum, t) => sum + t.quality, 0) / (tasks.length || 1);
    if (avgQuality < 70) {
        issues.push(`品質スコアが低下中（${avgQuality.toFixed(1)}%）`);
    }

    // 進捗チェック（将来拡張用のログ出力でも可）

    // EVM SPI チェック
    const spi = project.evm?.spi || 1.0;
    if (spi < 0.9) {
        issues.push(`SPI低下（${spi.toFixed(2)}）: スケジュール遅延リスク`);
    }

    return {
        day: 'THURSDAY',
        phase: 'CHECK',
        progressMade: 0,  // チェック日は進捗なし
        issues,
        interventionRequired: issues.length > 0,
        interventionOptions: issues.length > 0 ? [
            { id: 'quality_focus', label: '品質強化週間', effect: '品質+10%', cost: 10 },
            { id: 'replanning', label: '再計画', effect: 'スケジュール調整', cost: 15 },
        ] : undefined,
    };
}

/**
 * 金曜日: アクションフェーズ
 * - 週の振り返り
 * - 来週への申し送り
 */
export function processFridayAction(
    dailyResults: DailyResult[],
    _project: Project
): DailyResult {
    const issues: string[] = [];

    // 週を通じての問題数
    const weeklyIssueCount = dailyResults.reduce((sum, r) => sum + r.issues.length, 0);

    if (weeklyIssueCount > 3) {
        issues.push(`今週の課題発生数が多い（${weeklyIssueCount}件）。チーム疲弊に注意`);
    }

    // 総進捗
    const weeklyProgress = dailyResults.reduce((sum, r) => sum + r.progressMade, 0);

    return {
        day: 'FRIDAY',
        phase: 'ACTION',
        progressMade: weeklyProgress * 0.1,  // 金曜は微量進捗
        issues,
        interventionRequired: false,  // 振り返りは介入不要
    };
}

/**
 * 1日を処理
 */
export function processDay(
    day: DayOfWeek,
    project: Project,
    tasks: Task[],
    assignees: Character[],
    plan: WeeklyPlan,
    previousResults: DailyResult[]
): DailyResult {
    switch (day) {
        case 'MONDAY':
            return processMondayPlan(project, tasks, plan);
        case 'TUESDAY':
        case 'WEDNESDAY':
            return processDoDay(day, tasks, assignees, plan);
        case 'THURSDAY':
            return processThursdayCheck(tasks, project);
        case 'FRIDAY':
            return processFridayAction(previousResults, project);
    }
}

/**
 * 週全体を処理（介入なしの場合）
 */
export function processFullWeek(
    project: Project,
    tasks: Task[],
    assignees: Character[],
    plan: WeeklyPlan
): DailyResult[] {
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const results: DailyResult[] = [];

    for (const day of days) {
        const result = processDay(day, project, tasks, assignees, plan, results);
        results.push(result);
    }

    return results;
}
