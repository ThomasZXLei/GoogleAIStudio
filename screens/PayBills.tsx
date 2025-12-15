import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Receipt, Zap, Droplets, Wifi } from 'lucide-react';

export const PayBills: React.FC = () => {
  const { state, dispatch, sendHaruTrigger } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  
  const handlePay = () => {
    dispatch({ 
      type: 'EXECUTE_TRANSACTION', 
      transaction: {
        id: Date.now().toString(),
        type: 'Bill Payment',
        description: state.billMerchant,
        amount: state.billAmount,
        currency: 'HKD',
        date: new Date().toLocaleDateString(),
        direction: 'out'
      }
    });
    dispatch({ type: 'UPDATE_BALANCE', currency: 'HKD', delta: -state.billAmount });

    // Context Awareness
    sendHaruTrigger(`[TRANSACTION] Type: Bill Payment | Merchant: ${state.billMerchant} | Amount: HKD ${state.billAmount}`);
    
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in">
         <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
           <CheckCircle size={40} className="text-emerald-600" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Sent</h2>
         <p className="text-gray-500 mb-8">Paid HKD {state.billAmount.toLocaleString()} to {state.billMerchant}</p>
         <button 
           onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
           className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold"
         >
           Back to Home
         </button>
      </div>
    );
  }

  const merchants = [
    { name: 'CLP Power', icon: <Zap size={20} className="text-yellow-600" />, category: 'Utility' },
    { name: 'Water Dept', icon: <Droplets size={20} className="text-blue-500" />, category: 'Utility' },
    { name: 'HKBN', icon: <Wifi size={20} className="text-purple-500" />, category: 'Telecom' },
  ];

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-in slide-in-from-right">
      <h2 className="text-2xl font-bold text-gray-900">Pay Bills</h2>
      
      {/* Merchant Selection */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Select Merchant</label>
        <div className="space-y-2">
          {merchants.map(m => (
            <button 
              key={m.name}
              onClick={() => dispatch({ type: 'SET_BILL_DETAILS', merchant: m.name })}
              className={`w-full flex items-center gap-4 p-3 rounded-lg border transition ${state.billMerchant === m.name ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:bg-gray-50'}`}
            >
               <div className="p-2 bg-white rounded-full shadow-sm">{m.icon}</div>
               <div className="text-left">
                 <p className="font-bold text-gray-800">{m.name}</p>
                 <p className="text-xs text-gray-400">{m.category}</p>
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
         <label className="text-xs font-bold text-gray-400 uppercase">Amount (HKD)</label>
         <input 
           type="number"
           value={state.billAmount || ''}
           onChange={(e) => dispatch({ type: 'SET_BILL_DETAILS', amount: Number(e.target.value) })}
           className="w-full text-4xl font-bold mt-2 outline-none placeholder-gray-200"
           placeholder="0.00"
         />
      </div>

      <button 
        onClick={handlePay}
        disabled={!state.billAmount || !state.billMerchant}
        className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Receipt size={18} /> Pay Now
      </button>
    </div>
  );
};