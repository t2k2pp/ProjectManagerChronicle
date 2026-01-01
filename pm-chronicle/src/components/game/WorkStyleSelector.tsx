/**
 * 担当時代の働き方選択UI
 */

import { useState } from 'react';
import { Card, Button, Badge } from '../common';
import { WORK_STYLE_CONFIG, processWorkStyle, type WorkStyle, type SkillGainResult } from '../../lib/workStyles';
import type { Character, StatsBlue } from '../../types';

interface WorkStyleSelectorProps {
    player: Character;
    onSelect: (style: WorkStyle, targetSkill?: keyof StatsBlue) => void;
    onSkillGain?: (result: SkillGainResult) => void;
}

const BLUE_SKILL_OPTIONS: { key: keyof StatsBlue; label: string }[] = [
    { key: 'design', label: '設計' },
    { key: 'develop', label: '製造' },
    { key: 'test', label: '評価' },
    { key: 'negotiation', label: '折衝' },
    { key: 'propose', label: '提案' },
    { key: 'judgment', label: '判断' },
];

export function WorkStyleSelector({
    player,
    onSelect,
    onSkillGain,
}: WorkStyleSelectorProps) {
    const [selectedStyle, setSelectedStyle] = useState<WorkStyle | null>(null);
    const [targetSkill, setTargetSkill] = useState<keyof StatsBlue>('develop');
    const [lastResult, setLastResult] = useState<SkillGainResult | null>(null);

    const handleConfirm = () => {
        if (!selectedStyle) return;

        // スキルアップ抽選
        const result = processWorkStyle(
            player,
            selectedStyle,
            selectedStyle === 'TRAINING' ? targetSkill : undefined
        );

        setLastResult(result);
        onSkillGain?.(result);
        onSelect(selectedStyle, selectedStyle === 'TRAINING' ? targetSkill : undefined);
    };

    const getCostDisplay = (style: WorkStyle): string => {
        const config = WORK_STYLE_CONFIG[style];
        switch (config.cost) {
            case 'NONE': return '無料';
            case 'TIME': return '時間のみ';
            case 'LOW_COST': return `${config.costAmount}万円`;
            case 'HIGH_COST': return `${config.costAmount}万円`;
        }
    };

    const getEfficiencyColor = (efficiency: string): string => {
        switch (efficiency) {
            case 'HIGH': return 'text-green-400';
            case 'MEDIUM': return 'text-yellow-400';
            case 'LOW': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <Card variant="glass" padding="md">
            <h2 className="text-lg font-bold text-white mb-4">📚 今週の働き方</h2>
            <p className="text-sm text-gray-400 mb-4">
                今週のタスクをどのように進めますか？スキルアップのチャンスがあります。
            </p>

            {/* スタイル選択 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {(Object.keys(WORK_STYLE_CONFIG) as WorkStyle[]).map(style => {
                    const config = WORK_STYLE_CONFIG[style];
                    const isSelected = selectedStyle === style;

                    return (
                        <button
                            key={style}
                            onClick={() => setSelectedStyle(style)}
                            className={`text-left p-3 rounded-lg border transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-white text-sm">{config.label}</span>
                                <Badge variant={config.cost === 'NONE' ? 'success' : config.cost === 'HIGH_COST' ? 'danger' : 'warning'} className="text-xs">
                                    {getCostDisplay(style)}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{config.description}</p>
                            <div className="flex gap-4 text-xs">
                                <span className="text-gray-500">
                                    効率: <span className={getEfficiencyColor(config.efficiency)}>{config.efficiency}</span>
                                </span>
                                <span className="text-gray-500">
                                    UP確率: <span className="text-blue-400">{Math.round(config.skillChance * 100)}%</span>
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 研修選択時のスキル選択 */}
            {selectedStyle === 'TRAINING' && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <label className="text-sm text-gray-400 mb-2 block">研修対象スキル</label>
                    <div className="flex flex-wrap gap-2">
                        {BLUE_SKILL_OPTIONS.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setTargetSkill(opt.key)}
                                className={`px-3 py-1 text-sm rounded ${targetSkill === opt.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 結果表示 */}
            {lastResult && (
                <div className={`mb-4 p-3 rounded-lg ${lastResult.success ? 'bg-green-500/20 border border-green-500' : 'bg-gray-800'}`}>
                    <p className={`text-sm ${lastResult.success ? 'text-green-400' : 'text-gray-400'}`}>
                        {lastResult.success ? '🎉 ' : ''}{lastResult.message}
                    </p>
                </div>
            )}

            {/* 確定ボタン */}
            <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedStyle}
                className="w-full"
            >
                この方法で作業する
            </Button>
        </Card>
    );
}
