/**
 * モブ社員生成・管理システム
 * 背景キャラクターとして機能するNPC
 */

import { v4 as uuidv4 } from 'uuid';
import type { Character, Company, PositionTitle, StatsBlue, StatsRed, MarriageStatus, EmploymentStatus } from '../types';

/** モブ社員設定 */
interface MobConfig {
    minAge: number;
    maxAge: number;
    positionDistribution: Record<PositionTitle, number>; // 確率分布
}

const MOB_CONFIG: MobConfig = {
    minAge: 22,
    maxAge: 60,
    positionDistribution: {
        NEWCOMER: 0.15,
        MEMBER: 0.35,
        SENIOR: 0.20,
        LEADER: 0.15,
        MANAGER: 0.08,
        SENIOR_MANAGER: 0.04,
        DIRECTOR: 0.02,
        EXECUTIVE: 0.008,
        VICE_PRESIDENT: 0.001,
        PRESIDENT: 0.001,
    },
};

/** 名前生成用 */
const FAMILY_NAMES = [
    '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
    '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
];

const GIVEN_NAMES_M = [
    '太郎', '健一', '誠', '翔太', '大輔', '拓也', '直樹', '雄太', '亮', '大樹',
];

const GIVEN_NAMES_F = [
    '花子', '美咲', '愛', '遥', '彩香', '真由', '明日香', '美穂', '麻衣', '友美',
];

/**
 * ランダム値（min-max）
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 確率分布から選択
 */
function selectByDistribution<T extends string>(dist: Record<T, number>): T {
    const rand = Math.random();
    let cumulative = 0;
    for (const [key, prob] of Object.entries(dist) as [T, number][]) {
        cumulative += prob;
        if (rand < cumulative) return key;
    }
    return Object.keys(dist)[0] as T;
}

/**
 * モブ社員を1人生成
 */
export function generateMobEmployee(
    company: Company,
    currentYear: number
): Character {
    const age = randomInt(MOB_CONFIG.minAge, MOB_CONFIG.maxAge);
    const birthYear = currentYear - age;
    const gender = Math.random() > 0.7 ? 'F' : 'M'; // 30%女性

    const familyName = FAMILY_NAMES[randomInt(0, FAMILY_NAMES.length - 1)];
    const givenNames = gender === 'M' ? GIVEN_NAMES_M : GIVEN_NAMES_F;
    const givenName = givenNames[randomInt(0, givenNames.length - 1)];
    const name = `${familyName} ${givenName}`;

    // 役職決定（年齢補正）
    let position = selectByDistribution(MOB_CONFIG.positionDistribution);
    // 若い人は高い役職になりにくい
    if (age < 30 && ['MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'EXECUTIVE', 'VICE_PRESIDENT', 'PRESIDENT'].includes(position)) {
        position = 'MEMBER';
    }

    // 入社年
    const workYears = Math.min(age - 22, randomInt(1, Math.max(1, age - 22)));
    const joinYear = currentYear - workYears;

    // スキル（低〜中程度）
    const statsBlue: StatsBlue = {
        design: randomInt(20, 60),
        develop: randomInt(20, 60),
        test: randomInt(20, 60),
        negotiation: randomInt(20, 50),
        propose: randomInt(20, 50),
        judgment: randomInt(20, 50),
    };

    const statsRed: StatsRed = {
        admin: randomInt(20, 50),
        organizer: randomInt(20, 50),
        service: randomInt(20, 50),
        chat: randomInt(30, 70),
        charm: randomInt(30, 70),
        luck: randomInt(30, 70),
    };

    // 婚姻状態
    let marriageStatus: MarriageStatus = 'SINGLE';
    if (age >= 30) {
        marriageStatus = Math.random() < 0.5 ? 'MARRIED' : 'SINGLE';
    }

    const mob: Character = {
        id: uuidv4(),
        name,
        birthYear,
        gender,
        status: 'EMPLOYED' as EmploymentStatus,
        companyId: company.id,
        position: {
            title: position,
            rank: ['NEWCOMER', 'MEMBER', 'SENIOR', 'LEADER', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'EXECUTIVE', 'VICE_PRESIDENT', 'PRESIDENT'].indexOf(position) + 1,
        },
        joinYear,
        statsBlue,
        statsRed,
        stamina: {
            current: randomInt(60, 100),
            max: age < 40 ? 100 : 80,
            recoveryRate: age < 40 ? 15 : 10,
        },
        traits: [],
        techSkills: [],
        loyalty: randomInt(30, 80),
        ambition: randomInt(20, 60),
        relationships: [],
        marriageStatus,
        childCount: marriageStatus === 'MARRIED' ? randomInt(0, 2) : 0,
        isAwakened: false,    // モブは未覚醒
        mood: randomInt(50, 80), // モブ士気50-80
        money: 0,
        certifications: [],
    };

    return mob;
}

/**
 * 企業のモブ社員を一括生成
 */
export function generateMobEmployeesForCompany(
    company: Company,
    currentYear: number,
    count?: number
): Character[] {
    const targetCount = count ?? company.mobEmployeeCount;
    const mobs: Character[] = [];

    for (let i = 0; i < targetCount; i++) {
        mobs.push(generateMobEmployee(company, currentYear));
    }

    return mobs;
}

/**
 * 全企業のモブ社員を生成
 */
export function generateAllMobEmployees(
    companies: Company[],
    currentYear: number
): Character[] {
    const allMobs: Character[] = [];

    for (const company of companies) {
        const mobs = generateMobEmployeesForCompany(company, currentYear);
        allMobs.push(...mobs);
    }

    return allMobs;
}
