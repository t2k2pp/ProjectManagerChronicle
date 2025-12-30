/**
 * タスクアサインメントパネル
 * ドラッグ&ドロップでキャラクターをタスクに割り当て
 */

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
        transition,
        isDragging,
    } = useSortable({ id: character.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
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
    const PHASE_NAMES: Record<string, string> = {
        REQUIREMENT: '要件定義',
        DESIGN: '設計',
        DEVELOP: '開発',
        TEST: 'テスト',
    };

    return (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-sm font-medium text-white">
                        {task.name || PHASE_NAMES[task.phase] || task.phase}
                    </div>
                    <div className="text-xs text-gray-400">進捗: {task.progress}%</div>
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
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-3 text-center text-gray-500 text-sm">
                    ここにドロップ
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
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

        if (over && active.id !== over.id) {
            // タスクへのドロップを検出
            const targetTask = tasks.find(t => t.id === over.id);
            if (targetTask) {
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
                    <SortableContext
                        items={availableCharacters.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {availableCharacters.map(character => (
                                <DraggableCharacter key={character.id} character={character} />
                            ))}
                        </div>
                    </SortableContext>
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
                    <CharacterCard character={activeCharacter} compact />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
