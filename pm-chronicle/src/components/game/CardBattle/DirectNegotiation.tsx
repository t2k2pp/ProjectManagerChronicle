/**
 * 直談判コンポーネント - AI判定付きテキスト交渉
 */

import { useState } from 'react';
import type { Character } from '../../../types';
import { Button, Card, Badge, Modal } from '../../common';
import { aiService } from '../../../services';

interface DirectNegotiationProps {
    isOpen: boolean;
    onClose: () => void;
    player: Character;
    opponent: Character;
    context: string;
    onResult: (result: NegotiationResult) => void;
}

interface NegotiationResult {
    success: boolean;
    score: number;
    feedback: string;
    gaugeChange: number;
}

export function DirectNegotiation({
    isOpen,
    onClose,
    player,
    opponent,
    context,
    onResult,
}: DirectNegotiationProps) {
    const [statement, setStatement] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<NegotiationResult | null>(null);

    // AI判定を実行
    const handleSubmit = async () => {
        if (!statement.trim()) return;

        setIsLoading(true);

        try {
            const aiResult = await aiService.judgeNegotiation(context, statement);

            if (aiResult.success && aiResult.score !== undefined && aiResult.feedback) {
                const negotiationResult: NegotiationResult = {
                    success: aiResult.score >= 60,
                    score: aiResult.score,
                    feedback: aiResult.feedback,
                    gaugeChange: Math.round((aiResult.score - 50) / 5),
                };
                setResult(negotiationResult);
                onResult(negotiationResult);
            } else {
                // AI接続失敗時はローカル評価
                const localResult = evaluateLocally(statement, player, opponent);
                setResult(localResult);
                onResult(localResult);
            }
        } catch {
            // フォールバック: ローカル評価
            const localResult = evaluateLocally(statement, player, opponent);
            setResult(localResult);
            onResult(localResult);
        } finally {
            setIsLoading(false);
        }
    };

    // ローカル評価（AI接続なし）
    const evaluateLocally = (
        text: string,
        _player: Character,
        _opponent: Character
    ): NegotiationResult => {
        // 簡易評価ロジック
        const length = text.length;
        const hasPoliteWords = /お願い|ご検討|ありがとう|恐れ入り/.test(text);
        const hasLogic = /なぜなら|理由|メリット|効果|実績/.test(text);
        const hasNumbers = /\d+/.test(text);

        let score = 50;
        if (length > 50) score += 10;
        if (length > 100) score += 5;
        if (hasPoliteWords) score += 10;
        if (hasLogic) score += 15;
        if (hasNumbers) score += 10;

        score = Math.min(100, Math.max(0, score + Math.random() * 20 - 10));

        return {
            success: score >= 60,
            score: Math.round(score),
            feedback: score >= 60
                ? '説得力のある交渉でした！'
                : 'もう少し具体的な根拠があると良いでしょう',
            gaugeChange: Math.round((score - 50) / 5),
        };
    };

    // リセット
    const handleReset = () => {
        setStatement('');
        setResult(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="直談判" size="lg">
            <div className="space-y-4">
                {/* 状況説明 */}
                <Card variant="default" padding="sm">
                    <div className="text-sm text-gray-400">交渉状況</div>
                    <p className="text-white mt-1">{context}</p>
                </Card>

                {/* 対戦相手情報 */}
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                    <div className="text-3xl">🧑‍💼</div>
                    <div>
                        <div className="font-bold text-white">{opponent.name}</div>
                        <div className="text-sm text-gray-400">{opponent.position.title}</div>
                    </div>
                </div>

                {!result ? (
                    <>
                        {/* テキスト入力 */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                あなたの主張を入力してください
                            </label>
                            <textarea
                                value={statement}
                                onChange={(e) => setStatement(e.target.value)}
                                placeholder="例: このプロジェクトの成功には、チームのスキルアップが不可欠です。なぜなら..."
                                rows={5}
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                disabled={isLoading}
                            />
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>具体的な数字や根拠を含めると説得力UP</span>
                                <span>{statement.length}文字</span>
                            </div>
                        </div>

                        {/* 送信ボタン */}
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                                キャンセル
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={!statement.trim() || isLoading}
                            >
                                {isLoading ? '判定中...' : '💬 発言する'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* 結果表示 */}
                        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{result.success ? '✅' : '❌'}</span>
                                <div>
                                    <div className={`text-lg font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.success ? '交渉成功！' : '交渉失敗...'}
                                    </div>
                                    <Badge variant={result.success ? 'success' : 'danger'}>
                                        スコア: {result.score}/100
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-gray-300">{result.feedback}</p>
                            <div className="mt-2 text-sm text-gray-400">
                                ゲージ変動: {result.gaugeChange > 0 ? '+' : ''}{result.gaugeChange}
                            </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={handleReset}>
                                もう一度
                            </Button>
                            <Button variant="primary" onClick={onClose}>
                                閉じる
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
