
import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ tasks, onTaskToggle, onDelete, onClearHistory }) => {
  const completedTasks = tasks
    .filter(t => t.completed)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Group by date
  const groupedTasks: Record<string, Task[]> = {};
  completedTasks.forEach(task => {
    const dateKey = formatDate(task.completedAt || Date.now());
    if (!groupedTasks[dateKey]) groupedTasks[dateKey] = [];
    groupedTasks[dateKey].push(task);
  });

  return (
    <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto h-full scrollbar-thin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <CheckCircle2 className="text-green-500" />
            Task History
        </h2>
        {completedTasks.length > 0 && (
            <button 
                onClick={() => {
                    if(window.confirm("Are you sure you want to delete all completed tasks? This cannot be undone.")) {
                        onClearHistory();
                    }
                }}
                className="text-xs flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded border border-red-900/50 transition-colors"
            >
                <Trash2 size={14} /> Clear History
            </button>
        )}
      </div>

      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center text-slate-500 mt-20">
          <p>No completed tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([date, tasks]) => (
            <div key={date}>
              <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
                {date}
              </h3>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-4">
                       <button onClick={() => onTaskToggle(task.id)} className="text-green-500 hover:text-slate-400" title="Mark as incomplete">
                         <CheckCircle2 size={20} />
                       </button>
                       <div>
                         <p className="text-slate-300 line-through decoration-slate-600">{task.title}</p>
                         <p className="text-xs text-slate-500">
                           {task.quadrant} • {task.tags.join(', ')} 
                           {task.completedAt && ` • Completed at ${new Date(task.completedAt).toLocaleTimeString()}`}
                         </p>
                       </div>
                    </div>
                    <button onClick={() => onDelete(task.id)} className="text-slate-600 hover:text-red-400 text-xs">
                       Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
