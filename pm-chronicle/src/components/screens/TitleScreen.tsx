/**
 * タイトル画面
 */

import { useState } from 'react';
import { Button, Card } from '../common';
import { SaveSlotModal } from '../game/SaveSlotModal';
import type { SaveSlotInfo } from '../../services/saveService';

interface TitleScreenProps {
    onNewGame: (slotNumber: number) => void;
    onLoadGame: (slotNumber: number, slotInfo: SaveSlotInfo) => void;
    onSettings: () => void;
}

export function TitleScreen({
    onNewGame,
    onLoadGame,
    onSettings,
}: TitleScreenProps) {
    const [slotModalMode, setSlotModalMode] = useState<'newGame' | 'load' | null>(null);

    // 新規ゲームスロット選択
    const handleNewGameClick = () => {
        setSlotModalMode('newGame');
    };

    // ロード画面
    const handleLoadClick = () => {
        setSlotModalMode('load');
    };

    // スロット選択完了
    const handleSlotSelect = (slotNumber: number, slotInfo: SaveSlotInfo) => {
        setSlotModalMode(null);
        if (slotModalMode === 'newGame') {
            onNewGame(slotNumber);
        } else if (slotModalMode === 'load') {
            onLoadGame(slotNumber, slotInfo);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
            <div className="text-center">
                {/* ロゴ */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        PM立志伝
                    </h1>
                    <h2 className="text-2xl text-blue-400">
                        プロジェクト・クロニクル
                    </h2>
                    <p className="text-gray-400 mt-4">
                        Project Manager Training Simulation Game
                    </p>
                </div>

                {/* メニュー */}
                <Card variant="glass" padding="lg" className="inline-block">
                    <div className="space-y-4">
                        <Button onClick={handleNewGameClick} variant="primary" size="lg" className="w-64">
                            🎮 新規ゲーム
                        </Button>
                        <Button onClick={handleLoadClick} variant="secondary" size="lg" className="w-64">
                            📂 続きから
                        </Button>
                        <Button onClick={onSettings} variant="ghost" size="lg" className="w-64">
                            ⚙️ 設定
                        </Button>
                    </div>
                </Card>

                {/* バージョン情報 */}
                <p className="text-gray-600 mt-8 text-sm">
                    Version 0.1.0 - Early Development
                </p>
            </div>

            {/* スロット選択モーダル */}
            <SaveSlotModal
                isOpen={slotModalMode !== null}
                onClose={() => setSlotModalMode(null)}
                mode={slotModalMode || 'newGame'}
                onSlotSelect={handleSlotSelect}
            />
        </div>
    );
}
