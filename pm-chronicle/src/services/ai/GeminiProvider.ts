/**
 * Google Gemini APIプロバイダー
 */

import { BaseAIProvider } from './BaseProvider';
import type { ChatMessage, AIResponse } from './types';

export class GeminiProvider extends BaseAIProvider {
    readonly name = 'Gemini';

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/models?key=${this.config.apiKey}`,
                { method: 'GET' },
                5000
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    /** Gemini API形式にメッセージを変換 */
    private formatMessages(messages: ChatMessage[]) {
        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        return {
            systemInstruction: systemMessage ? {
                parts: [{ text: systemMessage.content }]
            } : undefined,
            contents: chatMessages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }))
        };
    }

    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        try {
            const model = this.config.model || 'gemini-1.5-flash';
            const url = `${this.config.apiEndpoint}/models/${model}:generateContent?key=${this.config.apiKey}`;
            const { systemInstruction, contents } = this.formatMessages(messages);

            const response = await this.fetchWithTimeout(
                url,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction,
                        contents,
                        generationConfig: {
                            temperature: this.config.temperature ?? 0.7,
                            maxOutputTokens: this.config.maxTokens ?? 2000,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error: `Gemini error: ${error}` };
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                success: true,
                content,
                usage: data.usageMetadata ? {
                    promptTokens: data.usageMetadata.promptTokenCount || 0,
                    completionTokens: data.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: data.usageMetadata.totalTokenCount || 0,
                } : undefined,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
}
