/**
 * PM立志伝：プロジェクト・クロニクル
 * メインアプリケーション
 */

import { useEffect, useState } from 'react';
import { useGameStore, getPlayerCharacter, getPlayerCompany } from './store/gameStore';
import {
  TitleScreen, SetupScreen, DashboardScreen, PMCockpitScreen,
  IndustryMapScreen, CareerScreen, ProjectCompletionScreen, ReportScreen,
  type GameStartOptions
} from './components/screens';
import { ActivitySelector } from './components/game/ActivitySelector';
import { EventDialog } from './components/game/EventDialog';
import { BattleField } from './components/game/CardBattle';
import { generateInitialWorld, createPlayerCharacter } from './lib/generators';
import { checkProjectCompletion as checkTasksComplete } from './lib/projectScore';
import { checkRandomEvent, applyEventEffect, type ProjectEvent } from './lib/projectEvents';
import { processTurn, checkProjectFailure, type ProjectPolicy } from './lib/engine/turnProcessor';
import type { Project, Task, Character } from './types';
import type { ActivityResult } from './lib/activities';
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

  // イベントシステム
  const [currentEvent, setCurrentEvent] = useState<ProjectEvent | null>(null);

  // 方針（ポリシー）ステート
  const [currentPolicy, setCurrentPolicy] = useState<ProjectPolicy>('NORMAL');

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
              // 案件選択画面へ遷移（仮プロジェクト作成を維持しつつ段階的移行）
              // TODO: 将来的にはPROJECT_SELECT遷移に完全移行
              // 現在は既存の動作を維持して安定性を確保
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

              // リアルなウォーターフォールスケジュール
              setCurrentTasks([
                { id: 't1', projectId: 'proj-1', name: '要件定義', assigneeId: null, phase: 'REQUIREMENT', progress: 0, quality: 80, riskFactor: 20, dependencies: [], isCriticalPath: true, startWeek: 1, endWeek: 4, estimatedWeeks: 4 },
                { id: 't2', projectId: 'proj-1', name: '基本設計', assigneeId: null, phase: 'DESIGN', progress: 0, quality: 80, riskFactor: 30, dependencies: ['t1'], isCriticalPath: true, startWeek: 5, endWeek: 8, estimatedWeeks: 4 },
                { id: 't3', projectId: 'proj-1', name: '詳細設計', assigneeId: null, phase: 'DESIGN', progress: 0, quality: 80, riskFactor: 25, dependencies: ['t2'], isCriticalPath: false, startWeek: 9, endWeek: 11, estimatedWeeks: 3 },
                { id: 't4', projectId: 'proj-1', name: '開発', assigneeId: null, phase: 'DEVELOP', progress: 0, quality: 80, riskFactor: 40, dependencies: ['t3'], isCriticalPath: true, startWeek: 12, endWeek: 17, estimatedWeeks: 6 },
                { id: 't5', projectId: 'proj-1', name: 'テスト', assigneeId: null, phase: 'TEST', progress: 0, quality: 80, riskFactor: 35, dependencies: ['t4'], isCriticalPath: true, startWeek: 18, endWeek: 20, estimatedWeeks: 3 },
              ]);

              // チームメンバー（NPCから選択）
              setTeamMembers(worldState.npcs.slice(0, 5));

              setPhase('PM_COCKPIT');
            }}
            onOpenCareer={() => setPhase('CAREER')}
            onOpenIndustryMap={() => setPhase('INDUSTRY_MAP')}
            onOpenActivity={() => setPhase('ACTIVITY')}
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
            currentPolicy={currentPolicy}
            onPolicyChange={setCurrentPolicy}
            onNextTurn={() => {
              if (!worldState || !playerCharacter) return;

              // ターンプロセッサーでシミュレーション実行（ポリシー適用）
              const turnResult = processTurn(
                worldState,
                currentProject,
                currentTasks,
                playerCharacter,
                currentPolicy
              );

              // ワールド状態更新（年・週が進む）
              // Note: processTurnは内部でworldStateを変更している

              // プロジェクト完了/失敗判定
              if (currentProject) {
                const tasksComplete = checkTasksComplete(currentTasks);
                const failure = checkProjectFailure(currentProject);
                const isOverdue = turnResult.week > currentProject.schedule.endWeek;

                if (tasksComplete.isComplete) {
                  // プロジェクト成功
                  setCurrentProject(prev => prev ? {
                    ...prev,
                    schedule: { ...prev.schedule, currentWeek: turnResult.week },
                    status: 'COMPLETED',
                  } : null);
                  setPhase('PROJECT_COMPLETION');
                } else if (failure.failed || isOverdue) {
                  // プロジェクト失敗
                  setCurrentProject(prev => prev ? {
                    ...prev,
                    schedule: { ...prev.schedule, currentWeek: turnResult.week },
                    status: 'FAILED',
                  } : null);
                  setPhase('PROJECT_COMPLETION');
                } else {
                  // 継続
                  setCurrentProject(prev => prev ? {
                    ...prev,
                    schedule: { ...prev.schedule, currentWeek: turnResult.week },
                    evm: prev.evm, // EVMは processTurn で更新済み
                  } : null);

                  // ターン結果のイベントを表示（歴史イベントなど）
                  if (turnResult.events.length > 0) {
                    console.log('Turn events:', turnResult.events);
                  }

                  // ランダムイベント発生チェック
                  const event = checkRandomEvent(currentProject, turnResult.week);
                  if (event) {
                    setCurrentEvent(event);
                  }
                }
              }
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
          <CareerScreen
            player={playerCharacter || null}
            currentYear={worldState?.currentYear || 2020}
            onBack={() => setPhase('DASHBOARD')}
          />
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

      case 'PROJECT_COMPLETION':
        if (!currentProject || !playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <ProjectCompletionScreen
            project={currentProject}
            tasks={currentTasks}
            teamMembers={teamMembers}
            onComplete={(score) => {
              console.log('Project completed with score:', score);
              // プロジェクトをリセットしてダッシュボードへ
              setCurrentProject(null);
              setCurrentTasks([]);
              setPhase('DASHBOARD');
            }}
            onViewReport={() => setPhase('REPORT')}
            onBack={() => setPhase('DASHBOARD')}
          />
        );

      case 'ACTIVITY':
        if (!playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">🎉 日常活動</h1>
                <button
                  onClick={() => setPhase('DASHBOARD')}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
                >
                  ← 戻る
                </button>
              </div>
              <ActivitySelector
                player={playerCharacter}
                teammates={teamMembers}
                onActivityComplete={(result: ActivityResult) => {
                  console.log('Activity completed:', result);
                  // TODO: プレイヤーステータス更新
                }}
              />
            </div>
          </div>
        );

      case 'REPORT':
        if (!currentProject || !playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <ReportScreen
            project={currentProject}
            player={playerCharacter}
            logs={[]}
            onBack={() => setPhase('PROJECT_COMPLETION')}
            onExport={() => {
              console.log('Export report');
            }}
          />
        );

      case 'CARD_BATTLE':
        if (!playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <BattleField
            playerName={playerCharacter.name}
            opponentName="ステークホルダー"
            onBattleEnd={(result) => {
              console.log('Battle result:', result);
              setPhase('PM_COCKPIT');
            }}
            onCancel={() => setPhase('PM_COCKPIT')}
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

  // イベントハンドラ
  const handleEventAccept = () => {
    if (currentEvent && currentProject) {
      const updated = applyEventEffect(currentProject, currentEvent.options.accept.effect);
      setCurrentProject(updated);
      setCurrentEvent(null);
    }
  };

  const handleEventReject = () => {
    if (currentEvent && currentProject) {
      const updated = applyEventEffect(currentProject, currentEvent.options.reject.effect);
      setCurrentProject(updated);
      setCurrentEvent(null);
    }
  };

  const handleEventNegotiate = () => {
    if (currentEvent) {
      // カードバトルへ遷移
      setPhase('CARD_BATTLE');
      // イベントは保持（バトル後に処理）
    }
  };

  return (
    <>
      {renderScreen()}
      {/* イベントダイアログ */}
      {currentEvent && (
        <EventDialog
          event={currentEvent}
          onAccept={handleEventAccept}
          onReject={handleEventReject}
          onNegotiate={currentEvent.options.negotiate ? handleEventNegotiate : undefined}
        />
      )}
    </>
  );
}

export default App;
