/**
 * EVM計算ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { calculateEVM, evaluateProjectHealth, type HealthStatus } from './evmCalculator';

describe('EVM Calculator', () => {
    describe('calculateEVM', () => {
        it('should calculate EVM values correctly', () => {
            const result = calculateEVM(100, 90, 95);

            expect(result.pv).toBe(100);
            expect(result.ev).toBe(90);
            expect(result.ac).toBe(95);
            expect(result.spi).toBeCloseTo(0.9);
            expect(result.cpi).toBeCloseTo(0.947, 2);
        });

        it('should handle zero AC gracefully', () => {
            const result = calculateEVM(100, 0, 0);

            expect(result.cpi).toBe(1); // デフォルト値
        });

        it('should handle zero PV gracefully', () => {
            const result = calculateEVM(0, 0, 0);

            expect(result.spi).toBe(1); // デフォルト値
        });
    });

    describe('evaluateProjectHealth', () => {
        it('should return EXCELLENT for high SPI and CPI', () => {
            const evm = calculateEVM(100, 110, 100);
            const result = evaluateProjectHealth(evm);
            expect(result.overall).toBe('EXCELLENT');
        });

        it('should return GOOD for normal values', () => {
            const evm = calculateEVM(100, 95, 100);
            const result = evaluateProjectHealth(evm);
            expect(result.overall).toBe('GOOD');
        });

        it('should return WARNING for low values', () => {
            const evm = calculateEVM(100, 75, 100);
            const result = evaluateProjectHealth(evm);
            expect(result.overall).toBe('WARNING');
        });

        it('should return CRITICAL for very low values', () => {
            const evm = calculateEVM(100, 60, 100);
            const result = evaluateProjectHealth(evm);
            expect(result.overall).toBe('CRITICAL');
        });
    });
});
