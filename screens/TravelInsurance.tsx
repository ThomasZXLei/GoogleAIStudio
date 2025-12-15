import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plane, Snowflake, Car, CheckCircle } from 'lucide-react';

export const TravelInsurance: React.FC = () => {
  const { state, dispatch, sendHaruTrigger } = useApp();
  const [confirmed, setConfirmed] = useState(false);

  // Dynamic Premium Calculation
  const BASE_PREMIUM = 240;
  const ADDON_COSTS: Record<string, number> = {
    'winter-sports': 80,
    'car-rental': 50
  };

  const totalPremium = state.insuranceAddons.reduce((sum, addon) => {
    return sum + (ADDON_COSTS[addon] || 0);
  }, BASE_PREMIUM);

  const handleBuy = () => {
    // Deduct Balance
    dispatch({ type: 'UPDATE_BALANCE', currency: 'HKD', delta: -totalPremium });
    
    // Record Transaction
    dispatch({ 
      type: 'EXECUTE_TRANSACTION', 
      transaction: {
        id: Date.now().toString(),
        type: 'Bill Payment',
        description: `Travel Insurance (${state.destination || 'Single Trip'})`,
        amount: totalPremium,
        currency: 'HKD',
        date: new Date().toLocaleDateString(),
        direction: 'out'
      }
    });

    // Context Awareness: Log transaction to Chatbot
    const addonsList = state.insuranceAddons.join(', ') || 'None';
    sendHaruTrigger(`[TRANSACTION] Type: Travel Insurance | Destination: ${state.destination} | Addons: ${addonsList} | Premium: HKD ${totalPremium}`);

    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in">
         <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
           <CheckCircle size={40} className="text-emerald-600" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Policy Issued</h2>
         <p className="text-gray-500 mb-8">
           You have successfully purchased travel insurance for {state.destination || 'your trip'}. 
           <br/>Premium paid: HKD {totalPremium}
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
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-in slide-in-from-right pb-24">
      <h2 className="text-2xl font-bold text-gray-900">Travel Insurance</h2>
      
      {/* Inputs */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Destination</label>
           <input 
              placeholder="e.g. Tokyo, Japan" 
              value={state.destination}
              onChange={(e) => dispatch({ type: 'SET_TRAVEL_DETAILS', destination: e.target.value })}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
           />
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Travel Period</label>
           <select 
              value={state.travelMonth}
              onChange={(e) => dispatch({ type: 'SET_TRAVEL_DETAILS', month: e.target.value })}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"
           >
             <option value="">Select Month</option>
             <option value="December">December</option>
             <option value="January">January</option>
             <option value="February">February</option>
             <option value="March">March</option>
           </select>
        </div>
      </div>

      {/* Quote Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden transition-all duration-500">
        <Plane className="absolute top-4 right-4 text-white/10" size={120} />
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Single Trip Protection</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-xs">Comprehensive medical & accident coverage up to $1,000,000.</p>
          
          {/* Add-on Chips */}
          <div className="flex gap-2 flex-wrap mb-6 min-h-[30px]">
            {state.insuranceAddons.includes('winter-sports') && (
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in zoom-in">
                 <Snowflake size={14} /> <span className="text-xs font-bold">Winter Sports</span>
              </div>
            )}
             {state.insuranceAddons.includes('car-rental') && (
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in zoom-in delay-100">
                 <Car size={14} /> <span className="text-xs font-bold">Car Rental</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center border-t border-white/20 pt-4">
            <div>
              <p className="text-xs text-blue-200">Total Premium</p>
              <p className="text-2xl font-bold">${totalPremium}</p>
            </div>
            <button 
               onClick={handleBuy}
               className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
               Buy Now
            </button>
          </div>
        </div>
      </div>
      
       {/* Manual Addon Toggles */}
       <div className="space-y-3">
          <h4 className="font-bold text-gray-700 text-sm">Customize Coverage</h4>
          
          {/* Winter Sports Toggle */}
          <div 
            onClick={() => dispatch({ type: 'TOGGLE_INSURANCE_ADDON', addon: 'winter-sports', active: !state.insuranceAddons.includes('winter-sports') })}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${state.insuranceAddons.includes('winter-sports') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
             <Snowflake className="text-blue-500" />
             <div className="flex-1">
               <p className="font-bold text-gray-800 text-sm">Winter Sports (+${ADDON_COSTS['winter-sports']})</p>
               <p className="text-xs text-gray-500">Skiing & Snowboarding cover</p>
             </div>
             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${state.insuranceAddons.includes('winter-sports') ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
               {state.insuranceAddons.includes('winter-sports') && <div className="w-2 h-2 bg-white rounded-full" />}
             </div>
          </div>

          {/* Car Rental Toggle */}
          <div 
            onClick={() => dispatch({ type: 'TOGGLE_INSURANCE_ADDON', addon: 'car-rental', active: !state.insuranceAddons.includes('car-rental') })}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${state.insuranceAddons.includes('car-rental') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
             <Car className="text-blue-500" />
             <div className="flex-1">
               <p className="font-bold text-gray-800 text-sm">Car Rental (+${ADDON_COSTS['car-rental']})</p>
               <p className="text-xs text-gray-500">Rental vehicle excess cover</p>
             </div>
             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${state.insuranceAddons.includes('car-rental') ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
               {state.insuranceAddons.includes('car-rental') && <div className="w-2 h-2 bg-white rounded-full" />}
             </div>
          </div>
       </div>
    </div>
  );
};