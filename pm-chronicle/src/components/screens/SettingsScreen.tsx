/**
 * 設定画面コンポーネント
 * AIプロバイダの設定、APIキー管理
 */

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, Badge } from '../common';
import type { AIProvider, AIProviderConfig } from '../../services/ai/types';
import { DEFAULT_CONFIGS } from '../../services/ai/types';
import { aiService } from '../../services/ai';

interface SettingsScreenProps {
    onBack: () => void;
}

const PROVIDER_INFO: Record<AIProvider, { label: string; description: string; requiresKey: boolean }> = {
    azure: {
        label: 'Azure OpenAI',
        description: 'Microsoft Azure OpenAI Service',
        requiresKey: true,
    },
    gemini: {
        label: 'Google Gemini',
        description: 'Google Gemini API',
        requiresKey: true,
    },
    ollama: {
        label: 'Ollama',
        description: 'ローカルLLM（無料）',
        requiresKey: false,
    },
    lmstudio: {
        label: 'LM Studio',
        description: 'ローカルLLM（無料）',
        requiresKey: false,
    },
    llamacpp: {
        label: 'llama.cpp',
        description: 'ローカルLLM（無料）',
        requiresKey: false,
    },
};

const STORAGE_KEY = 'pm-chronicle-ai-config';

export function SettingsScreen({ onBack }: SettingsScreenProps) {
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
    const [apiKey, setApiKey] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [model, setModel] = useState('');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    // 設定読み込み
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const config = JSON.parse(saved) as AIProviderConfig;
                setSelectedProvider(config.provider);
                setApiKey(config.apiKey || '');
                setApiEndpoint(config.apiEndpoint);
                setModel(config.model);
            } catch {
                // 無効なJSONは無視
            }
        }
    }, []);

    // プロバイダ変更時にデフォルト値を設定
    useEffect(() => {
        const defaults = DEFAULT_CONFIGS[selectedProvider];
        if (defaults) {
            setApiEndpoint(defaults.apiEndpoint || '');
            setModel(defaults.model || '');
        }
    }, [selectedProvider]);

    // 設定保存
    const handleSave = () => {
        const config: AIProviderConfig = {
            provider: selectedProvider,
            apiEndpoint,
            apiKey: apiKey || undefined,
            model,
            temperature: 0.7,
            maxTokens: 2000,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        aiService.configure(config);
        setTestStatus('idle');
        setTestMessage('設定を保存しました');
        setTimeout(() => setTestMessage(''), 3000);
    };

    // 接続テスト
    const handleTest = async () => {
        setTestStatus('testing');
        setTestMessage('');

        // 先に設定を適用
        const config: AIProviderConfig = {
            provider: selectedProvider,
            apiEndpoint,
            apiKey: apiKey || undefined,
            model,
            temperature: 0.7,
            maxTokens: 2000,
        };
        aiService.configure(config);

        try {
            const response = await aiService.chat([
                { role: 'user', content: 'テスト接続です。「OK」と返答してください。' }
            ]);
            if (response.success) {
                setTestStatus('success');
                setTestMessage(`接続成功: ${response.content?.slice(0, 50) || 'OK'}`);
            } else {
                setTestStatus('error');
                setTestMessage(`接続失敗: ${response.error || '不明なエラー'}`);
            }
        } catch (e) {
            setTestStatus('error');
            setTestMessage(`接続エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>← 戻る</Button>
                    <h1 className="text-2xl font-bold text-white">⚙️ 設定</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* AIプロバイダ選択 */}
                <Card variant="glass" padding="lg">
                    <CardHeader title="AIプロバイダ設定" subtitle="ゲーム内のAI機能（直談判、振り返り等）に使用" />

                    <div className="space-y-4 mt-4">
                        {/* プロバイダ選択 */}
                        <div>
                            <label className="block text-sm text-muted mb-2">プロバイダ</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {(Object.keys(PROVIDER_INFO) as AIProvider[]).map(provider => (
                                    <button
                                        key={provider}
                                        onClick={() => setSelectedProvider(provider)}
                                        className={`p-3 rounded-lg border transition-all ${selectedProvider === provider
                                                ? 'selected'
                                                : 'interactive'
                                            }`}
                                    >
                                        <div className="font-medium text-white text-sm">
                                            {PROVIDER_INFO[provider].label}
                                        </div>
                                        <div className="text-xs text-muted mt-1">
                                            {PROVIDER_INFO[provider].description}
                                        </div>
                                        {!PROVIDER_INFO[provider].requiresKey && (
                                            <Badge variant="success" size="sm" className="mt-2">キー不要</Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* APIキー */}
                        {PROVIDER_INFO[selectedProvider].requiresKey && (
                            <div>
                                <label className="block text-sm text-muted mb-2">APIキー</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="sk-... または AIzaSy..."
                                    className="input"
                                />
                                <p className="text-xs text-muted mt-1">
                                    ※ APIキーはブラウザのLocalStorageに保存されます
                                </p>
                            </div>
                        )}

                        {/* エンドポイント */}
                        <div>
                            <label className="block text-sm text-muted mb-2">APIエンドポイント</label>
                            <input
                                type="text"
                                value={apiEndpoint}
                                onChange={e => setApiEndpoint(e.target.value)}
                                placeholder="https://..."
                                className="input"
                            />
                        </div>

                        {/* モデル */}
                        <div>
                            <label className="block text-sm text-muted mb-2">モデル名</label>
                            <input
                                type="text"
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                placeholder="gpt-4, gemini-1.5-flash, llama3 など"
                                className="input"
                            />
                        </div>

                        {/* テスト結果 */}
                        {testMessage && (
                            <div className={`p-3 rounded-lg ${testStatus === 'success' ? 'bg-green-500/20 border border-green-500' :
                                    testStatus === 'error' ? 'bg-red-500/20 border border-red-500' :
                                        'bg-surface'
                                }`}>
                                <p className={`text-sm ${testStatus === 'success' ? 'text-green-400' :
                                        testStatus === 'error' ? 'text-red-400' :
                                            'text-gray-300'
                                    }`}>
                                    {testMessage}
                                </p>
                            </div>
                        )}

                        {/* アクションボタン */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={handleTest}
                                disabled={testStatus === 'testing'}
                            >
                                {testStatus === 'testing' ? '🔄 テスト中...' : '🧪 接続テスト'}
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                💾 設定を保存
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* ヒント */}
                <Card variant="default" padding="md">
                    <h3 className="font-bold text-white mb-2">💡 ヒント</h3>
                    <ul className="text-sm text-muted space-y-2">
                        <li>• <strong>ローカルLLM</strong>（Ollama, LM Studio）は無料で使えますが、事前にインストールと起動が必要です</li>
                        <li>• <strong>Gemini</strong>は無料枠があり、手軽に始められます</li>
                        <li>• AI機能を使わなくてもゲームはプレイ可能です（ローカル評価にフォールバック）</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
