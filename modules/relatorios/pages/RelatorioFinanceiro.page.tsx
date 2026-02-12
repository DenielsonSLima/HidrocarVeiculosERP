import React from 'react';
import { useNavigate } from 'react-router-dom';

const RelatorioFinanceiroPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/relatorios')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
        >
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
           <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Relatórios / Gestão</p>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Movimentação Financeira</h1>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm min-h-[500px]">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 items-end">
            <div className="md:col-span-2">
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Intervalo de Datas</label>
               <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  <input type="date" className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold focus:ring-0 outline-none" />
                  <span className="text-slate-300">até</span>
                  <input type="date" className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold focus:ring-0 outline-none" />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Tipo de Fluxo</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none">
                  <option value="">Todos</option>
                  <option value="ENTRADA">Apenas Receitas</option>
                  <option value="SAIDA">Apenas Despesas</option>
               </select>
            </div>
            <button className="px-6 py-3.5 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all">
               Filtrar Fluxo
            </button>
         </div>

         <div className="border-2 border-dashed border-slate-100 rounded-[2rem] py-20 text-center">
            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Processando dados de fluxo de caixa...</p>
         </div>
      </div>
    </div>
  );
};

export default RelatorioFinanceiroPage;