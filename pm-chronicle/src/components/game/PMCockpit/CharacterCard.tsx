/**
 * キャラクターカードコンポーネント
 * チームメンバーの状態を表示
 */

import type { Character } from '../../../types';

interface CharacterCardProps {
    character: Character;
    compact?: boolean;
    onClick?: () => void;
    isDraggable?: boolean;
}

/** 状態アイコンを取得 */
function getStatusEmoji(character: Character): string {
    const staminaRatio = character.stamina.current / character.stamina.max;

    if (staminaRatio >= 0.8) return '😊';
    if (staminaRatio >= 0.5) return '😐';
    if (staminaRatio >= 0.2) return '😓';
    return '😵';
}

/** 役職名を取得 */
function getPositionName(title: string): string {
    const names: Record<string, string> = {
        NEWCOMER: '新人',
        MEMBER: 'メンバー',
        SENIOR: 'シニア',
        LEADER: 'リーダー',
        MANAGER: 'マネージャー',
        SENIOR_MANAGER: '上級マネージャー',
        DIRECTOR: '部長',
        EXECUTIVE: '執行役員',
        VICE_PRESIDENT: '副社長',
        PRESIDENT: '社長',
    };
    return names[title] || title;
}

export function CharacterCard({
    character,
    compact = false,
    onClick,
    isDraggable = false,
}: CharacterCardProps) {
    const staminaRatio = character.stamina.current / character.stamina.max;
    const staminaColor = staminaRatio >= 0.5 ? 'bg-[var(--color-success)]' : staminaRatio >= 0.2 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]';

    if (compact) {
        return (
            <div
                className={`flex items-center gap-2 p-2 bg-surface rounded-lg ${isDraggable ? 'cursor-grab hover:bg-surface-light' : ''} ${onClick ? 'cursor-pointer hover:bg-surface-light' : ''}`}
                onClick={onClick}
                draggable={isDraggable}
            >
                <span className="text-xl">{getStatusEmoji(character)}</span>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                        {character.name}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-surface-light rounded-full overflow-hidden">
                            <div
                                className={`h-full ${staminaColor}`}
                                style={{ width: `${staminaRatio * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400">
                            {character.stamina.current}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // フル表示
    return (
        <div
            className={`bg-surface rounded-xl p-4 border border-gray-700 ${isDraggable ? 'cursor-grab hover:border-[var(--color-primary)]' : ''} ${onClick ? 'cursor-pointer hover:border-[var(--color-primary)]' : ''}`}
            onClick={onClick}
            draggable={isDraggable}
        >
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-white font-bold">{character.name}</h4>
                    <p className="text-sm text-muted">
                        {getPositionName(character.position.title)}
                    </p>
                </div>
                <span className="text-2xl">{getStatusEmoji(character)}</span>
            </div>

            {/* スタミナバー */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>スタミナ</span>
                    <span>{character.stamina.current}/{character.stamina.max}</span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                    <div
                        className={`h-full ${staminaColor} transition-all duration-300`}
                        style={{ width: `${staminaRatio * 100}%` }}
                    />
                </div>
            </div>

            {/* スキルサマリー */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-700/50 rounded p-1">
                    <div className="text-xs text-gray-400">設計</div>
                    <div className="text-sm text-blue-400 font-bold">{character.statsBlue.design}</div>
                </div>
                <div className="bg-gray-700/50 rounded p-1">
                    <div className="text-xs text-gray-400">製造</div>
                    <div className="text-sm text-blue-400 font-bold">{character.statsBlue.develop}</div>
                </div>
                <div className="bg-gray-700/50 rounded p-1">
                    <div className="text-xs text-gray-400">評価</div>
                    <div className="text-sm text-blue-400 font-bold">{character.statsBlue.test}</div>
                </div>
            </div>

            {/* 特性タグ */}
            {character.traits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {character.traits.slice(0, 2).map(trait => (
                        <span
                            key={trait}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                        >
                            {trait}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/** キャラクターリスト */
export function CharacterList({
    characters,
    onSelect,
}: {
    characters: Character[];
    onSelect?: (character: Character) => void;
}) {
    return (
        <div className="space-y-2">
            {characters.map(character => (
                <CharacterCard
                    key={character.id}
                    character={character}
                    compact
                    onClick={() => onSelect?.(character)}
                />
            ))}
        </div>
    );
}
