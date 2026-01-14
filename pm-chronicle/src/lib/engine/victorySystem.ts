/**
 * 勝利条件判定システム
 * 太閤立志伝要素: 日本一のIT企業を目指す
 */

import type { WorldState, Character, Company } from '../../types';

/** 勝利条件タイプ */
export type VictoryType =
    | 'IT_EMPEROR'       // 日本一のIT企業（売上トップ）
    | 'LEGENDARY_PM'     // 伝説のPM（プロジェクト10成功）
    | 'INDUSTRY_PIONEER' // 業界のパイオニア（新技術導入）
    | 'EMPLOYEE_KING'    // 従業員の王（全社員覚醒）
    | 'TIME_LIMIT';      // 時間切れ（2030年到達）

/** 勝利結果 */
export interface VictoryResult {
    achieved: boolean;
    type: VictoryType;
    title: string;
    description: string;
    score: number;
    highlights: string[];
}

/** 勝利条件のしきい値 */
const VICTORY_THRESHOLDS = {
    IT_EMPEROR: {
        minRevenue: 1000000, // 100億円以上
        marketShareRank: 1,  // 業界1位
    },
    LEGENDARY_PM: {
        projectSuccessCount: 10,
    },
    INDUSTRY_PIONEER: {
        trendingSkillsMastered: 5, // トレンドスキル5つ以上習得
    },
    EMPLOYEE_KING: {
        awakenedRatio: 0.8, // 80%以上覚醒
    },
};

/**
 * 勝利条件をチェック
 */
export function checkVictoryCondition(
    worldState: WorldState,
    playerId: string,
    completedProjects: number,
    successfulProjects: number
): VictoryResult | null {
    const player = findPlayer(worldState, playerId);
    if (!player) return null;

    const playerCompany = player.companyId
        ? worldState.companies.find(c => c.id === player.companyId)
        : null;

    // 1. 日本一のIT企業チェック
    if (playerCompany) {
        const itEmperorResult = checkITEmperor(worldState, playerCompany);
        if (itEmperorResult) return itEmperorResult;
    }

    // 2. 伝説のPMチェック
    const legendaryPMResult = checkLegendaryPM(successfulProjects, player);
    if (legendaryPMResult) return legendaryPMResult;

    // 3. 従業員の王チェック
    const employeeKingResult = checkEmployeeKing(worldState, playerCompany ?? null);
    if (employeeKingResult) return employeeKingResult;

    // 4. 業界のパイオニアチェック
    const pioneerResult = checkIndustryPioneer(worldState, player);
    if (pioneerResult) return pioneerResult;

    // 5. 時間切れチェック（2030年）
    if (worldState.currentYear >= 2030) {
        return {
            achieved: true,
            type: 'TIME_LIMIT',
            title: '時代の終焉',
            description: '2030年を迎え、あなたのキャリアは終わりを迎えました。',
            score: calculateFinalScore(worldState, player, completedProjects, successfulProjects),
            highlights: generateHighlights(worldState, player, completedProjects, successfulProjects),
        };
    }

    return null;
}

/**
 * 日本一のIT企業チェック
 */
function checkITEmperor(worldState: WorldState, playerCompany: Company): VictoryResult | null {
    const sortedCompanies = [...worldState.companies]
        .filter(c => c.isActive)
        .sort((a, b) => b.revenue - a.revenue);

    const rank = sortedCompanies.findIndex(c => c.id === playerCompany.id) + 1;

    if (rank === 1 && playerCompany.revenue >= VICTORY_THRESHOLDS.IT_EMPEROR.minRevenue) {
        return {
            achieved: true,
            type: 'IT_EMPEROR',
            title: 'IT帝王',
            description: `${playerCompany.name}は日本一のIT企業となりました！売上${formatRevenue(playerCompany.revenue)}を達成。`,
            score: 10000 + Math.floor(playerCompany.revenue / 10000),
            highlights: [
                `売上高: ${formatRevenue(playerCompany.revenue)}`,
                `従業員数: ${playerCompany.employeeCount}人`,
                `評判: ${playerCompany.reputation}点`,
            ],
        };
    }

    return null;
}

/**
 * 伝説のPMチェック
 */
function checkLegendaryPM(successfulProjects: number, player: Character): VictoryResult | null {
    if (successfulProjects >= VICTORY_THRESHOLDS.LEGENDARY_PM.projectSuccessCount) {
        return {
            achieved: true,
            type: 'LEGENDARY_PM',
            title: '伝説のプロジェクトマネージャー',
            description: `${player.name}は${successfulProjects}のプロジェクトを成功に導き、伝説となりました！`,
            score: 8000 + successfulProjects * 500,
            highlights: [
                `成功プロジェクト数: ${successfulProjects}`,
                `役職: ${player.position.title}`,
                player.isAwakened ? `覚醒達成: ${player.hiddenData?.trueName || '覚醒済み'}` : '',
            ].filter(h => h !== ''),
        };
    }

    return null;
}

/**
 * 従業員の王チェック
 */
function checkEmployeeKing(worldState: WorldState, playerCompany: Company | null): VictoryResult | null {
    if (!playerCompany) return null;

    const companyEmployees = worldState.npcs.filter(n => n.companyId === playerCompany.id);
    if (companyEmployees.length < 10) return null; // 最低10人必要

    const awakenedCount = companyEmployees.filter(n => n.isAwakened).length;
    const awakenedRatio = awakenedCount / companyEmployees.length;

    if (awakenedRatio >= VICTORY_THRESHOLDS.EMPLOYEE_KING.awakenedRatio) {
        return {
            achieved: true,
            type: 'EMPLOYEE_KING',
            title: '従業員の王',
            description: `${playerCompany.name}の従業員の${Math.round(awakenedRatio * 100)}%が覚醒しました！最高のチームが完成！`,
            score: 7000 + awakenedCount * 200,
            highlights: [
                `覚醒者数: ${awakenedCount}/${companyEmployees.length}人`,
                `覚醒率: ${Math.round(awakenedRatio * 100)}%`,
            ],
        };
    }

    return null;
}

/**
 * 業界のパイオニアチェック
 */
function checkIndustryPioneer(worldState: WorldState, player: Character): VictoryResult | null {
    const trendingSkills = worldState.industryState.trendingSkills;
    const playerSkills = player.techSkills || [];

    const masteredTrending = trendingSkills.filter(skill =>
        playerSkills.includes(skill)
    ).length;

    if (masteredTrending >= VICTORY_THRESHOLDS.INDUSTRY_PIONEER.trendingSkillsMastered) {
        return {
            achieved: true,
            type: 'INDUSTRY_PIONEER',
            title: '業界のパイオニア',
            description: `${player.name}は${masteredTrending}のトレンド技術を習得し、業界を牽引しています！`,
            score: 6000 + masteredTrending * 300,
            highlights: [
                `習得トレンド技術: ${masteredTrending}`,
                `技術リスト: ${playerSkills.slice(0, 5).join(', ')}`,
            ],
        };
    }

    return null;
}

/**
 * プレイヤーキャラクターを検索
 */
function findPlayer(worldState: WorldState, playerId: string): Character | null {
    return worldState.npcs.find(c => c.id === playerId) ||
        worldState.freelancers.find(c => c.id === playerId) ||
        null;
}

/**
 * 最終スコア計算
 */
function calculateFinalScore(
    worldState: WorldState,
    player: Character,
    completedProjects: number,
    successfulProjects: number
): number {
    let score = 0;

    // プロジェクト実績
    score += completedProjects * 100;
    score += successfulProjects * 300;

    // キャラクター成長
    const blueSkillSum = Object.values(player.statsBlue).reduce((a, b) => a + b, 0);
    const redSkillSum = Object.values(player.statsRed).reduce((a, b) => a + b, 0);
    score += blueSkillSum * 50;
    score += redSkillSum * 30;

    // 覚醒ボーナス
    if (player.isAwakened) score += 1000;

    // 資産
    score += Math.floor(player.money / 100);

    // 年数ペナルティ（長くかかるほど減点）
    const yearsPlayed = worldState.currentYear - worldState.startYear;
    score -= yearsPlayed * 50;

    return Math.max(0, score);
}

/**
 * ハイライト生成
 */
function generateHighlights(
    worldState: WorldState,
    player: Character,
    completedProjects: number,
    successfulProjects: number
): string[] {
    return [
        `経過年数: ${worldState.currentYear - worldState.startYear}年`,
        `完了プロジェクト: ${completedProjects} (成功: ${successfulProjects})`,
        `最終役職: ${player.position.title}`,
        `総資産: ${player.money}万円`,
        player.isAwakened ? `二つ名: ${player.hiddenData?.trueName || '覚醒者'}` : '',
    ].filter(h => h !== '');
}

/**
 * 売上フォーマット
 */
function formatRevenue(revenue: number): string {
    if (revenue >= 100000) {
        return `${(revenue / 100000).toFixed(1)}兆円`;
    } else if (revenue >= 100) {
        return `${(revenue / 100).toFixed(1)}億円`;
    } else {
        return `${revenue}万円`;
    }
}

/**
 * 勝利条件の進捗状況を取得
 */
export function getVictoryProgress(
    worldState: WorldState,
    playerId: string,
    successfulProjects: number
): { type: VictoryType; label: string; progress: number; target: number }[] {
    const player = findPlayer(worldState, playerId);
    if (!player) return [];

    const playerCompany = player.companyId
        ? worldState.companies.find(c => c.id === player.companyId)
        : null;

    const progress: { type: VictoryType; label: string; progress: number; target: number }[] = [];

    // 伝説のPM進捗
    progress.push({
        type: 'LEGENDARY_PM',
        label: '伝説のPM',
        progress: successfulProjects,
        target: VICTORY_THRESHOLDS.LEGENDARY_PM.projectSuccessCount,
    });

    // IT帝王進捗
    if (playerCompany) {
        const sortedCompanies = [...worldState.companies]
            .filter(c => c.isActive)
            .sort((a, b) => b.revenue - a.revenue);
        const rank = sortedCompanies.findIndex(c => c.id === playerCompany.id) + 1;

        progress.push({
            type: 'IT_EMPEROR',
            label: 'IT帝王',
            progress: rank === 1 ? playerCompany.revenue : 0,
            target: VICTORY_THRESHOLDS.IT_EMPEROR.minRevenue,
        });
    }

    // 従業員の王進捗
    if (playerCompany) {
        const companyEmployees = worldState.npcs.filter(n => n.companyId === playerCompany.id);
        const awakenedCount = companyEmployees.filter(n => n.isAwakened).length;

        progress.push({
            type: 'EMPLOYEE_KING',
            label: '従業員の王',
            progress: awakenedCount,
            target: Math.ceil(companyEmployees.length * VICTORY_THRESHOLDS.EMPLOYEE_KING.awakenedRatio),
        });
    }

    return progress;
}
