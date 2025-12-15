import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Mic, ChevronDown, ChevronUp, Bot, Loader2 } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { state, dispatch, sendHaruTrigger, isHaruConnected, isHaruSpeaking, connectHaru, disconnectHaru } = useApp();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpen = state.isChatPanelOpen;

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatHistory, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendHaruTrigger(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const lastMessage = state.chatHistory.length > 0 
    ? state.chatHistory[state.chatHistory.length - 1].text 
    : state.haruMessage;

  return (
    <div 
      className={`fixed left-0 right-0 bottom-0 z-50 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'h-[500px]' : 'h-[100px] pb-safe'}`}
    >
      {/* Header / Collapse Handle */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
        onClick={() => dispatch({ type: 'TOGGLE_CHAT_PANEL', open: !isOpen })}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isHaruConnected ? 'bg-[#006847] text-white' : 'bg-gray-200 text-gray-500'}`}>
            <Bot size={16} />
          </div>
          <span className="font-bold text-sm text-gray-700">Haru Assistant</span>
          {isHaruConnected && (
             <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
          )}
        </div>
        {isOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
      </div>

      {/* Expanded: Chat History */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
          {state.conversationSummary && (
            <div className="flex justify-center">
              <div className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full max-w-[90%] text-center">
                Prev: {state.conversationSummary}
              </div>
            </div>
          )}
          {state.chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                   msg.role === 'user' 
                     ? 'bg-[#006847] text-white rounded-tr-none' 
                     : msg.role === 'system'
                     ? 'bg-transparent text-gray-400 text-xs italic text-center w-full'
                     : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                 }`}>
                 {msg.text}
                 {msg.role === 'model' && !msg.isFinal && <span className="animate-pulse">_</span>}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapsed: Last Message Preview (Only if NOT open) */}
      {!isOpen && (
        <div className="px-4 py-1 bg-white" onClick={() => dispatch({ type: 'TOGGLE_CHAT_PANEL', open: true })}>
          <p className="text-xs text-gray-500 truncate">{lastMessage}</p>
        </div>
      )}

      {/* Input Area (Combined Dock) */}
      <div className="p-3 bg-white">
        {/* Voice Activity Bar */}
        {isHaruConnected && (
          <div className="h-1 bg-gray-100 rounded-full mb-2 overflow-hidden flex items-center justify-center gap-1">
             {isHaruSpeaking ? (
                <>
                  <div className="w-full h-full bg-emerald-400 animate-pulse"></div>
                </>
             ) : (
                <div className="text-[10px] text-gray-400 font-medium w-full text-center">Listening...</div>
             )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
           <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-emerald-100">
             <input 
                type="text" 
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                placeholder={isHaruConnected ? "Listening..." : "Ask Haru..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isHaruConnected && !isHaruSpeaking && false} // Allow typing even if connected
              />
              {inputText && (
                <button onClick={handleSend} className="text-[#006847] hover:scale-110 transition">
                  <Send size={18} />
                </button>
              )}
           </div>

           {/* Voice Toggle Button */}
           <button 
             onClick={isHaruConnected ? disconnectHaru : connectHaru}
             className={`p-3 rounded-full shadow-sm transition-all duration-300 ${
               isHaruConnected 
                 ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100' 
                 : 'bg-[#006847] text-white hover:bg-[#005238] shadow-lg'
             }`}
           >
             {isHaruConnected ? <div className="animate-pulse"><Mic size={20} /></div> : <Mic size={20} />}
           </button>
        </div>
      </div>
    </div>
  );
};