/**
 * 動作確認スクリプト
 * IndexedDBとデータ生成の動作確認
 */

import { db } from './db/schema';
import { generateCompanies } from './lib/generators/companyGenerator';
import { generateNPCs } from './lib/generators/characterGenerator';

export async function runVerification(): Promise<void> {
    console.log('=== PM Chronicle 動作確認 ===');

    try {
        // 1. データベース接続テスト
        console.log('1. データベース接続テスト...');
        await db.open();
        console.log('   ✅ データベース接続成功');

        // 2. 企業生成テスト
        console.log('2. 企業生成テスト...');
        const companies = generateCompanies(20, 12345);
        console.log(`   ✅ ${companies.length}社生成成功`);
        console.log(`   企業例: ${companies.slice(0, 3).map(c => c.name).join(', ')}`);

        // 3. NPC生成テスト
        console.log('3. NPC生成テスト...');
        const npcs = generateNPCs(12345, companies, 2000, 100);
        console.log(`   ✅ ${npcs.length}人生成成功`);
        console.log(`   NPC例: ${npcs.slice(0, 3).map(n => n.name).join(', ')}`);

        // 4. データ保存テスト
        console.log('4. データ保存テスト...');
        await db.companies.bulkAdd(companies);
        await db.characters.bulkAdd(npcs);
        console.log('   ✅ データ保存成功');

        // 5. データ読み込みテスト
        console.log('5. データ読み込みテスト...');
        const savedCompanies = await db.companies.count();
        const savedCharacters = await db.characters.count();
        console.log(`   ✅ 企業: ${savedCompanies}社, キャラクター: ${savedCharacters}人`);

        // 6. クリーンアップ
        console.log('6. クリーンアップ...');
        await db.companies.clear();
        await db.characters.clear();
        console.log('   ✅ クリーンアップ完了');

        console.log('\n=== 全テスト成功 ===');
    } catch (error) {
        console.error('❌ エラー発生:', error);
        throw error;
    }
}

// ブラウザコンソールから実行可能にエクスポート
if (typeof window !== 'undefined') {
    (window as unknown as { runVerification: typeof runVerification }).runVerification = runVerification;
}
