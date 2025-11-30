
import React, { useState, useRef, useEffect } from 'react';
import { Task, QUADRANT_CONFIG } from '../types';
import { GripVertical, CheckCircle2, Circle, Tag, Trash2, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggle, 
  onUpdate,
  onDelete, 
  onDragStart,
  isSelected,
  onSelect
}) => {
  const quadrantColor = QUADRANT_CONFIG[task.quadrant].color;
  
  // Helper to format timestamp to YYYY-MM-DD (Local Time)
  const toLocalDateString = (timestamp?: number) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDate, setEditDate] = useState(toLocalDateString(task.dueDate));
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditDate(toLocalDateString(task.dueDate));
    }
  }, [task.title, task.description, task.dueDate, isEditing]);

  const saveChanges = () => {
    // Parse YYYY-MM-DD to Local Timestamp
    let newDueDate: number | undefined = undefined;
    if (editDate) {
      const [y, m, d] = editDate.split('-').map(Number);
      newDueDate = new Date(y, m - 1, d).getTime();
    }

    if (
      editTitle.trim() !== task.title || 
      editDescription !== (task.description || '') ||
      newDueDate !== task.dueDate
    ) {
      onUpdate(task.id, { 
        title: editTitle, 
        description: editDescription,
        dueDate: newDueDate
      });
    }
    setIsEditing(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // If we're moving focus between inputs inside the card, don't close yet
    if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    saveChanges();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditDate(toLocalDateString(task.dueDate));
      return;
    }
    
    // For Title Input: Enter saves
    if ((e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'text' && e.key === 'Enter') {
      e.preventDefault();
      saveChanges();
    }
    
    // For Description Textarea: Ctrl+Enter saves
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveChanges();
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={containerRef}
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, task.id)}
      onClick={() => onSelect(task.id)}
      onDoubleClick={() => setIsEditing(true)}
      className={`
        group relative p-3 mb-2 rounded-lg border 
        transition-all duration-200 ease-in-out 
        ${!isEditing ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-text'}
        flex flex-col gap-2
        ${isSelected 
          ? 'bg-slate-700 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
        ${task.completed ? 'opacity-50 grayscale' : 'opacity-100'}
      `}
    >
      <div className="flex items-start gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className="mt-1 text-slate-500 hover:text-green-400 transition-colors"
        >
          {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
             <div onBlur={handleBlur} className="flex flex-col gap-2 w-full">
                <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="bg-slate-900/50 text-slate-200 p-1 -ml-1 rounded border border-blue-500/50 outline-none text-sm font-medium w-full"
                    autoFocus
                    onKeyDown={handleKeyDown}
                />
                <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Add description..."
                    className="bg-slate-900/50 text-slate-400 p-1 -ml-1 rounded border border-blue-500/50 outline-none text-xs w-full resize-none min-h-[40px] leading-relaxed"
                    onKeyDown={handleKeyDown}
                />
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-slate-500" />
                   <input 
                      type="date"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="bg-slate-900/50 text-slate-400 text-xs p-1 rounded border border-slate-700 outline-none focus:border-blue-500/50"
                      onKeyDown={handleKeyDown}
                   />
                </div>
             </div>
          ) : (
            <>
                <p className={`text-sm font-medium leading-tight break-words ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 break-words leading-relaxed">
                        {task.description}
                    </p>
                )}
            </>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2 items-center">
             {task.dueDate && !isEditing && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${task.dueDate < Date.now() && !task.completed ? 'bg-red-900/30 text-red-400' : 'bg-slate-900/50 text-slate-400'}`}>
                  <Calendar size={8} /> {formatDate(task.dueDate)}
                </span>
             )}
             
             {task.tags.map(tag => (
               <span key={tag} className="text-[10px] bg-slate-900/50 px-1.5 py-0.5 rounded text-slate-400 flex items-center gap-1">
                 <Tag size={8} /> {tag}
               </span>
             ))}
             {!isEditing && (
                <span className={`text-[10px] font-bold ml-auto ${quadrantColor} bg-slate-900/30 px-1.5 py-0.5 rounded`}>
                    {task.quadrant}
                </span>
             )}
          </div>
        </div>

        {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <div className="cursor-grab text-slate-600 hover:text-slate-400">
                <GripVertical size={14} />
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="text-slate-600 hover:text-red-400 mt-auto"
            >
                <Trash2 size={14} />
            </button>
            </div>
        )}
      </div>
    </div>
  );
};
