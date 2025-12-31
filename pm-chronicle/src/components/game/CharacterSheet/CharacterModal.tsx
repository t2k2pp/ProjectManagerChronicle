/**
 * キャラクター詳細モーダル
 */

import { useEffect, useCallback } from 'react';
import type { Character } from '../../../types';
import { Button } from '../../common';
import { StatusDisplay } from './StatusDisplay';

interface CharacterModalProps {
    character: Character | null;
    isOpen: boolean;
    onClose: () => void;
    onAssign?: (characterId: string) => void;
}

export function CharacterModal({
    character,
    isOpen,
    onClose,
    onAssign,
}: CharacterModalProps) {
    // ESCキーで閉じる
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen || !character) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダル本体 */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* 閉じるボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-10"
                >
                    ✕
                </button>

                {/* コンテンツ */}
                <div className="p-6">
                    <StatusDisplay character={character} />

                    {/* アクションボタン */}
                    {onAssign && (
                        <div className="mt-6 flex gap-3">
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={() => {
                                    onAssign(character.id);
                                    onClose();
                                }}
                            >
                                タスクにアサイン
                            </Button>
                            <Button variant="ghost" onClick={onClose}>
                                閉じる
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
