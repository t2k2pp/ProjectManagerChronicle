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
 * 入札判定
 */
export function processBid(
    proposal: Proposal,
    estimate: Estimate,
    playerReputation: number // 0-100
): BidResult {
    const params = DIFFICULTY_PARAMS[proposal.difficulty];

    // 基本勝率
    let winChance = params.winChanceBase;

    // 予算による補正（安いほど有利、ただし安すぎると不信感）
    const budgetMid = (proposal.estimatedBudget.min + proposal.estimatedBudget.max) / 2;
    const budgetRatio = estimate.budget / budgetMid;
    if (budgetRatio < 0.7) {
        winChance -= 0.2; // 安すぎて不信
    } else if (budgetRatio < 0.9) {
        winChance += 0.15; // 競争力あり
    } else if (budgetRatio > 1.1) {
        winChance -= 0.1; // 高い
    }

    // 期間による補正
    const durationMid = (proposal.estimatedDuration.min + proposal.estimatedDuration.max) / 2;
    const durationRatio = estimate.duration / durationMid;
    if (durationRatio < 0.8) {
        winChance += 0.1; // 早い
    } else if (durationRatio > 1.2) {
        winChance -= 0.1; // 遅い
    }

    // 評判補正
    winChance += (playerReputation - 50) / 200; // ±0.25

    // 自信度補正
    winChance += (estimate.confidence - 50) / 500; // ±0.1

    // 確率を0-1に収める
    winChance = Math.max(0.05, Math.min(0.95, winChance));

    // 抽選
    const won = Math.random() < winChance;

    if (won) {
        return {
            won: true,
            reason: '貴社の提案が最も優れていると判断されました。',
        };
    } else {
        const reasons = [
            '他社の提案がより魅力的でした。',
            '予算面で折り合いがつきませんでした。',
            'スケジュールの都合で見送りとなりました。',
            '今回は別のベンダーに決定しました。',
        ];
        return {
            won: false,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
        };
    }
}
