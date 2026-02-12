import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IOperationalPerformance } from '../performance.types';

const OperationalPerformance: React.FC = () => {
   const [data, setData] = useState<IOperationalPerformance | null>(null);

   useEffect(() => {
      PerformanceService.getOperationalPerformance().then(setData);
   }, []);

   if (!data) return null;

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempo Médio Compra → Venda</p>
               <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{data.tempo_compra_venda} <span className="text-sm opacity-50 uppercase">Dias</span></h4>
            </div>
            <div className="md:border-x border-slate-100 px-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempo Médio Preparação</p>
               <h4 className="text-3xl font-black text-indigo-600 tracking-tighter">{data.tempo_preparacao} <span className="text-sm opacity-50 uppercase">Dias</span></h4>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custo Médio Reforma</p>
               <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.custo_medio_reforma)}
               </h4>
            </div>
         </div>
      </div>
   );
};

export default OperationalPerformance;