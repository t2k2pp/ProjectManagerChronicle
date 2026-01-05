/**
 * 直感（Intuition）スキルシステム
 * リスク予兆の検知と可視化
 */

import type { Character, Task, Project } from '../../types';

/** リスク予兆 */
export interface RiskOmen {
    id: string;
    type: 'SCHEDULE' | 'QUALITY' | 'RESOURCE' | 'SCOPE' | 'COMMUNICATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    probability: number;  // 発現確率 0-1
    impact: number;       // 影響度 1-10
    detectedAt: number;   // 検知週
    visible: boolean;     // プレイヤーに見えるか
}

/** 直感スキルによる検知結果 */
export interface IntuitionResult {
    detected: RiskOmen[];
    hiddenCount: number;   // 検知できなかったリスク数
    intuitionBonus: number;  // judgment値によるボーナス
}

/**
 * 直感スキルによるリスク予兆検知
 */
export function detectRiskOmens(
    character: Character,
    tasks: Task[],
    project: Project,
    currentWeek: number
): IntuitionResult {
    const judgment = character.statsBlue.judgment;
    const intuitionBonus = judgment / 10;  // 0-1のボーナス

    const allOmens: RiskOmen[] = [];
    let hiddenCount = 0;

    // 1. スケジュールリスク検知
    const sv = (project.evm?.ev || 0) - (project.evm?.pv || 0);
    if (sv < -5000) {
        const omen: RiskOmen = {
            id: `schedule-${currentWeek}`,
            type: 'SCHEDULE',
            severity: sv < -20000 ? 'CRITICAL' : sv < -10000 ? 'HIGH' : 'MEDIUM',
            message: 'スケジュール遅延の兆候があります',
            probability: Math.min(1, Math.abs(sv) / 50000),
            impact: Math.min(10, Math.abs(sv) / 5000),
            detectedAt: currentWeek,
            visible: Math.random() < intuitionBonus + 0.3,
        };
        if (omen.visible) {
            allOmens.push(omen);
        } else {
            hiddenCount++;
        }
    }

    // 2. 品質リスク検知
    const avgQuality = tasks.reduce((sum, t) => sum + t.quality, 0) / (tasks.length || 1);
    if (avgQuality < 75) {
        const omen: RiskOmen = {
            id: `quality-${currentWeek}`,
            type: 'QUALITY',
            severity: avgQuality < 50 ? 'CRITICAL' : avgQuality < 60 ? 'HIGH' : 'MEDIUM',
            message: '品質低下の兆候があります',
            probability: Math.min(1, (100 - avgQuality) / 50),
            impact: Math.min(10, (100 - avgQuality) / 10),
            detectedAt: currentWeek,
            visible: Math.random() < intuitionBonus + 0.4,
        };
        if (omen.visible) {
            allOmens.push(omen);
        } else {
            hiddenCount++;
        }
    }

    // 3. リソースリスク検知（スタミナ低下）
    // characterのスタミナが低い場合
    if (character.stamina.current / character.stamina.max < 0.3) {
        const omen: RiskOmen = {
            id: `resource-${currentWeek}`,
            type: 'RESOURCE',
            severity: 'HIGH',
            message: 'チームメンバーの疲弊が見られます',
            probability: 0.7,
            impact: 6,
            detectedAt: currentWeek,
            visible: Math.random() < intuitionBonus + 0.5,
        };
        if (omen.visible) {
            allOmens.push(omen);
        } else {
            hiddenCount++;
        }
    }

    // 4. スコープリスク検知（タスク数増加）
    const remainingTasks = tasks.filter(t => t.progress < 100).length;
    const remainingWeeks = (project.schedule?.endWeek || 0) - currentWeek;
    if (remainingTasks > remainingWeeks * 2) {
        const omen: RiskOmen = {
            id: `scope-${currentWeek}`,
            type: 'SCOPE',
            severity: remainingTasks > remainingWeeks * 4 ? 'CRITICAL' : 'HIGH',
            message: '残タスク数が多く、スコープ調整の検討が必要です',
            probability: 0.6,
            impact: 8,
            detectedAt: currentWeek,
            visible: Math.random() < intuitionBonus + 0.2,
        };
        if (omen.visible) {
            allOmens.push(omen);
        } else {
            hiddenCount++;
        }
    }

    // 5. コミュニケーションリスク（プロジェクト進行中の問題）
    // 高リスクタスクが多い場合
    const highRiskTasks = tasks.filter(t => t.riskFactor > 70).length;
    if (highRiskTasks >= 3) {
        const omen: RiskOmen = {
            id: `communication-${currentWeek}`,
            type: 'COMMUNICATION',
            severity: 'MEDIUM',
            message: '高リスクタスクが複数あり、情報共有の強化が必要です',
            probability: 0.5,
            impact: 5,
            detectedAt: currentWeek,
            visible: Math.random() < intuitionBonus + 0.3,
        };
        if (omen.visible) {
            allOmens.push(omen);
        } else {
            hiddenCount++;
        }
    }

    return {
        detected: allOmens,
        hiddenCount,
        intuitionBonus,
    };
}

/**
 * リスク予兆の優先度でソート
 */
export function sortOmensByPriority(omens: RiskOmen[]): RiskOmen[] {
    const severityOrder: Record<RiskOmen['severity'], number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
    };

    return [...omens].sort((a, b) => {
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.impact - a.impact;
    });
}

/**
 * リスクタイプのラベル
 */
export const RISK_TYPE_LABELS: Record<RiskOmen['type'], string> = {
    SCHEDULE: 'スケジュール',
    QUALITY: '品質',
    RESOURCE: 'リソース',
    SCOPE: 'スコープ',
    COMMUNICATION: 'コミュニケーション',
};

/**
 * 重要度の色
 */
export const SEVERITY_COLORS: Record<RiskOmen['severity'], string> = {
    CRITICAL: '#dc2626',  // red-600
    HIGH: '#f59e0b',      // amber-500
    MEDIUM: '#eab308',    // yellow-500
    LOW: '#22c55e',       // green-500
};
