/**
 * 企業生成システム
 * 20社+5社（ベンチャー）の企業を生成
 */

import { v4 as uuidv4 } from 'uuid';
import type { Company, CompanyCategory, CompanyCulture } from '../../types';
import { generateCompanyName } from './companyNameGenerator';

/** シード値から再現可能な乱数生成器 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

/** 配列からランダムに選択 */
function pickRandom<T>(array: readonly T[], random: () => number): T {
    return array[Math.floor(random() * array.length)];
}

/** 範囲内のランダム整数 */
function randomInt(min: number, max: number, random: () => number): number {
    return Math.floor(random() * (max - min + 1)) + min;
}

/** 得意分野 */
const SPECIALTIES = [
    '金融', '医療', '官公庁', '製造', '流通', '通信',
    'Webサービス', 'ゲーム', 'インフラ', 'セキュリティ',
    'AI/ML', 'クラウド', 'モバイル', 'IoT', 'DX推進'
];

/** 企業文化を生成 */
function generateCulture(random: () => number, category: CompanyCategory): CompanyCulture {
    const workStyles = ['TRADITIONAL', 'BALANCED', 'FLEXIBLE'] as const;
    const hierarchies = ['STRICT', 'MODERATE', 'FLAT'] as const;
    const innovations = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as const;
    const trainings = ['MINIMAL', 'STANDARD', 'EXTENSIVE'] as const;

    // カテゴリに応じた傾向
    if (category === 'LARGE') {
        return {
            workStyle: random() > 0.7 ? 'BALANCED' : 'TRADITIONAL',
            hierarchy: random() > 0.8 ? 'MODERATE' : 'STRICT',
            innovation: random() > 0.7 ? 'MODERATE' : 'CONSERVATIVE',
            training: random() > 0.5 ? 'EXTENSIVE' : 'STANDARD',
        };
    } else if (category === 'VENTURE') {
        return {
            workStyle: random() > 0.3 ? 'FLEXIBLE' : 'BALANCED',
            hierarchy: random() > 0.3 ? 'FLAT' : 'MODERATE',
            innovation: random() > 0.2 ? 'AGGRESSIVE' : 'MODERATE',
            training: random() > 0.6 ? 'STANDARD' : 'MINIMAL',
        };
    } else {
        return {
            workStyle: pickRandom(workStyles, random),
            hierarchy: pickRandom(hierarchies, random),
            innovation: pickRandom(innovations, random),
            training: pickRandom(trainings, random),
        };
    }
}

/** 企業を1社生成 */
export function generateCompany(
    seed: number,
    category: CompanyCategory,
    startYear: number
): Company {
    const random = seededRandom(seed);
    const name = generateCompanyName(seed);

    // カテゴリに応じたパラメータ
    let employeeCount: number;
    let mobEmployeeCount: number;
    let revenue: number;
    let foundedYear: number;

    if (category === 'LARGE') {
        employeeCount = randomInt(50, 100, random);
        mobEmployeeCount = randomInt(5000, 20000, random);
        revenue = randomInt(1000, 10000, random); // 億円
        foundedYear = randomInt(1960, 1990, random);
    } else if (category === 'VENTURE') {
        employeeCount = randomInt(10, 30, random);
        mobEmployeeCount = randomInt(50, 200, random);
        revenue = randomInt(10, 100, random);
        foundedYear = randomInt(startYear - 5, startYear + 10, random);
    } else {
        employeeCount = randomInt(20, 60, random);
        mobEmployeeCount = randomInt(200, 2000, random);
        revenue = randomInt(50, 500, random);
        foundedYear = randomInt(1980, 2010, random);
    }

    // 得意分野を1-3個選択
    const numSpecialties = randomInt(1, 3, random);
    const specialties: string[] = [];
    for (let i = 0; i < numSpecialties; i++) {
        const specialty = pickRandom(SPECIALTIES, random);
        if (!specialties.includes(specialty)) {
            specialties.push(specialty);
        }
    }

    return {
        id: uuidv4(),
        name,
        foundedYear,
        category,
        employeeCount,
        mobEmployeeCount,
        revenue,
        culture: generateCulture(random, category),
        specialties,
        reputation: randomInt(40, 90, random),
        financialHealth: randomInt(50, 100, random),
        growthRate: (random() * 20 - 5) / 100, // -5% ~ +15%
        rivals: [],
        partners: [],
        isActive: true,
    };
}

/** 全企業を生成（大企業5社 + 中小15社） */
export function generateCompanies(
    baseSeed: number,
    startYear: number,
    largeCo: number = 5,
    mediumCo: number = 15
): Company[] {
    const companies: Company[] = [];
    let seed = baseSeed;

    // 大企業
    for (let i = 0; i < largeCo; i++) {
        companies.push(generateCompany(seed++, 'LARGE', startYear));
    }

    // 中小企業
    for (let i = 0; i < mediumCo; i++) {
        companies.push(generateCompany(seed++, 'MEDIUM', startYear));
    }

    // ライバル関係を設定（同カテゴリ内でランダムに）
    companies.forEach((company, idx) => {
        const sameCategory = companies.filter(
            (c, i) => c.category === company.category && i !== idx
        );
        if (sameCategory.length > 0) {
            const random = seededRandom(baseSeed + idx * 1000);
            const numRivals = Math.min(randomInt(1, 3, random), sameCategory.length);
            for (let i = 0; i < numRivals; i++) {
                const rival = pickRandom(sameCategory, random);
                if (!company.rivals.includes(rival.id)) {
                    company.rivals.push(rival.id);
                }
            }
        }
    });

    return companies;
}
