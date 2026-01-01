/**
 * チームメンバーカード
 * 評判ベースの情報表示（スキル値は非表示）
 */

import { Badge } from '../common';
import { calcReputation, calcExperienceYears, getStarsDisplay, getPositionLabel } from '../../lib/reputation';
import type { Character } from '../../types';

interface TeamMemberCardProps {
    member: Character;
    currentYear: number;
    isSelected?: boolean;
    onClick?: () => void;
    showAssignButton?: boolean;
    onAssign?: () => void;
}

export function TeamMemberCard({
    member,
    currentYear,
    isSelected = false,
    onClick,
    showAssignButton = false,
    onAssign,
}: TeamMemberCardProps) {
    const reputation = calcReputation(member);
    const experienceYears = calcExperienceYears(member, currentYear);
    const age = currentYear - member.birthYear;

    // スタミナ割合
    const staminaPercent = (member.stamina.current / member.stamina.max) * 100;
    const staminaColor = staminaPercent > 60 ? 'bg-green-500' : staminaPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div
            onClick={onClick}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                }`}
        >
            {/* 名前と役職 */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-bold text-white">{member.name}</div>
                    <div className="text-xs text-gray-400">{getPositionLabel(member.position.title)}</div>
                </div>
                <Badge variant={reputation.type === 'TECH' ? 'info' : reputation.type === 'SOCIAL' ? 'warning' : 'default'}>
                    {reputation.typeLabel}
                </Badge>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="text-gray-400">
                    年齢: <span className="text-white">{age}歳</span>
                </div>
                <div className="text-gray-400">
                    {member.gender === 'M' ? '♂' : '♀'}
                </div>
                <div className="text-gray-400">
                    経験: <span className="text-white">{experienceYears}年</span>
                </div>
            </div>

            {/* 評判（スター） */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">評判:</span>
                <span className="text-sm">{getStarsDisplay(reputation.stars)}</span>
            </div>

            {/* スタミナバー */}
            <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">スタミナ</span>
                    <span className="text-white">{member.stamina.current}/{member.stamina.max}</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${staminaColor}`}
                        style={{ width: `${staminaPercent}%` }}
                    />
                </div>
            </div>

            {/* アサインボタン */}
            {showAssignButton && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAssign?.();
                    }}
                    className="w-full mt-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    アサイン
                </button>
            )}
        </div>
    );
}
