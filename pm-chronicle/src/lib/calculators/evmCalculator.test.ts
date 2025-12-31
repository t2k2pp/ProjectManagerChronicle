/**
 * EVM計算ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import { calculateEVM, calculateSPI, calculateCPI, getEVMStatus } from '../lib/calculators/evmCalculator';

describe('EVM Calculator', () => {
    describe('calculateEVM', () => {
        it('should calculate EVM values correctly', () => {
            const result = calculateEVM({
                pv: 100,
                ev: 90,
                ac: 95,
            });

            expect(result.pv).toBe(100);
            expect(result.ev).toBe(90);
            expect(result.ac).toBe(95);
            expect(result.spi).toBeCloseTo(0.9);
            expect(result.cpi).toBeCloseTo(0.947, 2);
        });

        it('should handle zero AC gracefully', () => {
            const result = calculateEVM({
                pv: 100,
                ev: 0,
                ac: 0,
            });

            expect(result.cpi).toBe(1); // デフォルト値
        });
    });

    describe('calculateSPI', () => {
        it('should calculate SPI correctly', () => {
            expect(calculateSPI(90, 100)).toBeCloseTo(0.9);
            expect(calculateSPI(100, 100)).toBe(1);
            expect(calculateSPI(110, 100)).toBeCloseTo(1.1);
        });

        it('should return 1 when PV is zero', () => {
            expect(calculateSPI(0, 0)).toBe(1);
        });
    });

    describe('calculateCPI', () => {
        it('should calculate CPI correctly', () => {
            expect(calculateCPI(100, 100)).toBe(1);
            expect(calculateCPI(100, 80)).toBeCloseTo(1.25);
            expect(calculateCPI(80, 100)).toBeCloseTo(0.8);
        });
    });

    describe('getEVMStatus', () => {
        it('should return EXCELLENT for high SPI and CPI', () => {
            expect(getEVMStatus(1.1, 1.1)).toBe('EXCELLENT');
        });

        it('should return GOOD for normal values', () => {
            expect(getEVMStatus(1.0, 1.0)).toBe('GOOD');
        });

        it('should return WARNING for low values', () => {
            expect(getEVMStatus(0.85, 0.85)).toBe('WARNING');
        });

        it('should return CRITICAL for very low values', () => {
            expect(getEVMStatus(0.7, 0.7)).toBe('CRITICAL');
        });
    });
});
