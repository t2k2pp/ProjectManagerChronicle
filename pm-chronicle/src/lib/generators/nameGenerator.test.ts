/**
 * 名前生成ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { generateJapaneseName, generateJapaneseNames } from './nameGenerator';

describe('Name Generator', () => {
    describe('generateJapaneseName', () => {
        it('should generate a valid Japanese name', () => {
            const result = generateJapaneseName(12345, 'M');

            expect(result.name).toBeTruthy();
            expect(typeof result.name).toBe('string');
            expect(result.name.length).toBeGreaterThan(0);
        });

        it('should generate names for male', () => {
            const result = generateJapaneseName(12345, 'M');
            expect(result.name).toBeTruthy();
            expect(result.gender).toBe('M');
        });

        it('should generate names for female', () => {
            const result = generateJapaneseName(12345, 'F');
            expect(result.name).toBeTruthy();
            expect(result.gender).toBe('F');
        });

        it('should generate unique names with different seeds', () => {
            const names = new Set<string>();
            for (let i = 0; i < 100; i++) {
                const result = generateJapaneseName(i, 'M');
                names.add(result.name);
            }
            // ほとんどがユニークなはず
            expect(names.size).toBeGreaterThan(80);
        });
    });

    describe('generateJapaneseNames', () => {
        it('should generate requested number of names', () => {
            const names = generateJapaneseNames(10, 12345);
            expect(names.length).toBe(10);
        });

        it('should generate unique names', () => {
            const names = generateJapaneseNames(50, 67890);
            const uniqueNames = new Set(names.map(n => n.name));
            expect(uniqueNames.size).toBe(50);
        });
    });
});
