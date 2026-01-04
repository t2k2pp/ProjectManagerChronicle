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
 * ランダムイベント発生チェック
 */
export function checkRandomEvent(
    project: Project,
    currentWeek: number
): ProjectEvent | null {
    // 発生確率（週ごとに10%）
    if (Math.random() > 0.1) return null;

    // プロジェクト後半ほどイベント発生しやすい
    const progressRatio = currentWeek / project.schedule.endWeek;
    if (progressRatio < 0.2 && Math.random() > 0.3) return null;

    // ランダムにイベント選択
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];

    return {
        ...template,
        id: `event-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
