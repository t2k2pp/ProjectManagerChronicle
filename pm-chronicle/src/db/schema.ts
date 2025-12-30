/**
 * PM立志伝：プロジェクト・クロニクル
 * IndexedDB スキーマ定義 (Dexie.js)
 */

import Dexie, { type EntityTable } from 'dexie';
import type {
    Character,
    Company,
    Project,
    Task,
    WeeklyLog,
    WorldState,
    HistoricalEvent
} from '../types';

/** セーブスロット */
export interface SaveSlot {
    id: number;              // 1-5
    name: string;            // セーブ名
    createdAt: Date;
    updatedAt: Date;
    worldState: WorldState;
    playerCharacterId: string;
    currentProjectId?: string;
}

/** データベースクラス */
export class PMChronicleDB extends Dexie {
    saves!: EntityTable<SaveSlot, 'id'>;
    characters!: EntityTable<Character, 'id'>;
    companies!: EntityTable<Company, 'id'>;
    projects!: EntityTable<Project, 'id'>;
    tasks!: EntityTable<Task, 'id'>;
    logs!: EntityTable<WeeklyLog, 'id'>;
    historicalEvents!: EntityTable<HistoricalEvent, 'id'>;

    constructor() {
        super('pm_chronicle_db');

        this.version(1).stores({
            saves: 'id, updatedAt',
            characters: 'id, companyId, status, name',
            companies: 'id, category, isActive, name',
            projects: 'id, status',
            tasks: 'id, projectId, assigneeId, phase',
            logs: 'id, projectId, week, eventType',
            historicalEvents: 'id, year'
        });
    }
}

/** データベースインスタンス（シングルトン） */
export const db = new PMChronicleDB();

/** データベースの初期化確認 */
export async function initDB(): Promise<void> {
    try {
        await db.open();
        console.log('PM Chronicle DB initialized successfully');
    } catch (error) {
        console.error('Failed to initialize DB:', error);
        throw error;
    }
}

/** データベースのリセット（デバッグ用） */
export async function resetDB(): Promise<void> {
    await db.delete();
    await db.open();
    console.log('PM Chronicle DB reset successfully');
}
