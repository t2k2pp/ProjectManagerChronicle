/**
 * リスク予兆アイコンコンポーネント
 */

interface RiskIndicatorProps {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const RISK_CONFIG = {
    LOW: { emoji: '✅', color: 'text-green-400', bg: 'bg-green-500/20', label: '順調' },
    MEDIUM: { emoji: '⚠️', color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: '注意' },
    HIGH: { emoji: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/20', label: '危険' },
    CRITICAL: { emoji: '💥', color: 'text-red-400', bg: 'bg-red-500/20', label: '緊急' },
};

const SIZE_CLASS = {
    sm: 'text-sm px-1.5 py-0.5',
    md: 'text-base px-2 py-1',
    lg: 'text-lg px-3 py-1.5',
};

export function RiskIndicator({ riskLevel, message, size = 'md' }: RiskIndicatorProps) {
    const config = RISK_CONFIG[riskLevel];

    return (
        <div
            className={`inline-flex items-center gap-1 rounded ${config.bg} ${SIZE_CLASS[size]}`}
            title={message || config.label}
        >
            <span>{config.emoji}</span>
            <span className={config.color}>{config.label}</span>
        </div>
    );
}

/**
 * リスクレベルを計算
 */
export function calculateRiskLevel(
    spi: number,
    cpi: number,
    staminaRatio: number
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // 複合リスク評価
    const scheduleRisk = spi < 0.8 ? 2 : spi < 0.9 ? 1 : 0;
    const costRisk = cpi < 0.8 ? 2 : cpi < 0.9 ? 1 : 0;
    const burnoutRisk = staminaRatio < 0.3 ? 2 : staminaRatio < 0.5 ? 1 : 0;

    const totalRisk = scheduleRisk + costRisk + burnoutRisk;

    if (totalRisk >= 5) return 'CRITICAL';
    if (totalRisk >= 3) return 'HIGH';
    if (totalRisk >= 1) return 'MEDIUM';
    return 'LOW';
}

/**
 * リスクメッセージを生成
 */
export function generateRiskMessage(
    spi: number,
    cpi: number,
    staminaRatio: number
): string {
    const messages: string[] = [];

    if (spi < 0.8) messages.push('スケジュール大幅遅延');
    else if (spi < 0.9) messages.push('スケジュール遅延気味');

    if (cpi < 0.8) messages.push('予算超過リスク高');
    else if (cpi < 0.9) messages.push('コスト効率低下');

    if (staminaRatio < 0.3) messages.push('チームバーンアウト危険');
    else if (staminaRatio < 0.5) messages.push('チーム疲労蓄積');

    return messages.length > 0 ? messages.join(' / ') : '問題なし';
}
