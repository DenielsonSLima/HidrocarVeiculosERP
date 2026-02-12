import React, { useState, useEffect, useMemo } from 'react';
import { DespesasFixasService } from './despesas-fixas.service';
import { FinanceiroService } from '../../financeiro.service';
import { ITituloFixa, FixasTab, IFixasFiltros, GroupByFixa } from './despesas-fixas.types';
import FixasFilters from './components/FixasFilters';
import FixasList from './components/FixasList';
import FixasKpis from './components/FixasKpis';
import ModalBaixa from '../components/ModalBaixa';
import ConfirmModal from '../../../../components/ConfirmModal';

const DespesasFixasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FixasTab>('MES_ATUAL');
  const [titulos, setTitulos] = useState<ITituloFixa[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupByFixa>('categoria');
  
  const [filtros, setFiltros] = useState<IFixasFiltros>({
    busca: '',
    dataInicio: '',
    dataFim: '',
    categoriaId: '',
    status: ''
  });

  const [selectedTitulo, setSelectedTitulo] = useState<ITituloFixa | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sincroniza agrupamento padrão ao mudar de aba
  useEffect(() => {
    if (activeTab === 'OUTROS') setGroupBy('mes');
    if (activeTab === 'MES_ATUAL') setGroupBy('categoria');
    if (activeTab === 'ATRASADOS') setGroupBy('nenhum');
  }, [activeTab]);

  useEffect(() => {
    loadData();
    FinanceiroService.getCategorias().then(data => 
      setCategorias(data.filter(c => c.tipo === 'FIXA'))
    );
    const sub = DespesasFixasService.subscribe(() => loadData(true));
    return () => { sub.unsubscribe(); };
  }, [activeTab, filtros]);

  async function loadData(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await DespesasFixasService.getAll(activeTab, filtros);
      setTitulos(data);
    } finally {
      setLoading(false);
    }
  }

  const processedData = useMemo(() => {
    if (groupBy === 'nenhum') return titulos;

    return titulos.reduce((acc: any, t) => {
      let key = 'DIVERSOS';
      if (groupBy === 'mes') {
        const d = new Date(t.data_vencimento);
        key = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
      } else if (groupBy === 'categoria') {
        key = t.categoria?.nome || 'SEM CATEGORIA';
      }

      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});
  }, [titulos, groupBy]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await DespesasFixasService.delete(deleteId);
      setDeleteId(null);
      loadData(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Despesas Fixas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Custos recorrentes e manutenção estrutural</p>
        </div>
        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Lançar Custo Fixo
        </button>
      </div>

      <FixasKpis titulos={titulos} />

      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button onClick={() => setActiveTab('MES_ATUAL')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MES_ATUAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Mês Atual</button>
        <button onClick={() => setActiveTab('ATRASADOS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ATRASADOS' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Vencidas</button>
        <button onClick={() => setActiveTab('OUTROS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OUTROS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Todos os Meses</button>
      </div>

      <FixasFilters 
        filtros={filtros} 
        onChange={setFiltros} 
        categorias={categorias}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <FixasList 
          items={processedData} 
          loading={loading} 
          isGrouped={groupBy !== 'nenhum'}
          onPagar={(t) => setSelectedTitulo(t as any)} 
          onDelete={setDeleteId} 
        />
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
        title="Remover Despesa?"
        message="Tem certeza que deseja excluir esta despesa fixa? Se for um lançamento automático, ele não será recriado este mês."
        confirmText="Sim, Remover"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DespesasFixasPage;
