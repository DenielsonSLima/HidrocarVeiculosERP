import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { ISalesPerformance } from '../performance.types';

const SalesPerformance: React.FC = () => {
   const [data, setData] = useState<ISalesPerformance[]>([]);

   useEffect(() => {
      PerformanceService.getSalesPerformance().then(setData);
   }, []);

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-full">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-8">Ranking de Vendedores</h3>
            <div className="space-y-4">
               {data.length === 0 ? (
                  <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhuma venda registrada.</p>
               ) : (
                  data.sort((a, b) => b.qtd_vendida - a.qtd_vendida).map((v, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl hover:bg-white hover:border-indigo-100 border border-transparent transition-all group">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg uppercase">
                              {v.vendedor_nome.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-black uppercase text-slate-800 leading-none">{v.vendedor_nome}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{v.qtd_vendida} Vendas • {v.margem_media.toFixed(1)}% Margem</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-indigo-600">Total</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">R$ {v.ticket_medio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                     </div>
                  )))}
            </div>
         </div>
      </div>
   );
};

export default SalesPerformance;