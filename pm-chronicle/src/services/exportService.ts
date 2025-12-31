/**
 * エクスポートサービス
 * ゲームデータをJSON形式でエクスポート
 */

import type { SaveData } from './saveService';

/** エクスポート形式 */
export interface ExportData {
    format: 'PM_CHRONICLE_SAVE';
    version: string;
    exportedAt: string;
    checksum: string;
    data: SaveData;
}

/**
 * チェックサムを生成（簡易版）
 */
function generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/** エクスポートサービス */
export const exportService = {
    /**
     * セーブデータをJSON文字列に変換
     */
    toJson(saveData: SaveData): string {
        const dataString = JSON.stringify(saveData);
        const checksum = generateChecksum(dataString);

        const exportData: ExportData = {
            format: 'PM_CHRONICLE_SAVE',
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            checksum,
            data: saveData,
        };

        return JSON.stringify(exportData, null, 2);
    },

    /**
     * JSONファイルをダウンロード
     */
    downloadAsFile(saveData: SaveData, filename?: string): void {
        const json = this.toJson(saveData);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const defaultFilename = `pm_chronicle_save_${saveData.worldState.currentYear}_w${saveData.worldState.currentWeek}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename || defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * クリップボードにコピー
     */
    async copyToClipboard(saveData: SaveData): Promise<void> {
        const json = this.toJson(saveData);
        await navigator.clipboard.writeText(json);
    },
};
