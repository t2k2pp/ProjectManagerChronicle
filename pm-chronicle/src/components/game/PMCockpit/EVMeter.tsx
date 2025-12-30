/**
 * EVMメーターコンポーネント
 * SPI/CPIをゲージ形式で表示
 */

import type { EVMState } from '../../../types';

interface EVMeterProps {
    evm: EVMState;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

/** ゲージの色を決定 */
function getGaugeColor(value: number): string {
    if (value >= 1.0) return '#10b981'; // 緑
    if (value >= 0.8) return '#f59e0b'; // 黄
    return '#ef4444'; // 赤
}

/** 針式ゲージコンポーネント */
function Gauge({
    value,
    label,
    size,
}: {
    value: number;
    label: string;
    size: number;
}) {
    // 0.5 ~ 1.5 の範囲を 0 ~ 180度にマッピング
    const clampedValue = Math.max(0.5, Math.min(1.5, value));
    const angle = ((clampedValue - 0.5) / 1.0) * 180 - 90;
    const color = getGaugeColor(value);

    const center = size / 2;
    const radius = size * 0.4;
    const needleLength = radius * 0.9;

    return (
        <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
            {/* 背景円弧 */}
            <path
                d={describeArc(center, size * 0.5, radius, -90, 90)}
                fill="none"
                stroke="#374151"
                strokeWidth={size * 0.08}
                strokeLinecap="round"
            />

            {/* 色付き円弧（値に応じて） */}
            <path
                d={describeArc(center, size * 0.5, radius, -90, angle)}
                fill="none"
                stroke={color}
                strokeWidth={size * 0.08}
                strokeLinecap="round"
            />

            {/* 針 */}
            <line
                x1={center}
                y1={size * 0.5}
                x2={center + needleLength * Math.cos((angle * Math.PI) / 180)}
                y2={size * 0.5 + needleLength * Math.sin((angle * Math.PI) / 180)}
                stroke="white"
                strokeWidth={size * 0.02}
                strokeLinecap="round"
            />

            {/* 中心点 */}
            <circle cx={center} cy={size * 0.5} r={size * 0.03} fill="white" />

            {/* ラベル */}
            <text
                x={center}
                y={size * 0.35}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={size * 0.08}
            >
                {label}
            </text>

            {/* 値 */}
            <text
                x={center}
                y={size * 0.55}
                textAnchor="middle"
                fill={color}
                fontSize={size * 0.12}
                fontWeight="bold"
            >
                {(value * 100).toFixed(0)}%
            </text>
        </svg>
    );
}

/** SVG円弧パスを生成 */
function describeArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
): string {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
}

/** 極座標からデカルト座標へ変換 */
function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angleInDegrees: number
) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
        x: cx + radius * Math.cos(angleInRadians),
        y: cy + radius * Math.sin(angleInRadians),
    };
}

export function EVMeter({ evm, showLabels = true, size = 'md' }: EVMeterProps) {
    const sizeMap = { sm: 100, md: 150, lg: 200 };
    const gaugeSize = sizeMap[size];

    return (
        <div className="flex gap-4 justify-center items-center">
            <div className="text-center">
                <Gauge value={evm.spi} label="SPI" size={gaugeSize} />
                {showLabels && (
                    <div className="text-xs text-gray-400 mt-1">スケジュール効率</div>
                )}
            </div>
            <div className="text-center">
                <Gauge value={evm.cpi} label="CPI" size={gaugeSize} />
                {showLabels && (
                    <div className="text-xs text-gray-400 mt-1">コスト効率</div>
                )}
            </div>
        </div>
    );
}

/** コンパクトEVMパネル（ダッシュボード用） */
export function EVMPanel({ evm }: { evm: EVMState }) {
    const formatValue = (v: number) => `${(v * 100).toFixed(0)}%`;

    return (
        <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">EVM指標</div>
            <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getGaugeColor(evm.spi) }}>
                        {formatValue(evm.spi)}
                    </div>
                    <div className="text-xs text-gray-500">SPI</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getGaugeColor(evm.cpi) }}>
                        {formatValue(evm.cpi)}
                    </div>
                    <div className="text-xs text-gray-500">CPI</div>
                </div>
            </div>
        </div>
    );
}
