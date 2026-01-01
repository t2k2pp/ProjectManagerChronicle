/**
 * PM立志伝：プロジェクト・クロニクル
 * メインアプリケーション
 */

import { useEffect, useState } from 'react';
import { useGameStore, getPlayerCharacter, getPlayerCompany } from './store/gameStore';
import { TitleScreen, SetupScreen, DashboardScreen, PMCockpitScreen, IndustryMapScreen, type GameStartOptions } from './components/screens';
import { generateInitialWorld, createPlayerCharacter } from './lib/generators';
import type { Project, Task, Character } from './types';
import './index.css';

function App() {
  const {
    phase,
    setPhase,
    worldState,
    startNewGame,
    loadGame,
    isLoading,
    error,
  } = useGameStore();

  // シミュレーション用の企業リスト（セットアップ画面用）
  const [setupCompanies, setSetupCompanies] = useState<typeof worldState extends null ? never : NonNullable<typeof worldState>['companies']>([]);

  // 現在のプロジェクトとタスク（仮データ）
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<Character[]>([]);

  // 初期化
  useEffect(() => {
    if (phase === 'SETUP' && setupCompanies.length === 0) {
      // セットアップ用に企業を事前生成
      const tempWorld = generateInitialWorld({
        startYear: 2020,
        seed: Date.now(),
      });
      setSetupCompanies(tempWorld.companies);
    }
  }, [phase, setupCompanies.length]);

  // プレイヤーキャラクター取得
  const playerCharacter = getPlayerCharacter(useGameStore.getState());
  const playerCompany = getPlayerCompany(useGameStore.getState());

  // 画面別レンダリング
  const renderScreen = () => {
    switch (phase) {
      case 'TITLE':
        return (
          <TitleScreen
            onNewGame={() => setPhase('SETUP')}
            onLoadGame={async () => {
              // スロット1からロード（簡易実装）
              const success = await loadGame(1);
              if (!success) {
                setPhase('SETUP');
              }
            }}
            onSettings={() => {
              // TODO: 設定画面
              console.log('Settings');
            }}
          />
        );

      case 'SETUP':
        return (
          <SetupScreen
            companies={setupCompanies}
            onStartGame={async (options: GameStartOptions) => {
              // ワールド生成
              const world = generateInitialWorld({
                startYear: options.startYear,
                seed: Date.now(),
              });

              // プレイヤーキャラクター作成
              const player = createPlayerCharacter(world, {
                name: options.playerName,
                gender: options.gender,
                startType: options.startType,
                companyId: options.companyId || world.companies[0]?.id,
              });

              // ワールドにプレイヤーを追加
              if (player.status === 'EMPLOYED') {
                world.npcs.push(player);
              } else {
                world.freelancers.push(player);
              }

              // ゲーム開始
              await startNewGame(world, player.id, 1);
            }}
            onBack={() => setPhase('TITLE')}
          />
        );

      case 'DASHBOARD':
        if (!worldState || !playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <DashboardScreen
            worldState={worldState}
            playerCharacter={playerCharacter}
            playerCompany={playerCompany}
            activeProject={currentProject}
            onStartProject={() => {
              // 仮のプロジェクト作成
              const mockProject: Project = {
                id: 'proj-1',
                name: 'ERPシステム刷新',
                client: '大手製造業A社',
                budget: { initial: 50000000, current: 50000000 },
                schedule: { startWeek: 1, endWeek: 20, currentWeek: 1 },
                evm: { pv: 0, ev: 0, ac: 0, spi: 1, cpi: 1 },
                status: 'RUNNING',
              };
              setCurrentProject(mockProject);

              // 仮のタスク
              setCurrentTasks([
                { id: 't1', projectId: 'proj-1', name: '要件定義', assigneeId: null, phase: 'REQUIREMENT', progress: 0, quality: 80, riskFactor: 20, dependencies: [], isCriticalPath: true },
                { id: 't2', projectId: 'proj-1', name: '基本設計', assigneeId: null, phase: 'DESIGN', progress: 0, quality: 80, riskFactor: 30, dependencies: ['t1'], isCriticalPath: true },
                { id: 't3', projectId: 'proj-1', name: '詳細設計', assigneeId: null, phase: 'DESIGN', progress: 0, quality: 80, riskFactor: 25, dependencies: ['t2'], isCriticalPath: false },
                { id: 't4', projectId: 'proj-1', name: '開発', assigneeId: null, phase: 'DEVELOP', progress: 0, quality: 80, riskFactor: 40, dependencies: ['t3'], isCriticalPath: true },
                { id: 't5', projectId: 'proj-1', name: 'テスト', assigneeId: null, phase: 'TEST', progress: 0, quality: 80, riskFactor: 35, dependencies: ['t4'], isCriticalPath: true },
              ]);

              // チームメンバー（NPCから選択）
              setTeamMembers(worldState.npcs.slice(0, 5));

              setPhase('PM_COCKPIT');
            }}
            onOpenCareer={() => setPhase('CAREER')}
            onOpenIndustryMap={() => setPhase('INDUSTRY_MAP')}
            onContinueProject={() => setPhase('PM_COCKPIT')}
          />
        );

      case 'PM_COCKPIT':
        if (!currentProject || !playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <PMCockpitScreen
            project={currentProject}
            tasks={currentTasks}
            teamMembers={teamMembers}
            currentWeek={currentProject.schedule.currentWeek}
            onNextTurn={() => {
              // ターン進行（仮実装）
              setCurrentProject(prev => prev ? {
                ...prev,
                schedule: { ...prev.schedule, currentWeek: prev.schedule.currentWeek + 1 }
              } : null);
            }}
            onAssignTask={(taskId, characterId) => {
              setCurrentTasks(prev =>
                prev.map(t => t.id === taskId ? { ...t, assigneeId: characterId } : t)
              );
            }}
            onUnassignTask={(taskId) => {
              setCurrentTasks(prev =>
                prev.map(t => t.id === taskId ? { ...t, assigneeId: null } : t)
              );
            }}
            onOpenMenu={() => setPhase('DASHBOARD')}
          />
        );

      case 'CAREER':
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-3xl font-bold mb-4">キャリア管理</h1>
              <p className="text-gray-400 mb-6">Coming Soon...</p>
              <button
                onClick={() => setPhase('DASHBOARD')}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                戻る
              </button>
            </div>
          </div>
        );

      case 'INDUSTRY_MAP':
        return (
          <IndustryMapScreen
            companies={worldState?.companies || []}
            npcs={[...(worldState?.npcs || []), ...(worldState?.freelancers || [])]}
            currentYear={worldState?.currentYear || 2020}
            onBack={() => setPhase('DASHBOARD')}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-3xl font-bold mb-4">画面準備中</h1>
              <p className="text-gray-400 mb-6">{phase}</p>
              <button
                onClick={() => setPhase('TITLE')}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                タイトルへ戻る
              </button>
            </div>
          </div>
        );
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold text-red-400 mb-4">エラー</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => setPhase('TITLE')}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            タイトルへ戻る
          </button>
        </div>
      </div>
    );
  }

  return renderScreen();
}

export default App;
