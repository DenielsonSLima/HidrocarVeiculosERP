import React from 'react';
import { ITituloCredito } from '../outros-creditos.types';

interface Props {
  titulos: ITituloCredito[];
}

const CreditosKpis: React.FC<Props> = ({ titulos }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const totalRecebido = titulos.reduce((acc, t) => acc + (t.valor_pago || 0), 0);
  const totalPendente = titulos.reduce((acc, t) => acc + (t.valor_total - (t.valor_pago || 0)), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-teal-300 transition-all">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Creditado</p>
          <h3 className="text-2xl font-black text-teal-600 mt-1">{formatCurrency(totalRecebido)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-teal-600 shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-teal-300 transition-all">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Previsto (Em Aberto)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalPendente)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between border border-slate-800">
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Volume de Entradas</p>
          <h3 className="text-2xl font-black text-white mt-1">{titulos.length} <span className="text-xs opacity-50 uppercase tracking-tighter">Eventos</span></h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
      </div>
    </div>
  );
};

export default CreditosKpis;
