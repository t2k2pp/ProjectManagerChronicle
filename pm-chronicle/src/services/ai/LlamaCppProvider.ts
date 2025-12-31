/**
 * llama.cppプロバイダー
 * llama.cpp serverとの連携
 */

import { BaseAIProvider } from './BaseProvider';
import type { ChatMessage, AIResponse } from './types';

export class LlamaCppProvider extends BaseAIProvider {
    readonly name = 'llama.cpp';

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/health`,
                { method: 'GET' },
                5000
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    /** メッセージをプロンプト形式に変換 */
    private formatMessages(messages: ChatMessage[]): string {
        return messages.map(m => {
            switch (m.role) {
                case 'system':
                    return `System: ${m.content}`;
                case 'user':
                    return `User: ${m.content}`;
                case 'assistant':
                    return `Assistant: ${m.content}`;
                default:
                    return m.content;
            }
        }).join('\n\n') + '\n\nAssistant:';
    }

    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        try {
            const prompt = this.formatMessages(messages);

            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/completion`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        temperature: this.config.temperature ?? 0.7,
                        n_predict: this.config.maxTokens ?? 2000,
                        stop: ['</s>', 'User:', '\nUser:'],
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error: `llama.cpp error: ${error}` };
            }

            const data = await response.json();

            return {
                success: true,
                content: data.content || '',
                usage: {
                    promptTokens: data.tokens_evaluated || 0,
                    completionTokens: data.tokens_predicted || 0,
                    totalTokens: (data.tokens_evaluated || 0) + (data.tokens_predicted || 0),
                },
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
}
