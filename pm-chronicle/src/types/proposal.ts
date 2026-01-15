/**
 * 案件データ型定義
 * 受注可能なプロジェクト案件
 */

import type { Company, TaskPhase } from '../types';

/** 案件難易度 */
export type ProposalDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME';

/** 案件ステータス */
export type ProposalStatus = 'AVAILABLE' | 'BIDDING' | 'WON' | 'LOST' | 'EXPIRED';

/** 案件（受注前プロジェクト） */
export interface Proposal {
    id: string;
    name: string;
    client: Company;
    description: string;

    // 要件
    difficulty: ProposalDifficulty;
    estimatedBudget: { min: number; max: number }; // 万円
    estimatedDuration: { min: number; max: number }; // 週
    requiredSkills: string[];
    requiredPhases: TaskPhase[];

    // 入札情報
    deadline: number; // 入札締切（週番号）
    competitors: string[]; // 競合企業ID
    status: ProposalStatus;

    // メタ
    createdWeek: number;
    tags: string[];
}

/** 見積もり */
export interface Estimate {
    proposalId: string;
    budget: number; // 提示予算（万円）
    duration: number; // 提示期間（週）
    teamSize: number; // 想定人数
    confidence: number; // 自信度 0-100
}

/** 入札結果 */
export interface BidResult {
    won: boolean;
    reason: string;
    bidScore?: number; // 入札スコア（0-100）
    competitorBids?: { companyName: string; budget: number }[];
}

/** 難易度別パラメータ */
export const DIFFICULTY_PARAMS: Record<ProposalDifficulty, {
    budgetMultiplier: number;
    durationMultiplier: number;
    competitorCount: { min: number; max: number };
    winChanceBase: number;
}> = {
    EASY: {
        budgetMultiplier: 1.0,
        durationMultiplier: 1.0,
        competitorCount: { min: 1, max: 3 },
        winChanceBase: 0.6,
    },
    NORMAL: {
        budgetMultiplier: 1.5,
        durationMultiplier: 1.2,
        competitorCount: { min: 2, max: 5 },
        winChanceBase: 0.4,
    },
    HARD: {
        budgetMultiplier: 2.5,
        durationMultiplier: 1.5,
        competitorCount: { min: 3, max: 7 },
        winChanceBase: 0.25,
    },
    EXTREME: {
        budgetMultiplier: 4.0,
        durationMultiplier: 2.0,
        competitorCount: { min: 5, max: 10 },
        winChanceBase: 0.1,
    },
};

/** 難易度ラベル */
export const DIFFICULTY_LABELS: Record<ProposalDifficulty, string> = {
    EASY: '簡単',
    NORMAL: '普通',
    HARD: '難しい',
    EXTREME: '超難関',
};
