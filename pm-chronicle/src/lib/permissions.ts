/**
 * 役職権限システム
 * 役職によって操作可能な範囲を制限
 */

import type { Character } from '../types';

/** 役職ランク */
export type PositionRank = 'MEMBER' | 'LEADER' | 'PM' | 'MANAGER' | 'GM' | 'DIRECTOR' | 'EXECUTIVE';

/** 権限タイプ */
export type PermissionType =
    | 'ASSIGN_TASK'      // タスクアサイン
    | 'CHANGE_PLAN'      // 計画変更
    | 'ACQUIRE_PROJECT'  // 案件獲得
    | 'MANAGE_BUDGET'    // 予算管理
    | 'TRAIN_SELF'       // 自己研修
    | 'TRAIN_OTHERS'     // 他者研修
    | 'VIEW_SKILL_DETAIL'; // スキル詳細閲覧

/** 役職別権限マップ */
const PERMISSION_MAP: Record<PositionRank, PermissionType[]> = {
    MEMBER: ['TRAIN_SELF'],
    LEADER: ['TRAIN_SELF', 'ASSIGN_TASK'], // 担当タスクのみ
    PM: ['TRAIN_SELF', 'ASSIGN_TASK', 'CHANGE_PLAN', 'VIEW_SKILL_DETAIL'],
    MANAGER: ['TRAIN_SELF', 'TRAIN_OTHERS', 'ASSIGN_TASK', 'CHANGE_PLAN', 'ACQUIRE_PROJECT', 'MANAGE_BUDGET', 'VIEW_SKILL_DETAIL'],
    GM: ['TRAIN_SELF', 'TRAIN_OTHERS', 'ASSIGN_TASK', 'CHANGE_PLAN', 'ACQUIRE_PROJECT', 'MANAGE_BUDGET', 'VIEW_SKILL_DETAIL'],
    DIRECTOR: ['TRAIN_SELF', 'TRAIN_OTHERS', 'ASSIGN_TASK', 'CHANGE_PLAN', 'ACQUIRE_PROJECT', 'MANAGE_BUDGET', 'VIEW_SKILL_DETAIL'],
    EXECUTIVE: ['TRAIN_SELF', 'TRAIN_OTHERS', 'ASSIGN_TASK', 'CHANGE_PLAN', 'ACQUIRE_PROJECT', 'MANAGE_BUDGET', 'VIEW_SKILL_DETAIL'],
};

/** 役職ランク数値変換 */
const RANK_VALUES: Record<PositionRank, number> = {
    MEMBER: 1,
    LEADER: 2,
    PM: 3,
    MANAGER: 4,
    GM: 5,
    DIRECTOR: 6,
    EXECUTIVE: 7,
};

/**
 * キャラクターが特定の権限を持っているかチェック
 */
export function hasPermission(char: Character, permission: PermissionType): boolean {
    const rank = char.position.title as PositionRank;
    const permissions = PERMISSION_MAP[rank] || PERMISSION_MAP.MEMBER;
    return permissions.includes(permission);
}

/**
 * キャラクターの役職ランクを取得
 */
export function getPositionRank(char: Character): PositionRank {
    return (char.position.title as PositionRank) || 'MEMBER';
}

/**
 * 役職ランクを数値で比較
 */
export function getRankValue(rank: PositionRank): number {
    return RANK_VALUES[rank] || 1;
}

/**
 * 役職がPM以上かチェック
 */
export function isPMOrAbove(char: Character): boolean {
    return getRankValue(getPositionRank(char)) >= RANK_VALUES.PM;
}

/**
 * 役職がリーダー以上かチェック
 */
export function isLeaderOrAbove(char: Character): boolean {
    return getRankValue(getPositionRank(char)) >= RANK_VALUES.LEADER;
}

/**
 * 役職の日本語ラベル
 */
export const POSITION_LABELS: Record<PositionRank, string> = {
    MEMBER: 'メンバー',
    LEADER: 'リーダー',
    PM: 'PM',
    MANAGER: '課長',
    GM: '部長',
    DIRECTOR: '本部長',
    EXECUTIVE: '役員',
};

/**
 * キャラクターの役職日本語名を取得
 */
export function getPositionLabelFromChar(char: Character): string {
    const rank = getPositionRank(char);
    return POSITION_LABELS[rank] || char.position.title;
}
