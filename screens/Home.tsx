import React from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Plane, Banknote, User, Repeat, Receipt, ArrowRightLeft, ShieldCheck, ChevronRight } from 'lucide-react';

export const Home: React.FC = () => {
  const { state, dispatch } = useApp();

  const totalBalanceHKD = state.accounts.reduce((acc, curr) => {
    // Simple mock conversion for total display
    let val = curr.balance;
    if (curr.currency === 'USD') val *= 7.8;
    if (curr.currency === 'JPY') val /= 19;
    return acc + val;
  }, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
       {/* Header */}
       <div className="flex justify-between items-center">
         <div>
           <h1 className="text-2xl font-bold text-gray-900">Good Morning</h1>
           <p className="text-gray-500">Welcome back to Haru Bank</p>
         </div>
         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-[#006847]">
            <User size={20} />
         </div>
       </div>

       {/* Accounts Summary */}
       <div className="bg-gradient-to-r from-[#006847] to-[#008f61] rounded-2xl p-6 text-white shadow-lg space-y-6">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total Wealth (HKD)</p>
            <h2 className="text-3xl font-bold">$ {totalBalanceHKD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {state.accounts.map(acc => (
              <div key={acc.currency} className="bg-white/10 min-w-[100px] p-3 rounded-xl backdrop-blur-md">
                <p className="text-xs text-emerald-100 font-bold">{acc.currency}</p>
                <p className="font-mono text-lg">{acc.balance.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => dispatch({ type: 'NAVIGATE', screen: 'transfer' })}
               className="flex-1 bg-white/20 backdrop-blur-md py-2.5 rounded-lg text-sm font-bold hover:bg-white/30 transition flex items-center justify-center gap-2"
             >
               <Repeat size={16} /> Transfer
             </button>
             <button 
               onClick={() => dispatch({ type: 'NAVIGATE', screen: 'pay-bills' })}
               className="flex-1 bg-white/20 backdrop-blur-md py-2.5 rounded-lg text-sm font-bold hover:bg-white/30 transition flex items-center justify-center gap-2"
             >
               <Receipt size={16} /> Pay Bills
             </button>
          </div>
       </div>

       {/* Services Grid */}
       <div>
         <h3 className="font-bold text-gray-900 text-lg mb-4">Quick Services</h3>
         <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'fx-trading' })}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md transition text-left group"
            >
               <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                 <ArrowRightLeft size={24} />
               </div>
               <span className="font-bold text-gray-800">FX Trading</span>
               <span className="text-xs text-gray-500 mt-1">Real-time rates 24/7</span>
            </button>

            <button 
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'travel-insurance' })}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md transition text-left group"
            >
               <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={24} />
               </div>
               <span className="font-bold text-gray-800">Travel Cover</span>
               <span className="text-xs text-gray-500 mt-1">Instant protection</span>
            </button>
            
             <button 
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'loan-calculator' })}
              className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition text-left group"
            >
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                   <Banknote size={24} />
                 </div>
                 <div>
                   <span className="font-bold text-gray-800 block">Personal Loan</span>
                   <span className="text-xs text-gray-500">Low interest APR from 1.8%</span>
                 </div>
               </div>
               <ChevronRight className="text-gray-300" />
            </button>
         </div>
       </div>
       
       {/* Transaction History */}
       <div>
         <div className="flex justify-between items-end mb-4">
           <h3 className="font-bold text-gray-900 text-lg">Recent Transactions</h3>
           <span className="text-xs text-emerald-600 font-medium">View All</span>
         </div>
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
           {state.transactions.map((tx) => (
             <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${tx.direction === 'out' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {tx.type === 'Transfer' ? <Repeat size={16} /> : tx.type === 'FX Exchange' ? <ArrowRightLeft size={16} /> : <Receipt size={16} />}
                   </div>
                   <div>
                     <p className="font-bold text-gray-800 text-sm">{tx.description}</p>
                     <p className="text-xs text-gray-400">{tx.date} • {tx.type}</p>
                   </div>
                </div>
                <div className={`font-mono font-medium ${tx.direction === 'out' ? 'text-gray-900' : 'text-emerald-600'}`}>
                  {tx.direction === 'out' ? '-' : '+'} {tx.amount.toLocaleString()} <span className="text-xs text-gray-400">{tx.currency}</span>
                </div>
             </div>
           ))}
           {state.transactions.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-sm">No recent transactions</div>
           )}
         </div>
       </div>
    </div>
  );
};