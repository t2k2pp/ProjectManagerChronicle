/**
 * 社員名簿画面
 * NPC一覧を表示・検索・フィルタ
 */

import { useState, useMemo } from 'react';
import type { Character, Company } from '../../types';
import { Button, Card, CardHeader, Badge } from '../common';
import { CharacterCard } from '../game/PMCockpit';

interface CharacterListScreenProps {
    characters: Character[];
    companies: Company[];
    onSelectCharacter: (character: Character) => void;
    onBack: () => void;
}

type SortKey = 'name' | 'company' | 'position' | 'age' | 'stamina';
type SortOrder = 'asc' | 'desc';

/** 役職ランク取得 */
function getPositionRank(title: string): number {
    const ranks: Record<string, number> = {
        PRESIDENT: 10,
        VICE_PRESIDENT: 9,
        EXECUTIVE: 8,
        DIRECTOR: 7,
        SENIOR_MANAGER: 6,
        MANAGER: 5,
        LEADER: 4,
        SENIOR: 3,
        MEMBER: 2,
        NEWCOMER: 1,
    };
    return ranks[title] || 0;
}

export function CharacterListScreen({
    characters,
    companies,
    onSelectCharacter,
    onBack,
}: CharacterListScreenProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'EMPLOYED' | 'FREELANCE'>('ALL');
    const [companyFilter, setCompanyFilter] = useState<string>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // フィルタリング・ソート
    const filteredCharacters = useMemo(() => {
        let result = [...characters];

        // 検索フィルタ
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.techSkills.some(s => s.toLowerCase().includes(query))
            );
        }

        // ステータスフィルタ
        if (statusFilter !== 'ALL') {
            result = result.filter(c => c.status === statusFilter);
        }

        // 企業フィルタ
        if (companyFilter !== 'ALL') {
            result = result.filter(c => c.companyId === companyFilter);
        }

        // ソート
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortKey) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'company':
                    comparison = (a.companyId || '').localeCompare(b.companyId || '');
                    break;
                case 'position':
                    comparison = getPositionRank(b.position.title) - getPositionRank(a.position.title);
                    break;
                case 'age':
                    comparison = a.birthYear - b.birthYear;
                    break;
                case 'stamina':
                    comparison = (b.stamina.current / b.stamina.max) - (a.stamina.current / a.stamina.max);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [characters, searchQuery, statusFilter, companyFilter, sortKey, sortOrder]);

    // 統計
    const stats = useMemo(() => ({
        total: characters.length,
        employed: characters.filter(c => c.status === 'EMPLOYED').length,
        freelance: characters.filter(c => c.status === 'FREELANCE').length,
    }), [characters]);

    const companyMap = useMemo(() =>
        new Map(companies.map(c => [c.id, c.name])),
        [companies]
    );

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* ヘッダー */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>← 戻る</Button>
                    <h1 className="text-2xl font-bold text-white">社員名簿</h1>
                </div>
                <div className="flex gap-4 text-sm">
                    <Badge variant="info">{stats.total}名</Badge>
                    <span className="text-gray-400">
                        正社員: {stats.employed} / フリーランス: {stats.freelance}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
                {/* フィルタ・サイドバー */}
                <aside className="col-span-3">
                    <Card variant="glass" padding="md">
                        <CardHeader title="検索・フィルタ" />

                        {/* 検索 */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="名前・スキルで検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input"
                            />
                        </div>

                        {/* ステータスフィルタ */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-400 mb-2">雇用形態</div>
                            <div className="flex flex-wrap gap-2">
                                {(['ALL', 'EMPLOYED', 'FREELANCE'] as const).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1 rounded-lg text-sm ${statusFilter === status ? 'active' : 'bg-surface-light text-gray-300 hover:bg-surface'}`}
                                    >
                                        {status === 'ALL' ? '全て' : status === 'EMPLOYED' ? '正社員' : 'フリーランス'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 企業フィルタ */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-400 mb-2">所属企業</div>
                            <select
                                value={companyFilter}
                                onChange={(e) => setCompanyFilter(e.target.value)}
                                className="input"
                            >
                                <option value="ALL">全ての企業</option>
                                {companies.filter(c => c.isActive).map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ソート */}
                        <div>
                            <div className="text-xs text-gray-400 mb-2">並び替え</div>
                            <div className="space-y-1">
                                {([
                                    { key: 'name', label: '名前' },
                                    { key: 'company', label: '企業' },
                                    { key: 'position', label: '役職' },
                                    { key: 'age', label: '年齢' },
                                    { key: 'stamina', label: 'スタミナ' },
                                ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex justify-between items-center ${sortKey === key ? 'selected' : 'bg-surface-glass text-gray-300 hover:bg-surface-light'}`}
                                    >
                                        {label}
                                        {sortKey === key && (
                                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </aside>

                {/* キャラクター一覧 */}
                <main className="col-span-9">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCharacters.map(character => (
                            <div key={character.id} className="relative">
                                <CharacterCard
                                    character={character}
                                    onClick={() => onSelectCharacter(character)}
                                />
                                {character.companyId && (
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="default" size="sm">
                                            {companyMap.get(character.companyId) || '不明'}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredCharacters.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">該当するキャラクターが見つかりません</p>
                            <p className="text-sm mt-2">フィルタ条件を変更してください</p>
                        </div>
                    )}

                    <div className="mt-4 text-center text-gray-400 text-sm">
                        {filteredCharacters.length} / {characters.length} 件表示
                    </div>
                </main>
            </div>
        </div>
    );
}
