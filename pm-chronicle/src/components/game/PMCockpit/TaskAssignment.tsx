/**
 * タスクアサインメントパネル
 * ドラッグ&ドロップでキャラクターをタスクに割り当て
 */

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import type { Character, Task } from '../../../types';
import { CharacterCard } from './CharacterCard';

interface TaskAssignmentPanelProps {
    tasks: Task[];
    characters: Character[];
    onAssign: (taskId: string, characterId: string) => void;
    onUnassign: (taskId: string) => void;
}

/** ドラッグ可能なキャラクターアイテム */
function DraggableCharacter({ character }: { character: Character }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: character.id,
    });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CharacterCard character={character} compact isDraggable />
        </div>
    );
}

/** タスクドロップエリア */
function TaskDropZone({
    task,
    assignedCharacter,
    onUnassign,
}: {
    task: Task;
    assignedCharacter?: Character;
    onUnassign: () => void;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: task.id,
    });

    const PHASE_NAMES: Record<string, string> = {
        REQUIREMENT: '要件定義',
        DESIGN: '設計',
        DEVELOP: '開発',
        TEST: 'テスト',
    };

    return (
        <div
            ref={setNodeRef}
            className={`bg-gray-800 rounded-lg p-3 border transition-colors ${isOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-sm font-medium text-white">
                        {task.name || PHASE_NAMES[task.phase] || task.phase}
                    </div>
                    <div className="text-xs text-gray-400">
                        進捗: {task.progress}% | 週{task.startWeek ?? '?'}-{task.endWeek ?? '?'}
                    </div>
                </div>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                    {PHASE_NAMES[task.phase]}
                </span>
            </div>

            {/* アサイン済みキャラクター or ドロップエリア */}
            {assignedCharacter ? (
                <div className="relative">
                    <CharacterCard character={assignedCharacter} compact />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUnassign();
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-3 text-center text-sm transition-colors ${isOver
                            ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                            : 'border-gray-600 text-gray-500'
                        }`}
                >
                    {isOver ? 'ここにドロップ！' : 'メンバーをドラッグ'}
                </div>
            )}
        </div>
    );
}

export function TaskAssignmentPanel({
    tasks,
    characters,
    onAssign,
    onUnassign,
}: TaskAssignmentPanelProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    // ポインターセンサー（距離5px以上でドラッグ開始）
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // 未アサインのキャラクター
    const availableCharacters = characters.filter(
        c => !tasks.some(t => t.assigneeId === c.id)
    );

    // アクティブキャラクター取得
    const activeCharacter = activeId
        ? characters.find(c => c.id === activeId)
        : null;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over) {
            // タスクへのドロップを検出
            const targetTask = tasks.find(t => t.id === over.id);
            if (targetTask && !targetTask.assigneeId) {
                onAssign(targetTask.id, active.id as string);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-2 gap-4">
                {/* 左: 利用可能なメンバー */}
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                        利用可能メンバー ({availableCharacters.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableCharacters.map(character => (
                            <DraggableCharacter key={character.id} character={character} />
                        ))}
                    </div>
                    {availableCharacters.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                            全員アサイン済み
                        </div>
                    )}
                </div>

                {/* 右: タスク一覧 */}
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                        タスク ({tasks.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {tasks.map(task => {
                            const assigned = characters.find(c => c.id === task.assigneeId);
                            return (
                                <TaskDropZone
                                    key={task.id}
                                    task={task}
                                    assignedCharacter={assigned}
                                    onUnassign={() => onUnassign(task.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ドラッグオーバーレイ */}
            <DragOverlay>
                {activeCharacter ? (
                    <div className="opacity-80">
                        <CharacterCard character={activeCharacter} compact />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
