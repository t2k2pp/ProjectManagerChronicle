/**
 * プロジェクトテンプレート
 */

import type { Project, Task, EVMState } from '../types';
import { v4 as uuid } from 'uuid';

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    budget: number;
    duration: number; // 週
    taskCount: number;
    tags: string[];
}

/** 利用可能なプロジェクトテンプレート */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: 'small-web',
        name: '小規模Webサイト構築',
        description: '企業サイトのリニューアル案件。比較的シンプルな要件。',
        difficulty: 'EASY',
        budget: 500,
        duration: 8,
        taskCount: 5,
        tags: ['Web', '新規開発'],
    },
    {
        id: 'mobile-app',
        name: 'モバイルアプリ開発',
        description: 'iOS/Android向けのネイティブアプリ開発。',
        difficulty: 'NORMAL',
        budget: 2000,
        duration: 16,
        taskCount: 10,
        tags: ['モバイル', '新規開発'],
    },
    {
        id: 'enterprise-system',
        name: '基幹システム刷新',
        description: '大規模な業務システムのモダナイズ。多くのステークホルダー対応が必要。',
        difficulty: 'HARD',
        budget: 10000,
        duration: 52,
        taskCount: 25,
        tags: ['基幹システム', '刷新'],
    },
    {
        id: 'ai-poc',
        name: 'AI PoC開発',
        description: '機械学習を活用した概念実証。技術的な不確実性が高い。',
        difficulty: 'HARD',
        budget: 3000,
        duration: 12,
        taskCount: 8,
        tags: ['AI', 'PoC'],
    },
];

/**
 * テンプレートからプロジェクトを生成
 */
export function createProjectFromTemplate(
    template: ProjectTemplate,
    clientName: string,
    startWeek: number
): { project: Project; tasks: Task[] } {
    const projectId = uuid();
    const endWeek = startWeek + template.duration;

    const defaultEVM: EVMState = {
        pv: 0,
        ev: 0,
        ac: 0,
        spi: 1,
        cpi: 1,
    };

    const project: Project = {
        id: projectId,
        name: template.name,
        client: clientName,
        budget: {
            initial: template.budget,
            current: template.budget,
        },
        schedule: {
            startWeek,
            endWeek,
            currentWeek: startWeek,
        },
        evm: defaultEVM,
        status: 'PLANNING',
    };

    // タスク生成
    const tasks = generateTasksForTemplate(template, projectId);

    return { project, tasks };
}

/**
 * テンプレートに基づいてタスクを生成
 */
function generateTasksForTemplate(
    template: ProjectTemplate,
    projectId: string
): Task[] {
    const tasks: Task[] = [];
    const phases: Task['phase'][] = ['REQUIREMENT', 'DESIGN', 'DEVELOP', 'TEST'];
    const phaseDuration = Math.ceil(template.taskCount / phases.length);

    phases.forEach((phase, phaseIndex) => {
        const taskCount = phaseIndex === phases.length - 1
            ? template.taskCount - (phaseDuration * (phases.length - 1))
            : phaseDuration;

        for (let i = 0; i < taskCount; i++) {
            tasks.push({
                id: uuid(),
                projectId,
                name: `${getPhaseLabel(phase)} - タスク${i + 1}`,
                assigneeId: null,
                phase,
                progress: 0,
                quality: 0,
                riskFactor: Math.random() * 0.3,
                dependencies: phaseIndex > 0 && i === 0
                    ? [tasks[tasks.length - 1]?.id].filter(Boolean)
                    : [],
                isCriticalPath: i === 0, // 各フェーズ最初のタスクはクリティカルパス
            });
        }
    });

    return tasks;
}

function getPhaseLabel(phase: Task['phase']): string {
    switch (phase) {
        case 'REQUIREMENT': return '要件定義';
        case 'DESIGN': return '設計';
        case 'DEVELOP': return '開発';
        case 'TEST': return 'テスト';
        default: return phase;
    }
}
