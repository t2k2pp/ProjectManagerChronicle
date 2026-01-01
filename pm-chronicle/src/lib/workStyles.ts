/**
 * 担当時代の働き方システム
 * 作業スタイルによるスキルアップ
 */

import type { Character, StatsBlue, StatsRed } from '../types';

/** 作業スタイル */
export type WorkStyle =
    | 'STUDY_SENIOR'   // 先輩に教わる
    | 'STUDY_BOOKS'    // 書籍/ネット
    | 'TRAINING'       // 研修受講
    | 'WORK_HARD';     // 黙々作業

/** 作業スタイル設定 */
interface WorkStyleConfig {
    label: string;
    description: string;
    cost: 'TIME' | 'LOW_COST' | 'HIGH_COST' | 'NONE';
    costAmount: number; // 万円単位、TIME場合は0
    efficiency: 'HIGH' | 'MEDIUM' | 'LOW';
    skillChance: number; // スキルアップ確率 (0-1)
    skillGainAmount: number; // スキル上昇量
    affectedSkills: 'BLUE_ONLY' | 'BLUE_AND_SOCIAL' | 'SPECIFIC';
}

/** 作業スタイル設定マップ */
export const WORK_STYLE_CONFIG: Record<WorkStyle, WorkStyleConfig> = {
    STUDY_SENIOR: {
        label: '先輩に教わる',
        description: '先輩社員に教えてもらいながら作業。対人スキルも上がる可能性あり。',
        cost: 'TIME',
        costAmount: 0,
        efficiency: 'HIGH',
        skillChance: 0.15, // 15%
        skillGainAmount: 1,
        affectedSkills: 'BLUE_AND_SOCIAL',
    },
    STUDY_BOOKS: {
        label: '書籍/ネットで調べる',
        description: '自分で調べながら作業。コストは低いが効率は中程度。',
        cost: 'LOW_COST',
        costAmount: 1, // 1万円
        efficiency: 'MEDIUM',
        skillChance: 0.08, // 8%
        skillGainAmount: 1,
        affectedSkills: 'BLUE_ONLY',
    },
    TRAINING: {
        label: '研修を受講',
        description: '時間外に有料研修を受講。確実にスキルアップ。',
        cost: 'HIGH_COST',
        costAmount: 10, // 10万円
        efficiency: 'LOW', // 業務時間外なので効率低
        skillChance: 0.80, // 80%（ほぼ確定）
        skillGainAmount: 3,
        affectedSkills: 'SPECIFIC',
    },
    WORK_HARD: {
        label: '黙々と作業',
        description: 'コストなしで集中。効率は普通だがスキルは運次第。',
        cost: 'NONE',
        costAmount: 0,
        efficiency: 'MEDIUM',
        skillChance: 0.03, // 3%
        skillGainAmount: 1,
        affectedSkills: 'BLUE_ONLY',
    },
};

/** スキルアップ結果 */
export interface SkillGainResult {
    success: boolean;
    skill?: keyof StatsBlue | keyof StatsRed;
    amount?: number;
    message: string;
}

/** 青スキルキー */
const BLUE_SKILLS: (keyof StatsBlue)[] = ['design', 'develop', 'test', 'negotiation', 'propose', 'judgment'];

/** 赤スキルキー（対人） */
const SOCIAL_SKILLS: (keyof StatsRed)[] = ['chat', 'charm'];

/**
 * ランダムで配列から1つ選択
 */
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 作業スタイルに基づいてスキルアップ抽選
 */
export function processWorkStyle(
    _char: Character,
    style: WorkStyle,
    targetSkill?: keyof StatsBlue
): SkillGainResult {
    const config = WORK_STYLE_CONFIG[style];

    // 抽選
    if (Math.random() > config.skillChance) {
        return {
            success: false,
            message: '今週はスキルアップしませんでした',
        };
    }

    // スキル選択
    let skill: keyof StatsBlue | keyof StatsRed;

    if (style === 'TRAINING' && targetSkill) {
        // 研修は指定スキル
        skill = targetSkill;
    } else if (config.affectedSkills === 'BLUE_AND_SOCIAL') {
        // 先輩：技術 + 対人
        const allSkills = [...BLUE_SKILLS, ...SOCIAL_SKILLS];
        skill = pickRandom(allSkills);
    } else {
        // 技術のみ
        skill = pickRandom(BLUE_SKILLS);
    }

    return {
        success: true,
        skill,
        amount: config.skillGainAmount,
        message: `${getSkillLabel(skill)}が ${config.skillGainAmount} 上がりました！`,
    };
}

/**
 * スキルラベル取得
 */
function getSkillLabel(skill: keyof StatsBlue | keyof StatsRed): string {
    const labels: Record<string, string> = {
        design: '設計',
        develop: '製造',
        test: '評価',
        negotiation: '折衝',
        propose: '提案',
        judgment: '判断',
        chat: '話術',
        charm: '魅力',
        admin: '事務',
        organizer: '幹事',
        service: '奉仕',
        luck: '運',
    };
    return labels[skill] || skill;
}
