/**
 * プロジェクトイベントシステム
 * 仕様変更、トラブル、交渉イベントなど
 */

import type { Project, Task } from '../types';

/** イベントタイプ */
export type ProjectEventType =
    | 'SCOPE_CHANGE'      // 仕様変更
    | 'BUDGET_NEGOTIATION' // 予算交渉
    | 'DEADLINE_EXTENSION' // 納期延長
    | 'MEMBER_TROUBLE'     // メンバートラブル
    | 'CLIENT_COMPLAINT'   // クレーム
    | 'TECHNICAL_ISSUE';   // 技術的問題

/** イベント定義 */
export interface ProjectEvent {
    id: string;
    type: ProjectEventType;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresBattle: boolean;  // カードバトル必要
    options: {
        accept: { label: string; effect: ProjectEventEffect };
        reject: { label: string; effect: ProjectEventEffect };
        negotiate?: { label: string; triggerBattle: true };
    };
}

/** イベント効果 */
export interface ProjectEventEffect {
    budgetChange?: number;      // 予算変更（万円）
    scheduleChange?: number;    // 期間変更（週）
    qualityChange?: number;     // 品質変更（%）
    newTasks?: Partial<Task>[]; // 追加タスク
    reputationChange?: number;  // 評判変更
}

/** イベントテンプレート */
const EVENT_TEMPLATES: Omit<ProjectEvent, 'id'>[] = [
    {
        type: 'SCOPE_CHANGE',
        title: '仕様変更要求',
        description: 'クライアントから追加機能の実装を要求されました。',
        severity: 'HIGH',
        requiresBattle: true,
        options: {
            accept: {
                label: '受け入れる',
                effect: { budgetChange: 500, scheduleChange: 3, qualityChange: -5 }
            },
            reject: {
                label: '断る',
                effect: { reputationChange: -10 }
            },
            negotiate: {
                label: '交渉する',
                triggerBattle: true
            }
        }
    },
    {
        type: 'BUDGET_NEGOTIATION',
        title: '予算削減要求',
        description: '上層部からプロジェクト予算の削減を要求されました。',
        severity: 'MEDIUM',
        requiresBattle: true,
        options: {
            accept: {
                label: '受け入れる',
                effect: { budgetChange: -300, qualityChange: -10 }
            },
            reject: {
                label: '断る',
                effect: { reputationChange: -5 }
            },
            negotiate: {
                label: '交渉する',
                triggerBattle: true
            }
        }
    },
    {
        type: 'DEADLINE_EXTENSION',
        title: '納期前倒し要求',
        description: 'クライアントから納期を早めるよう要求されました。',
        severity: 'HIGH',
        requiresBattle: true,
        options: {
            accept: {
                label: '受け入れる',
                effect: { scheduleChange: -2, qualityChange: -15 }
            },
            reject: {
                label: '断る',
                effect: { reputationChange: -8 }
            },
            negotiate: {
                label: '交渉する',
                triggerBattle: true
            }
        }
    },
    {
        type: 'MEMBER_TROUBLE',
        title: 'メンバー離脱',
        description: '主要メンバーが体調不良で離脱しました。',
        severity: 'MEDIUM',
        requiresBattle: false,
        options: {
            accept: {
                label: '代替要員を探す',
                effect: { budgetChange: -100, scheduleChange: 1 }
            },
            reject: {
                label: '残りメンバーで対応',
                effect: { qualityChange: -10 }
            }
        }
    },
    {
        type: 'CLIENT_COMPLAINT',
        title: 'クレーム対応',
        description: 'クライアントから品質に関するクレームが入りました。',
        severity: 'HIGH',
        requiresBattle: true,
        options: {
            accept: {
                label: '全面対応',
                effect: { budgetChange: -200, scheduleChange: 2 }
            },
            reject: {
                label: '部分対応',
                effect: { reputationChange: -15, qualityChange: -5 }
            },
            negotiate: {
                label: '交渉する',
                triggerBattle: true
            }
        }
    },
    {
        type: 'TECHNICAL_ISSUE',
        title: '技術的問題発生',
        description: '重大なバグが発見され、対応が必要です。',
        severity: 'CRITICAL',
        requiresBattle: false,
        options: {
            accept: {
                label: '緊急対応',
                effect: { budgetChange: -150, scheduleChange: 1, qualityChange: 5 }
            },
            reject: {
                label: '次フェーズで対応',
                effect: { qualityChange: -20 }
            }
        }
    },
];

/**
 * リスクベースイベント発生チェック
 * プレイヤーの管理状況に応じてイベントが発生
 */
export function checkRandomEvent(
    project: Project,
    currentWeek: number,
    tasks?: { quality: number; riskFactor: number }[]
): ProjectEvent | null {
    /**
     * イベント発生確率はプロジェクト状態から計算
     * - SPI/CPI低下 → スケジュール/予算イベント発生
     * - 品質低下 → クレーム/技術問題発生
     * - リスク高タスク → トラブル発生
     */

    // 基本発生閾値（これを超えるとイベント発生）
    let eventScore = 0;
    let eventType: ProjectEventType | null = null;

    // 1. スケジュール遅延チェック（SPI < 0.9）
    if (project.evm && project.evm.spi < 0.9) {
        eventScore += (0.9 - project.evm.spi) * 50; // 最大25ポイント
        if (project.evm.spi < 0.8) {
            eventType = 'DEADLINE_EXTENSION';
        }
    }

    // 2. コスト超過チェック（CPI < 0.9）
    if (project.evm && project.evm.cpi < 0.9) {
        eventScore += (0.9 - project.evm.cpi) * 40; // 最大20ポイント
        if (project.evm.cpi < 0.8 && !eventType) {
            eventType = 'BUDGET_NEGOTIATION';
        }
    }

    // 3. 品質低下チェック
    const avgQuality = tasks && tasks.length > 0
        ? tasks.reduce((sum, t) => sum + t.quality, 0) / tasks.length
        : 80;
    if (avgQuality < 70) {
        eventScore += (70 - avgQuality) * 0.5; // 最大15ポイント
        if (!eventType) {
            eventType = avgQuality < 60 ? 'CLIENT_COMPLAINT' : 'TECHNICAL_ISSUE';
        }
    }

    // 4. 高リスクタスク存在チェック
    const highRiskCount = tasks
        ? tasks.filter(t => t.riskFactor > 70).length
        : 0;
    if (highRiskCount >= 2) {
        eventScore += highRiskCount * 5;
        if (!eventType) {
            eventType = 'MEMBER_TROUBLE';
        }
    }

    // 5. 進捗フェーズによる補正（後半ほどイベント顕在化）
    const progressRatio = currentWeek / Math.max(1, project.schedule.endWeek);
    eventScore *= (0.5 + progressRatio * 0.5); // 後半で最大1.0倍

    // 閾値判定（20以上でイベント発生）
    if (eventScore < 20) {
        return null;
    }

    // イベントタイプに基づいてテンプレート選択
    const template = EVENT_TEMPLATES.find(t => t.type === eventType)
        || EVENT_TEMPLATES.find(t => t.type === 'SCOPE_CHANGE')!;

    return {
        ...template,
        id: `event-${Date.now()}-${currentWeek}`,
    };
}

/**
 * イベント効果を適用
 */
export function applyEventEffect(
    project: Project,
    effect: ProjectEventEffect
): Project {
    return {
        ...project,
        budget: {
            ...project.budget,
            current: project.budget.current + (effect.budgetChange || 0),
        },
        schedule: {
            ...project.schedule,
            endWeek: project.schedule.endWeek + (effect.scheduleChange || 0),
        },
    };
}

/**
 * イベントタイプラベル
 */
export const EVENT_TYPE_LABELS: Record<ProjectEventType, string> = {
    SCOPE_CHANGE: '仕様変更',
    BUDGET_NEGOTIATION: '予算交渉',
    DEADLINE_EXTENSION: '納期調整',
    MEMBER_TROUBLE: 'メンバー問題',
    CLIENT_COMPLAINT: 'クレーム',
    TECHNICAL_ISSUE: '技術問題',
};

/**
 * 重要度ラベル
 */
export const SEVERITY_LABELS: Record<ProjectEvent['severity'], { label: string; color: string }> = {
    LOW: { label: '軽微', color: 'text-gray-400' },
    MEDIUM: { label: '中程度', color: 'text-yellow-400' },
    HIGH: { label: '重大', color: 'text-orange-400' },
    CRITICAL: { label: '緊急', color: 'text-red-400' },
};
