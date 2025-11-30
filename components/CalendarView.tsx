
import React, { useState } from 'react';
import { Task, QUADRANT_CONFIG } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Circle, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onTaskToggle: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskToggle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  // Fill empty slots for days before start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
          <CalendarIcon className="text-blue-400" />
          {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium">
             Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-900/50 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const dayTasks = day ? getTasksForDay(day) : [];
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          const totalTasks = dayTasks.length;
          const completedTasks = dayTasks.filter(t => t.completed).length;

          return (
            <div key={index} className={`bg-slate-900/80 min-h-[100px] p-2 hover:bg-slate-900 transition-colors relative flex flex-col gap-1 ${!day ? 'bg-slate-950/50' : ''}`}>
              {day && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium block w-6 h-6 text-center leading-6 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    {totalTasks > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${completedTasks === totalTasks ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                        {completedTasks}/{totalTasks}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto scrollbar-none space-y-1">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`text-[10px] p-1.5 rounded border border-slate-700/50 truncate flex items-center gap-1.5 cursor-pointer ${task.completed ? 'opacity-50 line-through bg-slate-800' : `${QUADRANT_CONFIG[task.quadrant].bgColor} ${QUADRANT_CONFIG[task.quadrant].color}`}`}
                        onClick={() => onTaskToggle(task.id)}
                        title={task.title}
                      >
                         {task.completed ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                         <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
