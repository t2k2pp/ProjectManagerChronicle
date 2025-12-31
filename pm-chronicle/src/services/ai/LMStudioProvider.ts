/**
 * LM Studioプロバイダー
 * ローカルLM Studioサーバーとの連携（OpenAI互換API）
 */

import { BaseAIProvider } from './BaseProvider';
import type { ChatMessage, AIResponse } from './types';

export class LMStudioProvider extends BaseAIProvider {
    readonly name = 'LM Studio';

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/models`,
                { method: 'GET' },
                5000
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/chat/completions`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.config.model,
                        messages: messages.map(m => ({
                            role: m.role,
                            content: m.content,
                        })),
                        temperature: this.config.temperature ?? 0.7,
                        max_tokens: this.config.maxTokens ?? 2000,
                        stream: false,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error: `LM Studio error: ${error}` };
            }

            const data = await response.json();
            const choice = data.choices?.[0];

            return {
                success: true,
                content: choice?.message?.content || '',
                usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                } : undefined,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
}
