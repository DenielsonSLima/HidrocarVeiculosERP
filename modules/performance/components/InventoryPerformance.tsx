import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IInventoryAnalytics } from '../performance.types';

const InventoryPerformance: React.FC = () => {
  const [data, setData] = useState<IInventoryAnalytics | null>(null);

  useEffect(() => {
    PerformanceService.getInventoryAnalytics().then(setData);
  }, []);

  if (!data) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Giro de Estoque</p>
            <h3 className="text-4xl font-[900] text-indigo-600 tracking-tighter">{data.giro_estoque}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Saídas / Mês</p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempo Médio Venda</p>
            <h3 className="text-4xl font-[900] text-slate-900 tracking-tighter">{data.tempo_medio_venda}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Dias em pátio</p>
         </div>
         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Custo Diário Parado</p>
            <h3 className="text-4xl font-[900] text-white tracking-tighter">{formatCurrency(data.custo_diario_parado)}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Perda invisível/dia</p>
         </div>
      </div>
    </div>
  );
};

export default InventoryPerformance;