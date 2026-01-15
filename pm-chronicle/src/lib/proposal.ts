/**
 * 案件生成・入札ロジック
 */

import { v4 as uuidv4 } from 'uuid';
import type { Company, TaskPhase } from '../types';
import type { Proposal, ProposalDifficulty, Estimate, BidResult } from '../types/proposal';
import { DIFFICULTY_PARAMS } from '../types/proposal';

/** 案件名テンプレート */
const PROJECT_NAMES = [
    '社内基幹システム刷新',
    'ECサイト構築',
    'モバイルアプリ開発',
    'データ分析基盤構築',
    'クラウド移行プロジェクト',
    'セキュリティ強化',
    '業務効率化システム',
    'CRM導入',
    'AI活用PoC',
    'DX推進支援',
];

/** 必要スキル候補 */
const SKILL_CANDIDATES = [
    'Java', 'Python', 'TypeScript', 'React', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'AI/ML', 'セキュリティ',
];

/**
 * ランダム案件生成
 */
export function generateProposal(
    clients: Company[],
    currentWeek: number,
    difficulty?: ProposalDifficulty
): Proposal {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const name = PROJECT_NAMES[Math.floor(Math.random() * PROJECT_NAMES.length)];

    // 難易度決定
    const diff = difficulty || (['EASY', 'NORMAL', 'HARD', 'EXTREME'] as ProposalDifficulty[])[
        Math.floor(Math.random() * 4)
    ];
    const params = DIFFICULTY_PARAMS[diff];

    // 予算・期間
    const baseBudget = 500 + Math.random() * 2000; // 500-2500万
    const budget = baseBudget * params.budgetMultiplier;
    const baseDuration = 8 + Math.random() * 16; // 8-24週
    const duration = baseDuration * params.durationMultiplier;

    // スキル選択
    const skillCount = 2 + Math.floor(Math.random() * 3);
    const requiredSkills: string[] = [];
    while (requiredSkills.length < skillCount) {
        const skill = SKILL_CANDIDATES[Math.floor(Math.random() * SKILL_CANDIDATES.length)];
        if (!requiredSkills.includes(skill)) requiredSkills.push(skill);
    }

    // フェーズ
    const phases: TaskPhase[] = ['REQUIREMENT', 'DESIGN', 'DEVELOP', 'TEST'];

    return {
        id: uuidv4(),
        name: `${client.name}様向け ${name}`,
        client,
        description: `${client.name}様からのご依頼。${name}案件です。`,
        difficulty: diff,
        estimatedBudget: { min: Math.floor(budget * 0.8), max: Math.floor(budget * 1.2) },
        estimatedDuration: { min: Math.floor(duration * 0.8), max: Math.floor(duration * 1.2) },
        requiredSkills,
        requiredPhases: phases,
        deadline: currentWeek + 4 + Math.floor(Math.random() * 4), // 4-8週後
        competitors: [], // 後で設定
        status: 'AVAILABLE',
        createdWeek: currentWeek,
        tags: [diff, client.category],
    };
}

/**
 * 複数案件生成
 */
export function generateProposals(
    clients: Company[],
    currentWeek: number,
    count: number = 5
): Proposal[] {
    const proposals: Proposal[] = [];
    for (let i = 0; i < count; i++) {
        proposals.push(generateProposal(clients, currentWeek));
    }
    return proposals;
}

/**
 * 入札判定（確定的評価ベース）
 * プレイヤーの見積もり精度によって結果が決まる
 */
export function processBid(
    proposal: Proposal,
    estimate: Estimate,
    playerReputation: number // 0-100
): BidResult {
    const params = DIFFICULTY_PARAMS[proposal.difficulty];

    /**
     * 入札スコア計算（0-100）
     * 60以上で落札成功
     */
    let score = params.winChanceBase * 100; // 基本スコア変換

    // 予算精度評価（最大±20ポイント）
    const budgetMid = (proposal.estimatedBudget.min + proposal.estimatedBudget.max) / 2;
    const budgetRatio = estimate.budget / budgetMid;
    if (budgetRatio < 0.7) {
        // 安すぎ：クライアントは不信感を持つ
        score -= 20;
    } else if (budgetRatio >= 0.85 && budgetRatio <= 0.95) {
        // 最適ゾーン：競争力がありつつ信頼できる
        score += 15;
    } else if (budgetRatio > 0.95 && budgetRatio <= 1.05) {
        // 適正範囲
        score += 5;
    } else if (budgetRatio > 1.1) {
        // 高すぎ
        score -= 10;
    }

    // 期間評価（最大±15ポイント）
    const durationMid = (proposal.estimatedDuration.min + proposal.estimatedDuration.max) / 2;
    const durationRatio = estimate.duration / durationMid;
    if (durationRatio >= 0.85 && durationRatio <= 1.0) {
        // 最適：やや早めの妥当な提案
        score += 15;
    } else if (durationRatio < 0.7) {
        // 短すぎ：実現性に疑問
        score -= 10;
    } else if (durationRatio > 1.2) {
        // 長すぎ
        score -= 10;
    }

    // 評判ボーナス（最大±15ポイント）
    score += (playerReputation - 50) * 0.3;

    // 自信度ボーナス（最大±10ポイント）
    score += (estimate.confidence - 50) * 0.2;

    // 難易度による閾値調整
    const winThreshold = 60 - (params.winChanceBase - 0.5) * 20; // 難易度補正

    // 確定的判定
    const won = score >= winThreshold;

    if (won) {
        // 落札成功時、スコアに応じたメッセージ
        const excellentReasons = [
            '貴社の提案が最も優れていると判断されました。',
            'バランスの取れた見積もりが高く評価されました。',
            '信頼性と競争力を両立した提案でした。',
        ];
        const goodReasons = [
            '総合的に検討した結果、貴社に決定しました。',
            '条件面で折り合いがつきました。',
        ];

        return {
            won: true,
            reason: score >= 80 ? excellentReasons[0] : goodReasons[0],
            bidScore: Math.round(score),
        };
    } else {
        // 敗北時、原因に応じたフィードバック
        let reason: string;
        if (budgetRatio < 0.7) {
            reason = '見積額が低すぎ、実現可能性に懸念がありました。';
        } else if (budgetRatio > 1.1) {
            reason = '他社と比較してコスト面で競争力がありませんでした。';
        } else if (durationRatio < 0.7) {
            reason = 'スケジュールが短すぎ、品質面での懸念がありました。';
        } else if (durationRatio > 1.2) {
            reason = 'スケジュールが長すぎ、スピード感が不足していました。';
        } else if (playerReputation < 40) {
            reason = '実績面でより信頼できる他社を選択しました。';
        } else {
            reason = '総合評価で他社がわずかに上回りました。';
        }

        return {
            won: false,
            reason,
            bidScore: Math.round(score),
        };
    }
}
