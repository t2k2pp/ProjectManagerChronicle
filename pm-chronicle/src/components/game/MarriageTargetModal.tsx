import { Card, Button, Badge } from '../common';
import type { Character } from '../../types';

interface MarriageTargetModalProps {
    isOpen: boolean;
    partner: Character;
    onAccept: () => void;
    onReject: () => void;
    onClose: () => void;
}

export function MarriageTargetModal({
    isOpen,
    partner,
    onAccept,
    onReject,
    onClose
}: MarriageTargetModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card variant="glass" padding="lg" className="max-w-md w-full animate-in fade-in zoom-in duration-300 border-pink-500/50">
                <div className="text-center space-y-6">
                    <div className="text-6xl animate-bounce">💍</div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">プロポーズ</h2>
                        <p className="text-gray-300">
                            <span className="font-bold text-pink-400 text-xl">{partner.name}</span> から<br />
                            結婚を申し込まれました！
                        </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">年齢</span>
                            <span className="text-white">{new Date().getFullYear() - partner.birthYear}歳</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">職業</span>
                            <span className="text-white">{partner.position?.title || 'フリーランス'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">ステータス</span>
                            <div className="flex gap-2">
                                <Badge variant="default" size="sm">愛: 80+</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full bg-pink-600 hover:bg-pink-700 border-pink-500"
                            onClick={onAccept}
                        >
                            喜んでお受けします！ 💖
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onReject}
                            className="w-full"
                        >
                            今は仕事に専念したい... 🙇
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
