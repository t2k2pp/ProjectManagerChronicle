/**
 * 業界マップ画面
 * IT業界全体を俯瞰して企業・キャラクター情報を確認
 */

import { useState } from 'react';
import { Button, Card, Badge } from '../common';
import type { Company, Character, CompanyCategory } from '../../types';

interface IndustryMapScreenProps {
    companies: Company[];
    npcs: Character[];
    currentYear: number;
    onBack: () => void;
    onSelectCompany?: (company: Company) => void;
}

type FilterCategory = 'ALL' | CompanyCategory;

export function IndustryMapScreen({
    companies,
    npcs,
    currentYear,
    onBack,
    onSelectCompany,
}: IndustryMapScreenProps) {
    const [filter, setFilter] = useState<FilterCategory>('ALL');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    // カテゴリ別にフィルタリング
    const filteredCompanies = filter === 'ALL'
        ? companies
        : companies.filter(c => c.category === filter);

    // 会社の従業員数を取得
    const getEmployeeCount = (companyId: string): number => {
        return npcs.filter(n => n.companyId === companyId).length;
    };

    // カテゴリラベル
    const categoryLabel: Record<CompanyCategory, string> = {
        LARGE: '大手企業',
        MEDIUM: '中堅企業',
        VENTURE: 'ベンチャー',
    };

    // カテゴリカラー
    const categoryColor: Record<CompanyCategory, string> = {
        LARGE: 'bg-blue-500',
        MEDIUM: 'bg-green-500',
        VENTURE: 'bg-purple-500',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">🗺️ 業界マップ</h1>
                    <p className="text-gray-400 mt-1">
                        {currentYear}年 - IT業界の企業一覧（{companies.length}社）
                    </p>
                </div>
                <Button variant="ghost" onClick={onBack}>
                    ← 戻る
                </Button>
            </div>

            {/* フィルター */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(['ALL', 'LARGE', 'MEDIUM', 'VENTURE'] as FilterCategory[]).map(cat => (
                    <Button
                        key={cat}
                        variant={filter === cat ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter(cat)}
                    >
                        {cat === 'ALL' ? '全て' : categoryLabel[cat as CompanyCategory]}
                        <span className="ml-1 text-xs opacity-70">
                            ({cat === 'ALL' ? companies.length : companies.filter(c => c.category === cat).length})
                        </span>
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 企業一覧 */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredCompanies.map(company => (
                            <button
                                key={company.id}
                                onClick={() => {
                                    setSelectedCompany(company);
                                    onSelectCompany?.(company);
                                }}
                                className={`text-left p-4 rounded-lg border transition-all ${selectedCompany?.id === company.id
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-lg">{company.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-xs text-white ${categoryColor[company.category]}`}>
                                                {categoryLabel[company.category]}
                                            </span>
                                            {company.isActive ? (
                                                <Badge variant="success">営業中</Badge>
                                            ) : (
                                                <Badge variant="danger">廃業</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-400">
                                        👥 社員数: <span className="text-white">{company.employeeCount}名</span>
                                    </div>
                                    <div className="text-gray-400">
                                        📅 設立: <span className="text-white">{company.foundedYear}年</span>
                                    </div>
                                    <div className="text-gray-400">
                                        💰 財務: <span className="text-white">{company.financialHealth}</span>
                                    </div>
                                    <div className="text-gray-400">
                                        ⭐ 評判: <span className="text-white">{company.reputation}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 企業詳細パネル */}
                <div className="lg:col-span-1">
                    {selectedCompany ? (
                        <Card variant="glass" padding="md" className="sticky top-6">
                            <h2 className="text-xl font-bold text-white mb-4">
                                {selectedCompany.name}
                            </h2>

                            <div className="space-y-4">
                                {/* 基本情報 */}
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2">基本情報</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-white">設立: {selectedCompany.foundedYear}年</p>
                                        <p className="text-white">社員数: {selectedCompany.employeeCount}名</p>
                                        <p className="text-white">カテゴリ: {categoryLabel[selectedCompany.category]}</p>
                                        <p className="text-white">売上: {(selectedCompany.revenue / 100000000).toFixed(1)}億円</p>
                                    </div>
                                </div>

                                {/* ステータス */}
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2">企業ステータス</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-800 p-2 rounded">
                                            <div className="text-xs text-gray-400">評判</div>
                                            <div className="text-lg font-bold text-purple-400">{selectedCompany.reputation}</div>
                                        </div>
                                        <div className="bg-gray-800 p-2 rounded">
                                            <div className="text-xs text-gray-400">財務健全性</div>
                                            <div className="text-lg font-bold text-green-400">{selectedCompany.financialHealth}</div>
                                        </div>
                                        <div className="bg-gray-800 p-2 rounded">
                                            <div className="text-xs text-gray-400">成長率</div>
                                            <div className="text-lg font-bold text-blue-400">{selectedCompany.growthRate}%</div>
                                        </div>
                                        <div className="bg-gray-800 p-2 rounded">
                                            <div className="text-xs text-gray-400">働き方</div>
                                            <div className="text-sm font-bold text-orange-400">{selectedCompany.culture.workStyle}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 専門分野 */}
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2">専門分野</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedCompany.specialties.map((spec, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 所属社員リスト（最大5人） */}
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-2">主要社員</h3>
                                    <div className="space-y-1">
                                        {npcs
                                            .filter(n => n.companyId === selectedCompany.id)
                                            .slice(0, 5)
                                            .map(npc => (
                                                <div key={npc.id} className="flex items-center gap-2 text-sm bg-gray-800 p-2 rounded">
                                                    <span className="text-white">{npc.name}</span>
                                                    <span className="text-gray-400 text-xs">{npc.position.title}</span>
                                                </div>
                                            ))
                                        }
                                        {getEmployeeCount(selectedCompany.id) > 5 && (
                                            <p className="text-xs text-gray-500">
                                                他 {getEmployeeCount(selectedCompany.id) - 5}名
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card variant="default" padding="md" className="text-center">
                            <p className="text-gray-400">
                                企業を選択すると詳細が表示されます
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
