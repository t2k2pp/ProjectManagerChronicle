/**
 * プロジェクトリポジトリ
 */

import { db } from '../schema';
import type { Project, ProjectStatus } from '../../types';

export const projectRepository = {
    /** 全プロジェクト取得 */
    async findAll(): Promise<Project[]> {
        return await db.projects.toArray();
    },

    /** IDで取得 */
    async findById(id: string): Promise<Project | undefined> {
        return await db.projects.get(id);
    },

    /** ステータスで取得 */
    async findByStatus(status: ProjectStatus): Promise<Project[]> {
        return await db.projects.where('status').equals(status).toArray();
    },

    /** 作成 */
    async create(project: Project): Promise<string> {
        return await db.projects.add(project);
    },

    /** 更新 */
    async update(id: string, updates: Partial<Project>): Promise<void> {
        await db.projects.update(id, updates);
    },

    /** 削除 */
    async delete(id: string): Promise<void> {
        await db.projects.delete(id);
    },

    /** 全削除 */
    async clear(): Promise<void> {
        await db.projects.clear();
    }
};
