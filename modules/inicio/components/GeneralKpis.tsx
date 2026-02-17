
import React from 'react';
import { IDashboardStats } from '../inicio.types';

interface Props {
  stats: IDashboardStats;
}

const GeneralKpis: React.FC<Props> = ({ stats }) => {
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const kpis = [
    {
      label: 'Veículos em Estoque',
      value: stats.totalEstoque,
      color: 'blue',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      label: 'VGV em Pátio',
      value: formatBRL(stats.valorGlobalEstoque),
      color: 'indigo',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Vendas (Mês)',
      value: stats.vendasMesAtual,
      color: 'emerald',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Lucro (Mês)',
      value: formatBRL(stats.lucroProjetado),
      color: 'rose',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:scale-150 group-hover:bg-${kpi.color}-500/10`}></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
              </svg>
            </div>
            {idx >= 2 && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wider">Mensal</span>}
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{kpi.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GeneralKpis;
