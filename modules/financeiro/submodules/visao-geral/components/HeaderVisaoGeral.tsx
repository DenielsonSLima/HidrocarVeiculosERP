import React from 'react';

const HeaderVisaoGeral: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
           </svg>
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Visão Geral Financeira</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status de saúde do caixa e previsões</p>
        </div>
      </div>
    </div>
  );
};

export default HeaderVisaoGeral;
