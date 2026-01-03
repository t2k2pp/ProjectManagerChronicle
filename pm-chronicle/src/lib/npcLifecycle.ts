/**
 * NPCライフサイクルシステム
 * 転職、結婚、引き抜き、退職などのライフイベント
 */

import type { Character, Company } from '../types';

/** ライフイベントタイプ */
export type LifeEventType =
    | 'JOB_CHANGE'      // 転職
    | 'HEADHUNT'        // 引き抜き
    | 'MARRIAGE'        // 結婚
    | 'DIVORCE'         // 離婚
    | 'RETIREMENT'      // 退職
    | 'PROMOTION'       // 昇進
    | 'CHILD_BIRTH'     // 出産
    | 'SICK_LEAVE';     // 病気休職

/** ライフイベント */
export interface LifeEvent {
    type: LifeEventType;
    characterId: string;
    year: number;
    week: number;
    details: {
        fromCompany?: string;
        toCompany?: string;
        newPosition?: string;
        partnerId?: string;
    };
    message: string;
}

/**
 * 転職判定
 */
export function checkJobChange(
    character: Character,
    currentCompany: Company | undefined,
    allCompanies: Company[]
): LifeEvent | null {
    // 条件: 忠誠度低 + 野心高 + 市場に選択肢あり
    if (character.loyalty > 40) return null;
    if (character.ambition < 50) return null;

    // 転職確率（忠誠度が低いほど高い）
    const chance = (100 - character.loyalty) / 500; // 最大12%
    if (Math.random() > chance) return null;

    // 転職先候補
    const candidates = allCompanies.filter(c =>
        c.id !== currentCompany?.id &&
        c.isActive &&
        c.financialHealth > 50
    );

    if (candidates.length === 0) return null;

    const newCompany = candidates[Math.floor(Math.random() * candidates.length)];

    return {
        type: 'JOB_CHANGE',
        characterId: character.id,
        year: 0, // 呼び出し元で設定
        week: 0,
        details: {
            fromCompany: currentCompany?.name,
            toCompany: newCompany.name,
        },
        message: `${character.name}が${newCompany.name}に転職しました`,
    };
}

/**
 * 結婚判定
 */
export function checkMarriage(
    character: Character,
    allCharacters: Character[],
    currentYear: number
): LifeEvent | null {
    // 既婚者は除外
    if (character.marriageStatus !== 'SINGLE') return null;

    // 年齢条件（25-45歳）
    const age = currentYear - character.birthYear;
    if (age < 25 || age > 45) return null;

    // 結婚確率（年齢依存）
    let chance = 0.02; // 基本2%
    if (age >= 28 && age <= 35) chance = 0.05; // 最適期
    if (age > 40) chance = 0.01; // 減少

    if (Math.random() > chance) return null;

    // 相手候補（異性かつ独身）
    const candidates = allCharacters.filter(c =>
        c.id !== character.id &&
        c.marriageStatus === 'SINGLE' &&
        c.gender !== character.gender
    );

    if (candidates.length === 0) return null;

    const partner = candidates[Math.floor(Math.random() * candidates.length)];

    return {
        type: 'MARRIAGE',
        characterId: character.id,
        year: currentYear,
        week: 0,
        details: {
            partnerId: partner.id,
        },
        message: `${character.name}と${partner.name}が結婚しました`,
    };
}

/**
 * 退職判定
 */
export function checkRetirement(
    character: Character,
    currentYear: number
): LifeEvent | null {
    const age = currentYear - character.birthYear;

    // 定年（60-65歳）
    if (age >= 60) {
        const chance = (age - 59) * 0.15; // 60歳で15%、65歳で90%
        if (Math.random() < chance) {
            return {
                type: 'RETIREMENT',
                characterId: character.id,
                year: currentYear,
                week: 0,
                details: {},
                message: `${character.name}が定年退職しました`,
            };
        }
    }

    // 早期退職（条件: スタミナ低下 + 高齢）
    if (age >= 50 && character.stamina.max < 50) {
        if (Math.random() < 0.05) {
            return {
                type: 'RETIREMENT',
                characterId: character.id,
                year: currentYear,
                week: 0,
                details: {},
                message: `${character.name}が早期退職しました`,
            };
        }
    }

    return null;
}

/**
 * 年次NPCイベント処理
 */
export function processAnnualNPCEvents(
    characters: Character[],
    companies: Company[],
    currentYear: number
): LifeEvent[] {
    const events: LifeEvent[] = [];

    for (const character of characters) {
        // 退職チェック
        const retirement = checkRetirement(character, currentYear);
        if (retirement) {
            events.push(retirement);
            continue; // 退職者は他のイベント不要
        }

        // 結婚チェック
        const marriage = checkMarriage(character, characters, currentYear);
        if (marriage) {
            events.push(marriage);
        }

        // 転職チェック
        const company = companies.find(c => c.id === character.companyId);
        const jobChange = checkJobChange(character, company, companies);
        if (jobChange) {
            jobChange.year = currentYear;
            events.push(jobChange);
        }
    }

    return events;
}

/**
 * イベントラベル
 */
export const LIFE_EVENT_LABELS: Record<LifeEventType, string> = {
    JOB_CHANGE: '転職',
    HEADHUNT: '引き抜き',
    MARRIAGE: '結婚',
    DIVORCE: '離婚',
    RETIREMENT: '退職',
    PROMOTION: '昇進',
    CHILD_BIRTH: '出産',
    SICK_LEAVE: '病気休職',
};
