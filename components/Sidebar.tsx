
import React from 'react';
import { Task, QuadrantType, QUADRANT_CONFIG } from '../types';
import { TaskCard } from './TaskCard';
import { Archive, Plus, Sparkles } from 'lucide-react';

interface SidebarProps {
  tasks: Task[];
  onDrop: (e: React.DragEvent, quadrant: QuadrantType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onTaskToggle: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onTaskDragStart: (e: React.DragEvent, id: string) => void;
  onTaskReorder: (id: string, direction: 'up' | 'down') => void;
  selectedTaskId: string | null;
  onTaskSelect: (id: string) => void;
  onAddTask: () => void;
  onOpenAI: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  onDrop,
  onDragOver,
  onTaskToggle,
  onTaskUpdate,
  onTaskDelete,
  onTaskDragStart,
  onTaskReorder,
  selectedTaskId,
  onTaskSelect,
  onAddTask,
  onOpenAI
}) => {
  const config = QUADRANT_CONFIG[QuadrantType.Backlog];

  return (
    <div 
      className="w-80 border-r border-slate-800 bg-slate-900/90 flex flex-col h-full shrink-0"
      onDrop={(e) => onDrop(e, QuadrantType.Backlog)}
      onDragOver={onDragOver}
    >
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-slate-800 rounded-lg text-purple-400">
            <Archive size={20} />
          </div>
          <h2 className="font-bold text-lg text-slate-100">Backlog</h2>
        </div>
        <p className="text-xs text-slate-500 pl-1">Unsorted tasks & ideas</p>
      </div>

      <div className="p-4 flex gap-2">
        <button 
          onClick={onAddTask}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} /> New Task
        </button>
        <button 
          onClick={onOpenAI}
          className="px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
          title="AI Bulk Import"
        >
          <Sparkles size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="text-center mt-10 text-slate-600">
            <p className="text-sm">Inbox Zero</p>
            <p className="text-xs opacity-50 mt-1">Great job!</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onTaskToggle}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onDragStart={onTaskDragStart}
              onReorder={onTaskReorder}
              isFirst={index === 0}
              isLast={index === tasks.length - 1}
              isSelected={selectedTaskId === task.id}
              onSelect={onTaskSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};
