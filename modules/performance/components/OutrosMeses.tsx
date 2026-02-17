import React, { useState, useEffect, useCallback } from 'react';
import { PerformanceService } from '../performance.service';
import { IPerformanceData } from '../performance.types';
import PerformanceContent from './PerformanceContent';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const OutrosMeses: React.FC = () => {
  const now = new Date();
  // Iniciar no mês anterior
  const mesAnterior = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const anoAnterior = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [mesSelecionado, setMesSelecionado] = useState(mesAnterior);
  const [anoSelecionado, setAnoSelecionado] = useState(anoAnterior);
  const [data, setData] = useState<IPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);

  // Gerar lista de anos: do atual até 3 anos atrás
  const anos = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = new Date(anoSelecionado, mesSelecionado, 1).toISOString().split('T')[0];
    const endDate = new Date(anoSelecionado, mesSelecionado + 1, 0).toISOString().split('T')[0];

    try {
      const result = await PerformanceService.getPerformanceData(startDate, endDate);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [mesSelecionado, anoSelecionado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periodoLabel = `${MESES[mesSelecionado]} de ${anoSelecionado}`;

  // Verificar se é o mês atual (não deveria, mas proteger)
  const isMesAtual = mesSelecionado === now.getMonth() && anoSelecionado === now.getFullYear();

  return (
    <div className="space-y-6">
      {/* Seletor de Mês/Ano */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200/80 p-1.5">
          {MESES.map((mes, idx) => {
            const isFuturo = anoSelecionado === now.getFullYear() && idx > now.getMonth();
            const isAtual = anoSelecionado === now.getFullYear() && idx === now.getMonth();
            return (
              <button
                key={idx}
                disabled={isFuturo}
                onClick={() => setMesSelecionado(idx)}
                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  mesSelecionado === idx
                    ? 'bg-slate-900 text-white shadow-lg'
                    : isFuturo
                      ? 'text-slate-200 cursor-not-allowed'
                      : isAtual
                        ? 'text-indigo-500 hover:bg-indigo-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {mes.slice(0, 3)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-slate-200/80 p-1.5">
          {anos.map(ano => (
            <button
              key={ano}
              onClick={() => {
                setAnoSelecionado(ano);
                // Se o mês selecionado é futuro no novo ano, ajustar
                if (ano === now.getFullYear() && mesSelecionado > now.getMonth()) {
                  setMesSelecionado(now.getMonth());
                }
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                anoSelecionado === ano
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ano}
            </button>
          ))}
        </div>
      </div>

      {/* Aviso mês atual */}
      {isMesAtual && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Este é o mês atual. Use a aba "Mês Atual" para dados em tempo real.</span>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando {periodoLabel}...</p>
          </div>
        </div>
      ) : data ? (
        <PerformanceContent data={data} periodoLabel={periodoLabel} />
      ) : null}
    </div>
  );
};

export default OutrosMeses;
