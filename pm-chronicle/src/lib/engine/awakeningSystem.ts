/**
 * 覚醒（True Name）システム
 * キャラクターの覚醒条件判定と効果
 */

import type { Character, Project } from '../../types';

/** 覚醒条件 */
export interface AwakeningCondition {
    type: 'LOYALTY' | 'PROJECT_SUCCESS' | 'SKILL_MASTERY' | 'RELATIONSHIP' | 'CRISIS_OVERCOME';
    threshold: number;
    description: string;
}

/** 覚醒結果 */
export interface AwakeningResult {
    characterId: string;
    awakened: boolean;
    triggerCondition?: string;
    trueName?: string;
}

/** 覚醒条件閾値 */
const AWAKENING_THRESHOLDS = {
    LOYALTY_MIN: 90,           // 忠誠度90以上
    PROJECT_SUCCESS_COUNT: 3,   // 成功プロジェクト3つ以上
    SKILL_MASTERY_VALUE: 9,     // スキル値9以上が2つ
    RELATIONSHIP_STRENGTH: 80,  // 関係性強度80以上
};

/**
 * 覚醒条件をチェック
 */
export function checkAwakeningCondition(
    character: Character,
    completedProjects: Project[],
    _seed: number
): AwakeningResult {
    // 既に覚醒済みの場合はスキップ
    if (character.isAwakened) {
        return { characterId: character.id, awakened: false };
    }

    // 条件1: 高い忠誠度
    if (character.loyalty >= AWAKENING_THRESHOLDS.LOYALTY_MIN) {
        return {
            characterId: character.id,
            awakened: true,
            triggerCondition: `忠誠度${character.loyalty}達成`,
            trueName: generateTrueName(character, 'LOYALTY'),
        };
    }

    // 条件2: プロジェクト成功実績
    const successfulProjects = completedProjects.filter(p =>
        p.status === 'COMPLETED'
    );
    if (successfulProjects.length >= AWAKENING_THRESHOLDS.PROJECT_SUCCESS_COUNT) {
        return {
            characterId: character.id,
            awakened: true,
            triggerCondition: `${successfulProjects.length}プロジェクト成功`,
            trueName: generateTrueName(character, 'PROJECT_SUCCESS'),
        };
    }

    // 条件3: スキルマスタリー（高スキル値が複数）
    const highSkills = Object.values(character.statsBlue).filter(
        v => v >= AWAKENING_THRESHOLDS.SKILL_MASTERY_VALUE
    );
    if (highSkills.length >= 2) {
        return {
            characterId: character.id,
            awakened: true,
            triggerCondition: 'スキルマスタリー達成',
            trueName: generateTrueName(character, 'SKILL_MASTERY'),
        };
    }

    // 条件4: 強い対人関係
    const strongRelationships = character.relationships.filter(
        r => r.strength >= AWAKENING_THRESHOLDS.RELATIONSHIP_STRENGTH
    );
    if (strongRelationships.length >= 2) {
        return {
            characterId: character.id,
            awakened: true,
            triggerCondition: '信頼関係構築',
            trueName: generateTrueName(character, 'RELATIONSHIP'),
        };
    }

    return { characterId: character.id, awakened: false };
}

/**
 * True Nameを生成
 */
function generateTrueName(character: Character, triggerType: string): string {
    // 最も高いスキルを特定
    const blueSkills = Object.entries(character.statsBlue) as [string, number][];
    const topSkill = blueSkills.sort((a, b) => b[1] - a[1])[0];

    const skillTitles: Record<string, string> = {
        design: '設計の達人',
        develop: 'コードマスター',
        test: '品質の守護者',
        negotiation: '交渉の達人',
        propose: '提案の魔術師',
        judgment: '判断の賢者',
    };

    const triggerTitles: Record<string, string> = {
        LOYALTY: '忠義の',
        PROJECT_SUCCESS: '成功者',
        SKILL_MASTERY: '極めし者',
        RELATIONSHIP: '絆の',
    };

    const baseTitle = skillTitles[topSkill[0]] || '達人';
    const prefix = triggerTitles[triggerType] || '';

    return `${prefix}${baseTitle}`;
}

/**
 * キャラクターを覚醒させる
 */
export function awakenCharacter(character: Character, trueName: string): void {
    character.isAwakened = true;
    if (!character.hiddenData) {
        character.hiddenData = {
            trueName: trueName,
            trueStats: {},
            backstory: '',
        };
    } else {
        character.hiddenData.trueName = trueName;
    }
}

/**
 * 覚醒イベントを処理（年次シミュレーションから呼び出し）
 */
export function processAwakeningEvents(
    npcs: Character[],
    completedProjects: Project[],
    seed: number
): AwakeningResult[] {
    const results: AwakeningResult[] = [];

    for (const npc of npcs) {
        if (npc.isAwakened) continue;

        const result = checkAwakeningCondition(npc, completedProjects, seed);
        if (result.awakened && result.trueName) {
            awakenCharacter(npc, result.trueName);
            results.push(result);
        }
    }

    return results;
}
