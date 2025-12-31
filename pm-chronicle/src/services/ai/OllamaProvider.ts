/**
 * Ollamaプロバイダー
 * ローカルOllamaサーバーとの連携
 */

import { BaseAIProvider } from './BaseProvider';
import type { ChatMessage, AIResponse } from './types';

export class OllamaProvider extends BaseAIProvider {
    readonly name = 'Ollama';

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/api/tags`,
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
                `${this.config.apiEndpoint}/api/chat`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.config.model,
                        messages: messages.map(m => ({
                            role: m.role,
                            content: m.content,
                        })),
                        stream: false,
                        options: {
                            temperature: this.config.temperature ?? 0.7,
                            num_predict: this.config.maxTokens ?? 2000,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error: `Ollama error: ${error}` };
            }

            const data = await response.json();
            return {
                success: true,
                content: data.message?.content || '',
                usage: {
                    promptTokens: data.prompt_eval_count || 0,
                    completionTokens: data.eval_count || 0,
                    totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
                },
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async chatStream(
        messages: ChatMessage[],
        onChunk: (chunk: string) => void
    ): Promise<AIResponse> {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    stream: true,
                    options: {
                        temperature: this.config.temperature ?? 0.7,
                        num_predict: this.config.maxTokens ?? 2000,
                    },
                }),
            });

            if (!response.ok) {
                return { success: false, error: 'Stream request failed' };
            }

            const reader = response.body?.getReader();
            if (!reader) {
                return { success: false, error: 'No response body' };
            }

            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            fullContent += data.message.content;
                            onChunk(data.message.content);
                        }
                    } catch {
                        // JSON parse error, skip
                    }
                }
            }

            return { success: true, content: fullContent };
        } catch (error) {
            return this.handleError(error);
        }
    }
}
