
import React from 'react';
import { IDashboardStats } from '../inicio.types';

interface Props {
  stats: IDashboardStats;
}

const GeneralKpis: React.FC<Props> = ({ stats }) => {
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const kpis = [
    { label: 'VGV em Pátio', value: formatBRL(stats.valorGlobalEstoque), color: 'indigo', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Veículos Disponíveis', value: stats.totalEstoque, color: 'emerald', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Carteira Parceiros', value: stats.totalParceiros, color: 'blue', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-400 transition-all">
          <div className={`w-14 h-14 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-6 shadow-sm`}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
            </svg>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-1">{kpi.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default GeneralKpis;
