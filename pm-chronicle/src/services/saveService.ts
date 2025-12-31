/**
 * セーブ/ロードサービス
 * ゲームデータの永続化を管理
 */

import { db, type SaveSlot } from '../db/schema';
import type { WorldState, Project, Task, WeeklyLog } from '../types';

/** セーブデータ（拡張版）- エクスポート用 */
export interface SaveData extends SaveSlot {
    project?: Project;
    tasks?: Task[];
    logs?: WeeklyLog[];
    version: string;
}

/** セーブスロット情報（一覧表示用） */
export interface SaveSlotInfo {
    slotNumber: number;
    name: string;
    playerName: string;
    currentYear: number;
    currentWeek: number;
    updatedAt: Date;
    isEmpty: boolean;
}

const MAX_SLOTS = 5;

/** セーブサービス */
export const saveService = {
    /**
     * ゲームをセーブ
     */
    async save(
        slotId: number,
        name: string,
        playerId: string,
        worldState: WorldState,
        currentProjectId?: string
    ): Promise<void> {
        if (slotId < 0 || slotId > MAX_SLOTS) {
            throw new Error(`Invalid slot id: ${slotId}`);
        }

        const now = new Date();
        const existing = await db.saves.get(slotId);

        const saveSlot: SaveSlot = {
            id: slotId,
            name,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
            worldState,
            playerCharacterId: playerId,
            currentProjectId,
        };

        await db.saves.put(saveSlot);
    },

    /**
     * ゲームをロード
     */
    async load(slotId: number): Promise<SaveSlot | null> {
        const saveSlot = await db.saves.get(slotId);
        return saveSlot || null;
    },

    /**
     * セーブを削除
     */
    async delete(slotId: number): Promise<void> {
        await db.saves.delete(slotId);
    },

    /**
     * 全スロット情報を取得
     */
    async getSlotInfos(): Promise<SaveSlotInfo[]> {
        const saves = await db.saves.toArray();
        const saveMap = new Map(saves.map(s => [s.id, s]));

        const slots: SaveSlotInfo[] = [];
        for (let i = 1; i <= MAX_SLOTS; i++) {
            const save = saveMap.get(i);
            if (save) {
                const player = save.worldState.npcs.find(n => n.id === save.playerCharacterId) ||
                    save.worldState.freelancers.find(n => n.id === save.playerCharacterId);
                slots.push({
                    slotNumber: i,
                    name: save.name,
                    playerName: player?.name || 'Unknown',
                    currentYear: save.worldState.currentYear,
                    currentWeek: save.worldState.currentWeek,
                    updatedAt: save.updatedAt,
                    isEmpty: false,
                });
            } else {
                slots.push({
                    slotNumber: i,
                    name: '',
                    playerName: '',
                    currentYear: 0,
                    currentWeek: 0,
                    updatedAt: new Date(),
                    isEmpty: true,
                });
            }
        }

        return slots;
    },

    /**
     * オートセーブ（スロット0を使用）
     */
    async autoSave(
        playerId: string,
        worldState: WorldState,
        currentProjectId?: string
    ): Promise<void> {
        await this.save(0, 'オートセーブ', playerId, worldState, currentProjectId);
    },

    /**
     * オートセーブをロード
     */
    async loadAutoSave(): Promise<SaveSlot | null> {
        return this.load(0);
    },
};
