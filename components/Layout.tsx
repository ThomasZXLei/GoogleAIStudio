import React from 'react';
import { useApp } from '../context/AppContext';
import { HaruOverlay } from './HaruOverlay';
import { DebugPanel } from './DebugPanel';
import { Bell, UserCircle, Cog } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, dispatch } = useApp();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
             onClick={() => dispatch({ type: 'TOGGLE_DEBUG_PANEL', show: !state.showDebugPanel })}
             className="text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <Cog size={20} />
          </button>
          <button 
             onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })} 
             className="text-xl font-bold tracking-tight text-[#006847] hover:opacity-80 transition-opacity"
          >
            Haru Bank
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-400" size={20} />
          <UserCircle className="text-gray-400" size={24} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-4">
        {children}
      </main>

      {/* Haru AI Integration */}
      <HaruOverlay />
      
      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
};