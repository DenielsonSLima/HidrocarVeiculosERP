
import React from 'react';

const TaxPerformance: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-10">
       <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Inteligência Fiscal & Margem Real</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Análise de impacto tributário sobre o lucro bruto</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between h-48">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo Fiscal Médio / Carro</p>
             <div>
                <h4 className="text-2xl font-black text-rose-600">R$ 1.140</h4>
                <p className="text-[9px] font-bold text-rose-400 uppercase mt-1">ICMS + PIS/COFINS + IRPJ/CSLL</p>
             </div>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between h-48">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem Líquida Pós-Impostos</p>
             <div>
                <h4 className="text-2xl font-black text-emerald-600">9.2%</h4>
                <p className="text-[9px] font-bold text-emerald-400 uppercase mt-1">Rentabilidade real de bolso</p>
             </div>
          </div>
          <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between h-48 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-20"></div>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">Regime Tributário Atual</p>
             <div className="relative z-10">
                <h4 className="text-xl font-black uppercase text-white">Lucro Presumido</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Operação Interestadual Ativa</p>
             </div>
          </div>
       </div>

       <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex items-start space-x-5">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
             <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Simulação de Eficiência Fiscal</h4>
             <p className="text-xs text-amber-700 leading-relaxed font-medium mt-2">
                Baseado no volume de vendas projetado, a transição para o regime de <span className="font-bold text-indigo-600 underline">Lucro Real</span> poderia gerar uma economia tributária de <span className="font-black">R$ 14.500,00</span> nos próximos 12 meses. Consulte seu contador.
             </p>
          </div>
       </div>
    </div>
  );
};

export default TaxPerformance;
