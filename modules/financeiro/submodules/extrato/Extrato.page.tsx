import React, { useState, useEffect } from 'react';
import { FinanceiroService } from '../../financeiro.service';
import { ITransacao, IExtratoTotals } from '../../financeiro.types';
import ExtratoTable from './components/ExtratoTable';
import ExtratoKpis from './components/ExtratoKpis';
import ExtratoFilters from './components/ExtratoFilters';

const ExtratoPage: React.FC = () => {
  const [transacoes, setTransacoes] = useState<ITransacao[]>([]);
  const [totals, setTotals] = useState<IExtratoTotals>({ entradas: 0, saidas: 0, balanco: 0 });

  // Paginação
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', tipo: '' });

  useEffect(() => {
    loadData();
    const sub = FinanceiroService.subscribe(() => loadData(true));
    return () => { sub.unsubscribe(); };
  }, [filtros, currentPage]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtros]);

  async function loadData(silent = false) {
    if (!silent) setLoading(true);
    try {
      // Parallel fetching: one for the list (limited), one for totals (full range agg)
      const [listRes, totalsRes] = await Promise.all([
        FinanceiroService.getExtrato({
          ...filtros,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        }),
        FinanceiroService.getExtratoTotals(filtros)
      ]);

      setTransacoes(listRes.data);
      setTotalPages(listRes.totalPages);
      setTotalCount(listRes.count);
      setTotals(totalsRes);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 pb-20">

      {/* 1. KPIs de Fluxo do Período */}
      <ExtratoKpis totals={totals} />

      {/* 2. Filtros de Auditoria */}
      <ExtratoFilters filtros={filtros} onChange={setFiltros} />

      {/* 3. A Grande Tabela de Histórico (O Ledger) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Histórico Geral de Movimentações</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Todas as entradas, saídas e transferências registradas</p>
          </div>
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            Exportar para CSV
          </button>
        </div>

        <div className="p-0">
          <ExtratoTable transacoes={transacoes} loading={loading} />
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span>
              <span className="ml-2 opacity-50">({totalCount} registros)</span>
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl hover:bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button className="w-8 h-8 rounded-lg text-[10px] font-black bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center">
                {currentPage}
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl hover:bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtratoPage;