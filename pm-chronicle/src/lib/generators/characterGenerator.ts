/**
 * NPC（キャラクター）生成システム
 * 800人以上の固有NPCを生成
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    Character,
    Company,
    StatsBlue,
    StatsRed,
    PositionTitle,
    EmploymentStatus,
    MarriageStatus
} from '../../types';
import { generateJapaneseName } from './nameGenerator';

/** シード値から再現可能な乱数生成器 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

/** 範囲内のランダム整数 */
function randomInt(min: number, max: number, random: () => number): number {
    return Math.floor(random() * (max - min + 1)) + min;
}

/** 配列からランダムに選択 */
function pickRandom<T>(array: readonly T[], random: () => number): T {
    return array[Math.floor(random() * array.length)];
}

/** 特性リスト */
const TRAITS = [
    'vacation_lover', 'money_lover', 'plan_oriented', 'work_lover',
    'night_owl', 'early_bird', 'perfectionist', 'pragmatist',
    'team_player', 'lone_wolf', 'risk_taker', 'cautious',
    'creative', 'analytical', 'communicator', 'introvert'
];

/** 技術スキル（時代別） */
const TECH_SKILLS: Record<string, string[]> = {
    '1990s': ['COBOL', 'C', 'Oracle', 'VB', 'RPG', 'Assembler', 'Fortran'],
    '2000s': ['Java', 'PHP', '.NET', 'C++', 'SQL Server', 'Linux', 'JavaScript'],
    '2010s': ['Swift', 'Kotlin', 'AWS', 'React', 'Angular', 'Docker', 'Git'],
    '2020s': ['Python', 'TypeScript', 'Kubernetes', 'Go', 'Rust', 'AI/ML', 'Next.js']
};

/** 役職から年齢範囲を推定 */
function getAgeRangeByPosition(position: PositionTitle): [number, number] {
    switch (position) {
        case 'NEWCOMER': return [22, 25];
        case 'MEMBER': return [23, 32];
        case 'SENIOR': return [26, 38];
        case 'LEADER': return [28, 42];
        case 'MANAGER': return [32, 50];
        case 'SENIOR_MANAGER': return [38, 55];
        case 'DIRECTOR': return [42, 58];
        case 'EXECUTIVE': return [45, 62];
        case 'VICE_PRESIDENT': return [48, 64];
        case 'PRESIDENT': return [45, 68];
        default: return [22, 60];
    }
}

/** ランダムなスキル値を生成 */
function generateStats(random: () => number, level: 'low' | 'mid' | 'high'): StatsBlue & StatsRed {
    const ranges: Record<string, [number, number]> = {
        low: [1, 5],
        mid: [3, 7],
        high: [5, 10]
    };
    const [min, max] = ranges[level];

    return {
        design: randomInt(min, max, random),
        develop: randomInt(min, max, random),
        test: randomInt(min, max, random),
        negotiation: randomInt(min, max, random),
        propose: randomInt(min, max, random),
        judgment: randomInt(min, max, random),
        admin: randomInt(min, max, random),
        organizer: randomInt(min, max, random),
        service: randomInt(min, max, random),
        chat: randomInt(min, max, random),
        charm: randomInt(min, max, random),
        luck: randomInt(1, 10, random),
    };
}

/** NPCを1人生成 */
export function generateNPC(
    seed: number,
    currentYear: number,
    company?: Company,
    forcedPosition?: PositionTitle
): Character {
    const random = seededRandom(seed);
    const { name, gender } = generateJapaneseName(seed);

    // 役職決定
    const positions: PositionTitle[] = [
        'NEWCOMER', 'MEMBER', 'MEMBER', 'MEMBER', 'SENIOR', 'SENIOR',
        'LEADER', 'LEADER', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR'
    ];
    const position = forcedPosition || pickRandom(positions, random);

    // 年齢決定
    const [minAge, maxAge] = getAgeRangeByPosition(position);
    const age = randomInt(minAge, maxAge, random);
    const birthYear = currentYear - age;

    // ステータスレベル決定
    const rankThresholds: Record<PositionTitle, 'low' | 'mid' | 'high'> = {
        'NEWCOMER': 'low',
        'MEMBER': 'low',
        'SENIOR': 'mid',
        'LEADER': 'mid',
        'MANAGER': 'mid',
        'SENIOR_MANAGER': 'high',
        'DIRECTOR': 'high',
        'EXECUTIVE': 'high',
        'VICE_PRESIDENT': 'high',
        'PRESIDENT': 'high'
    };
    const stats = generateStats(random, rankThresholds[position]);

    // 特性（1-3個）
    const numTraits = randomInt(1, 3, random);
    const traits: string[] = [];
    for (let i = 0; i < numTraits; i++) {
        const trait = pickRandom(TRAITS, random);
        if (!traits.includes(trait)) {
            traits.push(trait);
        }
    }

    // 技術スキル（時代に応じて）
    const era = currentYear < 2000 ? '1990s' : currentYear < 2010 ? '2000s' : currentYear < 2020 ? '2010s' : '2020s';
    const availableSkills = [...TECH_SKILLS[era]];
    if (era !== '1990s') availableSkills.push(...TECH_SKILLS['1990s'].slice(0, 3));
    const numSkills = randomInt(2, 5, random);
    const techSkills: string[] = [];
    for (let i = 0; i < numSkills; i++) {
        const skill = pickRandom(availableSkills, random);
        if (!techSkills.includes(skill)) {
            techSkills.push(skill);
        }
    }

    // 婚姻状態（年齢に応じて）
    let marriageStatus: MarriageStatus = 'SINGLE';
    if (age > 28) {
        const marriageChance = (age - 28) * 0.03;
        if (random() < marriageChance) {
            marriageStatus = 'MARRIED';
        }
    }

    // 役職ランク計算
    const positionRanks: Record<PositionTitle, number> = {
        'NEWCOMER': 1,
        'MEMBER': 2,
        'SENIOR': 3,
        'LEADER': 4,
        'MANAGER': 5,
        'SENIOR_MANAGER': 6,
        'DIRECTOR': 7,
        'EXECUTIVE': 8,
        'VICE_PRESIDENT': 9,
        'PRESIDENT': 10
    };

    // 入社年決定
    const workYears = age - 22;
    const joinYear = currentYear - Math.min(workYears, randomInt(1, workYears, random));

    return {
        id: uuidv4(),
        name,
        birthYear,
        gender: gender as 'M' | 'F' | 'OTHER',
        status: 'EMPLOYED' as EmploymentStatus,
        companyId: company?.id,
        position: {
            title: position,
            rank: positionRanks[position]
        },
        joinYear,
        statsBlue: {
            design: stats.design,
            develop: stats.develop,
            test: stats.test,
            negotiation: stats.negotiation,
            propose: stats.propose,
            judgment: stats.judgment,
        },
        statsRed: {
            admin: stats.admin,
            organizer: stats.organizer,
            service: stats.service,
            chat: stats.chat,
            charm: stats.charm,
            luck: stats.luck,
        },
        stamina: {
            current: 100,
            max: age < 30 ? 80 : age < 45 ? 100 : 60,
            recoveryRate: age < 30 ? 20 : age < 45 ? 10 : 5,
        },
        traits,
        techSkills,
        loyalty: randomInt(30, 90, random),
        ambition: randomInt(20, 80, random),
        relationships: [],
        marriageStatus,
        childCount: marriageStatus === 'MARRIED' ? randomInt(0, 2, random) : 0,
    };
}

/** 全NPC生成（800人以上） */
export function generateNPCs(
    baseSeed: number,
    companies: Company[],
    currentYear: number,
    targetCount: number = 800
): Character[] {
    const npcs: Character[] = [];
    let seed = baseSeed;

    // 各企業の社長を生成
    for (const company of companies) {
        const president = generateNPC(seed++, currentYear, company, 'PRESIDENT');
        npcs.push(president);
    }

    // 残りのNPCを企業に配分
    const remainingCount = targetCount - companies.length;
    const weights = companies.map(c => c.employeeCount);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    for (const company of companies) {
        const ratio = company.employeeCount / totalWeight;
        const companyNpcCount = Math.floor(remainingCount * ratio);

        for (let i = 0; i < companyNpcCount; i++) {
            const npc = generateNPC(seed++, currentYear, company);
            npcs.push(npc);
        }
    }

    // フリーランス生成（100人程度）
    const freelanceCount = Math.floor(targetCount * 0.1);
    for (let i = 0; i < freelanceCount; i++) {
        const npc = generateNPC(seed++, currentYear);
        npc.status = 'FREELANCE';
        npc.companyId = undefined;
        npcs.push(npc);
    }

    return npcs;
}
