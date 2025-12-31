/**
 * 名前生成ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { generateJapaneseName, generateJapaneseNames } from '../lib/generators/nameGenerator';

describe('Name Generator', () => {
    describe('generateJapaneseName', () => {
        it('should generate a valid Japanese name', () => {
            const name = generateJapaneseName('M');

            expect(name).toBeTruthy();
            expect(typeof name).toBe('string');
            expect(name.length).toBeGreaterThan(0);
        });

        it('should generate names for male', () => {
            const name = generateJapaneseName('M');
            expect(name).toBeTruthy();
        });

        it('should generate names for female', () => {
            const name = generateJapaneseName('F');
            expect(name).toBeTruthy();
        });

        it('should generate unique names', () => {
            const names = new Set<string>();
            for (let i = 0; i < 100; i++) {
                names.add(generateJapaneseName('M'));
            }
            // ほとんどがユニークなはず
            expect(names.size).toBeGreaterThan(80);
        });
    });

    describe('generateJapaneseNames', () => {
        it('should generate requested number of names', () => {
            const names = generateJapaneseNames(10, 'M');
            expect(names.length).toBe(10);
        });

        it('should generate unique names', () => {
            const names = generateJapaneseNames(50, 'F');
            const uniqueNames = new Set(names);
            expect(uniqueNames.size).toBe(50);
        });
    });
});
