/**
 * メンバー用ダッシュボード
 * 担当者として働く画面（自己成長フォーカス）
 */

import { useState } from 'react';
import { Button, Card, Badge } from '../common';
import { WorkStyleSelector } from '../game/WorkStyleSelector';
import {
    calculateMonthlySalary,
    calculateDisposableIncome,
    SELF_DEVELOPMENT_OPTIONS,
    processSelfDevelopment,
    CERTIFICATION_LABELS,
    type SelfDevelopmentOption,
} from '../../lib/economy';
import type { Character, Task } from '../../types';

interface MemberDashboardProps {
    player: Character;
    currentYear: number;
    currentWeek: number;
    assignedTask?: Task;
    onWeekEnd: () => void;
    onPlayerUpdate: (player: Character) => void;
}

export function MemberDashboard({
    player,
    currentYear,
    currentWeek,
    assignedTask,
    onWeekEnd,
    onPlayerUpdate,
}: MemberDashboardProps) {
    const [showSelfDev, setShowSelfDev] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const salary = calculateMonthlySalary(player);
    const disposable = calculateDisposableIncome(salary);

    const handleSelfDevelopment = (option: SelfDevelopmentOption) => {
        const result = processSelfDevelopment(player, option);
        setMessage(result.message);
        onPlayerUpdate({ ...player });
        setShowSelfDev(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">📋 担当者ダッシュボード</h1>
                    <p className="text-gray-400">{currentYear}年 第{currentWeek}週</p>
                </div>
                <Button variant="primary" onClick={onWeekEnd}>
                    週を終える →
                </Button>
            </div>

            {/* メッセージ */}
            {message && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-300">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左: ステータス */}
                <div className="space-y-4">
                    {/* 基本情報 */}
                    <Card variant="glass" padding="md">
                        <h2 className="text-lg font-bold text-white mb-3">👤 {player.name}</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">役職</span>
                                <span className="text-white">{player.position.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">年齢</span>
                                <span className="text-white">{currentYear - player.birthYear}歳</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">入社</span>
                                <span className="text-white">{player.joinYear}年</span>
                            </div>
                        </div>
                    </Card>

                    {/* 経済状況 */}
                    <Card variant="glass" padding="md">
                        <h2 className="text-lg font-bold text-white mb-3">💰 経済状況</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">月収</span>
                                <span className="text-green-400">{salary.toFixed(1)}万円</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">可処分所得</span>
                                <span className="text-blue-400">{disposable.toFixed(1)}万円/月</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">所持金</span>
                                <span className="text-yellow-400 font-bold">{player.money.toFixed(1)}万円</span>
                            </div>
                        </div>
                    </Card>

                    {/* 資格 */}
                    <Card variant="glass" padding="md">
                        <h2 className="text-lg font-bold text-white mb-3">📜 取得資格</h2>
                        {player.certifications.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {player.certifications.map(cert => (
                                    <Badge key={cert} variant="success">
                                        {CERTIFICATION_LABELS[cert] || cert}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">まだ資格を取得していません</p>
                        )}
                    </Card>
                </div>

                {/* 中央: 現在のタスク & 働き方 */}
                <div className="space-y-4">
                    {/* 現在のタスク */}
                    <Card variant="glass" padding="md">
                        <h2 className="text-lg font-bold text-white mb-3">📋 今週のタスク</h2>
                        {assignedTask ? (
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="text-white font-medium mb-2">{assignedTask.name}</div>
                                <div className="text-xs text-gray-400 mb-2">
                                    進捗: {assignedTask.progress}%
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${assignedTask.progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                タスクがアサインされていません
                            </div>
                        )}
                    </Card>

                    {/* 働き方選択 */}
                    <WorkStyleSelector
                        player={player}
                        onSelect={() => { }}
                        onSkillGain={(result) => setMessage(result.message)}
                    />
                </div>

                {/* 右: 自己啓発 */}
                <div>
                    <Card variant="glass" padding="md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">📚 自己啓発</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSelfDev(!showSelfDev)}
                            >
                                {showSelfDev ? '閉じる' : '投資する'}
                            </Button>
                        </div>

                        {showSelfDev && (
                            <div className="space-y-3">
                                {SELF_DEVELOPMENT_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelfDevelopment(option)}
                                        disabled={player.money < option.cost}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${player.money >= option.cost
                                                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                                                : 'border-gray-800 bg-gray-900 opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-white text-sm">{option.label}</span>
                                            <Badge variant={player.money >= option.cost ? 'warning' : 'default'}>
                                                {option.cost}万円
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-400">{option.description}</p>
                                        {option.certificationEarned && (
                                            <p className="text-xs text-green-400 mt-1">
                                                合格で資格取得！
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!showSelfDev && (
                            <p className="text-gray-500 text-sm">
                                所持金を使って自己啓発に投資できます。<br />
                                資格取得で月収が上がります！
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
