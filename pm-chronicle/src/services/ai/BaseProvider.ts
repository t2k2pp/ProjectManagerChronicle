/**
 * AIプロバイダー基底クラス
 * 各プロバイダーの共通インターフェース
 */

import type { AIProviderConfig, ChatMessage, AIResponse } from './types';

/** プロバイダー基底インターフェース */
export interface IAIProvider {
    readonly name: string;
    readonly config: AIProviderConfig;

    /** 接続テスト */
    testConnection(): Promise<boolean>;

    /** チャット完了 */
    chat(messages: ChatMessage[]): Promise<AIResponse>;

    /** ストリーミングチャット（オプション） */
    chatStream?(
        messages: ChatMessage[],
        onChunk: (chunk: string) => void
    ): Promise<AIResponse>;
}

/** プロバイダー基底クラス */
export abstract class BaseAIProvider implements IAIProvider {
    abstract readonly name: string;
    readonly config: AIProviderConfig;

    constructor(config: AIProviderConfig) {
        this.config = config;
    }

    abstract testConnection(): Promise<boolean>;
    abstract chat(messages: ChatMessage[]): Promise<AIResponse>;

    /** タイムアウト付きfetch */
    protected async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeoutMs: number = 30000
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /** エラーハンドリング */
    protected handleError(error: unknown): AIResponse {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return { success: false, error: 'リクエストがタイムアウトしました' };
            }
            return { success: false, error: error.message };
        }
        return { success: false, error: '不明なエラーが発生しました' };
    }
}
