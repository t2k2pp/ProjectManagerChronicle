/**
 * キャラクターリポジトリ
 */

import { db } from '../schema';
import type { Character, EmploymentStatus } from '../../types';

export const characterRepository = {
    /** 全キャラクター取得 */
    async findAll(): Promise<Character[]> {
        return await db.characters.toArray();
    },

    /** IDで取得 */
    async findById(id: string): Promise<Character | undefined> {
        return await db.characters.get(id);
    },

    /** 企業所属のキャラクター取得 */
    async findByCompany(companyId: string): Promise<Character[]> {
        return await db.characters.where('companyId').equals(companyId).toArray();
    },

    /** フリーランス取得 */
    async findFreelancers(): Promise<Character[]> {
        return await db.characters.where('status').equals('FREELANCE').toArray();
    },

    /** ステータスで取得 */
    async findByStatus(status: EmploymentStatus): Promise<Character[]> {
        return await db.characters.where('status').equals(status).toArray();
    },

    /** 作成 */
    async create(character: Character): Promise<string> {
        return await db.characters.add(character);
    },

    /** バッチ作成 */
    async createMany(characters: Character[]): Promise<void> {
        await db.characters.bulkAdd(characters);
    },

    /** 更新 */
    async update(id: string, updates: Partial<Character>): Promise<void> {
        await db.characters.update(id, updates);
    },

    /** 削除 */
    async delete(id: string): Promise<void> {
        await db.characters.delete(id);
    },

    /** 全削除 */
    async clear(): Promise<void> {
        await db.characters.clear();
    },

    /** カウント */
    async count(): Promise<number> {
        return await db.characters.count();
    }
};
