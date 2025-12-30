/**
 * ダブル・ヘキサゴン・チャート
 * キャラクターの表スキル（青）と裏スキル（赤）を表示
 */

import type { StatsBlue, StatsRed } from '../../types';

interface HexagonChartProps {
    statsBlue: StatsBlue;
    statsRed?: StatsRed;
    size?: number;
    showLabels?: boolean;
    showValues?: boolean;
}

/** 青スキルラベル */
const BLUE_LABELS = ['設計', '製造', '評価', '折衝', '提案', '判断'];
const BLUE_KEYS: (keyof StatsBlue)[] = ['design', 'develop', 'test', 'negotiation', 'propose', 'judgment'];

/** 赤スキルキー */
const RED_KEYS: (keyof StatsRed)[] = ['admin', 'organizer', 'service', 'chat', 'charm', 'luck'];

export function HexagonChart({
    statsBlue,
    statsRed,
    size = 200,
    showLabels = true,
    showValues = false,
}: HexagonChartProps) {
    const center = size / 2;
    const maxRadius = (size / 2) * 0.8;
    const labelRadius = (size / 2) * 0.95;

    /** 6角形の頂点座標を計算 */
    const getPoints = (values: number[], maxValue: number = 10): string => {
        return values
            .map((value, i) => {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const radius = (value / maxValue) * maxRadius;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return `${x},${y}`;
            })
            .join(' ');
    };

    /** ラベル座標を計算 */
    const getLabelPosition = (index: number) => {
        const angle = (Math.PI / 3) * index - Math.PI / 2;
        return {
            x: center + labelRadius * Math.cos(angle),
            y: center + labelRadius * Math.sin(angle),
        };
    };

    const blueValues = BLUE_KEYS.map(key => statsBlue[key]);
    const redValues = statsRed ? RED_KEYS.map(key => statsRed[key]) : [];

    // グリッドライン
    const gridLevels = [2, 4, 6, 8, 10];

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* 背景グリッド */}
            {gridLevels.map(level => (
                <polygon
                    key={level}
                    points={getPoints(Array(6).fill(level))}
                    fill="none"
                    stroke="gray"
                    strokeWidth="0.5"
                    opacity="0.3"
                />
            ))}

            {/* 軸線 */}
            {Array(6).fill(0).map((_, i) => {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const x = center + maxRadius * Math.cos(angle);
                const y = center + maxRadius * Math.sin(angle);
                return (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="gray"
                        strokeWidth="0.5"
                        opacity="0.3"
                    />
                );
            })}

            {/* 赤スキル（背面） */}
            {statsRed && (
                <polygon
                    points={getPoints(redValues)}
                    fill="rgba(239, 68, 68, 0.3)"
                    stroke="#ef4444"
                    strokeWidth="2"
                />
            )}

            {/* 青スキル（前面） */}
            <polygon
                points={getPoints(blueValues)}
                fill="rgba(59, 130, 246, 0.3)"
                stroke="#3b82f6"
                strokeWidth="2"
            />

            {/* ラベル */}
            {showLabels && BLUE_LABELS.map((label, i) => {
                const pos = getLabelPosition(i);
                return (
                    <text
                        key={i}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                    >
                        {label}
                        {showValues && `: ${blueValues[i]}`}
                    </text>
                );
            })}

            {/* 中央に総合値 */}
            <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
            >
                {blueValues.reduce((a, b) => a + b, 0)}
            </text>
        </svg>
    );
}

/** ミニ版ヘキサゴン（リスト表示用） */
export function MiniHexagonChart({
    statsBlue,
    size = 60,
}: {
    statsBlue: StatsBlue;
    size?: number;
}) {
    return (
        <HexagonChart
            statsBlue={statsBlue}
            size={size}
            showLabels={false}
            showValues={false}
        />
    );
}
