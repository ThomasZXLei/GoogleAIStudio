import React from 'react';
import { useApp } from '../context/AppContext';
import { Bot, X } from 'lucide-react';
import { ChatPanel } from './ChatPanel';

export const HaruOverlay: React.FC = () => {
  const { state, dispatch } = useApp();

  // Floating Status Widget (Module 4) - Keeps existing widget logic separate from Chat
  if (state.showStatusWidget) {
    return (
      <div className="fixed top-24 right-4 z-[60] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#006847] p-1.5 rounded-full">
               <Bot size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800">Application Status</span>
          </div>
          <button onClick={() => dispatch({ type: 'TOGGLE_STATUS_WIDGET', show: false })} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Loan ID: #883921</span>
            <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">In Review</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#006847] w-2/3 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-400">Estimated completion: 2 hours</p>
        </div>
      </div>
    );
  }

  // The main Chat Interface is now entirely contained in ChatPanel (Bottom Dock)
  return <ChatPanel />;
};