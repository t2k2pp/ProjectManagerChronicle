/**
 * 評判システム
 * 対人スキルによって技術スキルを脚色した評価
 */

import type { Character } from '../types';

/** 評判計算結果 */
export interface ReputationInfo {
    stars: 1 | 2 | 3 | 4 | 5;
    type: 'TECH' | 'SOCIAL' | 'BALANCED' | 'WILDCARD';
    typeLabel: string;
}

/**
 * キャラクターの社内評判を計算
 * - 技術スキルの平均が基本
 * - 対人スキル（魅力・話術）で補正
 * - 運で変動
 */
export function calcReputation(char: Character): ReputationInfo {
    // 技術スキル平均
    const blueValues = Object.values(char.statsBlue) as number[];
    const techAvg = blueValues.reduce((a, b) => a + b, 0) / blueValues.length;

    // 対人スキル補正 (0 ~ 0.4)
    const socialMod = (char.statsRed.charm + char.statsRed.chat) / 500;

    // 運による変動 (-0.1 ~ 0.1)
    const luckVar = (char.statsRed.luck - 50) / 500;

    // 評判スコア計算
    const rawScore = techAvg * (1 + socialMod + luckVar);

    // 1-5 スターに変換 (0-100 → 1-5)
    const stars = Math.min(5, Math.max(1, Math.round(rawScore / 20))) as 1 | 2 | 3 | 4 | 5;

    // タイプ判定
    const redValues = Object.values(char.statsRed) as number[];
    const redAvg = redValues.reduce((a, b) => a + b, 0) / redValues.length;

    let type: ReputationInfo['type'];
    let typeLabel: string;

    if (techAvg > redAvg + 15) {
        type = 'TECH';
        typeLabel = '技術派';
    } else if (redAvg > techAvg + 15) {
        type = 'SOCIAL';
        typeLabel = '調整派';
    } else if (char.statsRed.luck > 70) {
        type = 'WILDCARD';
        typeLabel = '風雲児';
    } else {
        type = 'BALANCED';
        typeLabel = 'バランス型';
    }

    return { stars, type, typeLabel };
}

/**
 * 経験年数を計算
 */
export function calcExperienceYears(char: Character, currentYear: number): number {
    return Math.max(0, currentYear - char.joinYear);
}

/**
 * 評判の星を表示文字列に変換
 */
export function getStarsDisplay(stars: number): string {
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

/**
 * 役職の日本語ラベル
 */
export function getPositionLabel(title: string): string {
    const labels: Record<string, string> = {
        MEMBER: 'メンバー',
        LEADER: 'リーダー',
        PM: 'PM',
        MANAGER: '課長',
        GM: '部長',
        DIRECTOR: '本部長',
        EXECUTIVE: '役員',
    };
    return labels[title] || title;
}
