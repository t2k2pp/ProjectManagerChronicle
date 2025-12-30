/**
 * ダッシュボード画面
 * ゲーム開始後の初期画面
 */

import { Card, CardHeader, Button, Badge } from '../common';
import type { WorldState, Character, Company, Project } from '../../types';
import { EVMPanel } from '../game/PMCockpit';

interface DashboardScreenProps {
    worldState: WorldState;
    playerCharacter: Character;
    playerCompany: Company | null;
    activeProject: Project | null;
    onStartProject: () => void;
    onOpenCareer: () => void;
    onOpenIndustryMap: () => void;
    onContinueProject: () => void;
}

export function DashboardScreen({
    worldState,
    playerCharacter,
    playerCompany,
    activeProject,
    onStartProject,
    onOpenCareer,
    onOpenIndustryMap,
    onContinueProject,
}: DashboardScreenProps) {
    const currentEra = getEraName(worldState.currentYear);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <header className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            PM立志伝：プロジェクト・クロニクル
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {worldState.currentYear}年 第{worldState.currentWeek}週 - {currentEra}
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant="info">{playerCharacter.position.title}</Badge>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
                {/* プレイヤー情報 */}
                <div className="col-span-4">
                    <Card variant="glass" padding="md">
                        <CardHeader title={playerCharacter.name} subtitle={playerCompany?.name || 'フリーランス'} />

                        {/* スタミナ */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">スタミナ</span>
                                <span className="text-white">{playerCharacter.stamina.current}/{playerCharacter.stamina.max}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${playerCharacter.stamina.current / playerCharacter.stamina.max >= 0.5
                                        ? 'bg-green-500'
                                        : 'bg-yellow-500'
                                        }`}
                                    style={{ width: `${(playerCharacter.stamina.current / playerCharacter.stamina.max) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* スキルサマリー */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {Object.entries(playerCharacter.statsBlue).slice(0, 6).map(([key, value]) => (
                                <div key={key} className="bg-gray-700/50 rounded p-2">
                                    <div className="text-xs text-gray-400">{getSkillName(key)}</div>
                                    <div className="text-lg font-bold text-blue-400">{value}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 現在のプロジェクト */}
                <div className="col-span-5">
                    <Card variant="glass" padding="md">
                        <CardHeader
                            title="現在のプロジェクト"
                            action={
                                activeProject ? (
                                    <Button size="sm" onClick={onContinueProject}>
                                        続ける
                                    </Button>
                                ) : (
                                    <Button size="sm" onClick={onStartProject}>
                                        新規開始
                                    </Button>
                                )
                            }
                        />

                        {activeProject ? (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">{activeProject.name}</h3>
                                <p className="text-sm text-gray-400 mb-4">クライアント: {activeProject.client}</p>
                                <EVMPanel evm={activeProject.evm} />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>現在進行中のプロジェクトはありません</p>
                                <p className="text-sm mt-2">「新規開始」をクリックして案件を選択してください</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 業界情報 */}
                <div className="col-span-3">
                    <Card variant="glass" padding="md">
                        <CardHeader title="業界動向" />
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-gray-400">市場規模</div>
                                <div className="text-lg font-bold text-white">
                                    {worldState.industryState.totalMarketSize}兆円
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 mb-1">トレンドスキル</div>
                                <div className="flex flex-wrap gap-1">
                                    {worldState.industryState.trendingSkills.slice(0, 4).map(skill => (
                                        <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* クイックアクション */}
                <div className="col-span-12">
                    <div className="flex gap-4">
                        <Button onClick={onOpenCareer} variant="secondary">
                            キャリア管理
                        </Button>
                        <Button onClick={onOpenIndustryMap} variant="secondary">
                            業界マップ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 時代名を取得 */
function getEraName(year: number): string {
    if (year < 2000) return '汎用機・C/S時代';
    if (year < 2010) return 'Web時代';
    if (year < 2020) return 'モバイル・クラウド時代';
    return 'AI・DX時代';
}

/** スキル名を取得 */
function getSkillName(key: string): string {
    const names: Record<string, string> = {
        design: '設計',
        develop: '製造',
        test: '評価',
        negotiation: '折衝',
        propose: '提案',
        judgment: '判断',
    };
    return names[key] || key;
}
