/**
 * ゲームエンジン - ターン処理
 * 週次処理のコアロジック
 */

import type { WorldState, Character, Project, Task } from '../../types';
import { simulateYear } from '../simulation/npcSimulator';
import { getEventsForYear } from '../events/historicalEvents';

/** ターン処理結果 */
export interface TurnResult {
    week: number;
    year: number;
    events: string[];
    projectUpdates: ProjectUpdate[];
    characterUpdates: CharacterUpdate[];
    newEvents: string[];
}

/** プロジェクト更新情報 */
export interface ProjectUpdate {
    projectId: string;
    evmDelta: {
        ev: number;
        ac: number;
    };
    progressDelta: number;
    issuesDetected: string[];
}

/** キャラクター更新情報 */
export interface CharacterUpdate {
    characterId: string;
    staminaDelta: number;
    experienceGained: number;
}

/** プロジェクト方針（ポリシー） */
export type ProjectPolicy = 'NORMAL' | 'QUALITY_FIRST' | 'RUSH';

/** ポリシー補正係数 */
const POLICY_MODIFIERS: Record<ProjectPolicy, { progress: number; quality: number; stamina: number }> = {
    NORMAL: { progress: 1.0, quality: 1.0, stamina: 1.0 },
    QUALITY_FIRST: { progress: 0.7, quality: 1.3, stamina: 1.1 },  // 進捗遅いが品質高い
    RUSH: { progress: 1.5, quality: 0.7, stamina: 1.5 },          // 進捗速いが品質低い・疲労大
};

/** 季節稼働率補正（週番号 → 稼働率係数） */
function getSeasonalModifier(week: number): { productivity: number; event?: string } {
    // GW (18週目前後 = 4月末〜5月初)
    if (week >= 17 && week <= 19) {
        return { productivity: 0.6, event: 'ゴールデンウィーク期間中' };
    }
    // お盆 (33週目前後 = 8月中旬)
    if (week >= 32 && week <= 34) {
        return { productivity: 0.7, event: 'お盆期間中' };
    }
    // 年末年始 (52週目〜1週目)
    if (week >= 51 || week <= 1) {
        return { productivity: 0.5, event: '年末年始期間中' };
    }
    // 年度末 (12-13週目 = 3月末)
    if (week >= 12 && week <= 13) {
        return { productivity: 0.9, event: '年度末繁忙期' };
    }
    return { productivity: 1.0 };
}

/** 週数から年と週を計算 */
export function weekToYearWeek(totalWeeks: number, startYear: number): { year: number; week: number } {
    const year = startYear + Math.floor((totalWeeks - 1) / 52);
    const week = ((totalWeeks - 1) % 52) + 1;
    return { year, week };
}

/** 年と週から総週数を計算 */
export function yearWeekToTotalWeeks(year: number, week: number, startYear: number): number {
    return (year - startYear) * 52 + week;
}

/** 1週間（1ターン）の処理 */
export function processTurn(
    worldState: WorldState,
    activeProject: Project | null,
    tasks: Task[],
    playerCharacter: Character,
    policy: ProjectPolicy = 'NORMAL'
): TurnResult {
    const totalWeeks = yearWeekToTotalWeeks(
        worldState.currentYear,
        worldState.currentWeek,
        worldState.startYear
    );
    const { year, week } = weekToYearWeek(totalWeeks + 1, worldState.startYear);

    const result: TurnResult = {
        week,
        year,
        events: [],
        projectUpdates: [],
        characterUpdates: [],
        newEvents: [],
    };

    // 年が変わった場合、年次シミュレーションを実行
    if (year !== worldState.currentYear) {
        const yearlyResult = simulateYear(
            [...worldState.npcs, ...worldState.freelancers],
            worldState.companies,
            year,
            worldState.seed + year
        );

        // 結果をイベントに追加
        if (yearlyResult.bankruptCompanies.length > 0) {
            result.events.push(
                `${yearlyResult.bankruptCompanies.map(c => c.name).join(', ')} が倒産しました`
            );
        }
        if (yearlyResult.retiredNpcs.length > 0) {
            result.events.push(
                `${yearlyResult.retiredNpcs.length}名が定年退職しました`
            );
        }
        if (yearlyResult.marriedNpcs.length > 0) {
            result.events.push(
                `${yearlyResult.marriedNpcs.map(n => n.name).join(', ')} が結婚しました`
            );
        }
        if (yearlyResult.newbornNpcs.length > 0) {
            result.events.push(
                `${yearlyResult.newbornNpcs.length}名に子供が生まれました`
            );
        }
        if (yearlyResult.acquiredCompanies.length > 0) {
            for (const acq of yearlyResult.acquiredCompanies) {
                result.events.push(
                    `${acq.acquirer.name} が ${acq.target.name} を買収しました`
                );
            }
        }

        // 歴史イベントチェック
        const historicalEvents = getEventsForYear(year);
        for (const event of historicalEvents) {
            result.events.push(`【${event.name}】${event.description}`);
            result.newEvents.push(event.id);
        }
    }

    // プロジェクト処理（ポリシー適用）
    if (activeProject && activeProject.status === 'RUNNING') {
        const projectUpdate = processProjectWeek(activeProject, tasks, worldState, policy);
        result.projectUpdates.push(projectUpdate);
    }

    // キャラクター処理（スタミナ回復）
    const characterUpdate = processCharacterWeek(playerCharacter);
    result.characterUpdates.push(characterUpdate);

    // ワールド状態更新
    worldState.currentYear = year;
    worldState.currentWeek = week;

    return result;
}

/** プロジェクト週次処理 */
function processProjectWeek(
    project: Project,
    tasks: Task[],
    worldState: WorldState,
    policy: ProjectPolicy = 'NORMAL'
): ProjectUpdate {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const assignedTasks = projectTasks.filter(t => t.assigneeId !== null);

    // ポリシー補正係数を取得
    const modifier = POLICY_MODIFIERS[policy];

    // 季節稼働率補正を取得
    const seasonal = getSeasonalModifier(worldState.currentWeek);

    let evEarned = 0;
    let acSpent = 0;
    let totalProgress = 0;
    const issues: string[] = [];

    for (const task of assignedTasks) {
        const assignee = worldState.npcs.find(c => c.id === task.assigneeId) ||
            worldState.freelancers.find(c => c.id === task.assigneeId);

        if (!assignee) continue;

        // 作業量計算（能力値ベース）
        const taskPhaseSkills: Record<string, keyof typeof assignee.statsBlue> = {
            'REQUIREMENT': 'propose',
            'DESIGN': 'design',
            'DEVELOP': 'develop',
            'TEST': 'test',
            'INTEGRATION': 'judgment',  // 統合フェーズは判断力
            'REVIEW': 'judgment',       // レビューフェーズも判断力
        };
        const relevantSkill = taskPhaseSkills[task.phase] || 'develop';
        const skillValue = assignee.statsBlue[relevantSkill];

        // StatsRed効果計算
        const redStats = assignee.statsRed;

        // 美貌(Charm): 周囲への能力向上バフ（最大+20%）
        const charmBonus = 1 + (redStats.charm / 50);

        // 幸運(Luck): トラブル回避率向上（後述のリスク判定で使用）
        const luckFactor = redStats.luck / 10;

        // 進捗計算（スキル値 × ポリシー補正 × 美貌バフ × 季節補正）
        const baseProgress = skillValue * 2 * modifier.progress * charmBonus * seasonal.productivity;
        const progressMade = Math.min(100 - task.progress, baseProgress);

        task.progress += progressMade;
        totalProgress += progressMade;

        // 品質計算（ポリシーによる品質変動）
        task.quality = Math.min(100, Math.max(0, task.quality * modifier.quality));

        // EV計算（出来高）
        const taskValue = 100000; // 仮の1タスク価値
        evEarned += (progressMade / 100) * taskValue;

        // AC計算（実コスト = 人件費 × 庶務によるAP削減）
        const adminDiscount = 1 - (redStats.admin / 100); // 最大10%削減
        const weeklySalary = (150000 + (assignee.position.rank * 50000)) * adminDiscount;
        acSpent += weeklySalary;

        // リスク発現チェック（幸運で軽減）
        const riskThreshold = (task.riskFactor / 200) * (1 - luckFactor);
        if (task.riskFactor > 50 && Math.random() < riskThreshold) {
            issues.push(`タスク「${task.name || task.id}」で問題発生`);
        }

        // スタミナ消費（ポリシー補正適用）
        const staminaCost = Math.round(10 * modifier.stamina);
        assignee.stamina.current = Math.max(0, assignee.stamina.current - staminaCost);
    }

    // プロジェクトEVM更新
    project.evm.ev += evEarned;
    project.evm.ac += acSpent;
    project.evm.spi = project.evm.pv > 0 ? project.evm.ev / project.evm.pv : 1;
    project.evm.cpi = project.evm.ac > 0 ? project.evm.ev / project.evm.ac : 1;

    return {
        projectId: project.id,
        evmDelta: { ev: evEarned, ac: acSpent },
        progressDelta: totalProgress / Math.max(1, assignedTasks.length),
        issuesDetected: issues,
    };
}

/** キャラクター週次処理 */
function processCharacterWeek(character: Character, teammates: Character[] = []): CharacterUpdate {
    // Service効果: チームメンバーの給仕スキルによる回復支援
    const serviceBonus = teammates.reduce((sum, tm) => sum + tm.statsRed.service, 0) / 10;

    // スタミナ回復（基礎 + Service支援）
    const staminaRecovered = Math.min(
        character.stamina.max - character.stamina.current,
        character.stamina.recoveryRate + serviceBonus
    );
    character.stamina.current += staminaRecovered;

    return {
        characterId: character.id,
        staminaDelta: staminaRecovered,
        experienceGained: 10, // 基本経験値
    };
}

/** プロジェクト完了判定 */
export function checkProjectCompletion(project: Project, tasks: Task[]): boolean {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    return projectTasks.every(t => t.progress >= 100);
}

/** プロジェクト失敗判定 */
export function checkProjectFailure(project: Project): {
    failed: boolean;
    reason?: string;
} {
    // 進捗遅延チェック
    if (project.evm.spi < 0.5) {
        return { failed: true, reason: 'スケジュール遅延が深刻です' };
    }

    // コスト超過チェック
    if (project.evm.cpi < 0.5) {
        return { failed: true, reason: 'コスト超過が深刻です' };
    }

    // 期限超過チェック
    if (project.schedule.currentWeek > project.schedule.endWeek * 1.5) {
        return { failed: true, reason: 'プロジェクト期限を大幅に超過しました' };
    }

    return { failed: false };
}
