/**
 * バトルフィールドコンポーネント
 * 交渉カードバトルのメイン画面
 */

import { useState } from 'react';
import type { NegotiationCard } from './cardData';
import { BASE_CARDS } from './cardData';
import { CardHand } from './CardComponent';
import { Button, ProgressBar } from '../../common';

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
                <div className="bg-surface-glass rounded-lg p-4 h-full">
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
            <div className="bg-surface-glass border-t border-gray-700">
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
                        variant="secondary"
                        disabled={!isPlayerTurn}
                        onClick={endTurn}
                    >
                        パス
                    </Button>
                </div>
            </div>
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
