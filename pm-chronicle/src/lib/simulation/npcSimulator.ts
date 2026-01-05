/**
 * NPCシミュレーションシステム
 * NPC・企業の動態をシミュレート
 */

import type { Character, Company, PositionTitle } from '../../types';
import { getEra, getDecliningSkillsForEra } from '../events/historicalEvents';

/** シード値から再現可能な乱数生成器 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}


/** 年次シミュレーション結果 */
export interface YearlySimulationResult {
    year: number;
    retiredNpcs: Character[];
    deceasedNpcs: Character[];
    promotedNpcs: { npc: Character; oldPosition: PositionTitle; newPosition: PositionTitle }[];
    jobChangedNpcs: { npc: Character; oldCompanyId?: string; newCompanyId?: string }[];
    marriedNpcs: Character[];
    newbornNpcs: Character[];
    bankruptCompanies: Company[];
    acquiredCompanies: { target: Company; acquirer: Company }[];
    newCompanies: Company[];
}

/** NPC年齢計算 */
export function calculateAge(npc: Character, currentYear: number): number {
    return currentYear - npc.birthYear;
}

/** 定年チェック（65歳定年） */
export function checkRetirement(npc: Character, currentYear: number): boolean {
    const age = calculateAge(npc, currentYear);
    return age >= 65;
}

/** 昇進判定 */
export function checkPromotion(
    npc: Character,
    currentYear: number,
    seed: number
): PositionTitle | null {
    const random = seededRandom(seed);
    const age = calculateAge(npc, currentYear);
    const yearsInCompany = currentYear - npc.joinYear;

    // 能力スコア計算
    const blueTotal = Object.values(npc.statsBlue).reduce((a, b) => a + b, 0);
    const redTotal = Object.values(npc.statsRed).reduce((a, b) => a + b, 0);
    const totalScore = blueTotal + redTotal;

    // 昇進確率計算（能力、勤続年数、野心に基づく）
    const promotionChance = (totalScore / 120) * (yearsInCompany / 20) * (npc.ambition / 100) * 0.1;

    if (random() > promotionChance) {
        return null;
    }

    // 次の役職を決定
    const positions: PositionTitle[] = [
        'NEWCOMER', 'MEMBER', 'SENIOR', 'LEADER', 'MANAGER',
        'SENIOR_MANAGER', 'DIRECTOR', 'EXECUTIVE', 'VICE_PRESIDENT', 'PRESIDENT'
    ];
    const currentIndex = positions.indexOf(npc.position.title);

    // 社長は昇進なし、その他は次の役職へ
    if (currentIndex >= positions.length - 1) {
        return null;
    }

    // 年齢制限チェック
    const nextPosition = positions[currentIndex + 1];
    const minAgeForPosition: Record<PositionTitle, number> = {
        'NEWCOMER': 22, 'MEMBER': 23, 'SENIOR': 26, 'LEADER': 28,
        'MANAGER': 32, 'SENIOR_MANAGER': 38, 'DIRECTOR': 42,
        'EXECUTIVE': 45, 'VICE_PRESIDENT': 48, 'PRESIDENT': 45
    };

    if (age < minAgeForPosition[nextPosition]) {
        return null;
    }

    return nextPosition;
}

/** 転職判定 */
export function checkJobChange(
    npc: Character,
    companies: Company[],
    _currentYear: number,
    seed: number
): string | null {
    const random = seededRandom(seed);

    // フリーランスは転職しない
    if (npc.status === 'FREELANCE') {
        return null;
    }

    // 忠誠心が低く、野心が高いと転職しやすい
    const changeChance = ((100 - npc.loyalty) / 100) * (npc.ambition / 100) * 0.05;

    if (random() > changeChance) {
        return null;
    }

    // 転職先を選択（現在の企業以外）
    const availableCompanies = companies.filter(
        c => c.id !== npc.companyId && c.isActive
    );

    if (availableCompanies.length === 0) {
        return null;
    }

    // 評判の高い企業を優先
    const sortedCompanies = [...availableCompanies].sort(
        (a, b) => b.reputation - a.reputation
    );

    // 上位30%から選択
    const topCompanies = sortedCompanies.slice(0, Math.ceil(sortedCompanies.length * 0.3));
    const newCompany = topCompanies[Math.floor(random() * topCompanies.length)];

    return newCompany.id;
}

/** フリーランス転向判定 */
export function checkGoFreelance(
    npc: Character,
    currentYear: number,
    seed: number
): boolean {
    const random = seededRandom(seed);
    const age = calculateAge(npc, currentYear);

    // 30-50歳、高能力、高野心の人がフリーランスになりやすい
    if (age < 30 || age > 50) {
        return false;
    }

    const blueTotal = Object.values(npc.statsBlue).reduce((a, b) => a + b, 0);
    const freelanceChance = (blueTotal / 60) * (npc.ambition / 100) * 0.02;

    return random() < freelanceChance;
}

/** 企業破産判定 */
export function checkBankruptcy(
    company: Company,
    _currentYear: number,
    seed: number
): boolean {
    const random = seededRandom(seed);

    // 財務健全性が低いと破産しやすい
    const bankruptcyChance = ((100 - company.financialHealth) / 100) * 0.03;

    // 大企業は破産しにくい
    const categoryModifier = company.category === 'LARGE' ? 0.1 :
        company.category === 'MEDIUM' ? 0.5 : 1.0;

    return random() < (bankruptcyChance * categoryModifier);
}

/** 結婚判定 */
export function checkMarriage(
    npc: Character,
    currentYear: number,
    seed: number
): boolean {
    const random = seededRandom(seed);
    const age = calculateAge(npc, currentYear);

    // 既婚者は対象外（SPOUSEタイプの関係があれば既婚）
    const hasSpouse = npc.relationships.some(r => r.type === 'SPOUSE');
    if (hasSpouse) return false;

    // 25-40歳が結婚適齢期
    if (age < 25 || age > 40) return false;

    // 年齢による結婚確率（30歳がピーク）
    const ageModifier = 1 - Math.abs(age - 30) / 15;

    // 魅力・安定志向が高いと結婚しやすい
    const marriageChance = ageModifier * 0.08;

    return random() < marriageChance;
}

/** 出産判定（既婚者のみ） */
export function checkChildbirth(
    npc: Character,
    currentYear: number,
    seed: number
): boolean {
    const random = seededRandom(seed);
    const age = calculateAge(npc, currentYear);

    // 未婚者は対象外
    const hasSpouse = npc.relationships.some(r => r.type === 'SPOUSE');
    if (!hasSpouse) return false;

    // 25-42歳が出産可能年齢
    if (age < 25 || age > 42) return false;

    // 年齢による出産確率
    const ageModifier = Math.max(0, 1 - (age - 25) / 20);
    const childbirthChance = ageModifier * 0.12;

    return random() < childbirthChance;
}

/** 企業M&A（買収）判定 */
export function checkAcquisition(
    acquirer: Company,
    target: Company,
    seed: number
): boolean {
    const random = seededRandom(seed);

    // 買収企業は財務健全で大きい必要
    if (acquirer.financialHealth < 70) return false;
    if (acquirer.category === 'VENTURE') return false;

    // ターゲット企業は経営難
    if (target.financialHealth > 40) return false;

    // 同業種（specialtiesが重複）優先
    const hasOverlap = acquirer.specialties.some(s => target.specialties.includes(s));
    const acquisitionChance = hasOverlap ? 0.15 : 0.05;

    return random() < acquisitionChance;
}
export function simulateYear(
    npcs: Character[],
    companies: Company[],
    currentYear: number,
    baseSeed: number
): YearlySimulationResult {
    const result: YearlySimulationResult = {
        year: currentYear,
        retiredNpcs: [],
        deceasedNpcs: [],
        promotedNpcs: [],
        jobChangedNpcs: [],
        marriedNpcs: [],
        newbornNpcs: [],
        bankruptCompanies: [],
        acquiredCompanies: [],
        newCompanies: [],
    };

    let seed = baseSeed + currentYear * 10000;

    // NPC処理
    for (const npc of npcs) {
        if (npc.status !== 'EMPLOYED' && npc.status !== 'FREELANCE') {
            continue;
        }

        const age = calculateAge(npc, currentYear);

        // 死亡判定（80歳以上で確率増加）
        if (age >= 80) {
            const random = seededRandom(seed++);
            if (random() < (age - 80) * 0.1) {
                npc.status = 'DECEASED';
                result.deceasedNpcs.push(npc);
                continue;
            }
        }

        // 定年判定
        if (checkRetirement(npc, currentYear)) {
            npc.status = 'RETIRED';
            result.retiredNpcs.push(npc);
            continue;
        }

        // 昇進判定
        const newPosition = checkPromotion(npc, currentYear, seed++);
        if (newPosition) {
            const oldPosition = npc.position.title;
            npc.position.title = newPosition;
            npc.position.rank++;
            result.promotedNpcs.push({ npc, oldPosition, newPosition });
        }

        // フリーランス転向判定
        if (npc.status === 'EMPLOYED' && checkGoFreelance(npc, currentYear, seed++)) {
            const oldCompanyId = npc.companyId;
            npc.status = 'FREELANCE';
            npc.companyId = undefined;
            result.jobChangedNpcs.push({ npc, oldCompanyId, newCompanyId: undefined });
            continue;
        }

        // 転職判定
        if (npc.status === 'EMPLOYED') {
            const newCompanyId = checkJobChange(npc, companies, currentYear, seed++);
            if (newCompanyId) {
                const oldCompanyId = npc.companyId;
                npc.companyId = newCompanyId;
                npc.joinYear = currentYear;
                npc.loyalty = 50; // リセット
                result.jobChangedNpcs.push({ npc, oldCompanyId, newCompanyId });
            }
        }

        // 結婚判定
        if (checkMarriage(npc, currentYear, seed++)) {
            result.marriedNpcs.push(npc);
        }

        // 出産判定
        if (checkChildbirth(npc, currentYear, seed++)) {
            result.newbornNpcs.push(npc);
        }
    }

    // 企業処理
    for (const company of companies) {
        if (!company.isActive) continue;

        // 破産判定
        if (checkBankruptcy(company, currentYear, seed++)) {
            company.isActive = false;
            company.bankruptYear = currentYear;
            result.bankruptCompanies.push(company);

            // 所属NPCをフリーランス化
            for (const npc of npcs) {
                if (npc.companyId === company.id) {
                    npc.status = 'FREELANCE';
                    npc.companyId = undefined;
                }
            }
        }
    }

    // M&A（買収）判定
    const activeCompanies = companies.filter(c => c.isActive);
    for (const acquirer of activeCompanies) {
        for (const target of activeCompanies) {
            if (acquirer.id === target.id) continue;
            if (checkAcquisition(acquirer, target, seed++)) {
                target.isActive = false;
                target.acquiredBy = acquirer.id;
                result.acquiredCompanies.push({ target, acquirer });
                // 買収された企業のNPCを買収企業に移籍
                for (const npc of npcs) {
                    if (npc.companyId === target.id) {
                        npc.companyId = acquirer.id;
                    }
                }
                break; // 1社は1回のみ買収される
            }
        }
    }

    // スキル陳腐化処理
    const era = getEra(currentYear);
    const decliningSkills = getDecliningSkillsForEra(era);

    for (const npc of npcs) {
        // 陳腐化スキルを持っている場合、能力値に影響
        const hasDeclinaSkill = npc.techSkills.some(s => decliningSkills.includes(s));
        if (hasDeclinaSkill) {
            // 古いスキルしか持っていないと、評価が下がる可能性がある
            // （実際の能力値変更はゲームロジックで行う）
        }
    }

    return result;
}
