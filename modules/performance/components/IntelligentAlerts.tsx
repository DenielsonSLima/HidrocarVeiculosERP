
import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IIntelligentAlert } from '../performance.types';

const IntelligentAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<IIntelligentAlert[]>([]);

  useEffect(() => {
    PerformanceService.getIntelligentAlerts().then(setAlerts);
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 shadow-sm">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
               <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Anomalias & Sugestões Estratégicas</h3>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map(alert => (
             <div key={alert.id} className={`p-8 rounded-[2.5rem] border-2 flex gap-6 transition-all hover:scale-[1.02] shadow-sm ${
                alert.nivel === 'CRITICO' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
             }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                   alert.nivel === 'CRITICO' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <div>
                   <h4 className={`text-lg font-black uppercase tracking-tight ${
                      alert.nivel === 'CRITICO' ? 'text-rose-900' : 'text-amber-900'
                   }`}>{alert.titulo}</h4>
                   <p className={`mt-2 text-sm font-medium leading-relaxed ${
                      alert.nivel === 'CRITICO' ? 'text-rose-700/80' : 'text-amber-700/80'
                   }`}>{alert.mensagem}</p>
                   
                   <div className="mt-6 flex gap-3">
                      <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         alert.nivel === 'CRITICO' ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200 shadow-lg'
                      }`}>Resolver Agora</button>
                      <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Ignorar</button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default IntelligentAlerts;
