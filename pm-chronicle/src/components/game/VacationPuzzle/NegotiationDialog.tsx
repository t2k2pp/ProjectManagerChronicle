/**
 * 休暇パズル - 交渉ダイアログ
 */

import { useState } from 'react';
import type { Character } from '../../../types';
import { Button, Card, Badge, Modal } from '../../common';

interface NegotiationDialogProps {
    isOpen: boolean;
    character: Character;
    requestedDays: number;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
    onNegotiate: (counterOffer: number) => void;
}

export function NegotiationDialog({
    isOpen,
    character,
    requestedDays,
    onClose,
    onApprove,
    onReject,
    onNegotiate,
}: NegotiationDialogProps) {
    const [counterOffer, setCounterOffer] = useState(Math.ceil(requestedDays / 2));

    // キャラクターの交渉傾向
    const getNegotiationStyle = (): { style: string; emoji: string } => {
        if (character.ambition > 70) {
            return { style: '強気', emoji: '😤' };
        } else if (character.loyalty > 70) {
            return { style: '協力的', emoji: '😊' };
        } else {
            return { style: '普通', emoji: '🙂' };
        }
    };

    const { style, emoji } = getNegotiationStyle();

    // 承認確率の計算
    const getApprovalChance = (): number => {
        const loyaltyFactor = character.loyalty / 100;
        const requestFactor = Math.max(0, 1 - requestedDays * 0.1);
        const staminaFactor = character.stamina.current < 30 ? 1.5 : 1;

        return Math.min(95, Math.round((loyaltyFactor * requestFactor * staminaFactor) * 100));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="休暇交渉" size="md">
            <div className="space-y-4">
                {/* キャラクター情報 */}
                <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                    <div className="text-4xl">{emoji}</div>
                    <div>
                        <div className="text-lg font-bold text-white">{character.name}</div>
                        <div className="text-sm text-gray-400">{character.position.title}</div>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="info" size="sm">交渉スタイル: {style}</Badge>
                            <Badge variant={character.stamina.current < 30 ? 'danger' : 'success'} size="sm">
                                スタミナ {Math.round(character.stamina.current)}%
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 申請内容 */}
                <Card variant="default" padding="sm">
                    <div className="text-sm text-gray-400 mb-2">休暇申請</div>
                    <div className="text-2xl font-bold text-white">{requestedDays}日間</div>
                    <div className="text-sm text-gray-500 mt-1">
                        承認見込み: <span className="text-blue-400">{getApprovalChance()}%</span>
                    </div>
                </Card>

                {/* メッセージ */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                        「{character.stamina.current < 30
                            ? '最近疲れが溜まっていまして…休ませていただけませんか？'
                            : 'プロジェクトの合間に休暇を取りたいのですが…'}」
                    </p>
                </div>

                {/* 交渉オプション */}
                <div className="space-y-3">
                    <div className="text-sm text-gray-400">対応を選択</div>

                    <Button
                        variant="primary"
                        className="w-full justify-start"
                        onClick={onApprove}
                    >
                        ✅ 全日程を承認する（忠誠度+5）
                    </Button>

                    <div className="flex gap-2">
                        <input
                            type="range"
                            min={1}
                            max={requestedDays}
                            value={counterOffer}
                            onChange={(e) => setCounterOffer(Number(e.target.value))}
                            className="flex-1"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => onNegotiate(counterOffer)}
                        >
                            🤝 {counterOffer}日なら可
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400"
                        onClick={onReject}
                    >
                        ❌ 今は休めない（忠誠度-10, スタミナ-5）
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
