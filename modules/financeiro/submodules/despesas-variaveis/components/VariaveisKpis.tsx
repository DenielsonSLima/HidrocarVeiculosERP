import React from 'react';
import { ITituloVariavel } from '../despesas-variaveis.types';

interface Props {
  titulos: ITituloVariavel[];
}

const VariaveisKpis: React.FC<Props> = ({ titulos }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const total = titulos.reduce((acc, t) => acc + (t.valor_total - (t.valor_pago || 0)), 0);
  const totalPago = titulos.reduce((acc, t) => acc + (t.valor_pago || 0), 0);
  const count = titulos.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Variável Aberto</p>
          <h3 className="text-2xl font-black text-orange-600 mt-1">{formatCurrency(total)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Liquidações Variáveis</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalPago)}</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between border border-slate-800">
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Volume de Notas</p>
          <h3 className="text-2xl font-black text-white mt-1">{count} <span className="text-xs opacity-50 uppercase">Lançamentos</span></h3>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
      </div>
    </div>
  );
};

export default VariaveisKpis;
