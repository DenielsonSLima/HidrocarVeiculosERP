
import React from 'react';
import { IRetirada } from '../retiradas.types';

interface Props {
  retiradas: IRetirada[];
}

const RetiradasKpis: React.FC<Props> = ({ retiradas }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const total = retiradas.reduce((acc, r) => acc + r.valor, 0);
  const totalProLabore = retiradas.filter(r => r.tipo === 'PRO_LABORE').reduce((acc, r) => acc + r.valor, 0);
  const totalLucros = retiradas.filter(r => r.tipo === 'DISTRIBUICAO_LUCRO').reduce((acc, r) => acc + r.valor, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-400 transition-all">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Retirado (Período)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(total)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Distribuição de Lucros</p>
        <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalLucros)}</h3>
        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Participação societária</p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Pró-Labore</p>
        <h3 className="text-2xl font-black text-indigo-600 mt-1">{formatCurrency(totalProLabore)}</h3>
        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Remuneração administrativa</p>
      </div>
    </div>
  );
};

export default RetiradasKpis;
