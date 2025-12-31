/**
 * キャラクタースライス - プレイヤー・チーム状態管理
 */

import type { Character } from '../../types';

export interface CharacterSlice {
    // 状態
    player: Character | null;
    teamMembers: Character[];
    selectedCharacterId: string | null;

    // アクション
    setPlayer: (player: Character) => void;
    updatePlayer: (updates: Partial<Character>) => void;
    setTeamMembers: (members: Character[]) => void;
    addTeamMember: (member: Character) => void;
    removeTeamMember: (id: string) => void;
    updateTeamMember: (id: string, updates: Partial<Character>) => void;
    selectCharacter: (id: string | null) => void;
    updateStamina: (characterId: string, delta: number) => void;
}

export const createCharacterSlice = (set: (fn: (state: CharacterSlice) => Partial<CharacterSlice>) => void): CharacterSlice => ({
    // 初期状態
    player: null,
    teamMembers: [],
    selectedCharacterId: null,

    // アクション
    setPlayer: (player) => set(() => ({ player })),

    updatePlayer: (updates) => set((state) => ({
        player: state.player ? { ...state.player, ...updates } : null,
    })),

    setTeamMembers: (members) => set(() => ({
        teamMembers: members,
    })),

    addTeamMember: (member) => set((state) => ({
        teamMembers: [...state.teamMembers, member],
    })),

    removeTeamMember: (id) => set((state) => ({
        teamMembers: state.teamMembers.filter(m => m.id !== id),
    })),

    updateTeamMember: (id, updates) => set((state) => ({
        teamMembers: state.teamMembers.map(m =>
            m.id === id ? { ...m, ...updates } : m
        ),
    })),

    selectCharacter: (id) => set(() => ({
        selectedCharacterId: id,
    })),

    updateStamina: (characterId, delta) => set((state) => {
        // プレイヤーの場合
        if (state.player?.id === characterId) {
            return {
                player: {
                    ...state.player,
                    stamina: {
                        ...state.player.stamina,
                        current: Math.min(
                            state.player.stamina.max,
                            Math.max(0, state.player.stamina.current + delta)
                        ),
                    },
                },
            };
        }
        // チームメンバーの場合
        return {
            teamMembers: state.teamMembers.map(m =>
                m.id === characterId
                    ? {
                        ...m,
                        stamina: {
                            ...m.stamina,
                            current: Math.min(m.stamina.max, Math.max(0, m.stamina.current + delta)),
                        },
                    }
                    : m
            ),
        };
    }),
});
