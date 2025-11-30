import React from 'react';
import { QuadrantType, Task, QUADRANT_CONFIG } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface QuadrantProps {
  type: QuadrantType;
  tasks: Task[];
  onDrop: (e: React.DragEvent, quadrant: QuadrantType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onTaskToggle: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onTaskDragStart: (e: React.DragEvent, id: string) => void;
  selectedTaskId: string | null;
  onTaskSelect: (id: string) => void;
  onAddTask: (quadrant: QuadrantType) => void;
  flexGrow: number; // For dynamic sizing
}

export const Quadrant: React.FC<QuadrantProps> = ({
  type,
  tasks,
  onDrop,
  onDragOver,
  onTaskToggle,
  onTaskUpdate,
  onTaskDelete,
  onTaskDragStart,
  selectedTaskId,
  onTaskSelect,
  onAddTask,
  flexGrow
}) => {
  const config = QUADRANT_CONFIG[type];

  return (
    <div
      onDrop={(e) => onDrop(e, type)}
      onDragOver={onDragOver}
      style={{ flexGrow: Math.max(1, flexGrow) }}
      className={`
        relative flex flex-col rounded-xl border transition-all duration-500 ease-in-out
        ${config.borderColor} ${config.bgColor} backdrop-blur-sm p-4 overflow-hidden
        min-h-[200px]
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sticky top-0 z-10">
        <div>
          <h2 className={`text-lg font-bold ${config.color} tracking-tight`}>
            {config.label}
          </h2>
          <p className="text-xs text-slate-400 font-medium opacity-80">
            {config.subLabel}
          </p>
        </div>
        <div className="flex gap-2">
           <span className="text-xs font-mono bg-slate-900/50 text-slate-500 px-2 py-1 rounded border border-slate-700/50">
             {tasks.length}
           </span>
           <button 
             onClick={() => onAddTask(type)}
             className={`p-1 rounded-full hover:bg-white/10 ${config.color} transition-colors`}
            >
             <Plus size={18} />
           </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-1 pb-10 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
             <p className="text-sm">Drop tasks here</p>
             <p className="text-xs opacity-50">Shortcut: {config.shortcut}</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onTaskToggle}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onDragStart={onTaskDragStart}
              isSelected={selectedTaskId === task.id}
              onSelect={onTaskSelect}
            />
          ))
        )}
      </div>
      
      {/* Background number watermark */}
      <div className="absolute bottom-[-20px] right-[-10px] text-[120px] font-bold opacity-[0.03] select-none pointer-events-none">
        {type.replace('Q', '')}
      </div>
    </div>
  );
};