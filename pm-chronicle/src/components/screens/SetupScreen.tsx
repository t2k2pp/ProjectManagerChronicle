/**
 * ゲームセットアップ画面
 * キャラクター作成と開始年選択
 */

import { useState } from 'react';
import { Button, Card, CardHeader, Badge } from '../common';
import type { Company } from '../../types';

interface SetupScreenProps {
    companies: Company[];
    onStartGame: (options: GameStartOptions) => void;
    onBack: () => void;
}

export interface GameStartOptions {
    playerName: string;
    gender: 'M' | 'F' | 'OTHER';
    startYear: number;
    startType: 'FRESH_GRADUATE' | 'MID_CAREER' | 'FREELANCE';
    companyId?: string;
}

const START_YEARS = [
    { year: 1990, era: '汎用機・C/S時代', description: 'メインフレームからの移行期' },
    { year: 2000, era: 'Web時代', description: 'インターネット革命の幕開け' },
    { year: 2010, era: 'モバイル・クラウド時代', description: 'スマートフォンとクラウドの登場' },
    { year: 2020, era: 'AI・DX時代', description: 'デジタル変革と生成AIの時代' },
];

export function SetupScreen({
    companies,
    onStartGame,
    onBack,
}: SetupScreenProps) {
    const [step, setStep] = useState(1);
    const [playerName, setPlayerName] = useState('');
    const [gender, setGender] = useState<'M' | 'F' | 'OTHER'>('M');
    const [startYear, setStartYear] = useState(2020);
    const [startType, setStartType] = useState<'FRESH_GRADUATE' | 'MID_CAREER' | 'FREELANCE'>('FRESH_GRADUATE');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();

    const handleStart = () => {
        onStartGame({
            playerName: playerName || 'プレイヤー',
            gender,
            startYear,
            startType,
            companyId: startType !== 'FREELANCE' ? selectedCompanyId : undefined,
        });
    };

    const canProceed = () => {
        if (step === 1) return playerName.trim().length > 0;
        if (step === 2) return true;
        if (step === 3) return startType === 'FREELANCE' || selectedCompanyId;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* 進捗表示 */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full ${s <= step ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                        />
                    ))}
                </div>

                <Card variant="glass" padding="lg">
                    {/* Step 1: 名前入力 */}
                    {step === 1 && (
                        <div>
                            <CardHeader title="キャラクター作成" subtitle="Step 1: 名前と性別" />
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">名前</label>
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        placeholder="プレイヤー名を入力"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">性別</label>
                                    <div className="flex gap-4">
                                        {(['M', 'F', 'OTHER'] as const).map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`flex-1 py-3 rounded-lg font-medium transition ${gender === g
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {g === 'M' ? '♂ 男性' : g === 'F' ? '♀ 女性' : '⚧ その他'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: 開始年選択 */}
                    {step === 2 && (
                        <div>
                            <CardHeader title="時代選択" subtitle="Step 2: 開始年を選択" />
                            <div className="space-y-3">
                                {START_YEARS.map(({ year, era, description }) => (
                                    <button
                                        key={year}
                                        onClick={() => setStartYear(year)}
                                        className={`w-full text-left p-4 rounded-lg border transition ${startYear === year
                                            ? 'bg-blue-600/20 border-blue-500'
                                            : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-white">{year}年 - {era}</div>
                                                <div className="text-sm text-gray-400 mt-1">{description}</div>
                                            </div>
                                            {startYear === year && (
                                                <Badge variant="info">選択中</Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: 開始タイプ選択 */}
                    {step === 3 && (
                        <div>
                            <CardHeader title="スタートタイプ" subtitle="Step 3: 開始方法を選択" />
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {([
                                        { type: 'FRESH_GRADUATE', label: '新卒入社', desc: '22歳からスタート' },
                                        { type: 'MID_CAREER', label: '中途入社', desc: '35歳・経験者' },
                                        { type: 'FREELANCE', label: 'フリーランス', desc: '独立した働き方' },
                                    ] as const).map(({ type, label, desc }) => (
                                        <button
                                            key={type}
                                            onClick={() => setStartType(type)}
                                            className={`p-4 rounded-lg border transition ${startType === type
                                                ? 'bg-blue-600/20 border-blue-500'
                                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="font-bold text-white">{label}</div>
                                            <div className="text-xs text-gray-400 mt-1">{desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {startType !== 'FREELANCE' && (
                                    <div className="mt-6">
                                        <label className="block text-sm text-gray-400 mb-2">所属企業</label>
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {companies.filter(c => c.isActive).slice(0, 10).map(company => (
                                                <button
                                                    key={company.id}
                                                    onClick={() => setSelectedCompanyId(company.id)}
                                                    className={`w-full text-left p-3 rounded-lg border transition ${selectedCompanyId === company.id
                                                        ? 'bg-blue-600/20 border-blue-500'
                                                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <div className="font-medium text-white">{company.name}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {company.category === 'LARGE' ? '大企業' : '中小企業'} -
                                                        {company.specialties.join(', ')}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: 確認 */}
                    {step === 4 && (
                        <div>
                            <CardHeader title="確認" subtitle="Step 4: 設定内容を確認" />
                            <div className="space-y-4 text-gray-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-400">名前</div>
                                        <div className="font-bold text-white">{playerName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">性別</div>
                                        <div className="font-bold text-white">
                                            {gender === 'M' ? '男性' : gender === 'F' ? '女性' : 'その他'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">開始年</div>
                                        <div className="font-bold text-white">{startYear}年</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">開始タイプ</div>
                                        <div className="font-bold text-white">
                                            {startType === 'FRESH_GRADUATE' ? '新卒' :
                                                startType === 'MID_CAREER' ? '中途' : 'フリーランス'}
                                        </div>
                                    </div>
                                </div>
                                {selectedCompanyId && (
                                    <div>
                                        <div className="text-xs text-gray-400">所属企業</div>
                                        <div className="font-bold text-white">
                                            {companies.find(c => c.id === selectedCompanyId)?.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ナビゲーションボタン */}
                    <div className="flex justify-between mt-8">
                        <Button
                            onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}
                            variant="ghost"
                        >
                            ← 戻る
                        </Button>
                        {step < 4 ? (
                            <Button
                                onClick={() => setStep(s => s + 1)}
                                variant="primary"
                                disabled={!canProceed()}
                            >
                                次へ →
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStart}
                                variant="primary"
                            >
                                ゲーム開始 🎮
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
