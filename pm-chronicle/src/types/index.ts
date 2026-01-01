/**
 * PM立志伝：プロジェクト・クロニクル
 * 共通型定義
 */

// ========================
// キャラクター関連
// ========================

/** 役職タイトル */
export type PositionTitle =
    | 'NEWCOMER'        // 新人
    | 'MEMBER'          // 一般社員
    | 'SENIOR'          // 主任
    | 'LEADER'          // リーダー
    | 'MANAGER'         // 課長
    | 'SENIOR_MANAGER'  // 部長
    | 'DIRECTOR'        // 本部長
    | 'EXECUTIVE'       // 取締役
    | 'VICE_PRESIDENT'  // 副社長
    | 'PRESIDENT';      // 社長

/** 雇用状態 */
export type EmploymentStatus = 'EMPLOYED' | 'FREELANCE' | 'RETIRED' | 'DECEASED';

/** 婚姻状態 */
export type MarriageStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED';

/** 関係タイプ */
export type RelationshipType = 'COLLEAGUE' | 'RIVAL' | 'MENTOR' | 'MENTEE' | 'FRIEND' | 'SPOUSE';

/** 表スキル（プロジェクトスキル） */
export interface StatsBlue {
    design: number;      // 設計 0-10
    develop: number;     // 製造 0-10
    test: number;        // 評価 0-10
    negotiation: number; // 折衝 0-10
    propose: number;     // 提案 0-10
    judgment: number;    // 判断 0-10
}

/** 裏スキル（チーム運営能力） */
export interface StatsRed {
    admin: number;       // 庶務 0-10
    organizer: number;   // 幹事 0-10
    service: number;     // 給仕 0-10
    chat: number;        // 雑談 0-10
    charm: number;       // 美貌 0-10
    luck: number;        // 幸運 0-10
}

/** キャラクター（NPC人材） */
export interface Character {
    id: string;
    name: string;
    birthYear: number;
    gender: 'M' | 'F' | 'OTHER';

    // 所属
    status: EmploymentStatus;
    companyId?: string;
    position: {
        title: PositionTitle;
        rank: number;
    };
    joinYear: number;

    // 能力
    statsBlue: StatsBlue;
    statsRed: StatsRed;

    // 状態
    stamina: {
        current: number;
        max: number;
        recoveryRate: number;
    };
    traits: string[];
    techSkills: string[];

    // 関係性
    loyalty: number;
    ambition: number;
    relationships: {
        npcId: string;
        type: RelationshipType;
        strength: number;
    }[];

    // プライベート
    marriageStatus: MarriageStatus;
    spouseId?: string;
    childCount: number;

    // 隠しデータ
    hiddenData?: {
        trueName: string;
        trueStats: Partial<StatsBlue & StatsRed>;
        backstory: string;
    };
}

// ========================
// 企業関連
// ========================

/** 企業カテゴリ */
export type CompanyCategory = 'LARGE' | 'MEDIUM' | 'VENTURE';

/** 企業文化 */
export interface CompanyCulture {
    workStyle: 'TRADITIONAL' | 'BALANCED' | 'FLEXIBLE';
    hierarchy: 'STRICT' | 'MODERATE' | 'FLAT';
    innovation: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    training: 'MINIMAL' | 'STANDARD' | 'EXTENSIVE';
}

/** 企業 */
export interface Company {
    id: string;
    name: string;
    foundedYear: number;
    category: CompanyCategory;

    // 規模
    employeeCount: number;
    mobEmployeeCount: number;
    revenue: number;

    // 特性
    culture: CompanyCulture;
    specialties: string[];

    // 状態
    reputation: number;
    financialHealth: number;
    growthRate: number;

    // 関係
    rivals: string[];
    partners: string[];

    // 歴史
    isActive: boolean;
    bankruptYear?: number;
    acquiredBy?: string;
}

// ========================
// プロジェクト関連
// ========================

/** プロジェクト状態 */
export type ProjectStatus = 'PLANNING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

/** タスクフェーズ */
export type TaskPhase = 'REQUIREMENT' | 'DESIGN' | 'DEVELOP' | 'TEST';

/** EVM指標 */
export interface EVMState {
    pv: number;  // 計画値
    ev: number;  // 出来高
    ac: number;  // 実コスト
    spi: number; // スケジュール効率指数
    cpi: number; // コスト効率指数
}

/** プロジェクト */
export interface Project {
    id: string;
    name: string;
    client: string;
    budget: {
        initial: number;
        current: number;
    };
    schedule: {
        startWeek: number;
        endWeek: number;
        currentWeek: number;
    };
    evm: EVMState;
    status: ProjectStatus;
}

/** タスク */
export interface Task {
    id: string;
    projectId: string;
    name: string;
    assigneeId: string | null;
    phase: TaskPhase;
    progress: number;
    quality: number;
    riskFactor: number;
    dependencies: string[];
    isCriticalPath: boolean;
    // スケジュール情報
    startWeek: number;
    endWeek: number;
    estimatedWeeks: number;
}

// ========================
// ワールド状態
// ========================

/** 歴史イベント */
export interface HistoricalEvent {
    id: string;
    year: number;
    name: string;
    description: string;
    effects: {
        marketImpact: number;
        skillTrendChanges?: string[];
    };
}

/** 業界状態 */
export interface IndustryState {
    totalMarketSize: number;
    trendingSkills: string[];
    decliningSkills: string[];
}

/** ワールド状態 */
export interface WorldState {
    seed: number;
    startYear: number;
    currentYear: number;
    currentWeek: number;

    companies: Company[];
    npcs: Character[];
    freelancers: Character[];
    retiredNpcs: Character[];

    industryState: IndustryState;
    pastEvents: HistoricalEvent[];
}

// ========================
// ログ関連
// ========================

/** イベントタイプ */
export type EventType = 'PROGRESS' | 'TROUBLE' | 'DECISION' | 'NEGOTIATION';

/** 週次ログ */
export interface WeeklyLog {
    id: string;
    projectId: string;
    week: number;
    eventType: EventType;
    description: string;
    pmComment?: string;
    cardsUsed?: string[];
}
