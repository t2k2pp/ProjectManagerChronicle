/**
 * バトルフィールドコンポーネント
 * 交渉カードバトルのメイン画面
 */

import { useState } from 'react';
import type { NegotiationCard } from './cardData';
import { BASE_CARDS } from './cardData';
import { CardHand } from './CardComponent';
import { Button, ProgressBar } from '../../common';
import { aiService } from '../../../services';

interface BattleParticipant {
    name: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    buff: number;
    debuff: number;
}

interface BattleFieldProps {
    playerName: string;
    opponentName: string;
    onBattleEnd: (result: 'WIN' | 'LOSE' | 'DRAW') => void;
    onCancel?: () => void;
}

export function BattleField({
    playerName,
    opponentName,
    onBattleEnd,
    onCancel,
}: BattleFieldProps) {
    // バトル状態
    const [player, setPlayer] = useState<BattleParticipant>({
        name: playerName,
        hp: 30,
        maxHp: 30,
        mana: 3,
        maxMana: 3,
        buff: 0,
        debuff: 0,
    });

    const [opponent, setOpponent] = useState<BattleParticipant>({
        name: opponentName,
        hp: 30,
        maxHp: 30,
        mana: 3,
        maxMana: 3,
        buff: 0,
        debuff: 0,
    });

    const [playerHand, setPlayerHand] = useState<NegotiationCard[]>(() =>
        BASE_CARDS.slice(0, 5)
    );
    const [selectedCard, setSelectedCard] = useState<NegotiationCard | null>(null);
    const [turn, setTurn] = useState(1);
    const [log, setLog] = useState<string[]>(['交渉開始！']);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [isNegotiating, setIsNegotiating] = useState(false);
    const [negotiationText, setNegotiationText] = useState('');

    /** 直談判の発動 */
    const startNegotiation = () => {
        setIsNegotiating(true);
    };

    /** 直談判の送信（AI判定実装） */
    const submitNegotiation = async () => {
        setLog(l => [...l, `あなた: 「${negotiationText}」`]);
        setLog(l => [...l, '⏳ AI判定中...']);

        try {
            // 交渉コンテキストを構築
            const context = `プロジェクトマネージャーと${opponent.name}の交渉。相手を説得して合意を取り付ける必要がある。`;

            // AIサービスで判定
            const aiResult = await aiService.judgeNegotiation(negotiationText, context);

            let score: number;
            let feedback: string;

            if (aiResult.success && aiResult.score !== undefined) {
                score = aiResult.score;
                feedback = aiResult.feedback || '判定完了';
            } else {
                // AI接続失敗時はローカル評価
                score = evaluateLocallyWithRules(negotiationText);
                feedback = 'ローカル評価で判定しました';
            }

            // スコアに応じた効果
            setIsNegotiating(false);
            if (score >= 80) {
                const damage = 15;
                setOpponent(o => ({ ...o, hp: Math.max(0, o.hp - damage) }));
                setLog(l => [...l, `✨ AI判定: GREAT! (${score}点) - ${feedback} (${damage}ダメージ)`]);
            } else if (score >= 60) {
                const damage = 8;
                setOpponent(o => ({ ...o, hp: Math.max(0, o.hp - damage) }));
                setLog(l => [...l, `✅ AI判定: GOOD (${score}点) - ${feedback} (${damage}ダメージ)`]);
            } else {
                const damage = 3;
                setOpponent(o => ({ ...o, hp: Math.max(0, o.hp - damage) }));
                setLog(l => [...l, `⚠️ AI判定: WEAK (${score}点) - ${feedback} (${damage}ダメージ)`]);
            }

            setNegotiationText('');
            // 勝敗判定
            if (opponent.hp <= 0) {
                setLog(l => [...l, '交渉成立！勝利！']);
                setTimeout(() => onBattleEnd('WIN'), 1500);
                return;
            }
            // 相手ターンへ
            setIsPlayerTurn(false);
            setTimeout(opponentTurn, 1000);
        } catch (error) {
            // エラー時はローカル評価にフォールバック
            setIsNegotiating(false);
            const score = evaluateLocallyWithRules(negotiationText);
            const damage = score >= 60 ? 8 : 3;
            setOpponent(o => ({ ...o, hp: Math.max(0, o.hp - damage) }));
            setLog(l => [...l, `📊 ローカル判定: ${score}点 (${damage}ダメージ)`]);
            setNegotiationText('');
            setIsPlayerTurn(false);
            setTimeout(opponentTurn, 1000);
        }
    };

    /** ローカル評価（AI接続失敗時のフォールバック） */
    const evaluateLocallyWithRules = (text: string): number => {
        let score = 40;

        // 論理性: 理由や根拠を含む
        if (/なぜなら|理由|根拠|データ|実績|結果/.test(text)) score += 15;

        // 説得力: 具体的な数字やメリット提示
        if (/\d+/.test(text)) score += 10;
        if (/メリット|効果|改善|向上/.test(text)) score += 10;

        // 礼節: 丁寧な表現
        if (/お願い|ご検討|ありがとう|恐れ入り|恐縮/.test(text)) score += 10;

        // 創造性: 代替案や妥協案の提示
        if (/代わりに|その代わり|別の方法|提案|案/.test(text)) score += 10;

        // 長さボーナス
        if (text.length > 50) score += 5;
        if (text.length > 100) score += 5;

        return Math.min(100, Math.max(0, score));
    };

    /** カードをプレイ */
    const playCard = (card: NegotiationCard) => {
        if (card.cost > player.mana) return;

        // マナ消費
        setPlayer(p => ({ ...p, mana: p.mana - card.cost }));

        // ダメージ計算
        const damage = card.power + player.buff - opponent.debuff;
        const actualDamage = Math.max(0, damage);

        // 効果適用
        setOpponent(o => ({ ...o, hp: Math.max(0, o.hp - actualDamage) }));

        // ログ追加
        setLog(l => [...l, `${player.name}は「${card.name}」を使用！ ${actualDamage}ダメージ！`]);

        // カード効果処理
        if (card.effects) {
            card.effects.forEach(effect => {
                if (effect.type === 'HEAL' && effect.target === 'SELF') {
                    setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + effect.value) }));
                    setLog(l => [...l, `${player.name}のHPが${effect.value}回復！`]);
                }
                if (effect.type === 'BUFF' && effect.target === 'SELF') {
                    setPlayer(p => ({ ...p, buff: p.buff + effect.value }));
                    setLog(l => [...l, `${player.name}の攻撃力UP！`]);
                }
                if (effect.type === 'DEBUFF' && effect.target === 'OPPONENT') {
                    setOpponent(o => ({ ...o, debuff: o.debuff + effect.value }));
                    setLog(l => [...l, `${opponent.name}の防御力DOWN！`]);
                }
            });
        }

        // 手札から削除
        setPlayerHand(h => h.filter(c => c.id !== card.id));
        setSelectedCard(null);

        // 勝敗判定
        if (opponent.hp - actualDamage <= 0) {
            setLog(l => [...l, '交渉成立！勝利！']);
            setTimeout(() => onBattleEnd('WIN'), 1500);
            return;
        }

        // 相手ターンへ
        setIsPlayerTurn(false);
        setTimeout(opponentTurn, 1000);
    };

    /** 相手ターン（簡易AI） */
    const opponentTurn = () => {
        const damage = 3 + opponent.buff - player.debuff + Math.floor(Math.random() * 3);
        const actualDamage = Math.max(0, damage);

        setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - actualDamage) }));
        setLog(l => [...l, `${opponent.name}の反論！ ${actualDamage}ダメージ！`]);

        // 勝敗判定
        if (player.hp - actualDamage <= 0) {
            setLog(l => [...l, '交渉決裂...敗北...']);
            setTimeout(() => onBattleEnd('LOSE'), 1500);
            return;
        }

        // 次のターンへ
        setTurn(t => t + 1);
        setPlayer(p => ({ ...p, mana: Math.min(p.maxMana, p.mana + 1) }));

        // カード補充
        if (playerHand.length < 5) {
            const newCard = BASE_CARDS[Math.floor(Math.random() * BASE_CARDS.length)];
            setPlayerHand(h => [...h, { ...newCard, id: `${newCard.id}-${Date.now()}` }]);
        }

        setIsPlayerTurn(true);
    };

    /** ターンエンド */
    const endTurn = () => {
        if (!isPlayerTurn) return;
        setLog(l => [...l, `${player.name}はパスした`]);
        setIsPlayerTurn(false);
        setTimeout(opponentTurn, 1000);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 flex flex-col">
            {/* ヘッダー */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div className="text-white font-bold">Turn {turn}</div>
                <div className="text-gray-400">交渉バトル</div>
                {onCancel && (
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        ✕ 中断
                    </Button>
                )}
            </div>

            {/* 相手側 */}
            <div className="p-4">
                <ParticipantStatus participant={opponent} isOpponent />
            </div>

            {/* 中央：ログエリア */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-gray-800/50 rounded-lg p-4 h-full">
                    <div className="space-y-1 text-sm">
                        {log.slice(-8).map((entry, i) => (
                            <div key={i} className="text-gray-300">{entry}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* プレイヤー側 */}
            <div className="p-4 border-t border-gray-700">
                <ParticipantStatus participant={player} isOpponent={false} />
            </div>

            {/* 手札 */}
            <div className="bg-gray-800/80 border-t border-gray-700">
                <CardHand
                    cards={playerHand}
                    selectedCardId={selectedCard?.id}
                    onSelectCard={setSelectedCard}
                    playerMana={player.mana}
                />

                {/* アクションボタン */}
                <div className="flex justify-center gap-4 pb-4">
                    <Button
                        variant="primary"
                        disabled={!selectedCard || !isPlayerTurn}
                        onClick={() => selectedCard && playCard(selectedCard)}
                    >
                        カード使用
                    </Button>
                    <Button
                        variant="danger"
                        disabled={!isPlayerTurn || player.mana < 5}
                        onClick={startNegotiation}
                    >
                        🔥 直談判 (コスト5)
                    </Button>
                    <Button
                        variant="secondary"
                        disabled={!isPlayerTurn}
                        onClick={endTurn}
                    >
                        パス
                    </Button>
                </div>
            </div>

            {/* 直談判モーダル */}
            {isNegotiating && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-red-500 shadow-2xl">
                        <h3 className="text-xl font-bold text-red-500 mb-4">🔥 直談判開始</h3>
                        <p className="text-gray-300 mb-4">
                            相手を説得するメッセージを入力してください。AIが説得力を判定します。
                        </p>
                        <textarea
                            className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 h-32 mb-4 focus:border-red-500 outline-none"
                            placeholder="例: 品質を担保するために、納期を2週間延長させてください。その代わり、..."
                            value={negotiationText}
                            onChange={(e) => setNegotiationText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsNegotiating(false)}>キャンセル</Button>
                            <Button
                                variant="danger"
                                onClick={submitNegotiation}
                                disabled={negotiationText.length < 10}
                            >
                                勝負する！
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/** 参加者ステータス表示 */
function ParticipantStatus({
    participant,
    isOpponent,
}: {
    participant: BattleParticipant;
    isOpponent: boolean;
}) {
    return (
        <div className={`flex items-center gap-4 ${isOpponent ? 'flex-row-reverse' : ''}`}>
            <div className="text-2xl">{isOpponent ? '🤵' : '👤'}</div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">{participant.name}</span>
                    <span className="text-gray-400 text-sm">
                        HP: {participant.hp}/{participant.maxHp}
                    </span>
                </div>
                <ProgressBar
                    value={participant.hp}
                    max={participant.maxHp}
                    variant={participant.hp > participant.maxHp * 0.5 ? 'success' :
                        participant.hp > participant.maxHp * 0.2 ? 'warning' : 'danger'}
                    size="md"
                />
                <div className="flex justify-between mt-1 text-xs">
                    <span className="text-blue-400">💎 マナ: {participant.mana}/{participant.maxMana}</span>
                    {participant.buff > 0 && <span className="text-green-400">⬆ +{participant.buff}</span>}
                    {participant.debuff > 0 && <span className="text-red-400">⬇ -{participant.debuff}</span>}
                </div>
            </div>
        </div>
    );
}
