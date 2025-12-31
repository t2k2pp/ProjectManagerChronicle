/**
 * NPC関係性生成ロジック
 */

import type { Character, RelationshipType } from '../../types';

/** 関係性生成オプション */
interface RelationshipGenerationOptions {
    /** 同期の確率 */
    colleagueProbability?: number;
    /** メンター関係の確率 */
    mentorProbability?: number;
    /** ライバルの確率 */
    rivalProbability?: number;
}

/**
 * NPCの初期関係性を生成
 */
export function generateInitialRelationships(
    characters: Character[],
    options: RelationshipGenerationOptions = {}
): void {
    const {
        colleagueProbability = 0.3,
        mentorProbability = 0.1,
        rivalProbability = 0.05,
    } = options;

    // 会社ごとにグループ化
    const companyGroups = new Map<string, Character[]>();
    for (const char of characters) {
        if (char.companyId) {
            const group = companyGroups.get(char.companyId) || [];
            group.push(char);
            companyGroups.set(char.companyId, group);
        }
    }

    // 各会社内で関係性を生成
    for (const [, members] of companyGroups) {
        generateCompanyRelationships(members, {
            colleagueProbability,
            mentorProbability,
            rivalProbability,
        });
    }
}

/**
 * 同一会社内の関係性を生成
 */
function generateCompanyRelationships(
    members: Character[],
    options: RelationshipGenerationOptions
): void {
    const {
        colleagueProbability = 0.3,
        mentorProbability = 0.1,
        rivalProbability = 0.05,
    } = options;

    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            const charA = members[i];
            const charB = members[j];

            // 同期判定（入社年が同じ）
            if (charA.joinYear === charB.joinYear && Math.random() < colleagueProbability) {
                addRelationship(charA, charB.id, 'COLLEAGUE', 50 + Math.random() * 30);
                addRelationship(charB, charA.id, 'COLLEAGUE', 50 + Math.random() * 30);
                continue;
            }

            // メンター関係判定（役職差が大きい & 入社年差がある）
            const rankDiff = charA.position.rank - charB.position.rank;
            const yearDiff = charA.joinYear - charB.joinYear;

            if (Math.abs(rankDiff) >= 2 && Math.abs(yearDiff) >= 3 && Math.random() < mentorProbability) {
                if (rankDiff > 0) {
                    // charAがメンター
                    addRelationship(charA, charB.id, 'MENTEE', 40 + Math.random() * 40);
                    addRelationship(charB, charA.id, 'MENTOR', 40 + Math.random() * 40);
                } else {
                    // charBがメンター
                    addRelationship(charB, charA.id, 'MENTEE', 40 + Math.random() * 40);
                    addRelationship(charA, charB.id, 'MENTOR', 40 + Math.random() * 40);
                }
                continue;
            }

            // ライバル関係判定（同じ役職ランク）
            if (charA.position.rank === charB.position.rank &&
                charA.ambition > 60 && charB.ambition > 60 &&
                Math.random() < rivalProbability) {
                addRelationship(charA, charB.id, 'RIVAL', 30 + Math.random() * 40);
                addRelationship(charB, charA.id, 'RIVAL', 30 + Math.random() * 40);
            }
        }
    }
}

/**
 * 関係性を追加
 */
function addRelationship(
    character: Character,
    targetId: string,
    type: RelationshipType,
    strength: number
): void {
    // 既存の関係チェック
    const existing = character.relationships.find(r => r.npcId === targetId);
    if (existing) {
        existing.strength = Math.max(existing.strength, strength);
        return;
    }

    character.relationships.push({
        npcId: targetId,
        type,
        strength: Math.min(100, Math.max(0, strength)),
    });
}

/**
 * 関係性の強度を更新
 */
export function updateRelationshipStrength(
    character: Character,
    targetId: string,
    delta: number
): void {
    const relationship = character.relationships.find(r => r.npcId === targetId);
    if (relationship) {
        relationship.strength = Math.min(100, Math.max(0, relationship.strength + delta));
    }
}

/**
 * 友好関係に発展させる
 */
export function developFriendship(
    charA: Character,
    charB: Character
): void {
    addRelationship(charA, charB.id, 'FRIEND', 60);
    addRelationship(charB, charA.id, 'FRIEND', 60);
}
