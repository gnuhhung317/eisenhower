
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Maximize2, Minimize2, BarChart2, CheckSquare, Calendar, History, LayoutGrid } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Quadrant } from './components/Quadrant';
import { AIModal } from './components/AIModal';
import { HistoryView } from './components/HistoryView';
import { CalendarView } from './components/CalendarView';
import { Task, QuadrantType, AIImportResult } from './types';
import { parseTasksFromText, generateWeeklyReview } from './services/geminiService';

// Initial Mock Data (Fallback if localStorage is empty)
const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Finish Quarterly Report', description: 'Review Q3 KPIs and finalize slide deck.', quadrant: QuadrantType.Q1, completed: false, tags: ['Work'], createdAt: Date.now(), dueDate: Date.now() + 86400000 },
  { id: '2', title: 'Call Electrician', quadrant: QuadrantType.Q3, completed: false, tags: ['Home'], createdAt: Date.now() },
  { id: '3', title: 'Learn Advanced React Patterns', quadrant: QuadrantType.Q2, completed: false, tags: ['Learning'], createdAt: Date.now() },
  { id: '5', title: 'Email Design Team', description: 'Ask for the new logo assets.', quadrant: QuadrantType.Backlog, completed: false, tags: ['Work'], createdAt: Date.now() },
];

type ViewMode = 'matrix' | 'calendar' | 'history';

const App: React.FC = () => {
  // Load tasks from Local Storage or use Initial Mock Data
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('planning-hub-tasks');
      return savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS;
    } catch (e) {
      console.error("Failed to load from local storage", e);
      return INITIAL_TASKS;
    }
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('matrix');
  
  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState<'import' | 'review'>('import');
  const [aiLoading, setAiLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState('');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('planning-hub-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Actions ---

  const addTask = (quadrant: QuadrantType = QuadrantType.Backlog) => {
    const newTask: Task = {
      id: uuidv4(),
      title: 'New Task',
      quadrant,
      completed: false,
      tags: [],
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskId(newTask.id);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t
    ));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const clearHistory = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  const moveTask = (id: string, quadrant: QuadrantType) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, quadrant } : t));
  };

  const reorderTask = (taskId: string, direction: 'up' | 'down') => {
    const tasksCopy = [...tasks];
    const taskToMove = tasksCopy.find(t => t.id === taskId);
    if (!taskToMove) return;
  
    // We operate on the list of *visible* tasks in that quadrant
    const quadrantTasks = tasksCopy.filter(t => t.quadrant === taskToMove.quadrant && !t.completed);
    const localIndex = quadrantTasks.findIndex(t => t.id === taskId);
  
    let taskToSwapWith: Task | undefined;
  
    if (direction === 'up' && localIndex > 0) {
      taskToSwapWith = quadrantTasks[localIndex - 1];
    } else if (direction === 'down' && localIndex < quadrantTasks.length - 1) {
      taskToSwapWith = quadrantTasks[localIndex + 1];
    }
  
    if (taskToSwapWith) {
      const globalIndex1 = tasksCopy.findIndex(t => t.id === taskToMove.id);
      const globalIndex2 = tasksCopy.findIndex(t => t.id === taskToSwapWith!.id);
      
      // Simple swap in the main array
      [tasksCopy[globalIndex1], tasksCopy[globalIndex2]] = [tasksCopy[globalIndex2], tasksCopy[globalIndex1]];
      
      setTasks(tasksCopy);
    }
  };

  // --- Drag & Drop ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, quadrant: QuadrantType) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, quadrant);
      setDraggedTaskId(null);
    }
  };

  // --- Keyboard Shortcuts ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          addTask(QuadrantType.Backlog);
        }
      }

      if (selectedTaskId && currentView === 'matrix') {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteTask(selectedTaskId);
        }
        if (e.key === ' ') {
          e.preventDefault();
          toggleTask(selectedTaskId);
        }
        if (e.key === '1') moveTask(selectedTaskId, QuadrantType.Q1);
        if (e.key === '2') moveTask(selectedTaskId, QuadrantType.Q2);
        if (e.key === '3') moveTask(selectedTaskId, QuadrantType.Q3);
        if (e.key === '4') moveTask(selectedTaskId, QuadrantType.Q4);
        if (e.key === '`') moveTask(selectedTaskId, QuadrantType.Backlog);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, currentView]);

  // --- AI Integration ---

  const handleAIImport = async (text: string) => {
    setAiLoading(true);
    try {
      const results = await parseTasksFromText(text);
      const newTasks: Task[] = results.map(res => ({
        id: uuidv4(),
        title: res.title,
        quadrant: res.quadrant,
        tags: res.tags,
        completed: false,
        createdAt: Date.now(),
      }));
      setTasks(prev => [...prev, ...newTasks]);
      setIsAIModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("AI Processing Failed. Please check your API Key.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleWeeklyReview = async () => {
    setAiModalType('review');
    setIsAIModalOpen(true);
    setReviewResult('');
    setAiLoading(true);
    try {
      const review = await generateWeeklyReview(tasks);
      setReviewResult(review);
    } catch (error) {
      setReviewResult("Failed to generate review.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Render Helpers ---

  const getTasksByQuadrant = (q: QuadrantType) => tasks.filter(t => t.quadrant === q && !t.completed); // In matrix, only show incomplete

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-purple-500/30">
      
      {/* Sidebar (Backlog) - Only in Matrix Mode & Not in Focus */}
      {!focusMode && currentView === 'matrix' && (
        <Sidebar 
          tasks={getTasksByQuadrant(QuadrantType.Backlog)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onTaskToggle={toggleTask}
          onTaskUpdate={updateTask}
          onTaskDelete={deleteTask}
          onTaskDragStart={handleDragStart}
          onTaskReorder={reorderTask}
          selectedTaskId={selectedTaskId}
          onTaskSelect={setSelectedTaskId}
          onAddTask={() => addTask(QuadrantType.Backlog)}
          onOpenAI={() => { setAiModalType('import'); setIsAIModalOpen(true); }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-purple-500" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              The Planning Hub
            </h1>
          </div>

          {/* View Switcher */}
          <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700">
             <button 
                onClick={() => setCurrentView('matrix')}
                className={`p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium ${currentView === 'matrix' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <LayoutGrid size={16} /> Matrix
             </button>
             <button 
                onClick={() => setCurrentView('calendar')}
                className={`p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium ${currentView === 'calendar' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <Calendar size={16} /> Calendar
             </button>
             <button 
                onClick={() => setCurrentView('history')}
                className={`p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium ${currentView === 'history' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <History size={16} /> History
             </button>
          </div>

          <div className="flex items-center gap-4">
             {currentView === 'matrix' && (
               <div className="text-xs text-slate-500 flex gap-4 mr-4 hidden lg:flex">
                 <span><kbd className="bg-slate-800 px-1 rounded border border-slate-700">Cmd+N</kbd> New Task</span>
                 <span><kbd className="bg-slate-800 px-1 rounded border border-slate-700">1-4</kbd> Move</span>
               </div>
             )}

             <button 
               onClick={handleWeeklyReview}
               className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 text-sm"
               title="AI Weekly Review"
             >
               <BarChart2 size={18} />
             </button>

             {currentView === 'matrix' && (
                <button 
                  onClick={() => setFocusMode(!focusMode)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${focusMode ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  {focusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
             )}
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          
          {currentView === 'history' && (
             <HistoryView 
               tasks={tasks}
               onTaskToggle={toggleTask}
               onDelete={deleteTask}
               onClearHistory={clearHistory}
             />
          )}

          {currentView === 'calendar' && (
             <CalendarView 
                tasks={tasks}
                onTaskToggle={toggleTask}
             />
          )}

          {currentView === 'matrix' && (
            <div className={`flex flex-col h-full ${focusMode ? 'p-6' : 'p-6 gap-4'}`}>
              {focusMode ? (
                 // Focus Mode: Just show Q1 centered and huge
                 <div className="flex-1 flex justify-center items-center max-w-4xl mx-auto w-full">
                   <Quadrant
                     type={QuadrantType.Q1}
                     tasks={getTasksByQuadrant(QuadrantType.Q1)}
                     onDrop={handleDrop}
                     onDragOver={handleDragOver}
                     onTaskToggle={toggleTask}
                     onTaskUpdate={updateTask}
                     onTaskDelete={deleteTask}
                     onTaskDragStart={handleDragStart}
                     onTaskReorder={reorderTask}
                     selectedTaskId={selectedTaskId}
                     onTaskSelect={setSelectedTaskId}
                     onAddTask={addTask}
                     flexGrow={1}
                   />
                 </div>
              ) : (
                // Standard 2x2 Matrix
                <>
                  {/* Top Row: Q1 & Q2 */}
                  <div className="flex flex-1 gap-4 min-h-0">
                    <Quadrant
                      type={QuadrantType.Q1}
                      tasks={getTasksByQuadrant(QuadrantType.Q1)}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onTaskToggle={toggleTask}
                      onTaskUpdate={updateTask}
                      onTaskDelete={deleteTask}
                      onTaskDragStart={handleDragStart}
                      onTaskReorder={reorderTask}
                      selectedTaskId={selectedTaskId}
                      onTaskSelect={setSelectedTaskId}
                      onAddTask={addTask}
                      flexGrow={1}
                    />
                    <Quadrant
                      type={QuadrantType.Q2}
                      tasks={getTasksByQuadrant(QuadrantType.Q2)}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onTaskToggle={toggleTask}
                      onTaskUpdate={updateTask}
                      onTaskDelete={deleteTask}
                      onTaskDragStart={handleDragStart}
                      onTaskReorder={reorderTask}
                      selectedTaskId={selectedTaskId}
                      onTaskSelect={setSelectedTaskId}
                      onAddTask={addTask}
                      flexGrow={1}
                    />
                  </div>

                  {/* Bottom Row: Q3 & Q4 */}
                  <div className="flex flex-1 gap-4 min-h-0">
                    <Quadrant
                      type={QuadrantType.Q3}
                      tasks={getTasksByQuadrant(QuadrantType.Q3)}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onTaskToggle={toggleTask}
                      onTaskUpdate={updateTask}
                      onTaskDelete={deleteTask}
                      onTaskDragStart={handleDragStart}
                      onTaskReorder={reorderTask}
                      selectedTaskId={selectedTaskId}
                      onTaskSelect={setSelectedTaskId}
                      onAddTask={addTask}
                      flexGrow={1}
                    />
                    <Quadrant
                      type={QuadrantType.Q4}
                      tasks={getTasksByQuadrant(QuadrantType.Q4)}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onTaskToggle={toggleTask}
                      onTaskUpdate={updateTask}
                      onTaskDelete={deleteTask}
                      onTaskDragStart={handleDragStart}
                      onTaskReorder={reorderTask}
                      selectedTaskId={selectedTaskId}
                      onTaskSelect={setSelectedTaskId}
                      onAddTask={addTask}
                      flexGrow={1}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <AIModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onImport={handleAIImport}
        isLoading={aiLoading}
        type={aiModalType}
        reviewText={reviewResult}
      />
    </div>
  );
};

export default App;
