/**
 * 企業名生成システム
 * プレフィックス + 中央語 + サフィックスの組み合わせ
 */

/** プレフィックス（接頭語）30種以上 */
export const COMPANY_PREFIXES = [
    // 地名系
    '日本', '大和', '富士', '東京', '大阪', '神奈川', '中央', '東海', '関西', '九州',
    // 企業系
    '総合', '新日本', '第一', '太平洋', '環太平洋', 'アジア', 'グローバル', 'ユニバーサル', 'インター',
    // 先進系
    'ネオ', 'フューチャー', 'ネクスト', 'サイバー', 'デジタル', 'スマート', 'クラウド', 'AI',
    // 価値系
    'クリエイティブ', 'イノベーション', 'プレミア', 'エクセル', 'トップ', 'エース',
];

/** 中央語（コア名）30種以上 */
export const COMPANY_CORES = [
    // IT系
    'ソフト', 'データ', 'システム', 'ネット', 'テック', 'コンピュータ', 'インフォ', 'ロジック',
    // ソリューション系
    'ソリューション', 'サービス', 'コンサルティング', 'インテグレーション',
    // 先進系
    'サイエンス', 'イノベーション', 'クラウド', 'ラボ',
    // 英字
    'Zero', 'One', 'Alpha', 'Beta', 'Gamma', 'Nova', 'Prime', 'Core',
    // 組織系
    'パートナーズ', 'アソシエイツ', 'グループ', 'ユニオン',
    // クリエイティブ系
    'コード', 'ワークス', 'デザイン', 'スタジオ', 'ファクトリー',
];

/** サフィックス（接尾語）30種以上 */
export const COMPANY_SUFFIXES = [
    // 法人形態
    '株式会社', '', 'Inc.', 'Co.', 'Ltd.', 'Corp.',
    // 複合形
    'システムズ', 'ソリューションズ', 'テクノロジーズ', 'サービシーズ',
    // 組織形態
    'エンタープライズ', 'ホールディングス', 'コーポレーション',
    // 地域
    'ジャパン', 'アジア', 'グローバル', 'ワールドワイド',
    // 分野
    'ベース', 'ソフトウェア', 'サービス', 'ネットワーク',
    // 研究系
    'ラボラトリー', 'リサーチ', 'テクノロジー',
    // その他
    'プロジェクト', 'ファクトリー', 'スタジオ',
];

/** シード値から再現可能な乱数生成器 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

/** 配列からランダムに選択 */
function pickRandom<T>(array: T[], random: () => number): T {
    return array[Math.floor(random() * array.length)];
}

/** 企業名を生成 */
export function generateCompanyName(seed: number): string {
    const random = seededRandom(seed);

    const prefix = pickRandom(COMPANY_PREFIXES, random);
    const core = pickRandom(COMPANY_CORES, random);
    const suffix = pickRandom(COMPANY_SUFFIXES, random);

    // 組み合わせ（サフィックスが空の場合もある）
    return suffix ? `${prefix}${core}${suffix}` : `${prefix}${core}`;
}

/** 複数の企業名を生成（重複なし） */
export function generateCompanyNames(count: number, baseSeed: number): string[] {
    const names = new Set<string>();
    let seed = baseSeed;

    while (names.size < count) {
        const name = generateCompanyName(seed);
        names.add(name);
        seed++;
    }

    return Array.from(names);
}
