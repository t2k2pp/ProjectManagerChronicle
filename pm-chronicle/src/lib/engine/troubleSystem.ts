/**
 * トラブル発生判定
 * 設計書 3.1.3 準拠
 */

import type { Character, Task } from '../../types';

/** トラブルイベント */
export interface TroubleEvent {
    id: string;
    type: 'BUG' | 'REQUIREMENT_CHANGE' | 'SKILL_MISMATCH' | 'COMMUNICATION' | 'DEADLINE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    taskId: string;
    characterId: string;
    message: string;
    effect: {
        qualityDamage?: number;
        progressDamage?: number;
        costIncrease?: number;
        moraleDamage?: number;
    };
}

/** トラブルタイプ定義 */
const TROUBLE_TYPES: {
    type: TroubleEvent['type'];
    name: string;
    weight: number;
    baseSeverity: TroubleEvent['severity'];
    effect: TroubleEvent['effect'];
}[] = [
        {
            type: 'BUG',
            name: 'バグ発見',
            weight: 40,
            baseSeverity: 'MEDIUM',
            effect: { qualityDamage: 10, progressDamage: 5 },
        },
        {
            type: 'REQUIREMENT_CHANGE',
            name: '要件変更',
            weight: 20,
            baseSeverity: 'HIGH',
            effect: { progressDamage: 15, costIncrease: 100000 },
        },
        {
            type: 'SKILL_MISMATCH',
            name: 'スキル不足',
            weight: 15,
            baseSeverity: 'MEDIUM',
            effect: { qualityDamage: 15, progressDamage: 10 },
        },
        {
            type: 'COMMUNICATION',
            name: 'コミュニケーション問題',
            weight: 15,
            baseSeverity: 'LOW',
            effect: { moraleDamage: 10, progressDamage: 5 },
        },
        {
            type: 'DEADLINE',
            name: 'デッドライン圧力',
            weight: 10,
            baseSeverity: 'HIGH',
            effect: { moraleDamage: 15, qualityDamage: 10 },
        },
    ];

/**
 * トラブル発生判定
 * @param task 対象タスク
 * @param character 担当者
 * @param seed 乱数シード（オプション）
 * @returns トラブルイベント or null
 */
export function checkTrouble(
    task: Task,
    character: Character,
    seed?: number
): TroubleEvent | null {
    // 基礎発生率 = (100 - 品質スコア) / 100
    const baseRate = (100 - task.quality) / 100;

    // 幸運による軽減（最大50%軽減）
    const luckMitigation = character.statsRed.luck / 20;

    // 最終発生率
    const finalRate = baseRate * (1 - luckMitigation);

    // 乱数判定
    const random = seed !== undefined
        ? seededRandom(seed)
        : Math.random();

    if (random < finalRate) {
        return createTroubleEvent(task, character);
    }

    return null;
}

/**
 * トラブルイベント生成
 */
function createTroubleEvent(task: Task, character: Character): TroubleEvent {
    // 重み付きランダム選択
    const totalWeight = TROUBLE_TYPES.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedType = TROUBLE_TYPES[0];
    for (const troubleType of TROUBLE_TYPES) {
        random -= troubleType.weight;
        if (random <= 0) {
            selectedType = troubleType;
            break;
        }
    }

    // 重大度調整（タスクのリスク値に応じて）
    let severity = selectedType.baseSeverity;
    if (task.riskFactor > 60) {
        severity = upgradeSeverity(severity);
    }
    if (task.riskFactor > 80) {
        severity = upgradeSeverity(severity);
    }

    // 効果の倍率（重大度に応じて）
    const severityMultiplier = {
        'LOW': 0.5,
        'MEDIUM': 1.0,
        'HIGH': 1.5,
        'CRITICAL': 2.0,
    }[severity];

    const effect = { ...selectedType.effect };
    if (effect.qualityDamage) effect.qualityDamage *= severityMultiplier;
    if (effect.progressDamage) effect.progressDamage *= severityMultiplier;
    if (effect.costIncrease) effect.costIncrease *= severityMultiplier;
    if (effect.moraleDamage) effect.moraleDamage *= severityMultiplier;

    return {
        id: `trouble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: selectedType.type,
        severity,
        taskId: task.id,
        characterId: character.id,
        message: `${character.name}担当の「${task.name}」で${selectedType.name}が発生しました`,
        effect,
    };
}

/**
 * 重大度を1段階上げる
 */
function upgradeSeverity(severity: TroubleEvent['severity']): TroubleEvent['severity'] {
    const levels: TroubleEvent['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const index = levels.indexOf(severity);
    return levels[Math.min(index + 1, levels.length - 1)];
}

/**
 * シード付き乱数生成
 */
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * トラブルイベントの効果を適用
 */
export function applyTroubleEffect(
    trouble: TroubleEvent,
    task: Task,
    character: Character
): void {
    if (trouble.effect.qualityDamage) {
        task.quality = Math.max(0, task.quality - trouble.effect.qualityDamage);
    }
    if (trouble.effect.progressDamage) {
        task.progress = Math.max(0, task.progress - trouble.effect.progressDamage);
    }
    if (trouble.effect.moraleDamage) {
        character.mood = Math.max(0, character.mood - trouble.effect.moraleDamage);
    }
}

/**
 * 週次トラブルチェック（全タスク対象）
 */
export function checkWeeklyTroubles(
    tasks: Task[],
    characters: Character[],
    worldSeed: number
): TroubleEvent[] {
    const troubles: TroubleEvent[] = [];

    for (const task of tasks) {
        if (!task.assigneeId) continue;

        const character = characters.find(c => c.id === task.assigneeId);
        if (!character) continue;

        // タスクごとに異なるシードを使用
        const taskSeed = worldSeed + parseInt(task.id.replace(/\D/g, '').slice(0, 8) || '0', 10);
        const trouble = checkTrouble(task, character, taskSeed);

        if (trouble) {
            troubles.push(trouble);
        }
    }

    return troubles;
}
