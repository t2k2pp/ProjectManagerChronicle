/**
 * スタミナ計算ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import {
    calculateWeeklyStamina,
    calculateStaminaEfficiency,
    evaluateStaminaStatus
} from './staminaCalculator';
import type { Character } from '../../types';

// テスト用キャラクター
const createTestCharacter = (staminaCurrent: number): Character => ({
    id: 'test-1',
    name: 'テスト太郎',
    birthYear: 1990,
    gender: 'M',
    status: 'EMPLOYED',
    companyId: 'company-1',
    position: { title: 'MEMBER', rank: 2 },
    joinYear: 2015,
    statsBlue: { design: 5, develop: 5, test: 5, negotiation: 5, propose: 5, judgment: 5 },
    statsRed: { admin: 5, organizer: 5, service: 5, chat: 5, charm: 5, luck: 5 },
    stamina: { current: staminaCurrent, max: 100, recoveryRate: 10 },
    ageType: 'ENDURANCE',
    traits: [],
    techSkills: ['TypeScript'],
    loyalty: 50,
    ambition: 50,
    relationships: [],
    marriageStatus: 'SINGLE',
    childCount: 0,
    isAwakened: false,
    mood: 80,
    money: 100,
    certifications: [],
});

describe('Stamina Calculator', () => {
    describe('calculateWeeklyStamina', () => {
        it('should decrease stamina after normal work week', () => {
            const character = createTestCharacter(100);
            const result = calculateWeeklyStamina({ character });

            expect(result.staminaAfter).toBeLessThan(100);
            expect(result.burnoutRisk).toBe(false);
        });

        it('should recover stamina on vacation', () => {
            const character = createTestCharacter(50);
            const result = calculateWeeklyStamina({ character, vacation: true });

            expect(result.staminaAfter).toBeGreaterThan(50);
            expect(result.fatigue).toBe(0);
        });

        it('should show burnout risk when stamina is very low', () => {
            const character = createTestCharacter(15);
            const result = calculateWeeklyStamina({ character, overtime: true, pressure: 90 });

            expect(result.burnoutRisk).toBe(true);
        });
    });

    describe('calculateStaminaEfficiency', () => {
        it('should return 1.0 for high stamina', () => {
            expect(calculateStaminaEfficiency(80, 100)).toBe(1.0);
        });

        it('should return 0.8 for medium stamina', () => {
            expect(calculateStaminaEfficiency(50, 100)).toBe(0.8);
        });

        it('should return 0.5 for low stamina', () => {
            expect(calculateStaminaEfficiency(25, 100)).toBe(0.5);
        });

        it('should return 0.2 for critical stamina', () => {
            expect(calculateStaminaEfficiency(10, 100)).toBe(0.2);
        });
    });

    describe('evaluateStaminaStatus', () => {
        it('should return EXCELLENT for high stamina', () => {
            const character = createTestCharacter(90);
            const result = evaluateStaminaStatus(character);

            expect(result.status).toBe('EXCELLENT');
            expect(result.emoji).toBe('😊');
        });

        it('should return BURNOUT for very low stamina', () => {
            const character = createTestCharacter(10);
            const result = evaluateStaminaStatus(character);

            expect(result.status).toBe('BURNOUT');
        });
    });
});
