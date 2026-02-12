import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IStrategicKpis } from '../performance.types';

const StrategicDashboard: React.FC = () => {
  const [stats, setStats] = useState<IStrategicKpis | null>(null);

  useEffect(() => {
    PerformanceService.getStrategicKpis().then(setStats);
  }, []);

  if (!stats) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Patrimônio Líquido</p>
           <h3 className="text-3xl font-black tracking-tight">{formatCurrency(stats.capital_imobilizado)}</h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase mt-4">Total imobilizado em pátio</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Lucro Líquido Realizado</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.lucro_liquido_mensal)}</h3>
           <div className="mt-4 flex items-center text-emerald-600 space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth={3}/></svg>
              <span className="text-xs font-black">+{stats.crescimento_mensal}% vs Mês Anterior</span>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Margem Média da Loja</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.margem_media_loja}%</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Resultado bruto sobre custo</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">ROI Anual Projetado</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.roi_estoque}%</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Retorno sobre capital investido</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Fluxo de Caixa Projetado (30d)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Previsão baseada em títulos e giro médio</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo Previsto</p>
              <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.previsao_caixa_30d)}</p>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between px-4 pb-4 bg-slate-50 rounded-[2rem] border border-slate-100">
             {[45, 60, 55, 75, 90, 80, 100].map((h, i) => (
                <div key={i} className="w-12 bg-indigo-600 rounded-xl transition-all hover:scale-105 hover:bg-indigo-500 cursor-help group relative" style={{ height: `${h}%` }}>
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     {formatCurrency(h * 3000)}
                   </div>
                </div>
             ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
           <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-2">Ponto de Equilíbrio</p>
              <h4 className="text-4xl font-black tracking-tighter leading-none mb-4">{formatCurrency(stats.ponto_equilibrio)}</h4>
              <p className="text-xs text-indigo-100/60 font-medium leading-relaxed">Valor mínimo necessário para cobrir custos fixos e variáveis.</p>
           </div>
           <div className="mt-10 pt-10 border-t border-white/10">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest">Meta Mensal</span>
                 <span className="text-sm font-black">72%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white rounded-full" style={{ width: '72%' }}></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicDashboard;