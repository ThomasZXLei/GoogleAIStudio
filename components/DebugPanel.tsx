import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, RefreshCw, Settings, MessageSquare, Power } from 'lucide-react';
import { GET_SYSTEM_INSTRUCTION } from '../constants';

export const DebugPanel: React.FC = () => {
  const { state, dispatch, connectHaru, disconnectHaru, isHaruConnected, sendHaruTrigger, restartSession } = useApp();

  if (!state.showDebugPanel) return null;

  const handleUpdate = () => {
    // If connected, we might need to reconnect to apply system instruction changes
    if (isHaruConnected) {
       disconnectHaru();
       setTimeout(() => connectHaru(), 500);
    }
  };

  const currentSystemPrompt = GET_SYSTEM_INSTRUCTION(state.debug);

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-gray-900 text-white shadow-2xl z-[100] transform transition-transform overflow-y-auto">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Settings size={18} className="text-emerald-400" />
          Debug Console
        </h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_DEBUG_PANEL', show: false })} className="hover:text-gray-300">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Persona Settings */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Persona</h3>
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm mb-1">
                <span>Tone: {state.debug.tone}</span>
                <span className="text-xs text-gray-500">{state.debug.tone < 30 ? 'Strict' : state.debug.tone > 70 ? 'Playful' : 'Friendly'}</span>
              </label>
              <input 
                type="range" min="0" max="100" 
                value={state.debug.tone}
                onChange={(e) => dispatch({ type: 'UPDATE_DEBUG_SETTINGS', settings: { tone: Number(e.target.value) } })}
                className="w-full accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex gap-2 text-sm">
              {['en', 'mixed', 'yue'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => dispatch({ type: 'UPDATE_DEBUG_SETTINGS', settings: { language: lang as any } })}
                  className={`flex-1 py-2 rounded border ${state.debug.language === lang ? 'bg-emerald-600 border-emerald-500' : 'border-gray-700 hover:bg-gray-800'}`}
                >
                  {lang === 'en' ? 'EN' : lang === 'yue' ? 'HK' : 'Mix'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Risk Thresholds */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Logic Thresholds</h3>
          <div>
            <label className="text-sm mb-1 block">DTI Trigger (%)</label>
            <input 
              type="number" 
              value={state.debug.dtiThreshold}
              onChange={(e) => dispatch({ type: 'UPDATE_DEBUG_SETTINGS', settings: { dtiThreshold: Number(e.target.value) } })}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
            />
          </div>
        </section>

        {/* Injectors */}
        <section>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Injectors</h3>
           <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={() => {
                  dispatch({ type: 'SET_FINANCIALS', salary: 20000, debt: 15000 });
                  dispatch({ type: 'NAVIGATE', screen: 'personal-info' });
                }}
                className="p-2 bg-gray-800 hover:bg-red-900/30 border border-gray-700 rounded text-xs text-left"
             >
               <span className="text-red-400 font-bold block">High Risk User</span>
               Salary: 20k, Debt: 15k
             </button>
             <button 
                onClick={() => {
                   dispatch({ type: 'SET_TRAVEL_DETAILS', destination: 'Japan/Hokkaido', month: 'December' });
                   dispatch({ type: 'NAVIGATE', screen: 'travel-insurance' });
                }}
                className="p-2 bg-gray-800 hover:bg-blue-900/30 border border-gray-700 rounded text-xs text-left"
             >
               <span className="text-blue-400 font-bold block">Ski Trip</span>
               Japan, Winter
             </button>
           </div>
        </section>

        {/* Prompt Preview */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Instruction Preview</h3>
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-[10px] text-gray-400 max-h-40 overflow-y-auto whitespace-pre-wrap">
            {currentSystemPrompt}
          </div>
          <button 
            onClick={handleUpdate}
            className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Update & Reconnect
          </button>
        </section>
        
        {/* Manual Trigger */}
         <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Manual Prompt</h3>
          <div className="flex gap-2 mb-4">
             <input type="text" id="manual-trigger" className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-xs" placeholder="Send system event..." />
             <button 
               onClick={() => {
                  const el = document.getElementById('manual-trigger') as HTMLInputElement;
                  if(el && el.value) sendHaruTrigger(el.value);
               }}
               className="p-2 bg-gray-700 rounded hover:bg-gray-600"
             >
               <MessageSquare size={14} />
             </button>
          </div>
          <button 
            onClick={restartSession}
            className="w-full py-2 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            <Power size={14} /> Reboot Chat Session
          </button>
        </section>
      </div>
    </div>
  );
};