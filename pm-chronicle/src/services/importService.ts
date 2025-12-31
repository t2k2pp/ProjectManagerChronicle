/**
 * インポートサービス
 * エクスポートされたJSONファイルを読み込み
 */

import type { ExportData } from './exportService';
import type { SaveData } from './saveService';
import { saveService } from './saveService';

/** インポート結果 */
export interface ImportResult {
    success: boolean;
    error?: string;
    saveData?: SaveData;
}

/** バリデーションエラー */
export class ImportValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ImportValidationError';
    }
}

/**
 * チェックサムを検証
 */
function verifyChecksum(data: string, expectedChecksum: string): boolean {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const actualChecksum = Math.abs(hash).toString(16).padStart(8, '0');
    return actualChecksum === expectedChecksum;
}

/** インポートサービス */
export const importService = {
    /**
     * JSONテキストを解析してバリデーション
     */
    parseAndValidate(jsonString: string): ImportResult {
        try {
            const parsed = JSON.parse(jsonString) as unknown;

            // 基本的な構造チェック
            if (typeof parsed !== 'object' || parsed === null) {
                throw new ImportValidationError('無効なデータ形式です');
            }

            const exportData = parsed as ExportData;

            // フォーマットチェック
            if (exportData.format !== 'PM_CHRONICLE_SAVE') {
                throw new ImportValidationError('PM Chronicleのセーブデータではありません');
            }

            // バージョンチェック
            if (!exportData.version) {
                throw new ImportValidationError('バージョン情報がありません');
            }

            // チェックサム検証
            const dataString = JSON.stringify(exportData.data);
            if (!verifyChecksum(dataString, exportData.checksum)) {
                throw new ImportValidationError('データが破損している可能性があります（チェックサム不一致）');
            }

            // データ存在チェック
            if (!exportData.data || !exportData.data.worldState) {
                throw new ImportValidationError('セーブデータが不完全です');
            }

            return {
                success: true,
                saveData: exportData.data,
            };
        } catch (error) {
            if (error instanceof ImportValidationError) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            if (error instanceof SyntaxError) {
                return {
                    success: false,
                    error: 'JSONの解析に失敗しました',
                };
            }
            return {
                success: false,
                error: 'インポート中にエラーが発生しました',
            };
        }
    },

    /**
     * ファイルからインポート
     */
    async importFromFile(file: File): Promise<ImportResult> {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e.target?.result as string;
                resolve(this.parseAndValidate(text));
            };

            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'ファイルの読み込みに失敗しました',
                });
            };

            reader.readAsText(file);
        });
    },

    /**
     * インポートしてスロットに保存
     */
    async importToSlot(
        jsonString: string,
        slotNumber: number
    ): Promise<ImportResult> {
        const result = this.parseAndValidate(jsonString);

        if (!result.success || !result.saveData) {
            return result;
        }

        try {
            await saveService.save(
                slotNumber,
                result.saveData.name || 'インポートデータ',
                result.saveData.playerCharacterId,
                result.saveData.worldState,
                result.saveData.currentProjectId
            );

            return {
                success: true,
                saveData: result.saveData,
            };
        } catch (error) {
            return {
                success: false,
                error: '保存に失敗しました',
            };
        }
    },
};
