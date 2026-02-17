import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PedidosVendaService } from './pedidos-venda.service';
import { IPedidoVenda, IVendaFiltros, VendaTab } from './pedidos-venda.types';
import PedidosVendaList from './components/PedidosVendaList';
import PedidosVendaFilters from './components/PedidosVendaFilters';
import PedidosVendaKpis from './components/PedidosVendaKpis';
import { CorretoresService } from '../cadastros/corretores/corretores.service';
import { ICorretor } from '../cadastros/corretores/corretores.types';
import { SociosService } from '../ajustes/socios/socios.service';
import { ISocio } from '../ajustes/socios/socios.types';

const PedidoVendaPage: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [pedidos, setPedidos] = useState<IPedidoVenda[]>([]);
  const [statsPedidos, setStatsPedidos] = useState<IPedidoVenda[]>([]);
  const [corretores, setCorretores] = useState<ICorretor[]>([]);
  const [socios, setSocios] = useState<ISocio[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Filters
  const [activeTab, setActiveTab] = useState<VendaTab>('MES_ATUAL');
  const [filtros, setFiltros] = useState<IVendaFiltros>({
    busca: '',
    dataInicio: '',
    dataFim: '',
    corretorId: '',
    socioId: ''
  });

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await PedidosVendaService.getAll({
        ...filtros,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      }, activeTab);

      setPedidos(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.count);

      // Carregar Stats (sem paginação)
      const stats = await PedidosVendaService.getDashboardStats(filtros, activeTab);
      setStatsPedidos(stats);

    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeTab, filtros, currentPage]);

  useEffect(() => {
    // Busca dependências
    Promise.all([
      CorretoresService.getAll(),
      SociosService.getAll()
    ]).then(([c, s]) => {
      setCorretores(c);
      setSocios(s);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filtros]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Pedidos de Venda</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">Gestão comercial e saídas</p>
        </div>
        <button
          onClick={() => navigate('/pedidos-venda/novo')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Nova Venda
        </button>
      </div>

      <PedidosVendaKpis pedidos={statsPedidos} />

      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('MES_ATUAL')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'MES_ATUAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Mês Atual</button>
        <button onClick={() => setActiveTab('RASCUNHO')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'RASCUNHO' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Rascunho</button>
        <button onClick={() => setActiveTab('TODOS')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'TODOS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Todas</button>
      </div>

      <PedidosVendaFilters
        filtros={filtros}
        corretores={corretores}
        socios={socios}
        onChange={setFiltros}
      />

      <PedidosVendaList pedidos={pedidos} loading={loading} onEdit={(p) => navigate(`/pedidos-venda/${p.id}`)} />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span>
            <span className="ml-2 opacity-50">({totalCount} vendas)</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button className="w-10 h-10 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110 transition-all">
              {currentPage}
            </button>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidoVendaPage;
