/**
 * ワールド生成システム
 * ゲーム開始時の初期ワールドを生成
 */

import { v4 as uuidv4 } from 'uuid';
import type { WorldState, IndustryState } from '../../types';
import { generateCompanies } from '../generators/companyGenerator';
import { generateNPCs } from '../generators/characterGenerator';
import {
    getEventsUntil,
    getEra,
    getTrendingSkillsForEra,
    getDecliningSkillsForEra
} from '../events/historicalEvents';

/** ワールド生成オプション */
export interface WorldGenerationOptions {
    seed?: number;
    startYear: number;
    largeCompanyCount?: number;
    mediumCompanyCount?: number;
    npcCount?: number;
}

/** シード値生成 */
function generateSeed(): number {
    return Math.floor(Math.random() * 2147483647);
}

/** 初期ワールド生成 */
export function generateWorld(options: WorldGenerationOptions): WorldState {
    const seed = options.seed ?? generateSeed();
    const startYear = options.startYear;
    const largeCount = options.largeCompanyCount ?? 5;
    const mediumCount = options.mediumCompanyCount ?? 15;
    const npcCount = options.npcCount ?? 800;

    // 企業生成
    const companies = generateCompanies(seed, startYear, largeCount, mediumCount);

    // NPC生成
    const allNpcs = generateNPCs(seed + 100000, companies, startYear, npcCount);

    // 雇用状態で分類
    const npcs = allNpcs.filter(n => n.status === 'EMPLOYED');
    const freelancers = allNpcs.filter(n => n.status === 'FREELANCE');
    const retiredNpcs = allNpcs.filter(n => n.status === 'RETIRED');

    // 業界状態
    const era = getEra(startYear);
    const industryState: IndustryState = {
        totalMarketSize: calculateMarketSize(startYear),
        trendingSkills: getTrendingSkillsForEra(era),
        decliningSkills: getDecliningSkillsForEra(era),
    };

    // 過去イベント
    const pastEvents = getEventsUntil(startYear);

    return {
        seed,
        startYear,
        currentYear: startYear,
        currentWeek: 1,
        companies,
        npcs,
        freelancers,
        retiredNpcs,
        industryState,
        pastEvents,
    };
}

/** 年代に応じた市場規模を計算（兆円） */
function calculateMarketSize(year: number): number {
    // 1990年を基準に成長
    const baseSize = 5; // 1990年: 5兆円
    const yearsFromBase = year - 1990;

    // 年平均5%成長（複利）
    const growthRate = 0.05;
    const size = baseSize * Math.pow(1 + growthRate, yearsFromBase);

    return Math.round(size * 10) / 10;
}

/** プレイヤーキャラクター設定 */
export interface PlayerSetupOptions {
    name: string;
    gender: 'M' | 'F' | 'OTHER';
    startType: 'FRESH_GRADUATE' | 'MID_CAREER' | 'FREELANCE';
    companyId?: string; // フリーランスの場合はnull
    initialStats?: {
        statsBlue: Partial<Record<string, number>>;
        statsRed: Partial<Record<string, number>>;
    };
}

/** プレイヤーNPCを作成 */
export function createPlayerCharacter(
    worldState: WorldState,
    options: PlayerSetupOptions
): import('../../types').Character {
    const playerId = uuidv4();
    const currentYear = worldState.currentYear;

    // 開始タイプに応じた年齢
    let birthYear: number;
    switch (options.startType) {
        case 'FRESH_GRADUATE':
            birthYear = currentYear - 22;
            break;
        case 'MID_CAREER':
            birthYear = currentYear - 35;
            break;
        case 'FREELANCE':
            birthYear = currentYear - 30;
            break;
    }

    // 基本能力値
    const defaultBlue = { design: 3, develop: 3, test: 3, negotiation: 3, propose: 3, judgment: 3 };
    const defaultRed = { admin: 3, organizer: 3, service: 3, chat: 3, charm: 3, luck: 5 };

    const statsBlue = { ...defaultBlue, ...options.initialStats?.statsBlue };
    const statsRed = { ...defaultRed, ...options.initialStats?.statsRed };

    // 新卒は低能力、中途は中能力
    if (options.startType === 'FRESH_GRADUATE') {
        Object.keys(statsBlue).forEach(k => {
            statsBlue[k as keyof typeof statsBlue] = Math.max(1, (statsBlue[k as keyof typeof statsBlue] || 1) - 1);
        });
    }

    const playerCharacter: import('../../types').Character = {
        id: playerId,
        name: options.name,
        birthYear,
        gender: options.gender,
        status: options.startType === 'FREELANCE' ? 'FREELANCE' : 'EMPLOYED',
        companyId: options.companyId,
        position: {
            title: options.startType === 'FRESH_GRADUATE' ? 'NEWCOMER' :
                options.startType === 'MID_CAREER' ? 'SENIOR' : 'MEMBER',
            rank: options.startType === 'FRESH_GRADUATE' ? 1 :
                options.startType === 'MID_CAREER' ? 3 : 2,
        },
        joinYear: currentYear,
        statsBlue,
        statsRed,
        stamina: {
            current: 100,
            max: 100,
            recoveryRate: options.startType === 'FRESH_GRADUATE' ? 20 : 15,
        },
        traits: [],
        techSkills: getTrendingSkillsForEra(getEra(currentYear)).slice(0, 3),
        loyalty: 50,
        ambition: 50,
        relationships: [],
        marriageStatus: 'SINGLE',
        childCount: 0,
        money: 50, // 初期所持金（新卒の貯金）
        certifications: [], // 初期資格なし
    };

    return playerCharacter;
}

