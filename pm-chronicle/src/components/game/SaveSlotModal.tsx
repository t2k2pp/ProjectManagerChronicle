/**
 * セーブスロット選択モーダル
 */

import { useState, useEffect } from 'react';
import { Button, Modal } from '../common';
import { saveService, type SaveSlotInfo } from '../../services/saveService';

interface SaveSlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'save' | 'load' | 'newGame';
    onSlotSelect: (slotNumber: number, slotInfo: SaveSlotInfo) => void;
}

export function SaveSlotModal({
    isOpen,
    onClose,
    mode,
    onSlotSelect,
}: SaveSlotModalProps) {
    const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmSlot, setConfirmSlot] = useState<number | null>(null);

    // スロット情報を取得
    useEffect(() => {
        if (isOpen) {
            loadSlots();
        }
    }, [isOpen]);

    const loadSlots = async () => {
        setLoading(true);
        try {
            const slotInfos = await saveService.getSlotInfos();
            setSlots(slotInfos);
        } catch (error) {
            console.error('Failed to load slots:', error);
        } finally {
            setLoading(false);
        }
    };

    // スロットクリック処理
    const handleSlotClick = (slot: SaveSlotInfo) => {
        // ロードモードで空スロットはクリック不可
        if (mode === 'load' && slot.isEmpty) {
            return;
        }

        // 新規ゲーム/セーブで既存データありの場合は確認
        if ((mode === 'newGame' || mode === 'save') && !slot.isEmpty) {
            setConfirmSlot(slot.slotNumber);
            return;
        }

        // 確認なしで選択
        onSlotSelect(slot.slotNumber, slot);
    };

    // 上書き確認OK
    const handleConfirmOverwrite = () => {
        const slot = slots.find(s => s.slotNumber === confirmSlot);
        if (slot && confirmSlot !== null) {
            onSlotSelect(confirmSlot, slot);
        }
        setConfirmSlot(null);
    };

    // タイトル
    const getTitle = () => {
        switch (mode) {
            case 'newGame': return '新規ゲーム - スロット選択';
            case 'save': return 'セーブ - スロット選択';
            case 'load': return 'ロード - スロット選択';
        }
    };

    // 日付フォーマット
    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="lg">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {slots.map(slot => (
                            <button
                                key={slot.slotNumber}
                                onClick={() => handleSlotClick(slot)}
                                disabled={mode === 'load' && slot.isEmpty}
                                className={`w-full text-left p-4 rounded-lg border transition-all ${slot.isEmpty ? 'interactive' : 'selected'} ${mode === 'load' && slot.isEmpty ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">
                                            スロット {slot.slotNumber}
                                            {slot.isEmpty ? (
                                                <span className="ml-2 text-gray-500 font-normal">（空き）</span>
                                            ) : (
                                                <span className="ml-2 text-blue-400 font-normal">{slot.name}</span>
                                            )}
                                        </div>
                                        {!slot.isEmpty && (
                                            <div className="text-sm text-muted mt-1">
                                                <span>{slot.playerName}</span>
                                                <span className="mx-2">|</span>
                                                <span>{slot.currentYear}年 第{slot.currentWeek}週</span>
                                            </div>
                                        )}
                                    </div>
                                    {!slot.isEmpty && (
                                        <div className="text-xs text-gray-500">
                                            {formatDate(slot.updatedAt)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}

                        {/* オートセーブ表示 */}
                        {mode === 'load' && (
                            <button
                                onClick={async () => {
                                    const autoSave = await saveService.loadAutoSave();
                                    if (autoSave) {
                                        onSlotSelect(0, {
                                            slotNumber: 0,
                                            name: 'オートセーブ',
                                            playerName: '',
                                            currentYear: autoSave.worldState.currentYear,
                                            currentWeek: autoSave.worldState.currentWeek,
                                            updatedAt: autoSave.updatedAt,
                                            isEmpty: false,
                                        });
                                    }
                                }}
                                className="w-full text-left p-4 rounded-lg border border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">
                                            🔄 オートセーブから再開
                                        </div>
                                        <div className="text-sm text-muted mt-1">
                                            最後のオートセーブデータから続ける
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={onClose}>
                        キャンセル
                    </Button>
                </div>
            </Modal>

            {/* 上書き確認ダイアログ */}
            <Modal
                isOpen={confirmSlot !== null}
                onClose={() => setConfirmSlot(null)}
                title="上書き確認"
                size="sm"
            >
                <div className="py-4">
                    <p className="text-gray-300">
                        スロット {confirmSlot} には既にデータが存在します。
                    </p>
                    <p className="text-red-400 mt-2">
                        ⚠️ 上書きすると元のデータは失われます。
                    </p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setConfirmSlot(null)}>
                        キャンセル
                    </Button>
                    <Button variant="danger" onClick={handleConfirmOverwrite}>
                        上書きする
                    </Button>
                </div>
            </Modal>
        </>
    );
}
