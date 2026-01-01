/**
 * 経済システム
 * 給与計算・支出・自己啓発
 */

import type { Character, PositionTitle } from '../types';

// ========================
// 定数
// ========================

/** 役職別ベース給（万円） */
const BASE_SALARY: Record<PositionTitle, number> = {
    NEWCOMER: 22,
    MEMBER: 25,
    SENIOR: 30,
    LEADER: 38,
    MANAGER: 50,
    SENIOR_MANAGER: 65,
    DIRECTOR: 70,
    EXECUTIVE: 85,
    VICE_PRESIDENT: 100,
    PRESIDENT: 120,
};

/** 年代補正（入社年の経済状況） */
function getEraModifier(joinYear: number): number {
    if (joinYear < 2000) return 0.85; // バブル崩壊後
    if (joinYear < 2010) return 0.9;  // 就職氷河期
    if (joinYear < 2020) return 1.0;  // 回復期
    return 1.1; // 売り手市場
}

/** 資格ボーナス（資格ID → ボーナス率） */
const CERTIFICATION_BONUS: Record<string, number> = {
    // 情報処理技術者
    FE: 0.02,   // 基本情報
    AP: 0.05,   // 応用情報
    SA: 0.08,   // システムアーキテクト
    PM: 0.10,   // プロジェクトマネージャ
    DB: 0.06,   // データベース
    NW: 0.06,   // ネットワーク
    SC: 0.07,   // 情報処理安全確保支援士

    // ベンダー資格
    AWS_SAA: 0.05,  // AWS Solutions Architect
    AWS_SAP: 0.08,  // AWS SA Professional
    GCP_ACE: 0.04,  // GCP Associate
    AZURE: 0.05,    // Azure資格

    // その他
    PMP: 0.08,      // PMP
    TOEIC_800: 0.03, // TOEIC 800+
    MBA: 0.10,       // MBA
};

/** 月間固定支出（万円） */
const FIXED_EXPENSES = 20; // 生活費+社会保険

// ========================
// 給与計算
// ========================

/**
 * 月収を計算
 */
export function calculateMonthlySalary(char: Character): number {
    const baseSalary = BASE_SALARY[char.position.title] || BASE_SALARY.MEMBER;
    const eraModifier = getEraModifier(char.joinYear);

    // 資格ボーナス計算
    let certificationBonus = 0;
    for (const cert of char.certifications || []) {
        certificationBonus += CERTIFICATION_BONUS[cert] || 0;
    }

    const salary = baseSalary * eraModifier * (1 + certificationBonus);
    return Math.round(salary * 10) / 10; // 小数点1桁
}

/**
 * 可処分所得を計算（月収 - 固定支出）
 */
export function calculateDisposableIncome(salary: number): number {
    return Math.max(0, salary - FIXED_EXPENSES);
}

// ========================
// 自己啓発
// ========================

/** 自己啓発オプション */
export interface SelfDevelopmentOption {
    id: string;
    label: string;
    description: string;
    cost: number; // 万円
    skillChance: number; // 0-1
    skillAmount: number;
    certificationEarned?: string; // 資格取得の場合
}

/** 自己啓発オプション一覧 */
export const SELF_DEVELOPMENT_OPTIONS: SelfDevelopmentOption[] = [
    {
        id: 'book',
        label: '技術書購入',
        description: '最新技術の書籍を購入して学習',
        cost: 0.3,
        skillChance: 0.10,
        skillAmount: 1,
    },
    {
        id: 'online_course',
        label: 'オンライン講座',
        description: 'Udemy等のオンライン講座を受講',
        cost: 2,
        skillChance: 0.25,
        skillAmount: 2,
    },
    {
        id: 'seminar',
        label: 'セミナー参加',
        description: '業界セミナーに参加（人脈形成にも有効）',
        cost: 5,
        skillChance: 0.40,
        skillAmount: 2,
    },
    {
        id: 'fe_exam',
        label: '基本情報技術者試験',
        description: 'IT系国家資格の登竜門',
        cost: 1,
        skillChance: 0.50,
        skillAmount: 1,
        certificationEarned: 'FE',
    },
    {
        id: 'ap_exam',
        label: '応用情報技術者試験',
        description: 'ワンランク上のIT国家資格',
        cost: 1,
        skillChance: 0.35,
        skillAmount: 2,
        certificationEarned: 'AP',
    },
    {
        id: 'aws_cert',
        label: 'AWS認定資格',
        description: 'クラウド技術の証明',
        cost: 4,
        skillChance: 0.40,
        skillAmount: 3,
        certificationEarned: 'AWS_SAA',
    },
];

/**
 * 自己啓発実施
 */
export function processSelfDevelopment(
    char: Character,
    option: SelfDevelopmentOption
): { success: boolean; message: string; certEarned?: string } {
    // 費用チェック
    if (char.money < option.cost) {
        return { success: false, message: '所持金が足りません' };
    }

    // 費用控除
    char.money -= option.cost;

    // 抽選
    const isSuccess = Math.random() < option.skillChance;

    if (isSuccess) {
        // 資格取得
        if (option.certificationEarned) {
            if (!char.certifications.includes(option.certificationEarned)) {
                char.certifications.push(option.certificationEarned);
                return {
                    success: true,
                    message: `${option.label}に合格しました！`,
                    certEarned: option.certificationEarned,
                };
            }
        }
        return { success: true, message: 'スキルが向上しました！' };
    }

    return { success: false, message: '今回は成果が出ませんでした' };
}

/**
 * 月次経済処理（給料受取、生活費控除）
 */
export function processMonthlyEconomy(char: Character): { salary: number; expenses: number; netChange: number } {
    const salary = calculateMonthlySalary(char);
    const expenses = FIXED_EXPENSES;
    const netChange = salary - expenses;

    char.money += netChange;
    char.monthlySalary = salary;

    return { salary, expenses, netChange };
}

// 資格ラベル
export const CERTIFICATION_LABELS: Record<string, string> = {
    FE: '基本情報技術者',
    AP: '応用情報技術者',
    SA: 'システムアーキテクト',
    PM: 'プロジェクトマネージャ',
    DB: 'データベーススペシャリスト',
    NW: 'ネットワークスペシャリスト',
    SC: '情報処理安全確保支援士',
    AWS_SAA: 'AWS Solutions Architect',
    AWS_SAP: 'AWS SA Professional',
    GCP_ACE: 'GCP Associate',
    AZURE: 'Azure資格',
    PMP: 'PMP',
    TOEIC_800: 'TOEIC 800+',
    MBA: 'MBA',
};
