/**
 * ゲーム状態ストア
 * Zustandによるグローバル状態管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldState, Character, Company } from '../types';
import { db, type SaveSlot } from '../db/schema';

/** ゲームフェーズ */
export type GamePhase =
    | 'TITLE'           // タイトル画面
    | 'SETUP'           // ゲーム設定
    | 'DASHBOARD'       // ダッシュボード
    | 'PROJECT_SELECT'  // 案件選択
    | 'BIDDING'         // 入札バトル
    | 'PM_COCKPIT'      // PMコックピット（メイン）
    | 'PROJECT_COMPLETION' // プロジェクト完了
    | 'ACTIVITY'        // 日常活動
    | 'CARD_BATTLE'     // カードバトル
    | 'VACATION_PUZZLE' // 休暇パズル
    | 'REPORT'          // 振り返りレポート
    | 'CAREER'          // キャリア画面
    | 'INDUSTRY_MAP';   // 業界マップ

/** ゲーム状態 */
interface GameState {
    // ゲームフェーズ
    phase: GamePhase;
    setPhase: (phase: GamePhase) => void;

    // セーブスロット
    currentSlot: number | null;
    setCurrentSlot: (slot: number) => void;

    // ワールド状態
    worldState: WorldState | null;
    setWorldState: (world: WorldState) => void;

    // プレイヤー
    playerId: string | null;
    setPlayerId: (id: string) => void;

    // 現在のプロジェクト
    currentProjectId: string | null;
    setCurrentProjectId: (id: string | null) => void;

    // ローディング状態
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // エラー
    error: string | null;
    setError: (error: string | null) => void;

    // アクション
    startNewGame: (worldState: WorldState, playerId: string, slot: number) => Promise<void>;
    loadGame: (slot: number) => Promise<boolean>;
    saveGame: () => Promise<void>;
    resetGame: () => void;
}

/** ゲームストア */
export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // 初期状態
            phase: 'TITLE',
            currentSlot: null,
            worldState: null,
            playerId: null,
            currentProjectId: null,
            isLoading: false,
            error: null,

            // セッター
            setPhase: (phase) => set({ phase }),
            setCurrentSlot: (slot) => set({ currentSlot: slot }),
            setWorldState: (world) => set({ worldState: world }),
            setPlayerId: (id) => set({ playerId: id }),
            setCurrentProjectId: (id) => set({ currentProjectId: id }),
            setIsLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),

            // 新規ゲーム開始
            startNewGame: async (worldState, playerId, slot) => {
                set({ isLoading: true, error: null });
                try {
                    const now = new Date();
                    const saveData: SaveSlot = {
                        id: slot,
                        name: `セーブ ${slot}`,
                        createdAt: now,
                        updatedAt: now,
                        worldState,
                        playerCharacterId: playerId,
                    };

                    await db.saves.put(saveData);

                    set({
                        phase: 'DASHBOARD',
                        currentSlot: slot,
                        worldState,
                        playerId,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: `ゲーム開始に失敗しました: ${error}`,
                        isLoading: false,
                    });
                }
            },

            // ゲームロード
            loadGame: async (slot) => {
                set({ isLoading: true, error: null });
                try {
                    const saveData = await db.saves.get(slot);
                    if (!saveData) {
                        set({
                            error: 'セーブデータが見つかりません',
                            isLoading: false,
                        });
                        return false;
                    }

                    set({
                        phase: 'DASHBOARD',
                        currentSlot: slot,
                        worldState: saveData.worldState,
                        playerId: saveData.playerCharacterId,
                        currentProjectId: saveData.currentProjectId,
                        isLoading: false,
                    });
                    return true;
                } catch (error) {
                    set({
                        error: `ロードに失敗しました: ${error}`,
                        isLoading: false,
                    });
                    return false;
                }
            },

            // ゲーム保存
            saveGame: async () => {
                const { currentSlot, worldState, playerId, currentProjectId } = get();
                if (!currentSlot || !worldState || !playerId) {
                    set({ error: '保存するデータがありません' });
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    const existing = await db.saves.get(currentSlot);
                    const now = new Date();

                    const saveData: SaveSlot = {
                        id: currentSlot,
                        name: existing?.name || `セーブ ${currentSlot}`,
                        createdAt: existing?.createdAt || now,
                        updatedAt: now,
                        worldState,
                        playerCharacterId: playerId,
                        currentProjectId: currentProjectId || undefined,
                    };

                    await db.saves.put(saveData);
                    set({ isLoading: false });
                } catch (error) {
                    set({
                        error: `保存に失敗しました: ${error}`,
                        isLoading: false,
                    });
                }
            },

            // リセット
            resetGame: () => {
                set({
                    phase: 'TITLE',
                    currentSlot: null,
                    worldState: null,
                    playerId: null,
                    currentProjectId: null,
                    isLoading: false,
                    error: null,
                });
            },
        }),
        {
            name: 'pm-chronicle-game',
            partialize: (state) => ({
                currentSlot: state.currentSlot,
                // 軽量データのみ永続化（ワールドはIndexedDBに保存）
            }),
        }
    )
);

/** プレイヤーキャラクター取得ヘルパー */
export function getPlayerCharacter(state: GameState): Character | null {
    if (!state.worldState || !state.playerId) return null;
    return (
        state.worldState.npcs.find(c => c.id === state.playerId) ||
        state.worldState.freelancers.find(c => c.id === state.playerId) ||
        null
    );
}

/** プレイヤー所属企業取得ヘルパー */
export function getPlayerCompany(state: GameState): Company | null {
    const player = getPlayerCharacter(state);
    if (!player?.companyId || !state.worldState) return null;
    return state.worldState.companies.find(c => c.id === player.companyId) || null;
}
