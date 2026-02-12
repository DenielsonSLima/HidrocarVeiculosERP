import React from 'react';
import { IExtratoTotals } from '../../../financeiro.types';

interface Props {
  totals: IExtratoTotals;
}

const ExtratoKpis: React.FC<Props> = ({ totals }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const { entradas, saidas, balanco } = totals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] shadow-sm">
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Entradas</p>
        <h3 className="text-2xl font-black text-emerald-700">{formatCurrency(entradas)}</h3>
      </div>
      <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] shadow-sm">
        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Saídas</p>
        <h3 className="text-2xl font-black text-rose-700">{formatCurrency(saidas)}</h3>
      </div>
      <div className={`p-6 rounded-[2rem] border shadow-sm ${balanco >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${balanco >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>Saldo Período</p>
        <h3 className={`text-2xl font-black ${balanco >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>{formatCurrency(balanco)}</h3>
      </div>
    </div>
  );
};

export default ExtratoKpis;