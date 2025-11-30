import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, Loader2 } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => Promise<void>;
  isLoading: boolean;
  type: 'import' | 'review';
  reviewText?: string;
}

export const AIModal: React.FC<AIModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport, 
  isLoading,
  type,
  reviewText
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            Gemini AI Assistant
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {type === 'import' ? (
            <>
              <p className="text-slate-400 mb-4 text-sm">
                Paste a messy list of tasks, emails, or meeting notes below. 
                Gemini will split them, tag them, and sort them into the Matrix for you.
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="- Buy milk&#10;- Call Mom about weekend&#10;- Finish the Q3 report by Friday..."
                className="w-full h-48 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm leading-relaxed"
                autoFocus
              />
            </>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200">Weekly Review</h4>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-slate-300 leading-relaxed whitespace-pre-wrap">
                 {reviewText || "Analyzing your productivity..."}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end">
          {type === 'import' ? (
            <button
              onClick={() => onImport(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Sort & Import
            </button>
          ) : (
             <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};