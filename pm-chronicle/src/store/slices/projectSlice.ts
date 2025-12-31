/**
 * プロジェクトスライス - プロジェクト状態管理
 */

import type { Project, Task } from '../../types';

export interface ProjectSlice {
    // 状態
    currentProject: Project | null;
    tasks: Task[];
    projectHistory: string[];

    // アクション
    setCurrentProject: (project: Project | null) => void;
    updateProject: (updates: Partial<Project>) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    assignTask: (taskId: string, characterId: string | null) => void;
    advanceProjectWeek: () => void;
}

export const createProjectSlice = (set: (fn: (state: ProjectSlice) => Partial<ProjectSlice>) => void): ProjectSlice => ({
    // 初期状態
    currentProject: null,
    tasks: [],
    projectHistory: [],

    // アクション
    setCurrentProject: (project) => set(() => ({
        currentProject: project,
        tasks: [],
    })),

    updateProject: (updates) => set((state) => ({
        currentProject: state.currentProject
            ? { ...state.currentProject, ...updates }
            : null,
    })),

    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
    })),

    updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        ),
    })),

    removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
    })),

    assignTask: (taskId, characterId) => set((state) => ({
        tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, assigneeId: characterId } : t
        ),
    })),

    advanceProjectWeek: () => set((state) => ({
        currentProject: state.currentProject
            ? {
                ...state.currentProject,
                schedule: {
                    ...state.currentProject.schedule,
                    currentWeek: state.currentProject.schedule.currentWeek + 1,
                },
            }
            : null,
    })),
});
