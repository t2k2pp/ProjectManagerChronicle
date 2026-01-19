/**
 * 入札バトル - 3フェーズシステム
 * 太閤立志伝 7.1 準拠
 * 
 * フェーズ1: RFP読解 - 設計スキル重要
 * フェーズ2: 提案書作成 - 提案スキル重要
 * フェーズ3: プレゼン対決 - 折衝スキル重要（カードバトル）
 */

import { useState } from 'react';
import type { Character } from '../../../types';
import type { Proposal, Estimate } from '../../../types/proposal';
import { Button, Card, Badge } from '../../common';

export type BidPhase = 'RFP_READING' | 'PROPOSAL_CREATION' | 'PRESENTATION' | 'RESULT';

interface BidBattleProps {
    proposal: Proposal;
    player: Character;
    competitors: { name: string; strength: number }[];
    onComplete: (result: BidResult) => void;
    onCancel: () => void;
}

export interface BidResult {
    won: boolean;
    score: number;
    competitorScores: { name: string; score: number }[];
    feedback: string;
}

interface PhaseScore {
    rfpScore: number;      // フェーズ1スコア
    proposalScore: number; // フェーズ2スコア
    presentationScore: number; // フェーズ3スコア
}

export function BidBattle({
    proposal,
    player,
    competitors,
    onComplete,
    onCancel,
}: BidBattleProps) {
    const [currentPhase, setCurrentPhase] = useState<BidPhase>('RFP_READING');
    const [phaseScores, setPhaseScores] = useState<PhaseScore>({
        rfpScore: 0,
        proposalScore: 0,
        presentationScore: 0,
    });
    const [estimate, setEstimate] = useState<Partial<Estimate>>({
        budget: 0,
        duration: 0,
        teamSize: 3,
        confidence: 50,
    });

    // フェーズ1: RFP読解完了
    const completeRFPPhase = (score: number) => {
        setPhaseScores(prev => ({ ...prev, rfpScore: score }));
        setCurrentPhase('PROPOSAL_CREATION');
    };

    // フェーズ2: 提案書作成完了
    const completeProposalPhase = (score: number) => {
        setPhaseScores(prev => ({ ...prev, proposalScore: score }));
        setCurrentPhase('PRESENTATION');
    };

    // フェーズ3: プレゼン対決完了
    const completePresentationPhase = (won: boolean) => {
        const presentationScore = won ? 100 : 30;
        const totalScore = (phaseScores.rfpScore + phaseScores.proposalScore + presentationScore) / 3;

        // 競合他社のスコア計算
        const competitorScores = competitors.map(c => ({
            name: c.name,
            score: Math.round(30 + Math.random() * c.strength),
        }));

        const playerWon = totalScore > Math.max(...competitorScores.map(c => c.score));

        onComplete({
            won: playerWon,
            score: totalScore,
            competitorScores,
            feedback: playerWon
                ? `おめでとうございます！総合スコア${Math.round(totalScore)}点で落札しました！`
                : `残念ながら今回は敗北です。総合スコア${Math.round(totalScore)}点でした。`,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">⚔️ 入札バトル</h1>
                    <p className="text-gray-400">案件: {proposal.name}</p>
                </div>
                <Button variant="ghost" onClick={onCancel}>
                    棄権する
                </Button>
            </div>

            {/* フェーズインジケーター */}
            <div className="flex justify-center gap-4 mb-8">
                {(['RFP_READING', 'PROPOSAL_CREATION', 'PRESENTATION'] as BidPhase[]).map((phase, idx) => (
                    <div key={phase} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentPhase === phase
                                ? 'bg-blue-500 text-white'
                                : idx < ['RFP_READING', 'PROPOSAL_CREATION', 'PRESENTATION'].indexOf(currentPhase)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-700 text-gray-400'
                                }`}
                        >
                            {idx + 1}
                        </div>
                        {idx < 2 && (
                            <div className={`w-16 h-1 mx-2 ${idx < ['RFP_READING', 'PROPOSAL_CREATION', 'PRESENTATION'].indexOf(currentPhase)
                                ? 'bg-green-500'
                                : 'bg-gray-700'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* フェーズ名表示 */}
            <div className="text-center mb-6">
                <Badge variant="info">
                    {currentPhase === 'RFP_READING' && 'フェーズ1: RFP読解'}
                    {currentPhase === 'PROPOSAL_CREATION' && 'フェーズ2: 提案書作成'}
                    {currentPhase === 'PRESENTATION' && 'フェーズ3: プレゼン対決'}
                </Badge>
            </div>

            {/* フェーズ別コンテンツ */}
            {currentPhase === 'RFP_READING' && (
                <RFPReadingPhase
                    proposal={proposal}
                    player={player}
                    onComplete={completeRFPPhase}
                />
            )}

            {currentPhase === 'PROPOSAL_CREATION' && (
                <ProposalCreationPhase
                    proposal={proposal}
                    player={player}
                    estimate={estimate}
                    setEstimate={setEstimate}
                    rfpScore={phaseScores.rfpScore}
                    onComplete={completeProposalPhase}
                />
            )}

            {currentPhase === 'PRESENTATION' && (
                <PresentationPhase
                    player={player}
                    previousScores={phaseScores}
                    onComplete={completePresentationPhase}
                />
            )}
        </div>
    );
}

// フェーズ1: RFP読解
interface RFPReadingPhaseProps {
    proposal: Proposal;
    player: Character;
    onComplete: (score: number) => void;
}

function RFPReadingPhase({ proposal, player, onComplete }: RFPReadingPhaseProps) {
    const [answered, setAnswered] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

    // RFPに関するクイズ問題（実際のプロダクトではより詳細に）
    const questions = [
        {
            question: `${proposal.name}の主要な目的は何ですか？`,
            options: ['業務効率化', 'コスト削減', 'セキュリティ強化', '売上向上'],
            correct: 0,
        },
        {
            question: '必須要件として最も重要なスキルは？',
            options: proposal.requiredSkills.slice(0, 4).concat(['その他']).slice(0, 4),
            correct: 0,
        },
    ];

    const handleAnswer = (qIdx: number, aIdx: number) => {
        setSelectedAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
    };

    const submitAnswers = () => {
        // 設計スキルに基づくスコア計算
        const designSkill = player.statsBlue.design;
        const correctCount = questions.filter((q, i) => selectedAnswers[i] === q.correct).length;
        const baseScore = (correctCount / questions.length) * 100;
        const skillBonus = designSkill * 3; // 設計スキル重視

        const finalScore = Math.min(100, baseScore + skillBonus);
        setAnswered(true);

        setTimeout(() => {
            onComplete(finalScore);
        }, 1500);
    };

    return (
        <Card variant="glass" padding="lg" className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">📄 RFP読解</h2>
            <p className="text-gray-400 mb-6">
                要件を正確に理解してください。設計スキルが高いほど有利です。
            </p>

            {/* RFP内容 */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-white mb-2">{proposal.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{proposal.description}</p>
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400">必須スキル:</span>
                    {proposal.requiredSkills.map(skill => (
                        <Badge key={skill} variant="info" size="sm">{skill}</Badge>
                    ))}
                </div>
            </div>

            {/* 質問 */}
            <div className="space-y-6">
                {questions.map((q, qIdx) => (
                    <div key={qIdx}>
                        <p className="text-white mb-3">Q{qIdx + 1}. {q.question}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map((opt, aIdx) => (
                                <button
                                    key={aIdx}
                                    onClick={() => handleAnswer(qIdx, aIdx)}
                                    disabled={answered}
                                    className={`p-3 rounded-lg border text-left transition-all ${selectedAnswers[qIdx] === aIdx
                                        ? 'border-blue-500 bg-blue-500/20 text-white'
                                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <Button
                    variant="primary"
                    onClick={submitAnswers}
                    disabled={Object.keys(selectedAnswers).length < questions.length || answered}
                    className="w-full"
                >
                    {answered ? '次のフェーズへ...' : '回答を送信'}
                </Button>
            </div>
        </Card>
    );
}

// フェーズ2: 提案書作成
interface ProposalCreationPhaseProps {
    proposal: Proposal;
    player: Character;
    estimate: Partial<Estimate>;
    setEstimate: (e: Partial<Estimate>) => void;
    rfpScore: number;
    onComplete: (score: number) => void;
}

function ProposalCreationPhase({
    proposal,
    player,
    estimate,
    setEstimate,
    rfpScore,
    onComplete,
}: ProposalCreationPhaseProps) {
    const [submitted, setSubmitted] = useState(false);

    const calculateAccuracy = () => {
        const budgetMid = (proposal.estimatedBudget.min + proposal.estimatedBudget.max) / 2;
        const durationMid = (proposal.estimatedDuration.min + proposal.estimatedDuration.max) / 2;

        const budgetDiff = Math.abs((estimate.budget || 0) - budgetMid) / budgetMid;
        const durationDiff = Math.abs((estimate.duration || 0) - durationMid) / durationMid;

        // 適切な範囲:10%以内で高得点
        const budgetScore = Math.max(0, 100 - budgetDiff * 100);
        const durationScore = Math.max(0, 100 - durationDiff * 100);

        return (budgetScore + durationScore) / 2;
    };

    const handleSubmit = () => {
        const proposeSkill = player.statsBlue.propose;
        const accuracy = calculateAccuracy();
        const skillBonus = proposeSkill * 3;

        const finalScore = Math.min(100, accuracy * 0.7 + skillBonus + rfpScore * 0.1);
        setSubmitted(true);

        setTimeout(() => {
            onComplete(finalScore);
        }, 1500);
    };

    return (
        <Card variant="glass" padding="lg" className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">📝 提案書作成</h2>
            <p className="text-gray-400 mb-6">
                顧客の予算・期間の期待に合う提案を作成してください。提案スキルが高いほど有利です。
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">提示予算（万円）</label>
                    <input
                        type="number"
                        value={estimate.budget || ''}
                        onChange={e => setEstimate({ ...estimate, budget: Number(e.target.value) })}
                        disabled={submitted}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        想定: {proposal.estimatedBudget.min} - {proposal.estimatedBudget.max}万
                    </p>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">提示期間（週）</label>
                    <input
                        type="number"
                        value={estimate.duration || ''}
                        onChange={e => setEstimate({ ...estimate, duration: Number(e.target.value) })}
                        disabled={submitted}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        想定: {proposal.estimatedDuration.min} - {proposal.estimatedDuration.max}週
                    </p>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">チーム規模（人）</label>
                    <input
                        type="number"
                        value={estimate.teamSize || ''}
                        onChange={e => setEstimate({ ...estimate, teamSize: Number(e.target.value) })}
                        disabled={submitted}
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
                        disabled={submitted}
                        className="w-full"
                    />
                </div>
            </div>

            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!estimate.budget || !estimate.duration || submitted}
                className="w-full"
            >
                {submitted ? '次のフェーズへ...' : '提案書を提出'}
            </Button>
        </Card>
    );
}

// フェーズ3: プレゼン対決
interface PresentationPhaseProps {
    player: Character;
    previousScores: PhaseScore;
    onComplete: (won: boolean) => void;
}

function PresentationPhase({ player, previousScores, onComplete }: PresentationPhaseProps) {
    const [battleStarted, setBattleStarted] = useState(false);
    const [battleEnded, setBattleEnded] = useState(false);

    // 簡易的なカードバトルシミュレーション（実際はCardBattleコンポーネントを使用）
    const startSimpleBattle = () => {
        setBattleStarted(true);

        // 折衝スキルに基づく勝率計算
        const negotiationSkill = player.statsBlue.negotiation;
        const winProbability = 0.3 + (negotiationSkill / 20) + (previousScores.rfpScore + previousScores.proposalScore) / 400;

        setTimeout(() => {
            const won = Math.random() < winProbability;
            setBattleEnded(true);
            setTimeout(() => onComplete(won), 1500);
        }, 2000);
    };

    return (
        <Card variant="glass" padding="lg" className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-4">🎤 プレゼン対決</h2>
            <p className="text-gray-400 mb-6">
                ステークホルダーを説得してください。折衝スキルが高いほど有利です。
            </p>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-white">
                    {!battleStarted && '準備ができたらプレゼンを開始してください'}
                    {battleStarted && !battleEnded && 'プレゼン中...'}
                    {battleEnded && '結果を集計中...'}
                </p>
            </div>

            {!battleStarted && (
                <Button variant="primary" size="lg" onClick={startSimpleBattle}>
                    プレゼン開始
                </Button>
            )}

            {battleStarted && (
                <div className="animate-pulse">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin" />
                </div>
            )}
        </Card>
    );
}

export default BidBattle;
