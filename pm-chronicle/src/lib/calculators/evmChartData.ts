/**
 * EVMグラフ用データ生成
 */

import type { EVMState } from '../../types';

/** グラフデータポイント */
export interface EVMDataPoint {
    week: number;
    pv: number;
    ev: number;
    ac: number;
    spi?: number;
    cpi?: number;
}

/** グラフ用データセット */
export interface EVMChartData {
    data: EVMDataPoint[];
    summary: {
        totalPV: number;
        totalEV: number;
        totalAC: number;
        overallSPI: number;
        overallCPI: number;
        variance: number;
    };
}

/**
 * EVM履歴からグラフ用データを生成
 */
export function generateEVMChartData(
    history: { week: number; evm: EVMState }[],
    _totalBudget: number
): EVMChartData {
    const data: EVMDataPoint[] = history.map(h => ({
        week: h.week,
        pv: h.evm.pv,
        ev: h.evm.ev,
        ac: h.evm.ac,
        spi: h.evm.spi,
        cpi: h.evm.cpi,
    }));

    // 累積値でソート
    data.sort((a, b) => a.week - b.week);

    // サマリ計算
    const latest = data[data.length - 1] || { pv: 0, ev: 0, ac: 0 };
    const overallSPI = latest.pv > 0 ? latest.ev / latest.pv : 1;
    const overallCPI = latest.ac > 0 ? latest.ev / latest.ac : 1;
    const variance = latest.ev - latest.ac;

    return {
        data,
        summary: {
            totalPV: latest.pv,
            totalEV: latest.ev,
            totalAC: latest.ac,
            overallSPI,
            overallCPI,
            variance,
        },
    };
}

/**
 * S字カーブ予測データを生成
 */
export function generateSCurveForecast(
    currentWeek: number,
    totalWeeks: number,
    totalBudget: number,
    currentProgress: number
): EVMDataPoint[] {
    const forecast: EVMDataPoint[] = [];

    for (let week = currentWeek; week <= totalWeeks; week++) {
        // S字カーブ (ロジスティック関数)
        const t = (week / totalWeeks) * 12 - 6; // -6 to 6
        const sigmoid = 1 / (1 + Math.exp(-t));
        const plannedValue = totalBudget * sigmoid;

        // 現在の進捗傾向を反映
        const progressRatio = currentProgress / 100;
        const trendFactor = progressRatio > 0.5 ? 1.1 : progressRatio > 0.3 ? 1.0 : 0.9;

        forecast.push({
            week,
            pv: plannedValue,
            ev: plannedValue * trendFactor * (week <= currentWeek ? 1 : 0.9),
            ac: plannedValue * (week <= currentWeek ? 1.05 : 1.0),
        });
    }

    return forecast;
}

/**
 * 週次傾向分析
 */
export function analyzeWeeklyTrend(
    data: EVMDataPoint[]
): { trend: 'IMPROVING' | 'STABLE' | 'DECLINING'; message: string } {
    if (data.length < 3) {
        return { trend: 'STABLE', message: 'データ不足' };
    }

    const recent = data.slice(-3);
    const spiTrend = recent.map(d => d.spi || 1);
    const avgSPI = spiTrend.reduce((a, b) => a + b, 0) / spiTrend.length;
    const spiChange = (spiTrend[2] - spiTrend[0]) / spiTrend[0];

    if (spiChange > 0.05) {
        return { trend: 'IMPROVING', message: 'スケジュール効率が改善傾向' };
    } else if (spiChange < -0.05) {
        return { trend: 'DECLINING', message: 'スケジュール遅延が拡大傾向' };
    } else {
        return {
            trend: 'STABLE',
            message: avgSPI >= 1 ? '計画通り進行中' : '軽微な遅延が継続'
        };
    }
}
