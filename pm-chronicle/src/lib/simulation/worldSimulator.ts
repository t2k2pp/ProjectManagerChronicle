/**
 * 週次世界シミュレーションシステム
 * 太閤立志伝風「生きた世界」を実現
 */

import type { WorldState, Character, Company, Project } from '../../types';

/** 週次シミュレーション結果 */
export interface WorldWeekResult {
    // プロジェクト関連
    completedProjects: { company: Company; project: Project }[];
    failedProjects: { company: Company; project: Project; reason: string }[];
    newProjects: { company: Company; project: Project }[];

    // NPC関連
    skillGrowth: { npc: Character; skill: string; amount: number }[];
    staminaRecovery: { npc: Character; recovered: number }[];

    // 企業関連
    revenueChanges: { company: Company; change: number }[];

    // ログメッセージ
    logs: string[];
}

/**
 * 週次世界シミュレーション
 * プレイヤーのターン終了後に呼び出される
 */
export function simulateWorldWeek(
    worldState: WorldState,
    currentWeek: number,
    seed: number
): WorldWeekResult {
    const result: WorldWeekResult = {
        completedProjects: [],
        failedProjects: [],
        newProjects: [],
        skillGrowth: [],
        staminaRecovery: [],
        revenueChanges: [],
        logs: [],
    };

    const random = seededRandom(seed + currentWeek);

    // 1. 各社の進行中プロジェクトを進める
    for (const company of worldState.companies) {
        if (!company.isActive) continue;

        // 各社のプロジェクト進行（仮想プロジェクト）
        processCompanyProjects(company, worldState, random, result);
    }

    // 2. 全NPC週次処理
    for (const npc of worldState.npcs) {
        if (npc.status === 'RETIRED' || npc.status === 'DECEASED') continue;
        processNpcWeek(npc, random, result);
    }

    // 3. フリーランサー処理
    for (const freelancer of worldState.freelancers) {
        if (freelancer.status === 'RETIRED') continue;
        processNpcWeek(freelancer, random, result);
    }

    // 4. 企業週次処理
    for (const company of worldState.companies) {
        if (!company.isActive) continue;
        processCompanyWeek(company, random, result);
    }

    return result;
}

/** シード値から再現可能な乱数生成器 */
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

/** 企業のプロジェクト進行 */
function processCompanyProjects(
    company: Company,
    _worldState: WorldState,
    random: () => number,
    result: WorldWeekResult
) {
    // 企業ごとに仮想的なプロジェクト進行（簡易版）
    // 将来的にはCompany.activeProjectsを持たせる

    // 10%の確率で新規プロジェクト開始ログ
    if (random() < 0.01) {
        result.logs.push(`${company.name}が新規プロジェクトを受注`);
    }

    // 5%の確率でプロジェクト完了ログ
    if (random() < 0.005) {
        result.logs.push(`${company.name}のプロジェクトが完了`);
    }
}

/** NPC週次処理 */
function processNpcWeek(
    npc: Character,
    random: () => number,
    result: WorldWeekResult
) {
    // スタミナ回復
    const recoveryRate = npc.stamina.recoveryRate || 10;
    const recovery = Math.min(
        recoveryRate,
        npc.stamina.max - npc.stamina.current
    );
    if (recovery > 0) {
        npc.stamina.current += recovery;
        result.staminaRecovery.push({ npc, recovered: recovery });
    }

    // スキル微成長（1%の確率で+0.1）
    if (random() < 0.01) {
        const skills = ['design', 'develop', 'test', 'negotiation', 'propose', 'judgment'] as const;
        const skill = skills[Math.floor(random() * skills.length)];
        const currentValue = npc.statsBlue[skill];
        if (currentValue < 10) {
            npc.statsBlue[skill] = Math.min(10, currentValue + 0.1);
            result.skillGrowth.push({ npc, skill, amount: 0.1 });
        }
    }
}

/** 企業週次処理 */
function processCompanyWeek(
    company: Company,
    random: () => number,
    result: WorldWeekResult
) {
    // 売上微変動（±1%）
    const change = (random() - 0.5) * 0.02 * company.revenue;
    company.revenue += change;

    if (Math.abs(change) > company.revenue * 0.01) {
        result.revenueChanges.push({ company, change });
    }
}

/**
 * 年次シミュレーション結果をWorldStateに反映
 */
export function applyYearlySimulationResult(
    worldState: WorldState,
    yearlyResult: {
        retiredNpcs: Character[];
        deceasedNpcs: Character[];
        promotedNpcs: { npc: Character; oldPosition: string; newPosition: string }[];
        jobChangedNpcs: { npc: Character; oldCompanyId?: string; newCompanyId?: string }[];
        marriedNpcs: Character[];
        newbornNpcs: Character[];
        bankruptCompanies: Company[];
    }
): void {
    // 退職者処理（削除せずステータス変更）
    for (const retired of yearlyResult.retiredNpcs) {
        const npc = worldState.npcs.find(n => n.id === retired.id);
        if (npc) {
            npc.status = 'RETIRED';
            npc.companyId = undefined;
        }
    }

    // 死亡者処理
    for (const deceased of yearlyResult.deceasedNpcs) {
        const npc = worldState.npcs.find(n => n.id === deceased.id);
        if (npc) {
            npc.status = 'DECEASED';
            npc.companyId = undefined;
        }
    }

    // 昇進処理
    for (const promo of yearlyResult.promotedNpcs) {
        const npc = worldState.npcs.find(n => n.id === promo.npc.id);
        if (npc) {
            npc.position.title = promo.newPosition as typeof npc.position.title;
            npc.position.rank += 1;
        }
    }

    // 転職処理
    for (const change of yearlyResult.jobChangedNpcs) {
        const npc = worldState.npcs.find(n => n.id === change.npc.id);
        if (npc) {
            npc.companyId = change.newCompanyId;
            // フリーランス化チェック（companyIdがundefinedの場合）
            if (!change.newCompanyId) {
                npc.status = 'FREELANCE';
                const npcIndex = worldState.npcs.indexOf(npc);
                if (npcIndex >= 0) {
                    worldState.npcs.splice(npcIndex, 1);
                    worldState.freelancers.push(npc);
                }
            }
        }
    }

    // 結婚処理
    for (const married of yearlyResult.marriedNpcs) {
        const npc = worldState.npcs.find(n => n.id === married.id) ||
            worldState.freelancers.find(n => n.id === married.id);
        if (npc) {
            npc.marriageStatus = 'MARRIED';
        }
    }

    // 出産処理（newbornNpcsは親のCharacter）
    for (const parent of yearlyResult.newbornNpcs) {
        const npc = worldState.npcs.find(n => n.id === parent.id) ||
            worldState.freelancers.find(n => n.id === parent.id);
        if (npc) {
            npc.childCount = (npc.childCount || 0) + 1;
        }
    }

    // 破産企業処理
    for (const bankrupt of yearlyResult.bankruptCompanies) {
        const company = worldState.companies.find(c => c.id === bankrupt.id);
        if (company) {
            company.isActive = false;
            // 所属NPCは失業→フリーランス化
            const affectedNpcs = worldState.npcs.filter(n => n.companyId === company.id);
            for (const npc of affectedNpcs) {
                npc.status = 'FREELANCE';
                npc.companyId = undefined;
            }
        }
    }
}
