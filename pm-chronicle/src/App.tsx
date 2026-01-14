/**
 * PM立志伝：プロジェクト・クロニクル
 * メインアプリケーション
 */

import { useEffect, useState } from 'react';
import { useGameStore, getPlayerCharacter, getPlayerCompany } from './store/gameStore';
import {
  TitleScreen, SetupScreen, DashboardScreen, PMCockpitScreen,
  IndustryMapScreen, CareerScreen, ProjectCompletionScreen, ReportScreen,
  SettingsScreen, CharacterListScreen, ProposalScreen, WBSPlanningScreen,
  MemberDashboard,
  type GameStartOptions
} from './components/screens';
import { ActivitySelector } from './components/game/ActivitySelector';
import { EventDialog } from './components/game/EventDialog';
import { BattleField } from './components/game/CardBattle';
import { generateInitialWorld, createPlayerCharacter } from './lib/generators';
import { checkProjectCompletion as checkTasksComplete } from './lib/projectScore';
import { checkRandomEvent, applyEventEffect, type ProjectEvent } from './lib/projectEvents';
import { processTurn, checkProjectFailure, type ProjectPolicy } from './lib/engine/turnProcessor';
import { saveSetupWorld, getSetupWorld, adjustWorldYear } from './db/repositories/worldRepository';
import type { Project, Task, Character } from './types';
import type { Proposal, Estimate } from './types/proposal';
import type { ActivityResult } from './lib/activities';
import { aiService } from './services/ai';
import { saveService } from './services/saveService';
import type { AIProviderConfig } from './services/ai';
import './index.css';

// AI設定をLocalStorageから読み込み
const AI_CONFIG_STORAGE_KEY = 'pm-chronicle-ai-config';

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

  // セットアップ用企業リスト（IndexedDBから取得）
  const [setupCompanies, setSetupCompanies] = useState<typeof worldState extends null ? never : NonNullable<typeof worldState>['companies']>([]);

  // 現在のプロジェクトとタスク（仮データ）
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<Character[]>([]);

  // イベントシステム
  const [currentEvent, setCurrentEvent] = useState<ProjectEvent | null>(null);

  // 方針（ポリシー）ステート
  const [currentPolicy, setCurrentPolicy] = useState<ProjectPolicy>('NORMAL');

  // 案件選択後の一時保持データ（WBS計画用）
  const [pendingProposal, setPendingProposal] = useState<Proposal | null>(null);
  const [pendingEstimate, setPendingEstimate] = useState<Estimate | null>(null);

  // アプリ起動時にAI設定を読み込み
  useEffect(() => {
    const savedConfig = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig) as AIProviderConfig;
        aiService.configure(config);
        console.log(`AI provider configured: ${config.provider}`);
      } catch (e) {
        console.warn('Failed to load AI config:', e);
      }
    }
  }, []);

  // セットアップ画面用ワールド初期化
  useEffect(() => {
    const initSetupWorld = async () => {
      if (phase === 'SETUP' && setupCompanies.length === 0) {
        // IndexedDBから既存のセットアップワールドを取得
        let existingWorld = await getSetupWorld();

        if (!existingWorld) {
          // なければ新規生成してIndexedDBに保存
          existingWorld = generateInitialWorld({
            startYear: 2020,
            seed: Date.now(),
          });
          await saveSetupWorld(existingWorld);
        }

        setSetupCompanies(existingWorld.companies);
      }
    };
    initSetupWorld();
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
            onNewGame={(slotNumber) => {
              // 選択されたスロット番号を保持してセットアップへ
              console.log('New game in slot:', slotNumber);
              useGameStore.getState().setCurrentSlot(slotNumber);
              setPhase('SETUP');
            }}
            onLoadGame={async (slotNumber, _slotInfo) => {
              // 選択されたスロットからロード
              console.log('Load game from slot:', slotNumber);
              const success = await loadGame(slotNumber);
              if (!success) {
                setPhase('SETUP');
              }
            }}
            onSettings={() => setPhase('SETTINGS')}
          />
        );

      case 'SETUP':
        return (
          <SetupScreen
            companies={setupCompanies}
            onStartGame={async (options: GameStartOptions) => {
              // IndexedDBからセットアップワールドを取得
              let world = await getSetupWorld();

              if (!world) {
                // なければ新規生成
                world = generateInitialWorld({
                  startYear: options.startYear,
                  seed: Date.now(),
                });
              } else if (world.startYear !== options.startYear) {
                // 開始年が異なる場合は年を調整（企業・NPCのIDは維持）
                world = adjustWorldYear(world, options.startYear);
              }

              // companyIdは直接使用可能（同じワールドのため）
              const resolvedCompanyId = options.companyId;

              // プレイヤーキャラクター作成
              const player = createPlayerCharacter(world, {
                name: options.playerName,
                gender: options.gender,
                startType: options.startType,
                companyId: resolvedCompanyId || (options.startType !== 'FREELANCE' ? world.companies[0]?.id : undefined),
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

              // チームメンバー（プレイヤー + NPCから選択）
              // 新人〜中堅はプレイヤー自身も開発担当として参加
              const otherMembers = worldState.npcs.slice(0, 4);
              if (playerCharacter) {
                // プレイヤーを先頭に配置（自分自身をアサイン可能に）
                setTeamMembers([playerCharacter, ...otherMembers]);
              } else {
                setTeamMembers(otherMembers);
              }

              setPhase('PM_COCKPIT');
            }}
            onOpenCareer={() => setPhase('CAREER')}
            onOpenIndustryMap={() => setPhase('INDUSTRY_MAP')}
            onOpenActivity={() => setPhase('ACTIVITY')}
            onOpenEmployeeList={() => setPhase('CHARACTER_LIST')}
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

                // デバッグログ
                console.log('=== TURN COMPLETE CHECK ===');
                console.log('currentTasks:', currentTasks);
                console.log('tasksComplete:', tasksComplete);
                console.log('currentTasks.length:', currentTasks.length);
                console.log('failure:', failure);
                console.log('isOverdue:', isOverdue, 'turnResult.week:', turnResult.week, 'endWeek:', currentProject.schedule.endWeek);

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

                  // 週次オートセーブ（設計書 非機能要件 6.4）
                  if (worldState && playerCharacter) {
                    saveService.autoSave(
                      playerCharacter.id,
                      worldState,
                      currentProject?.id
                    ).catch(err => console.error('Auto save failed:', err));
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

      case 'SETTINGS':
        return (
          <SettingsScreen
            onBack={() => setPhase('TITLE')}
          />
        );

      case 'CHARACTER_LIST':
        if (!worldState) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <CharacterListScreen
            characters={[...worldState.npcs, ...worldState.freelancers]}
            companies={worldState.companies}
            onSelectCharacter={(character) => {
              console.log('Selected character:', character);
              // TODO: キャラクター詳細表示
            }}
            onBack={() => setPhase('DASHBOARD')}
          />
        );

      case 'PROJECT_SELECT':
        if (!worldState || !playerCharacter) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        // 仮の案件データを生成
        const mockProposals = worldState.companies.slice(0, 3).map((company, index) => ({
          id: `proposal-${index + 1}`,
          name: ['基幹システム刷新', 'ECサイト構築', 'AI導入支援'][index],
          client: company,
          description: '案件の詳細説明',
          difficulty: (['EASY', 'NORMAL', 'HARD'] as const)[index],
          estimatedBudget: { min: 1000 + index * 500, max: 2000 + index * 1000 },
          estimatedDuration: { min: 8 + index * 4, max: 16 + index * 8 },
          requiredSkills: ['Java', 'SQL'],
          requiredPhases: ['REQUIREMENT', 'DESIGN', 'DEVELOP', 'TEST'] as ('REQUIREMENT' | 'DESIGN' | 'DEVELOP' | 'TEST')[],
          deadline: worldState.currentWeek + 4,
          competitors: [],
          status: 'AVAILABLE' as const,
          createdWeek: worldState.currentWeek,
          tags: [],
        }));
        return (
          <ProposalScreen
            proposals={mockProposals}
            playerReputation={playerCompany?.reputation || 50}
            currentWeek={worldState.currentWeek}
            onBidWon={(proposal, estimate) => {
              console.log('Bid won:', proposal, estimate);
              // WBS計画画面へ遷移
              setPendingProposal(proposal);
              setPendingEstimate(estimate);
              setPhase('WBS_PLANNING');
            }}
            onBack={() => setPhase('DASHBOARD')}
          />
        );

      case 'WBS_PLANNING':
        // WBS計画画面（入札成功後に遷移）
        if (!pendingProposal || !pendingEstimate) {
          return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">案件が選択されていません</h1>
                <button
                  onClick={() => setPhase('DASHBOARD')}
                  className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  戻る
                </button>
              </div>
            </div>
          );
        }
        return (
          <WBSPlanningScreen
            proposal={pendingProposal}
            estimate={pendingEstimate}
            availableMembers={worldState ? [...worldState.npcs.slice(0, 5), ...(playerCharacter ? [playerCharacter] : [])] : []}
            onConfirmPlan={(project, tasks) => {
              console.log('WBS confirmed:', project, tasks);
              setCurrentProject(project);
              setCurrentTasks(tasks);
              // チームメンバー設定
              if (worldState && playerCharacter) {
                const otherMembers = worldState.npcs.slice(0, 4);
                setTeamMembers([playerCharacter, ...otherMembers]);
              }
              // ステートクリア
              setPendingProposal(null);
              setPendingEstimate(null);
              setPhase('PM_COCKPIT');
            }}
            onBack={() => {
              setPendingProposal(null);
              setPendingEstimate(null);
              setPhase('DASHBOARD');
            }}
          />
        );

      case 'MEMBER_DASHBOARD':
        if (!playerCharacter || !worldState) {
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
        }
        return (
          <MemberDashboard
            player={playerCharacter}
            currentYear={worldState.currentYear}
            currentWeek={worldState.currentWeek}
            onWeekEnd={() => {
              // 週末処理
              console.log('Week ended');
            }}
            onPlayerUpdate={(updatedPlayer) => {
              console.log('Player updated:', updatedPlayer);
              // TODO: プレイヤーステータス更新
            }}
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
