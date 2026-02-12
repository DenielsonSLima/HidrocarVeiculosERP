import React from 'react';
import { ITituloFixa } from '../despesas-fixas.types';

interface Props {
  titulos: ITituloFixa[];
}

const FixasKpis: React.FC<Props> = ({ titulos }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const totalAberto = titulos.filter(t => t.status !== 'PAGO').reduce((acc, t) => acc + (t.valor_total - (t.valor_pago || 0)), 0);
  const totalPago = titulos.reduce((acc, t) => acc + (t.valor_pago || 0), 0);
  const totalGeral = titulos.reduce((acc, t) => acc + t.valor_total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Custos em Aberto</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalAberto)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Liquidado no Período</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalPago)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between border border-slate-800">
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Comprometimento Total</p>
          <h3 className="text-2xl font-black text-white mt-1">{formatCurrency(totalGeral)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
      </div>
    </div>
  );
};

export default FixasKpis;
