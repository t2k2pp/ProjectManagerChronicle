/**
 * キャラクター特性（Traits）マスタ定義
 * 特性ごとの効果とゲームメカニクスへの影響
 */

/** 特性カテゴリ */
export type TraitCategory = 'WORK_STYLE' | 'PERSONALITY' | 'LIFE_STYLE' | 'SKILL_BONUS';

/** 特性効果タイプ */
export type TraitEffectType =
    | 'PROGRESS_MODIFIER'    // 進捗補正
    | 'QUALITY_MODIFIER'     // 品質補正
    | 'STAMINA_MODIFIER'     // スタミナ補正
    | 'RISK_MODIFIER'        // リスク補正
    | 'CHANGE_RESISTANCE'    // 変更抵抗
    | 'VACATION_DEMAND'      // 休暇要求
    | 'MORALE_MODIFIER'      // 士気補正
    | 'COST_MODIFIER';       // コスト補正

/** 特性定義 */
export interface TraitDefinition {
    id: string;
    name: string;
    description: string;
    category: TraitCategory;
    effects: TraitEffect[];
    conflictsWith?: string[];  // 相反する特性
}

/** 特性効果 */
export interface TraitEffect {
    type: TraitEffectType;
    value: number;  // 倍率または加算値
    condition?: string;  // 条件（例: "phase=RUSH", "week>10"）
}

/** 年齢タイプ */
export type AgeType = 'BURST' | 'ENDURANCE' | 'EFFICIENT';

/** 年齢タイプ定義 */
export interface AgeTypeDefinition {
    type: AgeType;
    name: string;
    ageRange: { min: number; max: number };
    staminaMax: number;
    staminaRecovery: number;
    progressBonus: number;
    description: string;
}

// ========================
// マスタデータ
// ========================

/** 年齢タイプマスタ */
export const AGE_TYPES: AgeTypeDefinition[] = [
    {
        type: 'BURST',
        name: '瞬発型',
        ageRange: { min: 22, max: 29 },
        staminaMax: 80,
        staminaRecovery: 20,
        progressBonus: 1.2,
        description: '短期集中に強い。スタミナ回復が早いが最大値は低め。',
    },
    {
        type: 'ENDURANCE',
        name: '持続型',
        ageRange: { min: 30, max: 44 },
        staminaMax: 100,
        staminaRecovery: 10,
        progressBonus: 1.0,
        description: 'バランス型。安定したパフォーマンスを発揮。',
    },
    {
        type: 'EFFICIENT',
        name: '省エネ型',
        ageRange: { min: 45, max: 65 },
        staminaMax: 60,
        staminaRecovery: 5,
        progressBonus: 0.8,
        description: '経験値を活かした効率的な働き方。短時間で成果を出す。',
    },
];

/** 特性マスタ */
export const TRAIT_DEFINITIONS: TraitDefinition[] = [
    // ワークスタイル系
    {
        id: 'planner',
        name: '計画重視型',
        description: '事前計画を重視し、急な変更に抵抗する',
        category: 'WORK_STYLE',
        effects: [
            { type: 'QUALITY_MODIFIER', value: 1.1 },
            { type: 'CHANGE_RESISTANCE', value: 0.7, condition: 'change=sudden' },
        ],
    },
    {
        id: 'flexible',
        name: '柔軟対応型',
        description: '急な変更にも柔軟に対応できる',
        category: 'WORK_STYLE',
        effects: [
            { type: 'CHANGE_RESISTANCE', value: 1.3, condition: 'change=sudden' },
            { type: 'QUALITY_MODIFIER', value: 0.95 },
        ],
        conflictsWith: ['planner'],
    },
    {
        id: 'perfectionist',
        name: '完璧主義',
        description: '品質にこだわるが時間がかかる',
        category: 'WORK_STYLE',
        effects: [
            { type: 'QUALITY_MODIFIER', value: 1.2 },
            { type: 'PROGRESS_MODIFIER', value: 0.85 },
        ],
    },
    {
        id: 'speedster',
        name: 'スピード重視',
        description: '作業が早いが品質が犠牲になりやすい',
        category: 'WORK_STYLE',
        effects: [
            { type: 'PROGRESS_MODIFIER', value: 1.2 },
            { type: 'QUALITY_MODIFIER', value: 0.9 },
        ],
        conflictsWith: ['perfectionist'],
    },

    // ライフスタイル系
    {
        id: 'vacation_lover',
        name: '休暇重視',
        description: '休暇を大切にし、長時間労働を嫌う',
        category: 'LIFE_STYLE',
        effects: [
            { type: 'VACATION_DEMAND', value: 1.5 },
            { type: 'MORALE_MODIFIER', value: 0.9, condition: 'policy=RUSH' },
        ],
    },
    {
        id: 'workaholic',
        name: 'ワーカホリック',
        description: '仕事に没頭しやすいが燃え尽き注意',
        category: 'LIFE_STYLE',
        effects: [
            { type: 'PROGRESS_MODIFIER', value: 1.15 },
            { type: 'STAMINA_MODIFIER', value: 0.9 },
        ],
        conflictsWith: ['vacation_lover'],
    },
    {
        id: 'money_lover',
        name: '報酬重視',
        description: '報酬に敏感。昇給で士気が大幅UP',
        category: 'LIFE_STYLE',
        effects: [
            { type: 'MORALE_MODIFIER', value: 1.2, condition: 'event=raise' },
            { type: 'MORALE_MODIFIER', value: 0.8, condition: 'event=no_bonus' },
        ],
    },

    // パーソナリティ系
    {
        id: 'leader',
        name: 'リーダー気質',
        description: 'チームを引っ張る。周囲の士気を上げる',
        category: 'PERSONALITY',
        effects: [
            { type: 'MORALE_MODIFIER', value: 1.1 },
        ],
    },
    {
        id: 'lone_wolf',
        name: '一匹狼',
        description: '単独作業を好む。チーム作業では効率低下',
        category: 'PERSONALITY',
        effects: [
            { type: 'PROGRESS_MODIFIER', value: 1.1, condition: 'team_size=1' },
            { type: 'PROGRESS_MODIFIER', value: 0.9, condition: 'team_size>3' },
        ],
        conflictsWith: ['leader'],
    },
    {
        id: 'optimist',
        name: '楽観主義',
        description: 'リスクを軽視しがちだが士気は高い',
        category: 'PERSONALITY',
        effects: [
            { type: 'MORALE_MODIFIER', value: 1.1 },
            { type: 'RISK_MODIFIER', value: 1.2 },
        ],
    },
    {
        id: 'pessimist',
        name: '悲観主義',
        description: 'リスクに敏感。問題を早期発見しやすい',
        category: 'PERSONALITY',
        effects: [
            { type: 'RISK_MODIFIER', value: 0.8 },
            { type: 'MORALE_MODIFIER', value: 0.95 },
        ],
        conflictsWith: ['optimist'],
    },
];

// ========================
// ヘルパー関数
// ========================

/**
 * 年齢からタイプを判定
 */
export function getAgeType(age: number): AgeTypeDefinition {
    for (const ageType of AGE_TYPES) {
        if (age >= ageType.ageRange.min && age <= ageType.ageRange.max) {
            return ageType;
        }
    }
    return AGE_TYPES[2]; // デフォルト: 省エネ型
}

/**
 * 特性IDから定義を取得
 */
export function getTraitDefinition(traitId: string): TraitDefinition | undefined {
    return TRAIT_DEFINITIONS.find(t => t.id === traitId);
}

/**
 * 特性リストから効果を集計
 */
export function calculateTraitEffects(
    traitIds: string[],
    effectType: TraitEffectType,
    condition?: string
): number {
    let multiplier = 1.0;

    for (const traitId of traitIds) {
        const trait = getTraitDefinition(traitId);
        if (!trait) continue;

        for (const effect of trait.effects) {
            if (effect.type !== effectType) continue;

            // 条件チェック
            if (effect.condition && condition !== effect.condition) continue;

            multiplier *= effect.value;
        }
    }

    return multiplier;
}

/**
 * 進捗補正を計算
 */
export function getProgressModifier(traitIds: string[], context?: string): number {
    return calculateTraitEffects(traitIds, 'PROGRESS_MODIFIER', context);
}

/**
 * 品質補正を計算
 */
export function getQualityModifier(traitIds: string[]): number {
    return calculateTraitEffects(traitIds, 'QUALITY_MODIFIER');
}

/**
 * リスク補正を計算
 */
export function getRiskModifier(traitIds: string[]): number {
    return calculateTraitEffects(traitIds, 'RISK_MODIFIER');
}

/**
 * 士気補正を計算
 */
export function getMoraleModifier(traitIds: string[], event?: string): number {
    return calculateTraitEffects(traitIds, 'MORALE_MODIFIER', event ? `event=${event}` : undefined);
}
