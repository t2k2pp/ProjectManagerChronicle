/**
 * キャラクターステータス表示コンポーネント
 * ダブル・ヘキサゴンチャートと詳細情報を表示
 */

import type { Character } from '../../../types';
import { HexagonChart } from '../../common';
import { Badge } from '../../common';

interface StatusDisplayProps {
    character: Character;
    showDetails?: boolean;
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

export function StatusDisplay({ character, showDetails = true }: StatusDisplayProps) {
    const staminaRatio = character.stamina.current / character.stamina.max;

    return (
        <div className="space-y-6">
            {/* ヘッダー */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{character.name}</h2>
                    <p className="text-gray-400">{getPositionName(character.position.title)}</p>
                </div>
                <div className="text-right">
                    <Badge variant={character.status === 'EMPLOYED' ? 'info' : 'warning'}>
                        {character.status === 'EMPLOYED' ? '正社員' :
                            character.status === 'FREELANCE' ? 'フリーランス' : character.status}
                    </Badge>
                </div>
            </div>

            {/* スタミナバー */}
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">スタミナ</span>
                    <span className="text-white">{character.stamina.current} / {character.stamina.max}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${staminaRatio >= 0.5 ? 'bg-green-500' : staminaRatio >= 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${staminaRatio * 100}%` }}
                    />
                </div>
            </div>

            {/* ダブル・ヘキサゴンチャート */}
            <div className="flex justify-center">
                <HexagonChart statsBlue={character.statsBlue} statsRed={character.statsRed} size={280} />
            </div>

            {/* 詳細情報 */}
            {showDetails && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">技術スキル</div>
                        <div className="flex flex-wrap gap-1">
                            {character.techSkills.length > 0 ? (
                                character.techSkills.map(skill => (
                                    <Badge key={skill} variant="info" size="sm">{skill}</Badge>
                                ))
                            ) : (
                                <span className="text-gray-500 text-sm">なし</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">特性</div>
                        <div className="flex flex-wrap gap-1">
                            {character.traits.length > 0 ? (
                                character.traits.map(trait => (
                                    <Badge key={trait} variant="warning" size="sm">{trait}</Badge>
                                ))
                            ) : (
                                <span className="text-gray-500 text-sm">なし</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">忠誠度</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${character.loyalty}%` }}
                                />
                            </div>
                            <span className="text-white text-sm">{character.loyalty}%</span>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">野心</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{ width: `${character.ambition}%` }}
                                />
                            </div>
                            <span className="text-white text-sm">{character.ambition}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
