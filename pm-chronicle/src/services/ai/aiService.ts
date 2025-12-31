/**
 * AIサービス
 * 複数プロバイダーを統一したインターフェースで利用
 */

import type { AIProviderConfig, AIProvider, ChatMessage, AIResponse, AnalysisRequest, AnalysisResult } from './types';
import { DEFAULT_CONFIGS } from './types';
import type { IAIProvider } from './BaseProvider';
import { OllamaProvider } from './OllamaProvider';
import { LMStudioProvider } from './LMStudioProvider';
import { LlamaCppProvider } from './LlamaCppProvider';
import { AzureProvider } from './AzureProvider';
import { GeminiProvider } from './GeminiProvider';

/** プロバイダーファクトリー */
function createProvider(config: AIProviderConfig): IAIProvider {
    switch (config.provider) {
        case 'ollama':
            return new OllamaProvider(config);
        case 'lmstudio':
            return new LMStudioProvider(config);
        case 'llamacpp':
            return new LlamaCppProvider(config);
        case 'azure':
            return new AzureProvider(config);
        case 'gemini':
            return new GeminiProvider(config);
        default:
            throw new Error(`Unknown provider: ${config.provider}`);
    }
}

/** AIサービスクラス */
class AIService {
    private provider: IAIProvider | null = null;
    private config: AIProviderConfig | null = null;

    /** プロバイダーを設定 */
    configure(config: Partial<AIProviderConfig> & { provider: AIProvider }): void {
        const defaultConfig = DEFAULT_CONFIGS[config.provider];
        this.config = { ...defaultConfig, ...config } as AIProviderConfig;
        this.provider = createProvider(this.config);
    }

    /** 現在の設定を取得 */
    getConfig(): AIProviderConfig | null {
        return this.config;
    }

    /** プロバイダー名を取得 */
    getProviderName(): string {
        return this.provider?.name || 'Not configured';
    }

    /** 接続テスト */
    async testConnection(): Promise<boolean> {
        if (!this.provider) return false;
        return this.provider.testConnection();
    }

    /** チャット */
    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        if (!this.provider) {
            return { success: false, error: 'AIプロバイダーが設定されていません' };
        }
        return this.provider.chat(messages);
    }

    /** プロジェクト振り返り分析 */
    async analyzeProject(request: AnalysisRequest): Promise<AnalysisResult> {
        const systemPrompt = this.getSystemPrompt(request.type);
        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...(request.history || []),
            { role: 'user', content: request.context + (request.question ? `\n\n質問: ${request.question}` : '') },
        ];

        const response = await this.chat(messages);

        if (!response.success) {
            return { success: false, error: response.error };
        }

        return {
            success: true,
            analysis: response.content,
            recommendations: this.extractRecommendations(response.content || ''),
        };
    }

    /** 交渉判定 */
    async judgeNegotiation(
        playerStatement: string,
        context: string
    ): Promise<{ success: boolean; score?: number; feedback?: string; error?: string }> {
        const systemPrompt = `あなたはPMシミュレーションゲームの交渉判定AIです。
プレイヤーの交渉文を評価し、1-100のスコアと短いフィードバックを返してください。

評価基準：
- 論理性（主張の筋道が通っているか）
- 説得力（相手を納得させられるか）
- 礼節（ビジネスマナーを守っているか）
- 創造性（新しい解決策を提示しているか）

以下のJSON形式で回答してください：
{"score": 数値, "feedback": "フィードバック文"}`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `状況: ${context}\n\nプレイヤーの発言: ${playerStatement}` },
        ];

        const response = await this.chat(messages);

        if (!response.success) {
            return { success: false, error: response.error };
        }

        try {
            const jsonMatch = response.content?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    success: true,
                    score: result.score,
                    feedback: result.feedback,
                };
            }
        } catch {
            // JSON解析失敗
        }

        return {
            success: true,
            score: 50,
            feedback: response.content || '判定できませんでした',
        };
    }

    /** 分析タイプ別のシステムプロンプト */
    private getSystemPrompt(type: AnalysisRequest['type']): string {
        switch (type) {
            case 'PROJECT_REVIEW':
                return `あなたはPMシミュレーションゲームのAIアドバイザーです。
プロジェクトの振り返りレポートを作成してください。
良かった点、改善点、次のプロジェクトへの提案を含めてください。
マークダウン形式で回答してください。`;

            case 'NEGOTIATION':
                return `あなたはPMシミュレーションゲームの交渉アドバイザーです。
交渉のコツやテクニックについてアドバイスしてください。`;

            case 'CAREER_ADVICE':
                return `あなたはPMシミュレーションゲームのキャリアアドバイザーです。
プレイヤーのキャリアパスについてアドバイスしてください。`;

            case 'DECISION_SUPPORT':
                return `あなたはPMシミュレーションゲームの意思決定支援AIです。
選択肢のメリット・デメリットを分析し、推奨を提示してください。`;

            default:
                return 'あなたはPMシミュレーションゲームのAIアシスタントです。';
        }
    }

    /** レスポンスから推奨事項を抽出 */
    private extractRecommendations(content: string): string[] {
        const recommendations: string[] = [];
        const lines = content.split('\n');

        for (const line of lines) {
            if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
                const cleaned = line.replace(/^[-*•\d.]+\s+/, '').trim();
                if (cleaned.length > 0) {
                    recommendations.push(cleaned);
                }
            }
        }

        return recommendations.slice(0, 5);
    }
}

/** シングルトンインスタンス */
export const aiService = new AIService();
