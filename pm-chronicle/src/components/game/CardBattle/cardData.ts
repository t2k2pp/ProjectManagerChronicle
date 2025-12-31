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
    effects?: {
        type: 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'DRAW';
        value: number;
        target: 'SELF' | 'OPPONENT';
    }[];
}

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
