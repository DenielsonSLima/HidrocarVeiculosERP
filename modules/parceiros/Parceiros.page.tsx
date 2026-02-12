

import React, { useState, useEffect, useCallback } from 'react';
import { ParceirosService } from './parceiros.service';
import { IParceiro, ParceiroTab, TipoParceiro, IParceirosStats } from './parceiros.types';
import ParceirosList from './components/ParceirosList';
import ParceiroForm from './components/ParceiroForm';
import ParceirosFilters from './components/ParceirosFilters';
import ParceirosKpis from './components/ParceirosKpis';
import ConfirmModal from '../../components/ConfirmModal';

const ParceirosPage: React.FC = () => {
  const [parceiros, setParceiros] = useState<IParceiro[]>([]);
  const [stats, setStats] = useState<IParceirosStats>({ total: 0, ativos: 0, clientes: 0, fornecedores: 0, inativos: 0 });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState<IParceiro | null>(null);

  // Estados de Filtro e Paginação
  const [activeTab, setActiveTab] = useState<ParceiroTab>('ativos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 9; // Grid 3x3

  // Estado de Toast e Modal
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Carrega dados paginados
      const response = await ParceirosService.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        tab: activeTab
      });

      setParceiros(response.data);
      setTotalPages(response.totalPages);

      // Carrega estatísticas (KPIs e Contadores)
      // Pode ser otimizado para não carregar sempre, mas garante consistência
      const statsData = await ParceirosService.getStats();
      setStats(statsData);

    } catch (err) {
      console.error(err);
      if (!silent) showToast('error', 'Falha ao conectar com o servidor.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentPage, searchTerm, activeTab]);

  useEffect(() => {
    loadData();

    const subscription = ParceirosService.subscribe(() => {
      loadData(true);
      showToast('success', 'Dados atualizados em tempo real');
    });

    return () => { subscription.unsubscribe(); };
  }, [loadData]);

  // Resetar para página 1 quando mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingParceiro(null);
    setIsFormOpen(true);
  };

  const handleEdit = (p: IParceiro) => {
    setEditingParceiro(p);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (p: IParceiro) => {
    try {
      // Atualização otimista local
      const novosParceiros = parceiros.map(item =>
        item.id === p.id ? { ...item, ativo: !item.ativo } : item
      );
      setParceiros(novosParceiros);

      await ParceirosService.toggleStatus(p.id, p.ativo);
      showToast('success', `Parceiro ${p.ativo ? 'inativado' : 'ativado'} com sucesso.`);
      // Recarrega stats para atualizar contadores
      loadData(true);
    } catch (err: any) {
      loadData(true);
      showToast('error', 'Erro ao alterar status: ' + err.message);
    }
  };

  const handleSubmit = async (data: Partial<IParceiro>) => {
    try {
      await ParceirosService.save(data);
      showToast('success', data.id ? 'Parceiro atualizado com sucesso!' : 'Novo parceiro cadastrado!');
      setIsFormOpen(false);
      loadData(true);
    } catch (err: any) {
      showToast('error', 'Erro ao salvar: ' + err.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await ParceirosService.delete(deleteId);
      showToast('success', 'Parceiro removido com sucesso.');
      setDeleteId(null);
      loadData(true);
    } catch (err: any) {
      showToast('error', 'Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${toast.type === 'success' ? 'bg-slate-900/95 text-white border-emerald-500/50' : 'bg-rose-600 text-white border-rose-400/50'
          }`}>
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Gestão de Parceiros</h1>
              <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-md animate-pulse">
                Online
              </div>
            </div>
            <p className="text-slate-500 mt-1">Gerencie clientes e fornecedores do seu negócio.</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center active:scale-95"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Parceiro
        </button>
      </div>

      <ParceirosKpis stats={stats} />

      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <ParceirosFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          stats={stats}
        />

        <ParceirosList
          parceiros={parceiros}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span>
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
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  // Lógica simples para mostrar páginas próximas
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                    }
                    if (pageNum > totalPages) {
                      pageNum = totalPages - (4 - i);
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                          : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
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

      {isFormOpen && (
        <ParceiroForm
          initialData={editingParceiro}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Excluir Parceiro?"
        message={`Tem certeza que deseja excluir "${parceiros.find(p => p.id === deleteId)?.nome}"?`}
        confirmText="Sim, Excluir"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ParceirosPage;
