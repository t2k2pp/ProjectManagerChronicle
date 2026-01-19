/**
 * 二つ名開眼演出モーダル
 * キャラクターの覚醒時に全画面演出を表示
 * UI設計書4.7準拠
 */

import { useState, useEffect } from 'react';
import type { Character } from '../../types';
import type { AwakeningResult } from '../../lib/engine/awakeningSystem';
import { Button } from '../common';

interface AwakeningEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    awakeningResult: AwakeningResult & { character?: Character };
}

export function AwakeningEventModal({
    isOpen,
    onClose,
    awakeningResult,
}: AwakeningEventModalProps) {
    const [animationPhase, setAnimationPhase] = useState<'enter' | 'reveal' | 'stats' | 'complete'>('enter');

    useEffect(() => {
        if (isOpen) {
            setAnimationPhase('enter');
            // フェーズ遷移のタイミング
            const revealTimer = setTimeout(() => setAnimationPhase('reveal'), 800);
            const statsTimer = setTimeout(() => setAnimationPhase('stats'), 2000);
            const completeTimer = setTimeout(() => setAnimationPhase('complete'), 3000);

            return () => {
                clearTimeout(revealTimer);
                clearTimeout(statsTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [isOpen]);

    if (!isOpen || !awakeningResult.awakened) return null;

    const character = awakeningResult.character;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* 背景エフェクト - キラキラ */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95">
                {/* パーティクルエフェクト */}
                <div className="sparkle-container">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="sparkle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* メインコンテンツ */}
            <div className="relative z-10 text-center px-8 max-w-2xl">
                {/* フェーズ1: 導入 */}
                <div className={`transition-all duration-700 ${animationPhase === 'enter' ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    }`}>
                    {animationPhase === 'enter' && (
                        <div className="text-4xl font-bold text-yellow-300 animate-pulse">
                            ✨ 二つ名開眼！ ✨
                        </div>
                    )}
                </div>

                {/* フェーズ2: 名前の開示 */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${['reveal', 'stats', 'complete'].includes(animationPhase)
                    ? 'opacity-100'
                    : 'opacity-0 translate-y-10'
                    }`}>
                    {/* キャラクター名 */}
                    {character && (
                        <div className={`mb-4 transition-all duration-500 ${animationPhase !== 'enter' ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-2xl text-gray-200">
                                {character.name} の真の姿が明らかに！
                            </span>
                        </div>
                    )}

                    {/* 二つ名 */}
                    <div className={`transition-all duration-700 delay-300 ${['reveal', 'stats', 'complete'].includes(animationPhase)
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-75'
                        }`}>
                        <div className="relative">
                            {/* グローエフェクト */}
                            <div className="absolute inset-0 blur-xl bg-yellow-500/50 animate-pulse" />
                            <span className="relative text-5xl font-bold bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                                「🔥 {awakeningResult.trueName} 🔥」
                            </span>
                        </div>
                    </div>

                    {/* トリガー条件 */}
                    <div className={`mt-6 transition-all duration-500 delay-500 ${['stats', 'complete'].includes(animationPhase)
                        ? 'opacity-100'
                        : 'opacity-0'
                        }`}>
                        <span className="text-lg text-green-300">
                            {awakeningResult.triggerCondition}
                        </span>
                    </div>

                    {/* 能力上昇表示 */}
                    <div className={`mt-8 space-y-2 transition-all duration-500 delay-700 ${animationPhase === 'complete' ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <div className="text-yellow-200 text-lg">
                            ⬆️ 最高スキルが上昇！
                        </div>
                        <div className="text-gray-300 text-sm">
                            特殊能力が解放されました
                        </div>
                    </div>

                    {/* 了解ボタン */}
                    <div className={`mt-12 transition-all duration-500 delay-1000 ${animationPhase === 'complete' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onClose}
                        >
                            了解
                        </Button>
                    </div>
                </div>
            </div>

            {/* CSS for sparkles */}
            <style>{`
                .sparkle-container {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                }
                .sparkle {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: radial-gradient(circle, white 0%, transparent 70%);
                    border-radius: 50%;
                    animation: sparkle-float 3s infinite ease-in-out;
                }
                @keyframes sparkle-float {
                    0%, 100% {
                        opacity: 0;
                        transform: translateY(0) scale(0);
                    }
                    50% {
                        opacity: 1;
                        transform: translateY(-50px) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * 複数の覚醒イベントを順番に表示するラッパー
 */
interface AwakeningEventsHandlerProps {
    events: (AwakeningResult & { character?: Character })[];
    onComplete: () => void;
}

export function AwakeningEventsHandler({
    events,
    onComplete,
}: AwakeningEventsHandlerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const validEvents = events.filter(e => e.awakened);

    if (validEvents.length === 0) {
        return null;
    }

    const handleClose = () => {
        if (currentIndex < validEvents.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <AwakeningEventModal
            isOpen={true}
            onClose={handleClose}
            awakeningResult={validEvents[currentIndex]}
        />
    );
}
