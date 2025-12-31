/**
 * ワールドスライス - 世界状態管理
 */

import type { Company, Character, HistoricalEvent } from '../../types';

export interface WorldSlice {
    // 状態
    currentYear: number;
    currentWeek: number;
    companies: Company[];
    npcs: Character[];
    historicalEvents: HistoricalEvent[];
    activeEvents: string[];

    // アクション
    setCurrentYear: (year: number) => void;
    advanceWeek: () => void;
    addCompany: (company: Company) => void;
    removeCompany: (id: string) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    addNPC: (npc: Character) => void;
    updateNPC: (id: string, updates: Partial<Character>) => void;
    triggerEvent: (eventId: string) => void;
}

export const createWorldSlice = (set: (fn: (state: WorldSlice) => Partial<WorldSlice>) => void): WorldSlice => ({
    // 初期状態
    currentYear: 2000,
    currentWeek: 1,
    companies: [],
    npcs: [],
    historicalEvents: [],
    activeEvents: [],

    // アクション
    setCurrentYear: (year) => set(() => ({ currentYear: year })),

    advanceWeek: () => set((state) => {
        const nextWeek = state.currentWeek + 1;
        const nextYear = nextWeek > 52 ? state.currentYear + 1 : state.currentYear;
        return {
            currentWeek: nextWeek > 52 ? 1 : nextWeek,
            currentYear: nextYear,
        };
    }),

    addCompany: (company) => set((state) => ({
        companies: [...state.companies, company],
    })),

    removeCompany: (id) => set((state) => ({
        companies: state.companies.filter(c => c.id !== id),
    })),

    updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ),
    })),

    addNPC: (npc) => set((state) => ({
        npcs: [...state.npcs, npc],
    })),

    updateNPC: (id, updates) => set((state) => ({
        npcs: state.npcs.map(n =>
            n.id === id ? { ...n, ...updates } : n
        ),
    })),

    triggerEvent: (eventId) => set((state) => ({
        activeEvents: [...state.activeEvents, eventId],
    })),
});
