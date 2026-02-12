
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CidadesService } from './cidades.service';
import { ICidade, ICidadesAgrupadas } from './cidades.types';
import CidadesList from './components/CidadesList';
import CidadeForm from './components/CidadeForm';
import CidadesKpis from './components/CidadesKpis';

const CidadesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cidades, setCidades] = useState<ICidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCidade, setEditingCidade] = useState<ICidade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await CidadesService.getAll();
    setCidades(data);
    setLoading(false);
  };

  // Lógica de Agrupamento e Ordenação
  const agrupadas = useMemo(() => {
    // 1. Filtragem
    const filtered = cidades.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.uf.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Agrupamento
    const groups = filtered.reduce((acc: ICidadesAgrupadas, cidade) => {
      const uf = cidade.uf.toUpperCase(); // Garante consistência (SP, sp, Sp -> SP)
      if (!acc[uf]) acc[uf] = [];
      acc[uf].push(cidade);
      return acc;
    }, {});

    // 3. Ordenação das Cidades dentro de cada UF
    Object.keys(groups).forEach(uf => {
      groups[uf].sort((a, b) => a.nome.localeCompare(b.nome));
    });

    return groups;
  }, [cidades, searchTerm]);

  const handleOpenAdd = () => {
    setEditingCidade(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cidade: ICidade) => {
    setEditingCidade(cidade);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta cidade?')) {
      await CidadesService.remove(id);
      loadData();
    }
  };

  const handleSubmit = async (data: Partial<ICidade>) => {
    try {
      await CidadesService.save(data);
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      alert('Erro ao salvar cidade');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Cidades e Estados</h1>
          <p className="text-slate-500 mt-1">Gerencie a base territorial agrupada por UF.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center active:scale-95"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Cidade
        </button>
      </div>

      <CidadesKpis cidades={cidades} />

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 min-h-[500px]">
        <div className="mb-10 relative max-w-md">
           <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Filtrar por cidade ou sigla do estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold"
          />
        </div>

        <CidadesList 
          agrupadas={agrupadas} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      {isFormOpen && (
        <CidadeForm 
          initialData={editingCidade}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default CidadesPage;
