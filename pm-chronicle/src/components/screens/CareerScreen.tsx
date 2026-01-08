/**
 * キャリア管理画面
 * プレイヤーのスキル・経歴を管理
 */

import { useState } from 'react';
import { Button, Card, Badge } from '../common';
import { HexagonChart } from '../common/HexagonChart';
import type { Character, StatsBlue, StatsRed } from '../../types';

interface CareerScreenProps {
    player: Character | null;
    currentYear: number;
    onBack: () => void;
}

// スキル名の日本語マッピング
const SKILL_LABELS_BLUE: Record<keyof StatsBlue, string> = {
    design: '設計',
    develop: '製造',
    test: '評価',
    negotiation: '折衝',
    propose: '提案',
    judgment: '判断',
};

const SKILL_LABELS_RED: Record<keyof StatsRed, string> = {
    admin: '事務',
    organizer: '幹事',
    service: '奉仕',
    chat: '話術',
    charm: '魅力',
    luck: '運',
};

export function CareerScreen({
    player,
    currentYear,
    onBack,
}: CareerScreenProps) {
    const [activeTab, setActiveTab] = useState<'status' | 'skills' | 'history'>('status');
    const [skillViewMode, setSkillViewMode] = useState<'chart' | 'bar'>('chart');

    if (!player) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-gray-400">プレイヤーデータがありません</p>
                    <Button onClick={onBack} className="mt-4">戻る</Button>
                </div>
            </div>
        );
    }

    // 経験年数計算
    const yearsOfExperience = currentYear - player.joinYear;

    // スキルレベルの合計
    const totalBlueSkills = Object.values(player.statsBlue).reduce((a, b) => a + b, 0);
    const totalRedSkills = Object.values(player.statsRed).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">👤 キャリア管理</h1>
                    <p className="text-gray-400 mt-1">
                        {player.name} - {player.position.title}
                    </p>
                </div>
                <Button variant="ghost" onClick={onBack}>
                    ← 戻る
                </Button>
            </div>

            {/* タブ */}
            <div className="flex gap-2 mb-6">
                {(['status', 'skills', 'history'] as const).map(tab => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'status' && '📊 ステータス'}
                        {tab === 'skills' && '💡 スキル'}
                        {tab === 'history' && '📜 経歴'}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* メインコンテンツ */}
                <div className="lg:col-span-2">
                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            {/* 基本情報カード */}
                            <Card variant="glass" padding="md">
                                <h2 className="text-lg font-bold text-white mb-4">基本情報</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-surface p-3 rounded-lg">
                                        <div className="text-xs text-gray-400">現在の役職</div>
                                        <div className="text-lg font-bold text-white">{player.position.title}</div>
                                    </div>
                                    <div className="bg-surface p-3 rounded-lg">
                                        <div className="text-xs text-gray-400">経験年数</div>
                                        <div className="text-lg font-bold text-blue-400">{yearsOfExperience}年</div>
                                    </div>
                                    <div className="bg-surface p-3 rounded-lg">
                                        <div className="text-xs text-gray-400">生年</div>
                                        <div className="text-lg font-bold text-white">{player.birthYear}年</div>
                                    </div>
                                    <div className="bg-surface p-3 rounded-lg">
                                        <div className="text-xs text-gray-400">年齢</div>
                                        <div className="text-lg font-bold text-white">{currentYear - player.birthYear}歳</div>
                                    </div>
                                </div>
                            </Card>

                            {/* スタミナ */}
                            <Card variant="glass" padding="md">
                                <h2 className="text-lg font-bold text-white mb-4">コンディション</h2>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">スタミナ</span>
                                            <span className="text-white">{player.stamina.current} / {player.stamina.max}</span>
                                        </div>
                                        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                                                style={{ width: `${(player.stamina.current / player.stamina.max) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-surface p-3 rounded-lg">
                                            <div className="text-xs text-gray-400">忠誠度</div>
                                            <div className="text-lg font-bold text-purple-400">{player.loyalty}</div>
                                        </div>
                                        <div className="bg-surface p-3 rounded-lg">
                                            <div className="text-xs text-gray-400">野心</div>
                                            <div className="text-lg font-bold text-orange-400">{player.ambition}</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            {/* 表示切替 */}
                            <div className="flex gap-2">
                                <Button
                                    variant={skillViewMode === 'chart' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSkillViewMode('chart')}
                                >
                                    📊 チャート表示
                                </Button>
                                <Button
                                    variant={skillViewMode === 'bar' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSkillViewMode('bar')}
                                >
                                    📈 バー表示
                                </Button>
                            </div>

                            {skillViewMode === 'chart' ? (
                                /* チャート表示 */
                                <Card variant="glass" padding="md">
                                    <h2 className="text-lg font-bold text-white mb-4 text-center">能力チャート</h2>
                                    <div className="flex justify-center">
                                        <HexagonChart
                                            statsBlue={player.statsBlue}
                                            statsRed={player.statsRed}
                                            size={280}
                                            showLabels={true}
                                        />
                                    </div>
                                    <div className="mt-4 text-center text-sm">
                                        <span className="text-blue-400 mr-4">🔷 技術: {totalBlueSkills}pt</span>
                                        <span className="text-red-400">🔶 対人: {totalRedSkills}pt</span>
                                    </div>
                                </Card>
                            ) : (
                                /* バー表示（2列並び） */
                                <Card variant="glass" padding="md">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* 技術スキル */}
                                        <div>
                                            <h3 className="text-md font-bold text-white mb-3">🔷 技術（Blue）</h3>
                                            <div className="space-y-2">
                                                {(Object.entries(player.statsBlue) as [keyof StatsBlue, number][]).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <div className="w-12 text-xs text-gray-300">{SKILL_LABELS_BLUE[key]}</div>
                                                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500"
                                                                style={{ width: `${value}%` }}
                                                            />
                                                        </div>
                                                        <div className="w-8 text-right text-white text-xs font-mono">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-blue-400 text-right">計: {totalBlueSkills}pt</div>
                                        </div>

                                        {/* 対人スキル */}
                                        <div>
                                            <h3 className="text-md font-bold text-white mb-3">🔶 対人（Red）</h3>
                                            <div className="space-y-2">
                                                {(Object.entries(player.statsRed) as [keyof StatsRed, number][]).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <div className="w-12 text-xs text-gray-300">{SKILL_LABELS_RED[key]}</div>
                                                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-red-500"
                                                                style={{ width: `${value}%` }}
                                                            />
                                                        </div>
                                                        <div className="w-8 text-right text-white text-xs font-mono">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-red-400 text-right">計: {totalRedSkills}pt</div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* 技術スタック */}
                            <Card variant="glass" padding="md">
                                <h2 className="text-lg font-bold text-white mb-4">🛠️ 技術スタック</h2>
                                <div className="flex flex-wrap gap-2">
                                    {player.techSkills.length > 0 ? (
                                        player.techSkills.map((skill, i) => (
                                            <Badge key={i} variant="info">{skill}</Badge>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">まだ習得した技術はありません</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <Card variant="glass" padding="md">
                            <h2 className="text-lg font-bold text-white mb-4">経歴</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-20 text-sm text-gray-400">{player.joinYear}年</div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold">入社</div>
                                        <div className="text-sm text-gray-400">キャリアスタート</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-20 text-sm text-gray-400">{currentYear}年</div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold">現在</div>
                                        <div className="text-sm text-gray-400">{player.position.title} として活動中</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mt-6">
                                ※ 詳細な経歴はプロジェクト完了時に記録されます
                            </p>
                        </Card>
                    )}
                </div>

                {/* サイドパネル */}
                <div className="lg:col-span-1">
                    <Card variant="glass" padding="md" className="sticky top-6">
                        <h2 className="text-lg font-bold text-white mb-4">プロフィール</h2>

                        {/* 基本情報サマリ */}
                        <div className="space-y-2 text-sm mb-4">
                            <p className="text-gray-400">
                                年齢: <span className="text-white">{currentYear - player.birthYear}歳</span>
                            </p>
                            <p className="text-gray-400">
                                経験: <span className="text-white">{yearsOfExperience}年</span>
                            </p>
                        </div>

                        {/* スキル合計 */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-surface p-2 rounded text-center">
                                <div className="text-xs text-gray-400">技術</div>
                                <div className="text-lg font-bold text-blue-400">{totalBlueSkills}</div>
                            </div>
                            <div className="bg-surface p-2 rounded text-center">
                                <div className="text-xs text-gray-400">対人</div>
                                <div className="text-lg font-bold text-red-400">{totalRedSkills}</div>
                            </div>
                        </div>

                        {/* 特性 */}
                        <div>
                            <h3 className="text-sm text-gray-400 mb-2">特性</h3>
                            <div className="flex flex-wrap gap-1">
                                {player.traits.length > 0 ? (
                                    player.traits.map((trait, i) => (
                                        <span key={i} className="px-2 py-1 bg-surface text-xs text-gray-300 rounded">
                                            {trait}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 text-xs">特性なし</span>
                                )}
                            </div>
                        </div>

                        {/* ヒント */}
                        <div className="mt-6 p-3 bg-surface-glass rounded-lg">
                            <p className="text-xs text-gray-400">
                                💡 訓練でスキルを上げるには、PMコックピットで「訓練」タスクをアサインしてください
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
