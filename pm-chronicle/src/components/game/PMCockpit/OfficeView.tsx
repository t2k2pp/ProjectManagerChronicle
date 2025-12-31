/**
 * オフィスビューコンポーネント
 * チームメンバーをグリッド表示し、状態を可視化
 */

import type { Character } from '../../../types';
import { CharacterCard } from './CharacterCard';

interface OfficeViewProps {
    characters: Character[];
    onCharacterClick?: (character: Character) => void;
    selectedCharacterId?: string;
    layout?: 'grid' | 'list';
}

export function OfficeView({
    characters,
    onCharacterClick,
    selectedCharacterId,
    layout = 'grid',
}: OfficeViewProps) {
    // ステータスごとにグルーピング
    const healthyMembers = characters.filter(c =>
        c.stamina.current / c.stamina.max >= 0.5
    );
    const tiredMembers = characters.filter(c =>
        c.stamina.current / c.stamina.max < 0.5 && c.stamina.current / c.stamina.max >= 0.2
    );
    const exhaustedMembers = characters.filter(c =>
        c.stamina.current / c.stamina.max < 0.2
    );

    if (layout === 'list') {
        return (
            <div className="space-y-2">
                {characters.map(character => (
                    <CharacterCard
                        key={character.id}
                        character={character}
                        compact
                        onClick={() => onCharacterClick?.(character)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* チームサマリー */}
            <div className="flex gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm text-gray-300">良好: {healthyMembers.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-sm text-gray-300">疲労: {tiredMembers.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm text-gray-300">消耗: {exhaustedMembers.length}</span>
                </div>
            </div>

            {/* メンバーグリッド */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {characters.map(character => (
                    <div
                        key={character.id}
                        className={`transition-transform ${selectedCharacterId === character.id
                                ? 'ring-2 ring-blue-500 rounded-xl scale-105'
                                : ''
                            }`}
                    >
                        <CharacterCard
                            character={character}
                            onClick={() => onCharacterClick?.(character)}
                        />
                    </div>
                ))}
            </div>

            {/* 空の場合 */}
            {characters.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">チームメンバーがいません</p>
                    <p className="text-sm mt-2">プロジェクト開始時にメンバーをアサインしてください</p>
                </div>
            )}
        </div>
    );
}

/** ミニオフィスビュー（ダッシュボード用） */
export function MiniOfficeView({
    characters,
    maxDisplay = 6,
}: {
    characters: Character[];
    maxDisplay?: number;
}) {
    const displayCharacters = characters.slice(0, maxDisplay);
    const remaining = characters.length - maxDisplay;

    return (
        <div className="flex flex-wrap gap-2">
            {displayCharacters.map(character => {
                const staminaRatio = character.stamina.current / character.stamina.max;
                const statusColor = staminaRatio >= 0.5 ? 'bg-green-500' : staminaRatio >= 0.2 ? 'bg-yellow-500' : 'bg-red-500';

                return (
                    <div
                        key={character.id}
                        className="relative group"
                        title={`${character.name} - スタミナ: ${character.stamina.current}/${character.stamina.max}`}
                    >
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                            {getStatusEmoji(character)}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusColor} border-2 border-gray-800`}></span>
                    </div>
                );
            })}
            {remaining > 0 && (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-300">
                    +{remaining}
                </div>
            )}
        </div>
    );
}

/** 状態アイコンを取得 */
function getStatusEmoji(character: Character): string {
    const staminaRatio = character.stamina.current / character.stamina.max;

    if (staminaRatio >= 0.8) return '😊';
    if (staminaRatio >= 0.5) return '😐';
    if (staminaRatio >= 0.2) return '😓';
    return '😵';
}
