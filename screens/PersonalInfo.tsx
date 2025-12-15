import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, CreditCard, Mic, DollarSign } from 'lucide-react';

export const PersonalInfo: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleFocus = (field: string) => setActiveField(field);
  const handleBlur = () => setActiveField(null);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">About You</h2>

      {/* Employment Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-3 text-[#006847] mb-2">
          <Briefcase size={20} />
          <h3 className="font-semibold">Employment Details</h3>
        </div>

        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <div className="relative">
             <input
              type="text"
              value={state.companyName}
              onFocus={() => handleFocus('company')}
              onBlur={handleBlur}
              onChange={(e) => dispatch({ type: 'SET_COMPANY', name: e.target.value })}
              placeholder="e.g. Hang Seng Bank"
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#006847] outline-none"
            />
            {activeField === 'company' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="relative flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-100 items-center justify-center">
                    <Mic size={16} className="text-[#006847]" />
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={state.salary || ''}
                onChange={(e) => dispatch({ type: 'SET_FINANCIALS', salary: Number(e.target.value) })}
                placeholder="20,000"
                className="w-full pl-8 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#006847] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Existing Debt</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={state.monthlyDebt || ''}
                onChange={(e) => dispatch({ type: 'SET_FINANCIALS', debt: Number(e.target.value) })}
                placeholder="5,000"
                className="w-full pl-8 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#006847] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Identity / Card Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-3 text-[#006847] mb-2">
          <CreditCard size={20} />
          <h3 className="font-semibold">Verification</h3>
        </div>
        
        <div className="relative">
           <label className="block text-sm font-medium text-gray-700 mb-2">Identify with Credit Card</label>
           <input
              type="text"
              value={state.cardLast4 ? `**** **** **** ${state.cardLast4}` : ''}
              onChange={(e) => dispatch({ type: 'SET_CARD_digits', digits: e.target.value.slice(-4) })}
              placeholder="Enter last 4 digits"
              className={`w-full p-4 bg-gray-50 rounded-xl border transition-all duration-300 ${state.cardLast4 ? 'border-emerald-500 bg-emerald-50 text-[#006847] font-semibold' : 'border-gray-200'}`}
            />
           {state.cardLast4 && (
             <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
               <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
               Identity verified with card ending in {state.cardLast4}
             </p>
           )}
        </div>
      </div>
      
      <button 
        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'document-upload' })}
        className="w-full py-4 bg-[#006847] text-white rounded-xl font-bold shadow-lg hover:bg-[#005238] transition-colors"
      >
        Continue to Upload
      </button>
    </div>
  );
};