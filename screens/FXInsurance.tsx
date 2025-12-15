import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, Plane, ShieldCheck, X, Snowflake, Car } from 'lucide-react';

export const FXInsurance: React.FC = () => {
  const { state, dispatch } = useApp();
  const hoverTimer = useRef<number | null>(null);

  const handleMouseEnter = () => {
    hoverTimer.current = window.setTimeout(() => {
      dispatch({ type: 'TOGGLE_FX_CARD', show: true });
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Foreign Exchange</h2>

      {/* FX Converter */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-visible">
        <div className="flex justify-between items-center mb-6">
           <div className="text-center flex-1">
             <p className="text-gray-500 text-sm mb-1">Sell (HKD)</p>
             <p className="text-2xl font-bold">1,000.00</p>
           </div>
           <div className="bg-gray-100 p-3 rounded-full">
             <ArrowRightLeft size={20} className="text-gray-600" />
           </div>
           <div 
             className="text-center flex-1 cursor-help relative"
             onMouseEnter={handleMouseEnter}
             onMouseLeave={handleMouseLeave}
           >
             <p className="text-gray-500 text-sm mb-1">Buy (JPY)</p>
             <p className="text-2xl font-bold text-[#006847]">18,450</p>
             
             {state.showFXRateCard && (
               <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-2xl border border-emerald-100 p-4 z-20 animate-in zoom-in-95 duration-200">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-gray-800 text-sm">Rate Alert</h4>
                   <button onClick={() => dispatch({ type: 'TOGGLE_FX_CARD', show: false })}><X size={14} /></button>
                 </div>
                 <p className="text-xs text-gray-500 mb-3">今日兌換 JPY 匯率更抵，要唔要調整兌換幣種？</p>
               </div>
             )}
           </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Travel Insurance</h2>
      
      {/* Trip Details Input (Triggers Ski Logic) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 mb-4">
        <input 
          placeholder="Destination (e.g. Japan)" 
          value={state.destination}
          onChange={(e) => dispatch({ type: 'SET_TRAVEL_DETAILS', destination: e.target.value })}
          className="flex-1 bg-gray-50 p-2 rounded-lg border-none focus:ring-1 focus:ring-emerald-500 text-sm"
        />
        <select 
          value={state.travelMonth}
          onChange={(e) => dispatch({ type: 'SET_TRAVEL_DETAILS', month: e.target.value })}
          className="flex-1 bg-gray-50 p-2 rounded-lg border-none focus:ring-1 focus:ring-emerald-500 text-sm"
        >
          <option value="">Month</option>
          <option value="December">December</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
        </select>
      </div>

      {/* Travel Insurance Card */}
      <div className="bg-gradient-to-br from-[#006847] to-[#004e36] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden transition-all duration-500">
        <Plane className="absolute top-4 right-4 text-white/10" size={120} />
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Single Trip Protection</h3>
          <p className="text-emerald-100 text-sm mb-6 max-w-xs"> comprehensive medical & accident coverage.</p>
          
          {/* Add-on Chips */}
          <div className="flex gap-2 flex-wrap mb-6">
            {state.insuranceAddons.includes('winter-sports') && (
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in zoom-in">
                 <Snowflake size={14} /> <span className="text-xs font-bold">Winter Sports Included</span>
              </div>
            )}
             {state.insuranceAddons.includes('car-rental') && (
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in zoom-in delay-100">
                 <Car size={14} /> <span className="text-xs font-bold">Car Rental Included</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-6 cursor-pointer hover:bg-white/20 transition"
               onClick={() => dispatch({ type: 'TOGGLE_REWARD_MODAL', show: true })}>
             <div className="bg-white rounded-full p-2">
               <ShieldCheck className="text-[#006847]" size={24} />
             </div>
             <div>
               <p className="font-bold">Select Credit Card</p>
               <p className="text-xs text-emerald-200">Click to pay</p>
             </div>
          </div>
          
          <button className="w-full py-3 bg-white text-[#006847] font-bold rounded-lg hover:bg-emerald-50">
            Confirm Quote
          </button>
        </div>
      </div>
      
       {/* Reward Modal */}
      {state.showRewardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full duration-300">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-3xl">🎁</span>
               </div>
               <h3 className="text-xl font-bold text-gray-900">Exclusive Travel Reward</h3>
               <p className="text-gray-500 mt-2 text-sm">
                 Use <strong>Hang Seng Travel Card</strong> for overseas spending to earn <strong>6% Cash Dollars</strong>!
               </p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => dispatch({ type: 'TOGGLE_REWARD_MODAL', show: false })}
                 className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl"
               >
                 Dismiss
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};