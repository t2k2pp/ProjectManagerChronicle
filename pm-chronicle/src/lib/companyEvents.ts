/**
 * 企業興亡システム
 * M&A、新興企業誕生、倒産処理
 */

import { v4 as uuidv4 } from 'uuid';
import type { Company, CompanyCategory, CompanyCulture } from '../types';

/** M&A結果 */
export interface MergerResult {
    acquirer: Company;
    acquired: Company;
    newName?: string;
    employeesTransferred: number;
}

/** 新興企業テンプレート */
const VENTURE_NAMES = [
    'テクノスフィア',
    'イノベーションラボ',
    'ディープテック',
    'スマートソリューションズ',
    'クラウドネクスト',
    'AIフロンティア',
    'デジタルシフト',
    'フューチャーテック',
];

const VENTURE_SPECIALTIES = [
    ['AI', 'Machine Learning'],
    ['Cloud', 'SaaS'],
    ['DX', 'IoT'],
    ['Security', 'FinTech'],
    ['Mobile', 'AR/VR'],
];

/**
 * 企業の財務健全性をチェック
 */
export function checkFinancialHealth(company: Company): {
    isHealthy: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    issues: string[];
} {
    const issues: string[] = [];
    let riskScore = 0;

    // 財務指標チェック
    if (company.financialHealth < 30) {
        issues.push('深刻な財務難');
        riskScore += 40;
    } else if (company.financialHealth < 50) {
        issues.push('財務状況悪化');
        riskScore += 20;
    }

    // 評判チェック
    if (company.reputation < 30) {
        issues.push('評判低下');
        riskScore += 15;
    }

    // 成長率チェック
    if (company.growthRate < -10) {
        issues.push('急激な縮小');
        riskScore += 25;
    } else if (company.growthRate < 0) {
        issues.push('マイナス成長');
        riskScore += 10;
    }

    const riskLevel = riskScore >= 50 ? 'CRITICAL'
        : riskScore >= 30 ? 'HIGH'
            : riskScore >= 15 ? 'MEDIUM'
                : 'LOW';

    return {
        isHealthy: riskScore < 30,
        riskLevel,
        issues,
    };
}

/**
 * M&A判定
 */
export function checkMergerOpportunity(
    companies: Company[],
    _currentYear: number
): MergerResult | null {
    // 財務難の企業を探す
    const strugglingCompanies = companies.filter(c => {
        const health = checkFinancialHealth(c);
        return health.riskLevel === 'CRITICAL' || health.riskLevel === 'HIGH';
    });

    if (strugglingCompanies.length === 0) return null;

    // 買収候補の健全企業を探す
    const healthyCompanies = companies.filter(c => {
        const health = checkFinancialHealth(c);
        return health.isHealthy && c.financialHealth > 70;
    });

    if (healthyCompanies.length === 0) return null;

    // ランダムで買収実行（10%確率）
    if (Math.random() > 0.1) return null;

    const acquired = strugglingCompanies[Math.floor(Math.random() * strugglingCompanies.length)];
    const acquirer = healthyCompanies[Math.floor(Math.random() * healthyCompanies.length)];

    // 同じ企業は除外
    if (acquired.id === acquirer.id) return null;

    return {
        acquirer,
        acquired,
        employeesTransferred: acquired.employeeCount,
    };
}

/**
 * 新興企業生成
 */
export function generateVentureCompany(currentYear: number): Company {
    const name = VENTURE_NAMES[Math.floor(Math.random() * VENTURE_NAMES.length)];
    const specialties = VENTURE_SPECIALTIES[Math.floor(Math.random() * VENTURE_SPECIALTIES.length)];

    const culture: CompanyCulture = {
        workStyle: 'FLEXIBLE',
        hierarchy: 'FLAT',
        innovation: 'AGGRESSIVE',
        training: Math.random() > 0.5 ? 'STANDARD' : 'MINIMAL',
    };

    const employeeCount = 5 + Math.floor(Math.random() * 20);

    return {
        id: uuidv4(),
        name: `${name}${currentYear % 100}`,
        category: 'VENTURE' as CompanyCategory,
        foundedYear: currentYear,
        employeeCount,
        mobEmployeeCount: Math.floor(employeeCount * 0.7),
        revenue: 100 + Math.floor(Math.random() * 500),
        financialHealth: 60 + Math.floor(Math.random() * 30),
        reputation: 30 + Math.floor(Math.random() * 30),
        growthRate: 10 + Math.floor(Math.random() * 30),
        culture,
        specialties,
        rivals: [],
        partners: [],
        isActive: true,
    };
}

/**
 * 年次企業イベント処理
 */
export function processAnnualCompanyEvents(
    companies: Company[],
    currentYear: number
): {
    mergers: MergerResult[];
    newVentures: Company[];
    bankruptcies: Company[];
} {
    const mergers: MergerResult[] = [];
    const newVentures: Company[] = [];
    const bankruptcies: Company[] = [];

    // M&Aチェック
    const mergerResult = checkMergerOpportunity(companies, currentYear);
    if (mergerResult) {
        mergers.push(mergerResult);
    }

    // 新興企業誕生（年1-2社）
    const ventureCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < ventureCount; i++) {
        newVentures.push(generateVentureCompany(currentYear));
    }

    // 倒産チェック
    for (const company of companies) {
        const health = checkFinancialHealth(company);
        if (health.riskLevel === 'CRITICAL' && Math.random() < 0.3) {
            bankruptcies.push(company);
        }
    }

    return { mergers, newVentures, bankruptcies };
}

/**
 * 企業財務更新（四半期）
 */
export function updateCompanyFinancials(company: Company): Company {
    // 成長率による変動
    const financialChange = (company.growthRate / 10) + (Math.random() * 10 - 5);
    const reputationChange = (Math.random() * 6 - 3);

    return {
        ...company,
        financialHealth: Math.max(0, Math.min(100, company.financialHealth + financialChange)),
        reputation: Math.max(0, Math.min(100, company.reputation + reputationChange)),
        employeeCount: Math.max(1, Math.round(company.employeeCount * (1 + company.growthRate / 100))),
    };
}
