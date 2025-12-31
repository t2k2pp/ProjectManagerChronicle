/**
 * Azure OpenAI Serviceプロバイダー
 */

import { BaseAIProvider } from './BaseProvider';
import type { ChatMessage, AIResponse } from './types';

export class AzureProvider extends BaseAIProvider {
    readonly name = 'Azure OpenAI';

    async testConnection(): Promise<boolean> {
        try {
            // デプロイメント一覧を取得して接続確認
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/openai/deployments?api-version=2024-02-15-preview`,
                {
                    method: 'GET',
                    headers: {
                        'api-key': this.config.apiKey || '',
                    },
                },
                5000
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        try {
            const deploymentName = this.config.deploymentName || this.config.model;
            const url = `${this.config.apiEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

            const response = await this.fetchWithTimeout(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.config.apiKey || '',
                    },
                    body: JSON.stringify({
                        messages: messages.map(m => ({
                            role: m.role,
                            content: m.content,
                        })),
                        temperature: this.config.temperature ?? 0.7,
                        max_tokens: this.config.maxTokens ?? 2000,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error: `Azure error: ${error}` };
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
