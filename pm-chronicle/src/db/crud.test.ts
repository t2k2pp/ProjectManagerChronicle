/**
 * CRUD操作テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/schema';

describe('Database CRUD Operations', () => {
    beforeEach(async () => {
        // テスト前にデータクリア
        await db.characters.clear();
        await db.companies.clear();
        await db.projects.clear();
    });

    describe('Characters', () => {
        it('should create and read a character', async () => {
            const character = {
                id: 'test-char-1',
                name: 'テスト太郎',
                birthYear: 1990,
                gender: 'M' as const,
                status: 'EMPLOYED' as const,
                companyId: 'company-1',
                position: { title: 'MEMBER' as const, rank: 2 },
                joinYear: 2015,
                statsBlue: { design: 5, develop: 5, test: 5, negotiation: 5, propose: 5, judgment: 5 },
                statsRed: { admin: 5, organizer: 5, service: 5, chat: 5, charm: 5, luck: 5 },
                stamina: { current: 100, max: 100, recoveryRate: 10 },
                traits: ['努力家'],
                techSkills: ['TypeScript'],
                loyalty: 50,
                ambition: 50,
                relationships: [],
                marriageStatus: 'SINGLE' as const,
            };

            await db.characters.add(character);
            const retrieved = await db.characters.get('test-char-1');

            expect(retrieved).toBeDefined();
            expect(retrieved?.name).toBe('テスト太郎');
        });

        it('should update a character', async () => {
            const character = {
                id: 'test-char-2',
                name: '更新前',
                birthYear: 1990,
                gender: 'M' as const,
                status: 'EMPLOYED' as const,
                position: { title: 'MEMBER' as const, rank: 2 },
                joinYear: 2015,
                statsBlue: { design: 5, develop: 5, test: 5, negotiation: 5, propose: 5, judgment: 5 },
                statsRed: { admin: 5, organizer: 5, service: 5, chat: 5, charm: 5, luck: 5 },
                stamina: { current: 100, max: 100, recoveryRate: 10 },
                traits: [],
                techSkills: [],
                loyalty: 50,
                ambition: 50,
                relationships: [],
                marriageStatus: 'SINGLE' as const,
            };

            await db.characters.add(character);
            await db.characters.update('test-char-2', { name: '更新後' });

            const updated = await db.characters.get('test-char-2');
            expect(updated?.name).toBe('更新後');
        });

        it('should delete a character', async () => {
            await db.characters.add({
                id: 'test-char-3',
                name: '削除対象',
                birthYear: 1990,
                gender: 'M' as const,
                status: 'EMPLOYED' as const,
                position: { title: 'MEMBER' as const, rank: 2 },
                joinYear: 2015,
                statsBlue: { design: 5, develop: 5, test: 5, negotiation: 5, propose: 5, judgment: 5 },
                statsRed: { admin: 5, organizer: 5, service: 5, chat: 5, charm: 5, luck: 5 },
                stamina: { current: 100, max: 100, recoveryRate: 10 },
                traits: [],
                techSkills: [],
                loyalty: 50,
                ambition: 50,
                relationships: [],
                marriageStatus: 'SINGLE' as const,
            });

            await db.characters.delete('test-char-3');
            const deleted = await db.characters.get('test-char-3');

            expect(deleted).toBeUndefined();
        });
    });

    describe('Projects', () => {
        it('should create and list projects', async () => {
            await db.projects.add({
                id: 'project-1',
                name: 'テストプロジェクト',
                client: 'テストクライアント',
                budget: { initial: 1000, current: 1000 },
                schedule: { startWeek: 1, endWeek: 10, currentWeek: 1 },
                evm: { pv: 0, ev: 0, ac: 0, spi: 1, cpi: 1 },
                status: 'PLANNING' as const,
            });

            const projects = await db.projects.toArray();
            expect(projects.length).toBe(1);
            expect(projects[0].name).toBe('テストプロジェクト');
        });
    });
});
