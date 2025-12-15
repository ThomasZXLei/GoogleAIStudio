import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RATES } from '../constants';
import { ArrowRightLeft, TrendingUp, CheckCircle } from 'lucide-react';

export const FXTrading: React.FC = () => {
  const { state, dispatch, sendHaruTrigger } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  
  const rate = RATES[state.fxBuyCurrency] || 1;
  const buyAmount = state.fxAmount * rate;
  
  const handleSellChange = (val: string) => {
    dispatch({ type: 'SET_FX_DETAILS', amount: Number(val) });
  };

  const handleBuyChange = (val: string) => {
    const newBuyAmount = Number(val);
    const newSellAmount = newBuyAmount / rate;
    dispatch({ type: 'SET_FX_DETAILS', amount: newSellAmount });
  };
  
  const handleTrade = () => {
    // Deduct HKD
    dispatch({ type: 'UPDATE_BALANCE', currency: 'HKD', delta: -state.fxAmount });
    // Add Foreign Currency
    dispatch({ type: 'UPDATE_BALANCE', currency: state.fxBuyCurrency, delta: buyAmount });
    
    dispatch({ 
      type: 'EXECUTE_TRANSACTION', 
      transaction: {
        id: Date.now().toString(),
        type: 'FX Exchange',
        description: `Bought ${state.fxBuyCurrency}`,
        amount: state.fxAmount,
        currency: 'HKD',
        date: new Date().toLocaleDateString(),
        direction: 'out'
      }
    });

    // Context Awareness: Log transaction to Chatbot
    sendHaruTrigger(`[TRANSACTION] Type: FX | Sold: HKD ${state.fxAmount.toFixed(2)} | Bought: ${state.fxBuyCurrency} ${buyAmount.toFixed(2)} | Rate: ${rate}`);

    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in">
         <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
           <CheckCircle size={40} className="text-emerald-600" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Exchange Complete</h2>
         <p className="text-gray-500 mb-8">
           You exchanged HKD {state.fxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} for {state.fxBuyCurrency} {buyAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}.
         </p>
         <button 
           onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
           className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold"
         >
           View Wallet
         </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-in slide-in-from-right">
      <h2 className="text-2xl font-bold text-gray-900">FX Trading</h2>
      
      {/* Rate Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center">
         <div>
           <p className="text-indigo-200 text-sm">HKD / {state.fxBuyCurrency}</p>
           <h3 className="text-3xl font-bold">{rate}</h3>
           <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +0.05% today</p>
         </div>
         <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
           <ArrowRightLeft size={24} />
         </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        {/* Sell */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-gray-500">Sell (HKD)</label>
            <span className="text-xs text-gray-400">Bal: ${state.accounts.find(a=>a.currency==='HKD')?.balance.toLocaleString()}</span>
          </div>
          <input 
            type="number"
            value={state.fxAmount || ''}
            onChange={(e) => handleSellChange(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-xl font-bold border border-gray-200 focus:ring-2 focus:ring-gray-200 outline-none"
            placeholder="0.00"
          />
        </div>
        
        <div className="flex justify-center -my-3 relative z-10">
           <div className="bg-gray-100 p-2 rounded-full border border-white shadow-sm">
             <ArrowRightLeft className="text-gray-500 rotate-90" size={20} />
           </div>
        </div>

        {/* Buy */}
        <div>
           <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-gray-500">Buy ({state.fxBuyCurrency})</label>
            <select 
               value={state.fxBuyCurrency}
               onChange={(e) => dispatch({ type: 'SET_FX_DETAILS', buy: e.target.value })}
               className="text-xs bg-gray-100 rounded px-2 py-1 font-bold outline-none"
            >
              <option value="JPY">JPY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <input 
            type="number"
            value={buyAmount ? parseFloat(buyAmount.toFixed(2)) : ''}
            onChange={(e) => handleBuyChange(e.target.value)}
            className="w-full p-3 bg-indigo-50 rounded-xl text-xl font-bold text-indigo-700 border border-indigo-100 focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="0.00"
          />
        </div>
      </div>

      <button 
        onClick={handleTrade}
        className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold hover:bg-[#005238] transition shadow-lg"
      >
        Confirm Exchange
      </button>
    </div>
  );
};