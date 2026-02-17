import React, { useState, useEffect } from 'react';
import { PerformanceService } from '../performance.service';
import { IPerformanceData } from '../performance.types';
import PerformanceContent from './PerformanceContent';

const MesAtual: React.FC = () => {
  const [data, setData] = useState<IPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    setLoading(true);
    PerformanceService.getPerformanceData(startDate, endDate)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando dados do mês...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const now = new Date();
  const mesNome = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const periodoLabel = `Mês Atual — ${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)}`;

  return <PerformanceContent data={data} periodoLabel={periodoLabel} />;
};

export default MesAtual;
