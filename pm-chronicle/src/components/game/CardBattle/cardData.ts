/**
 * 交渉カードの型定義と基本データ
 */

/** カードタイプ */
export type CardType = 'ATTACK' | 'DEFENSE' | 'SPECIAL' | 'COUNTER';

/** カードレアリティ */
export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC';

/** 交渉カード */
export interface NegotiationCard {
    id: string;
    name: string;
    description: string;
    type: CardType;
    rarity: CardRarity;
    cost: number;
    power: number;
    effects?: CardEffect[];
    pmTip?: string; // PM学習用のヒント
}

/** カード効果タイプ（汎用 + PM特化） */
export type CardEffectType =
    // 汎用効果
    | 'DAMAGE'           // ダメージ（交渉ゲージ減少）
    | 'HEAL'             // 回復（交渉ゲージ回復）
    | 'BUFF'             // バフ（攻撃力UP）
    | 'DEBUFF'           // デバフ（相手攻撃力DOWN）
    | 'DRAW'             // ドロー（カードを引く）
    // PM特化効果
    | 'SCOPE_FREEZE'     // 仕様凍結（相手の追加要求を無効化）
    | 'TRADEOFF'         // トレードオフ（コスト↔スコープ交換）
    | 'ESCALATE'         // エスカレーション（上司の権限を使用）
    | 'BASELINE_CHANGE'  // ベースライン変更（計画再承認）
    | 'RISK_MITIGATION'; // リスク軽減（次のリスク発生確率減）

/** カード効果 */
export interface CardEffect {
    type: CardEffectType;
    value: number;
    target: 'SELF' | 'OPPONENT';
}

/** PM効果タイプのラベルと説明 */
export const PM_EFFECT_LABELS: Partial<Record<CardEffectType, { label: string; description: string }>> = {
    SCOPE_FREEZE: {
        label: '仕様凍結',
        description: '追加要求を一時的に無効化し、現在のスコープを守る'
    },
    TRADEOFF: {
        label: 'トレードオフ',
        description: 'コストと品質のバランスを取り、双方に譲歩させる'
    },
    ESCALATE: {
        label: 'エスカレーション',
        description: '上位マネジメントの権限で決定を強行する'
    },
    BASELINE_CHANGE: {
        label: 'ベースライン変更',
        description: '計画を再承認し、現状を新たな基準とする'
    },
    RISK_MITIGATION: {
        label: 'リスク軽減',
        description: '予防策を講じ、今後のリスク発生確率を下げる'
    },
};

/** 基本カードデッキ */
export const BASE_CARDS: NegotiationCard[] = [
    // 攻撃系
    {
        id: 'card-001',
        name: '論理的反論',
        description: '相手の主張に論理的に反論する',
        type: 'ATTACK',
        rarity: 'COMMON',
        cost: 1,
        power: 3,
    },
    {
        id: 'card-002',
        name: 'データ提示',
        description: '客観的なデータで説得力を高める',
        type: 'ATTACK',
        rarity: 'COMMON',
        cost: 2,
        power: 5,
    },
    {
        id: 'card-003',
        name: '先例引用',
        description: '過去の成功事例を引き合いに出す',
        type: 'ATTACK',
        rarity: 'UNCOMMON',
        cost: 2,
        power: 4,
        effects: [{ type: 'BUFF', value: 1, target: 'SELF' }],
    },
    {
        id: 'card-004',
        name: '経営層の意向',
        description: '上層部の方針を持ち出す',
        type: 'ATTACK',
        rarity: 'RARE',
        cost: 3,
        power: 8,
    },

    // 防御系
    {
        id: 'card-010',
        name: '検討させてください',
        description: '時間を稼いで態勢を立て直す',
        type: 'DEFENSE',
        rarity: 'COMMON',
        cost: 1,
        power: 3,
    },
    {
        id: 'card-011',
        name: '持ち帰り確認',
        description: '社内確認を理由に保留する',
        type: 'DEFENSE',
        rarity: 'COMMON',
        cost: 2,
        power: 5,
        effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    },
    {
        id: 'card-012',
        name: 'リスク説明',
        description: '潜在的なリスクを丁寧に説明する',
        type: 'DEFENSE',
        rarity: 'UNCOMMON',
        cost: 2,
        power: 4,
        effects: [{ type: 'DEBUFF', value: 1, target: 'OPPONENT' }],
    },

    // スペシャル系
    {
        id: 'card-020',
        name: 'Win-Win提案',
        description: '双方にメリットのある提案を行う',
        type: 'SPECIAL',
        rarity: 'RARE',
        cost: 3,
        power: 6,
        effects: [{ type: 'HEAL', value: 3, target: 'SELF' }],
    },
    {
        id: 'card-021',
        name: '妥協点発見',
        description: '落としどころを見つけて合意を得る',
        type: 'SPECIAL',
        rarity: 'UNCOMMON',
        cost: 2,
        power: 4,
        effects: [
            { type: 'DAMAGE', value: 2, target: 'OPPONENT' },
            { type: 'HEAL', value: 2, target: 'SELF' },
        ],
    },

    // カウンター系
    {
        id: 'card-030',
        name: '揚げ足取り',
        description: '相手の発言の矛盾を突く',
        type: 'COUNTER',
        rarity: 'UNCOMMON',
        cost: 2,
        power: 6,
    },
    {
        id: 'card-031',
        name: '議事録確認',
        description: '過去の合意事項を持ち出す',
        type: 'COUNTER',
        rarity: 'RARE',
        cost: 3,
        power: 8,
        effects: [{ type: 'DEBUFF', value: 2, target: 'OPPONENT' }],
    },

    // ★ PM特化カード
    {
        id: 'card-100',
        name: '仕様凍結宣言',
        description: '「これ以上の追加要求は受け付けません」と明言する',
        type: 'DEFENSE',
        rarity: 'EPIC',
        cost: 4,
        power: 6,
        effects: [{ type: 'SCOPE_FREEZE', value: 3, target: 'OPPONENT' }],
        pmTip: '💡 スコープクリープを防ぐため、適切なタイミングでの仕様凍結は重要です',
    },
    {
        id: 'card-101',
        name: 'トレードオフ提案',
        description: '「この機能を追加するなら、こちらを削りましょう」',
        type: 'SPECIAL',
        rarity: 'RARE',
        cost: 3,
        power: 5,
        effects: [
            { type: 'TRADEOFF', value: 2, target: 'OPPONENT' },
            { type: 'BUFF', value: 1, target: 'SELF' },
        ],
        pmTip: '💡 PMは常にスコープ・コスト・品質のトレードオフを意識しましょう',
    },
    {
        id: 'card-102',
        name: 'エスカレーション',
        description: '上位マネジメントにエスカレーションする',
        type: 'ATTACK',
        rarity: 'EPIC',
        cost: 5,
        power: 10,
        effects: [{ type: 'ESCALATE', value: 5, target: 'OPPONENT' }],
        pmTip: '💡 エスカレーションは最後の手段。使いすぎると信頼を失います',
    },
    {
        id: 'card-103',
        name: 'ベースライン改訂',
        description: '計画を見直し、現状を新たな基準とする',
        type: 'SPECIAL',
        rarity: 'RARE',
        cost: 3,
        power: 4,
        effects: [
            { type: 'BASELINE_CHANGE', value: 0, target: 'SELF' },
            { type: 'HEAL', value: 5, target: 'SELF' },
        ],
        pmTip: '💡 現実的でない計画に固執するより、適切なタイミングでの計画変更が重要です',
    },
    {
        id: 'card-104',
        name: 'リスク対策実施',
        description: '予防策を講じてリスクを軽減する',
        type: 'DEFENSE',
        rarity: 'UNCOMMON',
        cost: 2,
        power: 3,
        effects: [{ type: 'RISK_MITIGATION', value: 2, target: 'SELF' }],
        pmTip: '💡 リスクは発生する前に対策を打つことで影響を最小化できます',
    },
    {
        id: 'card-105',
        name: 'PMBOK引用',
        description: 'プロジェクトマネジメントの知識体系を持ち出す',
        type: 'ATTACK',
        rarity: 'RARE',
        cost: 3,
        power: 7,
        effects: [{ type: 'BUFF', value: 2, target: 'SELF' }],
        pmTip: '💡 PMBOKは説得力の源。ただし実践的なアプローチも忘れずに',
    },
];

/** カードタイプの色 */
export const CARD_TYPE_COLORS: Record<CardType, string> = {
    ATTACK: '#ef4444',
    DEFENSE: '#3b82f6',
    SPECIAL: '#8b5cf6',
    COUNTER: '#f59e0b',
};

/** カードタイプのラベル */
export const CARD_TYPE_LABELS: Record<CardType, string> = {
    ATTACK: '攻撃',
    DEFENSE: '防御',
    SPECIAL: '特殊',
    COUNTER: '反撃',
};

/** レアリティの色 */
export const RARITY_COLORS: Record<CardRarity, string> = {
    COMMON: '#9ca3af',
    UNCOMMON: '#22c55e',
    RARE: '#3b82f6',
    EPIC: '#a855f7',
};
