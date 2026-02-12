import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IPurchasingPerformance } from '../performance.types';

const PurchasingPerformance: React.FC = () => {
   const [data, setData] = useState<IPurchasingPerformance[]>([]);

   useEffect(() => {
      PerformanceService.getPurchasingPerformance().then(setData);
   }, []);

   return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in duration-500">
         <div className="mb-10">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Eficiência de Aquisição</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Análise de ROI por canal de compra e fornecedor</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((item, i) => (
               <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:bg-white hover:shadow-md transition-all">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                  <h4 className={`text-2xl font-black text-indigo-600`}>{item.roi.toFixed(1)}% <span className="text-[10px] uppercase text-slate-400">ROI</span></h4>
               </div>
            ))}
         </div>
      </div>
   );
};

export default PurchasingPerformance;