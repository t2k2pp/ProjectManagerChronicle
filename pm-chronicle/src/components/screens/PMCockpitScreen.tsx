/**
 * PMコックピット画面
 * プロジェクト管理のメイン画面
 */

import { useState } from 'react';
import { Card, CardHeader, Button } from '../common';
import { GanttChart, EVMeter, CharacterList, TaskAssignmentPanel, NewsTicker } from '../game/PMCockpit';
import { MarriageTargetModal } from '../game/MarriageTargetModal';
import type { Project, Task, Character } from '../../types';
import type { ProjectPolicy } from '../../lib/engine/turnProcessor';

interface PMCockpitScreenProps {
    project: Project;
    tasks: Task[];
    teamMembers: Character[];
    currentWeek: number;
    currentPolicy?: ProjectPolicy;
    onPolicyChange?: (policy: ProjectPolicy) => void;
    onNextTurn: () => void;
    onAssignTask: (taskId: string, characterId: string) => void;
    onUnassignTask: (taskId: string) => void;
    onOpenMenu: () => void;
    recentEvents?: string[];
    marriageProposal?: { partnerId: string; message: string; };
    onAcceptMarriage?: () => void;
    onRejectMarriage?: () => void;
}

export function PMCockpitScreen({
    project,
    tasks,
    teamMembers,
    currentWeek,
    currentPolicy = 'NORMAL',
    onPolicyChange,
    onNextTurn,
    onAssignTask,
    onUnassignTask,
    onOpenMenu,
    recentEvents = [],
    marriageProposal,
    onAcceptMarriage,
    onRejectMarriage,
}: PMCockpitScreenProps) {
    const [activeTab, setActiveTab] = useState<'gantt' | 'assign' | 'team'>('gantt');

    // 結婚相手の特定
    const marriagePartner = marriageProposal
        ? teamMembers.find(m => m.id === marriageProposal.partnerId)
        : undefined;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
            {/* ニュースティッカー */}
            <NewsTicker events={recentEvents} />

            {/* ヘッダー */}
            <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onOpenMenu}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            ☰
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{project.name}</h1>
                            <p className="text-sm text-gray-400">
                                Week {currentWeek} / {project.schedule.endWeek}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* EVM簡易表示 */}
                        <div className="flex gap-3">
                            <div className="text-center">
                                <div className="text-xs text-gray-400">SPI</div>
                                <div className={`text-lg font-bold ${project.evm.spi >= 1 ? 'text-green-400' :
                                    project.evm.spi >= 0.8 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {(project.evm.spi * 100).toFixed(0)}%
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-400">CPI</div>
                                <div className={`text-lg font-bold ${project.evm.cpi >= 1 ? 'text-green-400' :
                                    project.evm.cpi >= 0.8 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {(project.evm.cpi * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* ポリシー選択 */}
                        {onPolicyChange && (
                            <div className="flex gap-1">
                                {(['NORMAL', 'QUALITY_FIRST', 'RUSH'] as const).map(policy => (
                                    <button
                                        key={policy}
                                        onClick={() => onPolicyChange(policy)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition ${currentPolicy === policy
                                            ? policy === 'NORMAL' ? 'bg-blue-600 text-white'
                                                : policy === 'QUALITY_FIRST' ? 'bg-green-600 text-white'
                                                    : 'bg-red-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {policy === 'NORMAL' ? '通常' : policy === 'QUALITY_FIRST' ? '品質優先' : '突貫'}
                                    </button>
                                ))}
                            </div>
                        )}

                        <Button onClick={onNextTurn} variant="primary">
                            ターン進行 →
                        </Button>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="p-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* 左サイドバー: チーム */}
                    <aside className="col-span-3">
                        <Card variant="glass" padding="md">
                            <CardHeader title="チームメンバー" subtitle={`${teamMembers.length}名`} />
                            <CharacterList characters={teamMembers} />
                        </Card>
                    </aside>

                    {/* メインエリア */}
                    <div className="col-span-6">
                        {/* タブ切替 */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setActiveTab('gantt')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'gantt'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                ガントチャート
                            </button>
                            <button
                                onClick={() => setActiveTab('assign')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'assign'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                アサイン
                            </button>
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'team'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                チーム詳細
                            </button>
                        </div>

                        {/* タブコンテンツ */}
                        <Card variant="glass" padding="md">
                            {activeTab === 'gantt' && (
                                <GanttChart
                                    tasks={tasks}
                                    currentWeek={currentWeek}
                                    totalWeeks={project.schedule.endWeek}
                                />
                            )}
                            {activeTab === 'assign' && (
                                <TaskAssignmentPanel
                                    tasks={tasks}
                                    characters={teamMembers}
                                    onAssign={onAssignTask}
                                    onUnassign={onUnassignTask}
                                />
                            )}
                            {activeTab === 'team' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {teamMembers.map(member => (
                                        <div key={member.id} className="bg-gray-800 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-white">{member.name}</div>
                                                    <div className="text-sm text-gray-400">{member.position.title}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-400">スタミナ</div>
                                                    <div className="text-lg font-bold text-white">
                                                        {member.stamina.current}/{member.stamina.max}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* 右サイドバー: EVM */}
                    <aside className="col-span-3 space-y-4">
                        <Card variant="glass" padding="md">
                            <CardHeader title="プロジェクト指標" />
                            <EVMeter evm={project.evm} size="sm" />
                        </Card>

                        <Card variant="glass" padding="md">
                            <CardHeader title="予算" />
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">PV（計画値）</span>
                                    <span className="text-white">{formatCurrency(project.evm.pv)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">EV（出来高）</span>
                                    <span className="text-green-400">{formatCurrency(project.evm.ev)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">AC（実コスト）</span>
                                    <span className="text-yellow-400">{formatCurrency(project.evm.ac)}</span>
                                </div>
                            </div>
                        </Card>

                        <Card variant="glass" padding="md">
                            <CardHeader title="スケジュール" />
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">開始週</span>
                                    <span className="text-white">Week {project.schedule.startWeek}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">終了予定</span>
                                    <span className="text-white">Week {project.schedule.endWeek}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">現在</span>
                                    <span className="text-blue-400">Week {currentWeek}</span>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </main>

            {/* 結婚イベントモーダル */}
            {marriagePartner && (
                <MarriageTargetModal
                    isOpen={!!marriageProposal}
                    partner={marriagePartner}
                    onAccept={onAcceptMarriage || (() => { })}
                    onReject={onRejectMarriage || (() => { })}
                    onClose={onRejectMarriage || (() => { })}
                />
            )}
        </div>
    );
}

/** 金額フォーマット */
function formatCurrency(value: number): string {
    if (value >= 100000000) {
        return `${(value / 100000000).toFixed(1)}億円`;
    }
    if (value >= 10000) {
        return `${(value / 10000).toFixed(0)}万円`;
    }
    return `${value.toFixed(0)}円`;
}
