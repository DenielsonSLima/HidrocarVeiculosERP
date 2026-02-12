import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IVehiclePerformance } from '../performance.types';

const FinancialPerformance: React.FC = () => {
  const [data, setData] = useState<IVehiclePerformance[]>([]);

  useEffect(() => {
    PerformanceService.getVehiclesPerformance().then(setData);
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
         <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Rentabilidade por Ativo</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Análise detalhada de custos e margens reais por veículo</p>
         </div>
      </div>
      <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Veículo</th>
                  <th className="px-8 py-5">Custo Total</th>
                  <th className="px-8 py-5">Preço Venda</th>
                  <th className="px-8 py-5">Lucro Líquido</th>
                  <th className="px-8 py-5 text-center">Margem %</th>
                  <th className="px-8 py-5 text-center">Dias Estoque</th>
                  <th className="px-8 py-5 text-right">Custo Capital</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {data.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-8 py-4">
                        <div>
                           <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{v.modelo}</p>
                           <p className="text-[10px] text-slate-400 font-mono mt-0.5">{v.placa}</p>
                        </div>
                     </td>
                     <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-600">{formatCurrency(v.custo_total)}</span>
                     </td>
                     <td className="px-8 py-4">
                        <span className="text-xs font-black text-indigo-600">{formatCurrency(v.preco_venda)}</span>
                     </td>
                     <td className="px-8 py-4">
                        <span className={`text-sm font-black ${v.lucro_liquido >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {formatCurrency(v.lucro_liquido)}
                        </span>
                     </td>
                     <td className="px-8 py-4 text-center">
                        <div className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black ${v.margem_percent >= 10 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                           {v.margem_percent.toFixed(1)}%
                        </div>
                     </td>
                     <td className="px-8 py-4 text-center">
                        <span className={`text-xs font-black ${v.dias_estoque > 30 ? 'text-rose-500' : 'text-slate-700'}`}>
                           {v.dias_estoque} dias
                        </span>
                     </td>
                     <td className="px-8 py-4 text-right">
                        <span className="text-xs font-bold text-rose-500">-{formatCurrency(v.custo_capital_parado)}</span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default FinancialPerformance;