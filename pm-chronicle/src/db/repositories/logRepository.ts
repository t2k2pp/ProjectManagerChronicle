/**
 * ログリポジトリ
 */

import { db } from '../schema';
import type { WeeklyLog, EventType } from '../../types';

export const logRepository = {
    /** 全ログ取得 */
    async findAll(): Promise<WeeklyLog[]> {
        return await db.logs.toArray();
    },

    /** プロジェクトIDで取得 */
    async findByProject(projectId: string): Promise<WeeklyLog[]> {
        return await db.logs.where('projectId').equals(projectId).toArray();
    },

    /** 週とプロジェクトで取得 */
    async findByProjectAndWeek(projectId: string, week: number): Promise<WeeklyLog[]> {
        return await db.logs
            .where('[projectId+week]')
            .equals([projectId, week])
            .toArray();
    },

    /** イベントタイプで取得 */
    async findByEventType(eventType: EventType): Promise<WeeklyLog[]> {
        return await db.logs.where('eventType').equals(eventType).toArray();
    },

    /** 作成 */
    async create(log: WeeklyLog): Promise<string> {
        return await db.logs.add(log);
    },

    /** バッチ作成 */
    async createMany(logs: WeeklyLog[]): Promise<void> {
        await db.logs.bulkAdd(logs);
    },

    /** 全削除 */
    async clear(): Promise<void> {
        await db.logs.clear();
    }
};
