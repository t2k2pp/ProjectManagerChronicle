/**
 * 案件選択・入札画面
 * 受注可能な案件を閲覧し、見積もりを提出して入札
 */

import { useState } from 'react';
import { Button, Card, Badge } from '../common';
import type { Proposal, Estimate, BidResult } from '../../types/proposal';
import { DIFFICULTY_LABELS } from '../../types/proposal';
import { processBid } from '../../lib/proposal';

interface ProposalScreenProps {
    proposals: Proposal[];
    playerReputation: number;
    currentWeek: number;
    onBidWon: (proposal: Proposal, estimate: Estimate) => void;
    onStartBidBattle?: (proposal: Proposal) => void; // 入札バトル3フェーズへ遷移
    onBack: () => void;
}

export function ProposalScreen({
    proposals,
    playerReputation,
    currentWeek,
    onBidWon,
    onStartBidBattle,
    onBack,
}: ProposalScreenProps) {
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [estimate, setEstimate] = useState<Partial<Estimate>>({
        budget: 0,
        duration: 0,
        teamSize: 3,
        confidence: 50,
    });
    const [bidResult, setBidResult] = useState<BidResult | null>(null);
    const [isBidding, setIsBidding] = useState(false);

    const availableProposals = proposals.filter(p =>
        p.status === 'AVAILABLE' && p.deadline >= currentWeek
    );

    const handleSelectProposal = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setBidResult(null);
        // 初期見積もり設定
        const budgetMid = (proposal.estimatedBudget.min + proposal.estimatedBudget.max) / 2;
        const durationMid = (proposal.estimatedDuration.min + proposal.estimatedDuration.max) / 2;
        setEstimate({
            budget: Math.round(budgetMid),
            duration: Math.round(durationMid),
            teamSize: 3,
            confidence: 50,
        });
    };

    const handleSubmitBid = () => {
        if (!selectedProposal || !estimate.budget || !estimate.duration) return;

        setIsBidding(true);

        // 少し遅延を入れて演出
        setTimeout(() => {
            const fullEstimate: Estimate = {
                proposalId: selectedProposal.id,
                budget: estimate.budget!,
                duration: estimate.duration!,
                teamSize: estimate.teamSize || 3,
                confidence: estimate.confidence || 50,
            };

            const result = processBid(selectedProposal, fullEstimate, playerReputation);
            setBidResult(result);
            setIsBidding(false);

            if (result.won) {
                // 勝利時は2秒後にコールバック
                setTimeout(() => {
                    onBidWon(selectedProposal, fullEstimate);
                }, 2000);
            }
        }, 1500);
    };

    const getDifficultyColor = (diff: string): string => {
        switch (diff) {
            case 'EASY': return 'bg-green-500';
            case 'NORMAL': return 'bg-blue-500';
            case 'HARD': return 'bg-orange-500';
            case 'EXTREME': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">📋 案件一覧</h1>
                    <p className="text-gray-400">受注可能な案件を選択して入札してください</p>
                </div>
                <Button variant="ghost" onClick={onBack}>← 戻る</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左: 案件リスト */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-bold text-white mb-4">利用可能な案件 ({availableProposals.length})</h2>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {availableProposals.map(proposal => (
                            <button
                                key={proposal.id}
                                onClick={() => handleSelectProposal(proposal)}
                                className={`w-full text-left p-4 rounded-lg border transition-all ${selectedProposal?.id === proposal.id
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-white text-sm">{proposal.name}</span>
                                    <span className={`px-2 py-0.5 text-xs text-white rounded ${getDifficultyColor(proposal.difficulty)}`}>
                                        {DIFFICULTY_LABELS[proposal.difficulty]}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{proposal.client.name}</p>
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <span>予算: {proposal.estimatedBudget.min}-{proposal.estimatedBudget.max}万</span>
                                    <span>締切: 第{proposal.deadline}週</span>
                                </div>
                            </button>
                        ))}
                        {availableProposals.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                現在利用可能な案件はありません
                            </div>
                        )}
                    </div>
                </div>

                {/* 中央・右: 詳細 & 見積もり */}
                <div className="lg:col-span-2">
                    {selectedProposal ? (
                        <div className="space-y-4">
                            {/* 案件詳細 */}
                            <Card variant="glass" padding="md">
                                <h2 className="text-xl font-bold text-white mb-4">{selectedProposal.name}</h2>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-400">クライアント</div>
                                        <div className="text-white">{selectedProposal.client.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">難易度</div>
                                        <div className="text-white">{DIFFICULTY_LABELS[selectedProposal.difficulty]}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">想定予算</div>
                                        <div className="text-white">{selectedProposal.estimatedBudget.min} - {selectedProposal.estimatedBudget.max} 万円</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">想定期間</div>
                                        <div className="text-white">{selectedProposal.estimatedDuration.min} - {selectedProposal.estimatedDuration.max} 週</div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm text-gray-400 mb-2">必要スキル</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProposal.requiredSkills.map(skill => (
                                            <Badge key={skill} variant="info">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm">{selectedProposal.description}</p>
                            </Card>

                            {/* 見積もり入力 */}
                            <Card variant="glass" padding="md">
                                <h3 className="text-lg font-bold text-white mb-4">📝 見積もり作成</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">提示予算（万円）</label>
                                        <input
                                            type="number"
                                            value={estimate.budget || ''}
                                            onChange={e => setEstimate({ ...estimate, budget: Number(e.target.value) })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">提示期間（週）</label>
                                        <input
                                            type="number"
                                            value={estimate.duration || ''}
                                            onChange={e => setEstimate({ ...estimate, duration: Number(e.target.value) })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">想定人数</label>
                                        <input
                                            type="number"
                                            value={estimate.teamSize || ''}
                                            onChange={e => setEstimate({ ...estimate, teamSize: Number(e.target.value) })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">自信度 ({estimate.confidence}%)</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={estimate.confidence || 50}
                                            onChange={e => setEstimate({ ...estimate, confidence: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* 入札ボタン */}
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitBid}
                                    disabled={isBidding || bidResult !== null}
                                    className="w-full"
                                >
                                    {isBidding ? '入札中...' : '入札する（簡易モード）'}
                                </Button>

                                {/* 大型案件では入札バトルモード */}
                                {onStartBidBattle && (selectedProposal.difficulty === 'HARD' || selectedProposal.difficulty === 'EXTREME') && !bidResult && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => onStartBidBattle(selectedProposal)}
                                        disabled={isBidding}
                                        className="w-full mt-3"
                                    >
                                        ⚔️ 入札バトルに挑む（3フェーズ）
                                    </Button>
                                )}
                            </Card>

                            {/* 入札結果 */}
                            {bidResult && (
                                <Card
                                    variant="glass"
                                    padding="md"
                                    className={bidResult.won ? 'border-green-500' : 'border-red-500'}
                                >
                                    <div className={`text-xl font-bold mb-2 ${bidResult.won ? 'text-green-400' : 'text-red-400'}`}>
                                        {bidResult.won ? '🎉 受注成功！' : '😔 失注'}
                                    </div>
                                    <p className="text-gray-300">{bidResult.reason}</p>
                                    {bidResult.won && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            プロジェクト計画画面に移動します...
                                        </p>
                                    )}
                                </Card>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            左の案件リストから案件を選択してください
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
