/**
 * 企業リポジトリ
 */

import { db } from '../schema';
import type { Company, CompanyCategory } from '../../types';

export const companyRepository = {
    /** 全企業取得 */
    async findAll(): Promise<Company[]> {
        return await db.companies.toArray();
    },

    /** IDで取得 */
    async findById(id: string): Promise<Company | undefined> {
        return await db.companies.get(id);
    },

    /** アクティブな企業のみ取得 */
    async findActive(): Promise<Company[]> {
        return await db.companies.where('isActive').equals(1).toArray();
    },

    /** カテゴリで取得 */
    async findByCategory(category: CompanyCategory): Promise<Company[]> {
        return await db.companies.where('category').equals(category).toArray();
    },

    /** 作成 */
    async create(company: Company): Promise<string> {
        return await db.companies.add(company);
    },

    /** バッチ作成 */
    async createMany(companies: Company[]): Promise<void> {
        await db.companies.bulkAdd(companies);
    },

    /** 更新 */
    async update(id: string, updates: Partial<Company>): Promise<void> {
        await db.companies.update(id, updates);
    },

    /** 削除 */
    async delete(id: string): Promise<void> {
        await db.companies.delete(id);
    },

    /** 全削除 */
    async clear(): Promise<void> {
        await db.companies.clear();
    },

    /** 年商順ランキング取得 */
    async findRankedByRevenue(limit: number = 10): Promise<Company[]> {
        const companies = await db.companies.where('isActive').equals(1).toArray();
        return companies.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
    }
};
