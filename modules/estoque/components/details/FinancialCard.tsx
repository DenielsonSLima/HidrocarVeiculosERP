
import React from 'react';
import { IVeiculo } from '../../estoque.types';

interface FinancialCardProps {
  veiculo: IVeiculo;
}

const FinancialCard: React.FC<FinancialCardProps> = ({ veiculo }) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatPercent = (val: number) => parseFloat(val.toFixed(2));

  // Cálculos
  const aquisicao = veiculo.valor_custo || 0;
  const servicos = veiculo.valor_custo_servicos || 0;
  const custoTotal = aquisicao + servicos;
  const venda = veiculo.valor_venda || 0;
  
  const lucroProjetado = venda - custoTotal;
  const margem = custoTotal > 0 ? (lucroProjetado / custoTotal) * 100 : 0;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-6">
       <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
       
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center space-x-2 text-indigo-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-black uppercase tracking-widest">Performance do Ativo</span>
             </div>
             <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${margem > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                Margem: {formatPercent(margem)}%
             </span>
          </div>

          <div className="mb-8 text-center bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço de Venda Sugerido</p>
             <h2 className="text-4xl font-black tracking-tighter text-white">{formatCurrency(venda)}</h2>
          </div>

          <div className="space-y-3 mb-8">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Custo de Aquisição</span>
                <span className="font-bold text-slate-200">{formatCurrency(aquisicao)}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Gastos com Serviços</span>
                <span className="font-bold text-amber-400">+ {formatCurrency(servicos)}</span>
             </div>
             <div className="h-px bg-white/10 my-2"></div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Investimento Total</span>
                <span className="text-xl font-black text-white">{formatCurrency(custoTotal)}</span>
             </div>
          </div>

          <div className="bg-emerald-900/20 p-5 rounded-3xl border border-emerald-500/20 mb-8 flex justify-between items-center">
             <div>
                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Retorno Previsto</p>
                <p className="text-2xl font-black text-emerald-400">{formatCurrency(lucroProjetado)}</p>
             </div>
             <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Distribuição Societária</h3>
             {veiculo.socios && veiculo.socios.length > 0 ? (
               <div className="grid grid-cols-1 gap-2">
                  {veiculo.socios.map((socio, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center space-x-3 min-w-0">
                           <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0 uppercase">
                             {socio.nome.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-200 truncate">{socio.nome}</span>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[10px] font-black text-indigo-400 leading-none">{formatPercent(socio.porcentagem)}%</p>
                           <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{formatCurrency(socio.valor)}</p>
                        </div>
                     </div>
                  ))}
               </div>
             ) : (
                <div className="text-center py-4 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                   Propriedade Integral (100%)
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default FinancialCard;
