import React, { useState, useEffect, useMemo } from 'react';
import { ContasPagarService } from './contas-pagar.service';
import { FinanceiroService } from '../../financeiro.service';
import { ITituloPagar, PagarTab, IPagarFiltros } from './contas-pagar.types';
import PagarFilters from './components/PagarFilters';
import PagarList from './components/PagarList';
import PagarKpis from './components/PagarKpis';
import ModalBaixa from '../components/ModalBaixa';
import ConfirmModal from '../../../../components/ConfirmModal';

const ContasPagarPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PagarTab>('MES_ATUAL');

  // Dados & Paginação
  const [titulos, setTitulos] = useState<ITituloPagar[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState<IPagarFiltros>({
    busca: '',
    dataInicio: '',
    dataFim: '',
    categoriaId: '',
    status: ''
  });

  // Estados de Modais
  const [selectedTitulo, setSelectedTitulo] = useState<ITituloPagar | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
    FinanceiroService.getCategorias().then(setCategorias);
    const sub = ContasPagarService.subscribe(() => loadData(true));
    return () => { sub.unsubscribe(); };
  }, [activeTab, filtros, currentPage]);

  // Reset pagination on filter/tab change (use functional ref to avoid double-load)
  const prevTabRef = React.useRef(activeTab);
  const prevFiltrosRef = React.useRef(filtros);
  useEffect(() => {
    if (prevTabRef.current !== activeTab || prevFiltrosRef.current !== filtros) {
      prevTabRef.current = activeTab;
      prevFiltrosRef.current = filtros;
      if (currentPage !== 1) {
        setCurrentPage(1); // will trigger the load via the dependency above
        return; // avoid double-load: the page reset triggers the useEffect above
      }
    }
  }, [activeTab, filtros]);

  async function loadData(silent = false) {
    if (!silent) setLoading(true);
    try {
      const response = await ContasPagarService.getAll(activeTab, {
        ...filtros,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });
      setTitulos(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.count);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await ContasPagarService.delete(deleteId);
      setDeleteId(null);
      loadData(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Contas a Pagar</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Agenda de compromissos financeiros e liquidação de pedidos</p>
        </div>

        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-95 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Despesa Avulsa
        </button>
      </div>

      <PagarKpis titulos={titulos} />

      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button onClick={() => setActiveTab('MES_ATUAL')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MES_ATUAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Mês Atual</button>
        <button onClick={() => setActiveTab('ATRASADOS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ATRASADOS' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Em Atraso</button>
        <button onClick={() => setActiveTab('OUTROS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OUTROS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Outros Meses</button>
      </div>

      <PagarFilters filtros={filtros} onChange={setFiltros} categorias={categorias} />

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <PagarList
          items={titulos}
          loading={loading}
          onPagar={setSelectedTitulo}
          onDelete={setDeleteId}
        />

        {/* Pagination Controls inside the card */}
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

      {selectedTitulo && (
        <ModalBaixa
          titulo={selectedTitulo as any}
          onClose={() => setSelectedTitulo(null)}
          onSuccess={() => { setSelectedTitulo(null); loadData(true); }}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Título?"
        message="Tem certeza que deseja remover esta conta? Caso ela seja vinculada a um pedido de compra, o rastreamento financeiro poderá ser perdido."
        confirmText="Sim, Excluir Registro"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ContasPagarPage;
