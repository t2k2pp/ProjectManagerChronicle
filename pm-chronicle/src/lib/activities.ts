/**
 * 日常活動システム
 * 社内研修、飲み会、交流イベントなど
 */

import type { Character, StatsBlue, StatsRed } from '../types';

/** 活動タイプ */
export type ActivityType =
    | 'COMPANY_TRAINING'  // 社内研修
    | 'DRINKING_PARTY'    // 飲み会
    | 'TEAM_BUILDING'     // チームビルディング
    | 'LUNCH_MEETING'     // ランチミーティング
    | 'MENTORING'         // メンタリング
    | 'CLUB_ACTIVITY';    // サークル活動

/** 活動定義 */
export interface ActivityDefinition {
    id: ActivityType;
    label: string;
    description: string;
    cost: number;         // コスト（万円、0=会社負担）
    duration: number;     // 所要時間（時間）
    staminaCost: number;  // スタミナ消費
    effects: {
        skillBonus?: Partial<StatsBlue & StatsRed>;
        relationshipBonus?: number;
        loyaltyChange?: number;
        staminaRecovery?: number;
    };
    requirements?: {
        minPosition?: string;
        maxParticipants?: number;
    };
}

/** 活動結果 */
export interface ActivityResult {
    success: boolean;
    message: string;
    skillGains: { skill: string; amount: number }[];
    relationshipChanges: { characterId: string; change: number }[];
    loyaltyChange: number;
    staminaChange: number;
}

/** 活動一覧 */
export const ACTIVITIES: ActivityDefinition[] = [
    {
        id: 'COMPANY_TRAINING',
        label: '社内研修',
        description: '会社主催の技術研修。費用は会社負担。',
        cost: 0,
        duration: 8,
        staminaCost: 20,
        effects: {
            skillBonus: { develop: 2, design: 1 },
        },
    },
    {
        id: 'DRINKING_PARTY',
        label: '飲み会',
        description: 'チームメンバーとの親睦会。関係性が向上。',
        cost: 0.5,
        duration: 3,
        staminaCost: 30,
        effects: {
            relationshipBonus: 10,
            loyaltyChange: 5,
            skillBonus: { chat: 1 },
        },
    },
    {
        id: 'TEAM_BUILDING',
        label: 'チームビルディング',
        description: 'チーム全体での交流イベント。協調性向上。',
        cost: 1,
        duration: 4,
        staminaCost: 15,
        effects: {
            relationshipBonus: 15,
            loyaltyChange: 3,
            skillBonus: { organizer: 1 },
        },
    },
    {
        id: 'LUNCH_MEETING',
        label: 'ランチミーティング',
        description: '昼食を取りながらの軽いミーティング。',
        cost: 0.1,
        duration: 1,
        staminaCost: 5,
        effects: {
            relationshipBonus: 5,
            skillBonus: { chat: 1 },
        },
    },
    {
        id: 'MENTORING',
        label: 'メンタリング',
        description: '後輩の指導。教えることで自分も学ぶ。',
        cost: 0,
        duration: 2,
        staminaCost: 10,
        effects: {
            skillBonus: { propose: 1, judgment: 1 },
            relationshipBonus: 8,
        },
        requirements: {
            minPosition: 'SENIOR',
        },
    },
    {
        id: 'CLUB_ACTIVITY',
        label: 'サークル活動',
        description: '社内サークルへの参加。リフレッシュ効果。',
        cost: 0,
        duration: 2,
        staminaCost: -10, // スタミナ回復
        effects: {
            staminaRecovery: 10,
            relationshipBonus: 5,
            skillBonus: { charm: 1 },
        },
    },
];

/**
 * 活動実行
 */
export function executeActivity(
    player: Character,
    activity: ActivityDefinition,
    participants: Character[]
): ActivityResult {
    const result: ActivityResult = {
        success: true,
        message: '',
        skillGains: [],
        relationshipChanges: [],
        loyaltyChange: 0,
        staminaChange: 0,
    };

    // スタミナチェック
    if (player.stamina.current < activity.staminaCost) {
        return {
            ...result,
            success: false,
            message: 'スタミナが足りません',
        };
    }

    // 費用チェック
    if (player.money < activity.cost) {
        return {
            ...result,
            success: false,
            message: '所持金が足りません',
        };
    }

    // スタミナ消費/回復
    const staminaChange = activity.effects.staminaRecovery
        ? activity.effects.staminaRecovery - activity.staminaCost
        : -activity.staminaCost;
    result.staminaChange = staminaChange;

    // スキル上昇（確率判定）
    if (activity.effects.skillBonus) {
        for (const [skill, bonus] of Object.entries(activity.effects.skillBonus)) {
            if (bonus && Math.random() < 0.5) { // 50%確率
                result.skillGains.push({ skill, amount: bonus });
            }
        }
    }

    // 関係性向上
    if (activity.effects.relationshipBonus && participants.length > 0) {
        for (const participant of participants) {
            if (participant.id !== player.id) {
                const change = activity.effects.relationshipBonus + Math.floor(Math.random() * 5);
                result.relationshipChanges.push({
                    characterId: participant.id,
                    change,
                });
            }
        }
    }

    // 忠誠度変化
    result.loyaltyChange = activity.effects.loyaltyChange || 0;

    // メッセージ生成
    const skillMsg = result.skillGains.length > 0
        ? `${result.skillGains.map(s => `${s.skill}+${s.amount}`).join(', ')}`
        : '';
    const relMsg = result.relationshipChanges.length > 0
        ? `${result.relationshipChanges.length}人との関係向上`
        : '';

    result.message = `${activity.label}に参加しました！${skillMsg ? ' ' + skillMsg : ''}${relMsg ? ' ' + relMsg : ''}`;

    return result;
}

/**
 * 活動ラベル取得
 */
export function getActivityLabel(id: ActivityType): string {
    const activity = ACTIVITIES.find(a => a.id === id);
    return activity?.label || id;
}
