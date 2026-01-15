/**
 * 結婚システム
 * 設計書 6.3.1 恋愛・結婚 準拠
 */

import type { Character } from '../../types';

/** 結婚イベントの結果 */
export interface MarriageEventResult {
    triggered: boolean;
    partnerId?: string;
    eventType?: 'CONFESSION' | 'PROPOSAL' | 'WEDDING';
    message?: string;
}

/**
 * 結婚イベント判定
 * ・同僚NPCとの関係値が80以上
 * ・両者とも独身
 * ・低確率で発生
 * ・異性間のみ（ユーザー要望）
 */
export function checkMarriageEvent(
    player: Character,
    npcs: Character[],
    seed: number
): MarriageEventResult {
    // 既婚者は除外
    if (player.marriageStatus !== 'SINGLE') {
        return { triggered: false };
    }

    // 候補者をフィルタリング
    const candidates = npcs.filter(npc => {
        // 1. 独身であること
        if (npc.marriageStatus !== 'SINGLE') return false;

        // 2. 異性であること（ユーザー要望）
        // M-F, F-M の組み合わせのみ許可
        if (player.gender === npc.gender) return false;
        if (player.gender === 'OTHER' || npc.gender === 'OTHER') return false; // OTHERの場合は現状結婚不可とする

        // 3. 関係値が80以上であること
        const rel = player.relationships.find(r => r.npcId === npc.id);
        if (!rel || rel.strength < 80) return false;

        return true;
    });

    if (candidates.length === 0) {
        return { triggered: false };
    }

    // 確率判定 (例: 5%の確率で発生)
    // 実際の実装では、イベント頻度が高すぎないように乱数を使用
    const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
    if (random > 0.05) {
        return { triggered: false };
    }

    // 候補者からランダムに1名選出
    const targetIndex = Math.floor(random * 100) % candidates.length;
    const target = candidates[targetIndex];

    // イベントタイプの決定
    // 現状は簡易的に、関係値に応じてステップアップさせるか、あるいはランダムで「プロポーズ」イベントなどを発生させる
    // ここでは「プロポーズ」イベントとして定義

    return {
        triggered: true,
        partnerId: target.id,
        eventType: 'PROPOSAL',
        message: `${target.name}から重要な話があるようです...`
    };
}
