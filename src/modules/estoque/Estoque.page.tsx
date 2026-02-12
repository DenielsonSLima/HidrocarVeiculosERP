
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EstoqueService } from './estoque.service';
import { IVeiculo } from './estoque.types';
import { MontadorasService } from '../cadastros/montadoras/montadoras.service';
import { TiposVeiculosService } from '../cadastros/tipos-veiculos/tipos-veiculos.service';
import { IMontadora } from '../cadastros/montadoras/montadoras.types';
import { ITipoVeiculo } from '../cadastros/tipos-veiculos/tipos-veiculos.types';

// Importação dos componentes do Dashboard
import EstoqueKpis from './components/EstoqueKpis';
import EstoqueFilters, { GroupByOption } from './components/EstoqueFilters';
import EstoqueList from './components/EstoqueList';

const EstoquePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados de Dados
  const [veiculos, setVeiculos] = useState<IVeiculo[]>([]);
  const [montadoras, setMontadoras] = useState<IMontadora[]>([]);
  const [tipos, setTipos] = useState<ITipoVeiculo[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro e Controle
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMontadora, setFilterMontadora] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carrega dados em paralelo para performance
      const [vData, mData, tData] = await Promise.all([
        EstoqueService.getAll(),
        MontadorasService.getAll(),
        TiposVeiculosService.getAll()
      ]);
      setVeiculos(vData);
      setMontadoras(mData);
      setTipos(tData);
    } catch (e) {
      console.error('Erro ao carregar estoque:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este veículo do estoque?')) {
      try {
        await EstoqueService.delete(id);
        // Atualiza lista localmente
        setVeiculos(prev => prev.filter(v => v.id !== id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Não foi possível excluir o veículo.');
      }
    }
  };

  // 1. Lógica de Filtragem (Memoizada)
  const filteredVeiculos = useMemo(() => {
    return veiculos.filter(v => {
      // Cast para any para acessar propriedades populadas pelo join (montadora, modelo, versao)
      const vFull = v as any;
      const term = searchTerm.toLowerCase();
      
      const matchesSearch = 
        (v.placa && v.placa.toLowerCase().includes(term)) ||
        (vFull.montadora?.nome && vFull.montadora.nome.toLowerCase().includes(term)) ||
        (vFull.modelo?.nome && vFull.modelo.nome.toLowerCase().includes(term)) ||
        (vFull.versao?.nome && vFull.versao.nome.toLowerCase().includes(term));

      const matchesMontadora = filterMontadora ? v.montadora_id === filterMontadora : true;
      const matchesTipo = filterTipo ? v.tipo_veiculo_id === filterTipo : true;

      return matchesSearch && matchesMontadora && matchesTipo;
    });
  }, [veiculos, searchTerm, filterMontadora, filterTipo]);

  // 2. Lógica de Agrupamento (Memoizada)
  const processedData = useMemo(() => {
    if (groupBy === 'none') return filteredVeiculos;

    return filteredVeiculos.reduce((acc: { [key: string]: IVeiculo[] }, v) => {
      let key = 'Outros';
      const vFull = v as any;

      if (groupBy === 'montadora') {
        key = vFull.montadora?.nome || 'Sem Montadora';
      } else if (groupBy === 'tipo') {
        // Tenta pegar nome do tipo pelo join ou busca na lista auxiliar
        key = vFull.tipo_veiculo?.nome || 
              tipos.find(t => t.id === v.tipo_veiculo_id)?.nome || 
              'Sem Categoria';
      }

      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    }, {});
  }, [filteredVeiculos, groupBy, tipos]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Estoque de Veículos</h1>
          <div className="flex items-center space-x-2 mt-1">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <p className="text-slate-500 text-sm">Visão geral do inventário e disponibilidade.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/estoque/novo')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center active:scale-95"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Veículo
        </button>
      </div>

      {/* Componente de KPIs (Cards de Topo) */}
      <EstoqueKpis veiculos={filteredVeiculos} />

      {/* Barra de Filtros e Controles */}
      <EstoqueFilters 
        montadoras={montadoras}
        tipos={tipos}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterMontadora={filterMontadora}
        setFilterMontadora={setFilterMontadora}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />

      {/* Listagem Principal */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">Carregando pátio...</p>
        </div>
      ) : (
        <EstoqueList 
          groupedData={processedData}
          isGrouped={groupBy !== 'none'}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
};

export default EstoquePage;
