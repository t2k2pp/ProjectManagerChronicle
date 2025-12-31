/**
 * TurnProcessor統合 - PMCockpitへの統合ヘルパー
 */

import { processTurn, type TurnResult } from '../../../lib/engine/turnProcessor';
import type { WorldState, Project, Task, Character } from '../../../types';

export interface TurnProcessorIntegration {
    worldState: WorldState;
    currentProject: Project | null;
    tasks: Task[];
    playerCharacter: Character;
}

/**
 * ターン処理を実行し、結果を返す
 */
export function executeTurn(
    integration: TurnProcessorIntegration
): TurnResult {
    const { worldState, currentProject, tasks, playerCharacter } = integration;

    // ターン処理を実行
    const result = processTurn(worldState, currentProject, tasks, playerCharacter);

    return result;
}

/**
 * ターン進行のサマリメッセージ生成
 */
export function generateTurnSummary(result: TurnResult): string {
    const lines: string[] = [];

    lines.push(`【Year ${result.year} Week ${result.week}】`);

    // プロジェクト進捗サマリ
    if (result.projectUpdates.length > 0) {
        const avgProgress = result.projectUpdates.reduce((sum, pu) => sum + pu.progressDelta, 0) / result.projectUpdates.length;
        lines.push(`進捗: 平均 +${avgProgress.toFixed(1)}%`);

        // 問題検出
        for (const pu of result.projectUpdates) {
            if (pu.issuesDetected.length > 0) {
                lines.push(`⚠️ ${pu.issuesDetected.join(', ')}`);
            }
        }
    }

    // イベント
    if (result.events.length > 0) {
        lines.push(`イベント: ${result.events.slice(0, 3).join(', ')}`);
    }

    return lines.join('\n');
}

/**
 * ターン結果からストア更新用データを生成
 */
export function generateStoreUpdates(result: TurnResult) {
    return {
        year: result.year,
        week: result.week,
        projectUpdates: result.projectUpdates,
        characterUpdates: result.characterUpdates,
        newEvents: result.newEvents,
    };
}
