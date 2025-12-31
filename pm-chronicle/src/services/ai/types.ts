/**
 * AIサービス型定義
 * 複数のAIプロバイダーに対応した抽象インターフェース
 */

/** サポートするAIプロバイダー */
export type AIProvider =
    | 'azure'      // Azure OpenAI Service
    | 'gemini'     // Google Gemini API
    | 'ollama'     // Ollama (ローカル)
    | 'lmstudio'   // LM Studio (ローカル)
    | 'llamacpp';  // llama.cpp (ローカル)

/** AIプロバイダー設定 */
export interface AIProviderConfig {
    provider: AIProvider;
    apiEndpoint: string;
    apiKey?: string;           // Azure, Gemini用
    model: string;             // 使用するモデル名
    deploymentName?: string;   // Azure用
    temperature?: number;
    maxTokens?: number;
}

/** チャットメッセージ */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/** AI応答 */
export interface AIResponse {
    success: boolean;
    content?: string;
    error?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/** 分析リクエスト */
export interface AnalysisRequest {
    type: 'PROJECT_REVIEW' | 'NEGOTIATION' | 'CAREER_ADVICE' | 'DECISION_SUPPORT';
    context: string;
    question?: string;
    history?: ChatMessage[];
}

/** 分析結果 */
export interface AnalysisResult {
    success: boolean;
    analysis?: string;
    recommendations?: string[];
    score?: number;
    error?: string;
}

/** デフォルト設定 */
export const DEFAULT_CONFIGS: Record<AIProvider, Partial<AIProviderConfig>> = {
    azure: {
        provider: 'azure',
        apiEndpoint: 'https://your-resource.openai.azure.com',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
    },
    gemini: {
        provider: 'gemini',
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 2000,
    },
    ollama: {
        provider: 'ollama',
        apiEndpoint: 'http://localhost:11434',
        model: 'llama3',
        temperature: 0.7,
        maxTokens: 2000,
    },
    lmstudio: {
        provider: 'lmstudio',
        apiEndpoint: 'http://localhost:1234/v1',
        model: 'local-model',
        temperature: 0.7,
        maxTokens: 2000,
    },
    llamacpp: {
        provider: 'llamacpp',
        apiEndpoint: 'http://localhost:8080',
        model: 'default',
        temperature: 0.7,
        maxTokens: 2000,
    },
};
