/**
 * Dexie.jsマイグレーション設定
 */

import { db } from './schema';

/**
 * マイグレーション履歴
 * 各バージョンでのスキーマ変更を記録
 */
export const MIGRATION_LOG = [
    { version: 1, date: '2024-01-01', changes: '初期スキーマ作成' },
    // 将来のマイグレーション
    // { version: 2, date: '2024-02-01', changes: 'キャラクターにスキルフィールド追加' },
];

/**
 * マイグレーション実行
 * Dexie.jsは自動的にバージョン管理を行うため、
 * 通常は明示的なマイグレーション処理は不要
 */
export async function runMigrations(): Promise<void> {
    // データベースを開く（存在しなければ作成）
    await db.open();

    // バージョンチェック
    const currentVersion = db.verno;
    console.log(`Database version: ${currentVersion}`);

    // 必要に応じてデータ変換処理を実行
    // 例: 古いデータ形式を新しい形式に変換
}

/**
 * データベースリセット（開発用）
 */
export async function resetDatabase(): Promise<void> {
    await db.delete();
    await db.open();
    console.log('Database reset complete');
}

/**
 * データベース接続状態を確認
 */
export function isDatabaseOpen(): boolean {
    return db.isOpen();
}

/**
 * データベース統計を取得
 */
export async function getDatabaseStats(): Promise<{
    saveSlots: number;
    characters: number;
    projects: number;
    weeklyLogs: number;
}> {
    const saveSlots = await db.saves.count();
    const characters = await db.characters.count();
    const projects = await db.projects.count();
    const weeklyLogs = await db.logs.count();

    return { saveSlots, characters, projects, weeklyLogs };
}
