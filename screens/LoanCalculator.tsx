import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, DollarSign, Lock } from 'lucide-react';

export const LoanCalculator: React.FC = () => {
  const { state, dispatch } = useApp();
  const [highlight, setHighlight] = useState(false);
  const loadedRef = useRef(false);

  // Trigger Logic 1.1: Load Time > 3.0s (Existing)
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const timer = setTimeout(() => {
      if (!state.isHaruActive) {
        dispatch({ 
          type: 'SET_HARU_STATE', 
          active: true, 
          message: "睇到你係度瀏覽私人分期貸款，需要幫你直接進入申請流程嗎？ (Seeing you browse... need help applying?)" 
        });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [dispatch, state.isHaruActive]);

  // Visual Feedback
  useEffect(() => {
    if (state.loanAmount > 100000 || state.loanTenure !== 12) {
       setHighlight(true);
       const t = setTimeout(() => setHighlight(false), 2000);
       return () => clearTimeout(t);
    }
  }, [state.loanAmount, state.loanTenure]);

  // Use Case 1 Calculation
  const monthlyPayment = Math.round(state.loanAmount / state.loanTenure * 1.05);
  const dtiRatio = state.salary > 0 ? (state.monthlyDebt + monthlyPayment) / state.salary : 0;
  const isHighRisk = dtiRatio > (state.debug.dtiThreshold / 100);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Personal Instalment Loan</h2>
        <p className="text-gray-500">Calculate your monthly repayment instantly.</p>
      </div>

      {/* DTI Warning Banner (Use Case 1 UI) */}
      {isHighRisk && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
           <div className="mt-1">⚠️</div>
           <div>
             <p className="font-bold text-sm">Borrowing Power Alert</p>
             <p className="text-xs mt-1">Your DTI ratio is {(dtiRatio * 100).toFixed(0)}%. Haru recommends extending tenure to lower monthly burden.</p>
           </div>
        </div>
      )}

      {/* Loan Amount Input */}
      <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-500 ${highlight ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200'}`}>
        <label className="block text-sm font-semibold text-gray-700 mb-4">Loan Amount (HKD)</label>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="number" 
              value={state.loanAmount}
              onChange={(e) => dispatch({ type: 'SET_LOAN_PARAMS', amount: Number(e.target.value), tenure: state.loanTenure })}
              className={`w-full pl-12 pr-4 py-4 text-2xl font-bold text-gray-900 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-[#006847] focus:border-transparent outline-none transition-colors ${highlight ? 'text-[#006847]' : ''}`}
            />
          </div>
        </div>
        <input 
          type="range" 
          min="10000" 
          max="2000000" 
          step="10000"
          value={state.loanAmount}
          onChange={(e) => dispatch({ type: 'SET_LOAN_PARAMS', amount: Number(e.target.value), tenure: state.loanTenure })}
          className="w-full mt-6 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006847]"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>$10,000</span>
          <span>$2,000,000</span>
        </div>
      </div>

      {/* Tenure Slider */}
      <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-500 ${highlight ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200'}`}>
        <label className="block text-sm font-semibold text-gray-700 mb-4">Repayment Period (Months)</label>
        <div className="flex items-center justify-between mb-6">
           <span className={`text-4xl font-bold transition-colors ${highlight ? 'text-[#006847]' : 'text-gray-900'}`}>{state.loanTenure}</span>
           <span className="text-gray-400 font-medium">Months</span>
        </div>
        
        <div className="flex justify-between gap-2">
           {[12, 24, 36, 48, 60].map(m => (
             <button
               key={m}
               onClick={() => dispatch({ type: 'SET_LOAN_PARAMS', amount: state.loanAmount, tenure: m })}
               className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${state.loanTenure === m ? 'bg-[#006847] text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               {m}
             </button>
           ))}
        </div>
      </div>

      {/* Action Button */}
      <div className={`p-6 rounded-2xl shadow-lg flex justify-between items-center cursor-pointer transition-colors ${isHighRisk ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#006847] hover:bg-[#005238]'} text-white`}
           onClick={() => dispatch({ type: 'NAVIGATE', screen: 'personal-info' })}>
        <div>
          <p className="text-sm opacity-80">{isHighRisk ? 'Review Risk' : 'Monthly Repayment'}</p>
          <p className="text-3xl font-bold mt-1">${monthlyPayment.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          {isHighRisk ? 'Proceed Anyway' : 'Apply Now'} <ChevronRight />
        </div>
      </div>
      
      {/* Use Case 5: Cool-off Save Offer */}
      {state.offerLocked ? (
         <div className="flex items-center gap-2 justify-center text-emerald-600 font-medium bg-emerald-50 p-3 rounded-lg">
           <Lock size={16} /> Offer Locked for 7 Days
         </div>
      ) : (
         <div className="text-center">
           <button 
             onClick={() => {
                dispatch({ type: 'SET_OFFER_LOCKED', locked: true });
                dispatch({ type: 'SET_HARU_STATE', active: true, message: "Offer saved! I've locked this rate for 7 days." });
             }}
             className="text-sm text-gray-500 underline hover:text-[#006847]"
           >
             Not ready? Save this offer for later.
           </button>
         </div>
      )}
    </div>
  );
};