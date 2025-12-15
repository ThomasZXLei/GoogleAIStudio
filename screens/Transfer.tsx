import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, CheckCircle, Repeat, AlertCircle, ArrowRightLeft } from 'lucide-react';

export const Transfer: React.FC = () => {
  const { state, dispatch, sendHaruTrigger } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  
  const selectedAccount = state.accounts.find(a => a.currency === state.transferFromCurrency);
  const balance = selectedAccount?.balance || 0;
  const isInsufficient = (state.transferAmount || 0) > balance;

  const handleTransfer = () => {
    if (isInsufficient) return;

    dispatch({ 
      type: 'EXECUTE_TRANSACTION', 
      transaction: {
        id: Date.now().toString(),
        type: 'Transfer',
        description: `To ${state.transferPayee || 'Friend'}`,
        amount: state.transferAmount,
        currency: state.transferFromCurrency,
        date: new Date().toLocaleDateString(),
        direction: 'out'
      }
    });
    dispatch({ type: 'UPDATE_BALANCE', currency: state.transferFromCurrency, delta: -state.transferAmount });
    
    // Context Awareness: Log transaction to Chatbot
    sendHaruTrigger(`[TRANSACTION] Type: Transfer | From: ${state.transferFromCurrency} | Amount: ${state.transferAmount} | To: ${state.transferPayee} (${state.transferToCurrency})`);
    
    setConfirmed(true);
  };

  const navigateToFX = () => {
    dispatch({ type: 'SET_FX_DETAILS', buy: state.transferFromCurrency, sell: 'HKD' }); // Assuming HKD as base for fallback
    dispatch({ type: 'NAVIGATE', screen: 'fx-trading' });
  };

  if (confirmed) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in">
         <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
           <CheckCircle size={40} className="text-emerald-600" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful</h2>
         <p className="text-gray-500 mb-8">
           You sent {state.transferFromCurrency} {state.transferAmount.toLocaleString()} to {state.transferPayee}
           <br/><span className="text-xs text-gray-400">Payee receives in {state.transferToCurrency}</span>
         </p>
         <button 
           onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
           className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold"
         >
           Back to Home
         </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-in slide-in-from-right">
      <h2 className="text-2xl font-bold text-gray-900">Transfer Money</h2>
      
      {/* From Account */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <label className="text-xs font-bold text-gray-400 uppercase">From Account</label>
        <div className="flex justify-between items-center mt-3">
           <select 
             value={state.transferFromCurrency}
             onChange={(e) => dispatch({ type: 'SET_TRANSFER_DETAILS', fromCurrency: e.target.value })}
             className="bg-gray-50 text-gray-800 font-bold p-2 rounded-lg outline-none border border-gray-200"
           >
             {state.accounts.map(acc => (
               <option key={acc.currency} value={acc.currency}>{acc.currency} Savings</option>
             ))}
           </select>
           <div className="text-right">
             <p className={`font-bold ${isInsufficient ? 'text-red-500' : 'text-emerald-700'}`}>
               ${balance.toLocaleString()}
             </p>
             <p className="text-xs text-gray-400">Available</p>
           </div>
        </div>
        {isInsufficient && (
          <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-3">
             <AlertCircle size={16} className="text-red-500 mt-0.5" />
             <div className="flex-1">
               <p className="text-xs font-bold text-red-700">Insufficient Funds</p>
               <button 
                 onClick={navigateToFX}
                 className="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md font-bold flex items-center gap-1 hover:bg-red-200 transition"
               >
                 <ArrowRightLeft size={12} /> Exchange Money
               </button>
             </div>
          </div>
        )}
      </div>

      {/* To Payee */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
           <label className="text-xs font-bold text-gray-400 uppercase">To Payee</label>
           <select 
             value={state.transferToCurrency}
             onChange={(e) => dispatch({ type: 'SET_TRANSFER_DETAILS', toCurrency: e.target.value })}
             className="text-xs bg-gray-100 rounded px-2 py-1"
           >
             <option value="HKD">HKD</option>
             <option value="USD">USD</option>
             <option value="JPY">JPY</option>
           </select>
        </div>
        
        {state.transferPayee ? (
           <div className="flex justify-between items-center">
             <div className="mt-1 font-bold text-lg text-gray-800">{state.transferPayee}</div>
             <button onClick={() => dispatch({ type: 'SET_TRANSFER_DETAILS', payee: '' })} className="text-xs text-emerald-600 font-bold">Change</button>
           </div>
        ) : (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
             {['Alex Chen', 'Mom', 'Landlord', 'Alice Wu'].map(p => (
               <button 
                 key={p} 
                 onClick={() => dispatch({ type: 'SET_TRANSFER_DETAILS', payee: p })}
                 className="min-w-[80px] p-2 bg-gray-50 rounded-lg text-sm hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 transition"
               >
                 <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                 {p}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className={`bg-white p-6 rounded-xl border transition-colors ${isInsufficient ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200'}`}>
         <label className="text-xs font-bold text-gray-400 uppercase">Amount ({state.transferFromCurrency})</label>
         <input 
           type="number"
           value={state.transferAmount || ''}
           onChange={(e) => dispatch({ type: 'SET_TRANSFER_DETAILS', amount: Number(e.target.value) })}
           className={`w-full text-4xl font-bold mt-2 outline-none placeholder-gray-200 ${isInsufficient ? 'text-red-500' : 'text-gray-900'}`}
           placeholder="0.00"
         />
      </div>

      <button 
        onClick={handleTransfer}
        disabled={!state.transferAmount || !state.transferPayee || isInsufficient}
        className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg disabled:shadow-none transition-all"
      >
        <Repeat size={18} /> Confirm Transfer
      </button>
    </div>
  );
};