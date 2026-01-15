/**
 * EVM（アーンドバリューマネジメント）計算ロジック
 */

import type { EVMState, Task } from '../../types';

/** EVM指標の計算 */
export function calculateEVM(
    pv: number,  // 計画値
    ev: number,  // 出来高
    ac: number   // 実コスト
): EVMState {
    // 基本指標
    const spi = pv > 0 ? ev / pv : 1;        // スケジュール効率指数
    const cpi = ac > 0 ? ev / ac : 1;        // コスト効率指数

    return { pv, ev, ac, spi, cpi };
}

/** EVM派生指標 */
export interface EVMDerivedMetrics {
    sv: number;      // スケジュール差異 (EV - PV)
    cv: number;      // コスト差異 (EV - AC)
    bac: number;     // 完成時総予算
    eac: number;     // 完成時総コスト見積り
    etc: number;     // 残作業コスト見積り
    vac: number;     // 完成時差異 (BAC - EAC)
    tcpi: number;    // 予算達成必要効率
}

/** 派生指標を計算 */
export function calculateDerivedMetrics(
    evm: EVMState,
    bac: number
): EVMDerivedMetrics {
    const sv = evm.ev - evm.pv;  // スケジュール差異
    const cv = evm.ev - evm.ac;  // コスト差異

    // 完成時総コスト見積り（EAC）
    // 典型的な見積りモデル: BAC / CPI
    const eac = evm.cpi > 0 ? bac / evm.cpi : bac * 2;

    // 残作業コスト見積り
    const etc = eac - evm.ac;

    // 完成時差異
    const vac = bac - eac;

    // 予算達成必要効率（TCPI）
    // 残予算で残作業を完了するために必要なCPI
    const remainingBudget = bac - evm.ac;
    const remainingWork = bac - evm.ev;
    const tcpi = remainingBudget > 0 ? remainingWork / remainingBudget : 0;

    return { sv, cv, bac, eac, etc, vac, tcpi };
}

/** EVM健全性の評価 */
export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';

export interface HealthEvaluation {
    overall: HealthStatus;
    schedule: HealthStatus;
    cost: HealthStatus;
    message: string;
}

/** プロジェクト健全性を評価 */
export function evaluateProjectHealth(evm: EVMState): HealthEvaluation {
    // スケジュール評価
    let schedule: HealthStatus;
    if (evm.spi >= 1.0) {
        schedule = 'EXCELLENT';
    } else if (evm.spi >= 0.9) {
        schedule = 'GOOD';
    } else if (evm.spi >= 0.7) {
        schedule = 'WARNING';
    } else {
        schedule = 'CRITICAL';
    }

    // コスト評価
    let cost: HealthStatus;
    if (evm.cpi >= 1.0) {
        cost = 'EXCELLENT';
    } else if (evm.cpi >= 0.9) {
        cost = 'GOOD';
    } else if (evm.cpi >= 0.7) {
        cost = 'WARNING';
    } else {
        cost = 'CRITICAL';
    }

    // 総合評価（悪い方を採用）
    const statusOrder: HealthStatus[] = ['CRITICAL', 'WARNING', 'GOOD', 'EXCELLENT'];
    const scheduleIdx = statusOrder.indexOf(schedule);
    const costIdx = statusOrder.indexOf(cost);
    const overall = statusOrder[Math.min(scheduleIdx, costIdx)];

    // メッセージ生成
    let message: string;
    switch (overall) {
        case 'EXCELLENT':
            message = 'プロジェクトは順調に進行しています';
            break;
        case 'GOOD':
            message = 'プロジェクトは概ね良好です';
            break;
        case 'WARNING':
            message = '注意が必要です。対策を検討してください';
            break;
        case 'CRITICAL':
            message = '⚠️ 危機的状況です。早急な対応が必要です';
            break;
    }

    return { overall, schedule, cost, message };
}

/** タスク群からPV（計画値）を計算 */
export function calculatePVFromTasks(
    tasks: Task[],
    currentWeek: number,
    taskValue: number = 100000
): number {
    /**
     * PMBOK準拠のPV計算:
     * 各タスクについて、現在週時点での計画完了率を計算し、
     * その計画完了率 × タスク価値の合計を返す
     */
    return tasks.reduce((total, task) => {
        const startWeek = task.startWeek ?? 1;
        const endWeek = task.endWeek ?? (startWeek + (task.estimatedWeeks ?? 4));
        const duration = Math.max(1, endWeek - startWeek + 1);

        let plannedProgress: number;

        if (currentWeek < startWeek) {
            // タスク開始前
            plannedProgress = 0;
        } else if (currentWeek >= endWeek) {
            // タスク完了予定週を過ぎている
            plannedProgress = 100;
        } else {
            // タスク進行中：線形で進捗する想定
            const weeksElapsed = currentWeek - startWeek + 1;
            plannedProgress = (weeksElapsed / duration) * 100;
        }

        // クリティカルパスタスクは価値にボーナス（重要度反映）
        const adjustedValue = task.isCriticalPath ? taskValue * 1.2 : taskValue;

        return total + (plannedProgress / 100) * adjustedValue;
    }, 0);
}

/** タスク群からEV（出来高）を計算 */
export function calculateEVFromTasks(
    tasks: Task[],
    taskValue: number = 100000
): number {
    return tasks.reduce((total, task) => {
        return total + (task.progress / 100) * taskValue;
    }, 0);
}

/** SPI/CPIをパーセント表示用に変換 */
export function formatIndex(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

/** 金額をフォーマット */
export function formatCurrency(value: number): string {
    if (value >= 100000000) {
        return `${(value / 100000000).toFixed(1)}億円`;
    }
    if (value >= 10000) {
        return `${(value / 10000).toFixed(0)}万円`;
    }
    return `${value.toFixed(0)}円`;
}
