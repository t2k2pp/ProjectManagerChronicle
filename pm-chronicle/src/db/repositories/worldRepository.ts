/**
 * ワールドリポジトリ
 * セットアップ用ワールドのCRUD操作
 */

import { db, type SetupWorld } from '../schema';
import type { WorldState } from '../../types';

const SETUP_WORLD_ID = 0;

/**
 * セットアップ用ワールドを保存
 */
export async function saveSetupWorld(worldState: WorldState): Promise<void> {
    const setupWorld: SetupWorld = {
        id: SETUP_WORLD_ID,
        worldState,
        createdAt: new Date(),
    };
    await db.setupWorlds.put(setupWorld);
}

/**
 * セットアップ用ワールドを取得
 */
export async function getSetupWorld(): Promise<WorldState | null> {
    const setupWorld = await db.setupWorlds.get(SETUP_WORLD_ID);
    return setupWorld?.worldState || null;
}

/**
 * セットアップ用ワールドが存在するか確認
 */
export async function hasSetupWorld(): Promise<boolean> {
    const count = await db.setupWorlds.count();
    return count > 0;
}

/**
 * セットアップ用ワールドをクリア（ゲーム開始後）
 */
export async function clearSetupWorld(): Promise<void> {
    await db.setupWorlds.delete(SETUP_WORLD_ID);
}

/**
 * ワールドの開始年を調整
 * 企業・NPC等のマスタデータは維持しつつ、年のみ変更
 */
export function adjustWorldYear(world: WorldState, newYear: number): WorldState {
    const yearDiff = newYear - world.startYear;

    return {
        ...world,
        startYear: newYear,
        currentYear: newYear,
        currentWeek: 1,
        // NPC・フリーランサーの生年を調整
        npcs: world.npcs.map(npc => ({
            ...npc,
            birthYear: npc.birthYear + yearDiff,
            joinYear: npc.joinYear + yearDiff,
        })),
        freelancers: world.freelancers.map(f => ({
            ...f,
            birthYear: f.birthYear + yearDiff,
            joinYear: f.joinYear + yearDiff,
        })),
        // 企業の設立年を調整
        companies: world.companies.map(c => ({
            ...c,
            foundedYear: c.foundedYear + yearDiff,
        })),
    };
}
