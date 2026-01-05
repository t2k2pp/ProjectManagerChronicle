/**
 * 難易度設定ヘルパー
 * ゲーム難易度に応じたルール変更を管理
 */

/** ゲーム難易度 */
export type GameDifficulty = 'TRAINEE' | 'NORMAL' | 'DEATH_MARCH';

/** 難易度設定 */
export interface DifficultySettings {
    label: string;
    description: string;
    hintEnabled: boolean;         // ヒント機能の有無
    bossHelpEnabled: boolean;     // 上司サポートの有無
    policyRestricted: boolean;    // ポリシー制限の有無
    staminaRecoveryRate: number;  // スタミナ回復率
    riskMultiplier: number;       // リスク発生率倍率
    budgetMargin: number;         // 予算マージン
}

/** 難易度別設定 */
export const DIFFICULTY_CONFIGS: Record<GameDifficulty, DifficultySettings> = {
    TRAINEE: {
        label: '研修生',
        description: 'ヒント機能と上司サポートが利用可能',
        hintEnabled: true,
        bossHelpEnabled: true,
        policyRestricted: false,
        staminaRecoveryRate: 1.5,
        riskMultiplier: 0.5,
        budgetMargin: 1.2,
    },
    NORMAL: {
        label: 'PL',
        description: '標準的な難易度',
        hintEnabled: true,
        bossHelpEnabled: false,
        policyRestricted: false,
        staminaRecoveryRate: 1.0,
        riskMultiplier: 1.0,
        budgetMargin: 1.0,
    },
    DEATH_MARCH: {
        label: 'デスマーチ',
        description: 'ヒント無し、高リスク、厳しい予算',
        hintEnabled: false,
        bossHelpEnabled: false,
        policyRestricted: true,  // RUSHポリシー強制
        staminaRecoveryRate: 0.7,
        riskMultiplier: 1.5,
        budgetMargin: 0.8,
    },
};

/**
 * 難易度設定を取得
 */
export function getDifficultySettings(difficulty: GameDifficulty): DifficultySettings {
    return DIFFICULTY_CONFIGS[difficulty];
}

/**
 * ヒント機能が利用可能か判定
 */
export function isHintAvailable(difficulty: GameDifficulty): boolean {
    return DIFFICULTY_CONFIGS[difficulty].hintEnabled;
}

/**
 * 上司サポートが利用可能か判定
 */
export function isBossHelpAvailable(difficulty: GameDifficulty): boolean {
    return DIFFICULTY_CONFIGS[difficulty].bossHelpEnabled;
}

/**
 * リスク発生率を計算
 */
export function calculateRiskRate(baseRisk: number, difficulty: GameDifficulty): number {
    return baseRisk * DIFFICULTY_CONFIGS[difficulty].riskMultiplier;
}
