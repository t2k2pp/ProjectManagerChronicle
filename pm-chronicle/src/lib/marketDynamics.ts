/**
 * 市場変動システム
 * 時代による市場サイズ・スキル需要の変化
 */

import type { Company } from '../types';

/** 市場セクター */
export type MarketSector =
    | 'FINANCE'      // 金融
    | 'MANUFACTURING' // 製造
    | 'RETAIL'       // 小売
    | 'HEALTHCARE'   // 医療
    | 'GOVERNMENT'   // 公共
    | 'TECH'         // IT/テック
    | 'MEDIA';       // メディア

/** 市場状態 */
export interface MarketState {
    sector: MarketSector;
    size: number;        // 市場規模（相対値）
    growth: number;      // 成長率（%）
    demandSkills: string[]; // 需要スキル
    competitionLevel: number; // 競争激しさ（1-10）
}

/** 年代別市場トレンド */
const ERA_TRENDS: Record<string, {
    hotSectors: MarketSector[];
    coldSectors: MarketSector[];
    demandSkills: string[];
}> = {
    '1990s': {
        hotSectors: ['FINANCE', 'MANUFACTURING'],
        coldSectors: ['TECH'],
        demandSkills: ['COBOL', 'C', 'DB2', 'メインフレーム'],
    },
    '2000s': {
        hotSectors: ['FINANCE', 'TECH'],
        coldSectors: ['MANUFACTURING'],
        demandSkills: ['Java', 'Web', 'Oracle', 'ERP'],
    },
    '2010s': {
        hotSectors: ['TECH', 'RETAIL'],
        coldSectors: ['GOVERNMENT'],
        demandSkills: ['クラウド', 'モバイル', 'Python', 'AWS'],
    },
    '2020s': {
        hotSectors: ['TECH', 'HEALTHCARE'],
        coldSectors: ['RETAIL'],
        demandSkills: ['AI', 'ML', 'クラウド', 'セキュリティ', 'DX'],
    },
};

/**
 * 年代を取得
 */
function getEra(year: number): string {
    if (year < 2000) return '1990s';
    if (year < 2010) return '2000s';
    if (year < 2020) return '2010s';
    return '2020s';
}

/**
 * 市場状態を計算
 */
export function calculateMarketState(
    sector: MarketSector,
    currentYear: number
): MarketState {
    const era = getEra(currentYear);
    const trends = ERA_TRENDS[era] || ERA_TRENDS['2020s'];

    // 基本値
    let size = 100;
    let growth = 3;
    let competitionLevel = 5;

    // トレンドによる補正
    if (trends.hotSectors.includes(sector)) {
        size *= 1.3;
        growth += 5;
        competitionLevel += 2;
    }
    if (trends.coldSectors.includes(sector)) {
        size *= 0.7;
        growth -= 3;
        competitionLevel -= 1;
    }

    // ランダム変動（±10%）
    const randomFactor = 0.9 + Math.random() * 0.2;
    size *= randomFactor;

    return {
        sector,
        size: Math.round(size),
        growth: Math.round(growth * 10) / 10,
        demandSkills: trends.demandSkills,
        competitionLevel: Math.max(1, Math.min(10, competitionLevel)),
    };
}

/**
 * 全セクターの市場状態を取得
 */
export function getAllMarketStates(currentYear: number): MarketState[] {
    const sectors: MarketSector[] = [
        'FINANCE', 'MANUFACTURING', 'RETAIL',
        'HEALTHCARE', 'GOVERNMENT', 'TECH', 'MEDIA'
    ];
    return sectors.map(sector => calculateMarketState(sector, currentYear));
}

/**
 * 企業を市場状態で分類
 */
export function categorizeCompaniesByMarket(
    companies: Company[],
    marketStates: MarketState[]
): Map<MarketSector, Company[]> {
    const result = new Map<MarketSector, Company[]>();

    for (const state of marketStates) {
        result.set(state.sector, []);
    }

    // 企業の専門分野で分類（簡易版）
    for (const company of companies) {
        let sector: MarketSector = 'TECH'; // デフォルト

        // specialtiesから推定
        const specialties = company.specialties.join(' ').toLowerCase();
        if (specialties.includes('金融') || specialties.includes('fintech')) sector = 'FINANCE';
        else if (specialties.includes('製造') || specialties.includes('iot')) sector = 'MANUFACTURING';
        else if (specialties.includes('小売') || specialties.includes('ec')) sector = 'RETAIL';
        else if (specialties.includes('医療') || specialties.includes('health')) sector = 'HEALTHCARE';
        else if (specialties.includes('公共') || specialties.includes('gov')) sector = 'GOVERNMENT';
        else if (specialties.includes('メディア') || specialties.includes('media')) sector = 'MEDIA';

        result.get(sector)?.push(company);
    }

    return result;
}

/**
 * セクターラベル
 */
export const SECTOR_LABELS: Record<MarketSector, string> = {
    FINANCE: '金融',
    MANUFACTURING: '製造',
    RETAIL: '小売',
    HEALTHCARE: '医療',
    GOVERNMENT: '公共',
    TECH: 'IT/テック',
    MEDIA: 'メディア',
};
