/**
 * 歴史イベントシステム
 * 1990-2030年のIT業界イベントを定義
 */

import type { HistoricalEvent } from '../../types';

/** 時代区分 */
export type Era =
    | 'MAINFRAME_CS'    // 汎用機・C/S時代 (1990-1999)
    | 'WEB'             // Web時代 (2000-2009)
    | 'MOBILE_CLOUD'    // モバイル・クラウド時代 (2010-2019)
    | 'AI_DX';          // AI・DX時代 (2020-2030)

/** 時代を年から判定 */
export function getEra(year: number): Era {
    if (year < 2000) return 'MAINFRAME_CS';
    if (year < 2010) return 'WEB';
    if (year < 2020) return 'MOBILE_CLOUD';
    return 'AI_DX';
}

/** 時代名を取得 */
export function getEraName(era: Era): string {
    switch (era) {
        case 'MAINFRAME_CS': return '汎用機・C/S時代';
        case 'WEB': return 'Web時代';
        case 'MOBILE_CLOUD': return 'モバイル・クラウド時代';
        case 'AI_DX': return 'AI・DX時代';
    }
}

/** 歴史イベント定義 */
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
    // 1990年代
    {
        id: 'evt-1990-windows3',
        year: 1991,
        name: 'Windows 3.0日本語版発売',
        description: 'GUIの普及が加速し、エンドユーザーコンピューティングの時代が到来',
        effects: { marketImpact: 10, skillTrendChanges: ['Windows', 'VB'] }
    },
    {
        id: 'evt-1995-windows95',
        year: 1995,
        name: 'Windows 95発売',
        description: '一般家庭へのPC普及を決定的にし、インターネット時代の幕開け',
        effects: { marketImpact: 20, skillTrendChanges: ['Internet', 'HTML'] }
    },
    {
        id: 'evt-1997-y2k-start',
        year: 1997,
        name: '2000年問題対策開始',
        description: '大規模なシステム改修プロジェクトが各地で開始、COBOLエンジニア需要急増',
        effects: { marketImpact: 30, skillTrendChanges: ['COBOL'] }
    },

    // 2000年代
    {
        id: 'evt-2000-y2k-end',
        year: 2000,
        name: '2000年問題終息',
        description: '大きな混乱なく年越しを迎え、レガシー改修バブル終了',
        effects: { marketImpact: -20 }
    },
    {
        id: 'evt-2001-dotcom-crash',
        year: 2001,
        name: 'ネットバブル崩壊',
        description: 'IT投資の急激な冷え込み、多くのネット企業が倒産',
        effects: { marketImpact: -40, skillTrendChanges: [] }
    },
    {
        id: 'evt-2004-sns-boom',
        year: 2004,
        name: 'SNS時代到来',
        description: 'mixi、GREEが登場しソーシャルネットワーキングが普及',
        effects: { marketImpact: 15, skillTrendChanges: ['PHP', 'MySQL', 'Web'] }
    },
    {
        id: 'evt-2007-iphone',
        year: 2007,
        name: 'iPhone発売',
        description: 'スマートフォン革命の始まり、モバイルファーストの時代へ',
        effects: { marketImpact: 25, skillTrendChanges: ['iOS', 'Mobile'] }
    },
    {
        id: 'evt-2008-financial-crisis',
        year: 2008,
        name: '世界金融危機',
        description: 'リーマン・ブラザーズ破綻をきっかけに世界的な不況、IT投資も冷え込む',
        effects: { marketImpact: -35 }
    },

    // 2010年代
    {
        id: 'evt-2011-earthquake',
        year: 2011,
        name: '東日本大震災',
        description: 'BCP/DRの重要性が再認識され、クラウド移行が加速',
        effects: { marketImpact: -15, skillTrendChanges: ['Cloud', 'AWS'] }
    },
    {
        id: 'evt-2012-cloud-era',
        year: 2012,
        name: 'クラウド本格普及',
        description: 'AWS、Azure等のクラウドサービスがエンタープライズに浸透',
        effects: { marketImpact: 20, skillTrendChanges: ['AWS', 'Azure', 'Docker'] }
    },
    {
        id: 'evt-2014-ai-boom',
        year: 2014,
        name: '第3次AIブーム開始',
        description: 'ディープラーニングの進化により、AI/ML投資が急増',
        effects: { marketImpact: 25, skillTrendChanges: ['Python', 'TensorFlow', 'AI/ML'] }
    },
    {
        id: 'evt-2016-dx-start',
        year: 2016,
        name: 'DX推進開始',
        description: '経済産業省がDXレポートを発表、デジタル変革が叫ばれ始める',
        effects: { marketImpact: 15, skillTrendChanges: ['DX', 'Agile'] }
    },
    {
        id: 'evt-2018-2025-cliff',
        year: 2018,
        name: '2025年の崖問題',
        description: 'レガシーシステム刷新の危機感が産業界全体に広がる',
        effects: { marketImpact: 20, skillTrendChanges: ['Microservices', 'Cloud'] }
    },

    // 2020年代
    {
        id: 'evt-2020-pandemic',
        year: 2020,
        name: '世界疫病危機',
        description: 'コロナ禍によりリモートワークが急速に普及、DXが加速',
        effects: { marketImpact: 10, skillTrendChanges: ['Remote', 'SaaS', 'Zero Trust'] }
    },
    {
        id: 'evt-2022-chatgpt',
        year: 2022,
        name: '生成AI革命',
        description: 'ChatGPT登場により生成AIが一般化、業務効率化の波',
        effects: { marketImpact: 30, skillTrendChanges: ['LLM', 'Prompt Engineering', 'AI'] }
    },
    {
        id: 'evt-2025-dx-deadline',
        year: 2025,
        name: 'DXデッドライン',
        description: '2025年の崖到来、レガシー刷新が急務に',
        effects: { marketImpact: 25, skillTrendChanges: ['Modernization', 'Cloud Native'] }
    },
];

/** 指定年までに発生したイベントを取得 */
export function getEventsUntil(year: number): HistoricalEvent[] {
    return HISTORICAL_EVENTS.filter(e => e.year <= year);
}

/** 指定年に発生するイベントを取得 */
export function getEventsForYear(year: number): HistoricalEvent[] {
    return HISTORICAL_EVENTS.filter(e => e.year === year);
}

/** 時代別のトレンドスキルを取得 */
export function getTrendingSkillsForEra(era: Era): string[] {
    switch (era) {
        case 'MAINFRAME_CS':
            return ['COBOL', 'C', 'Oracle', 'VB', 'Assembler', 'RPG'];
        case 'WEB':
            return ['Java', 'PHP', '.NET', 'JavaScript', 'MySQL', 'Linux'];
        case 'MOBILE_CLOUD':
            return ['Swift', 'Kotlin', 'React', 'AWS', 'Docker', 'Python'];
        case 'AI_DX':
            return ['Python', 'TypeScript', 'Kubernetes', 'AI/ML', 'Go', 'Rust'];
    }
}

/** 時代別の陳腐化スキルを取得 */
export function getDecliningSkillsForEra(era: Era): string[] {
    switch (era) {
        case 'MAINFRAME_CS':
            return []; // まだ何も陳腐化していない
        case 'WEB':
            return ['COBOL', 'Assembler', 'RPG'];
        case 'MOBILE_CLOUD':
            return ['VB', 'Delphi', 'Flash'];
        case 'AI_DX':
            return ['jQuery', 'PHP5', 'Objective-C'];
    }
}
