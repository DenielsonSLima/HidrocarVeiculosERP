import React, { useState, useEffect, useMemo } from 'react';
import { SitePublicoService } from '../site-publico.service';
import { IPublicPageData } from '../site-publico.types';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import EstoquePublicoFilters from './components/EstoquePublicoFilters';
import EstoquePublicoList from './components/EstoquePublicoList';

export type SortOption = 'nome' | 'preco_asc' | 'preco_desc';
export type GroupOption = 'none' | 'montadora' | 'tipo';

const EstoquePublicoPage: React.FC = () => {
  const [data, setData] = useState<IPublicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // Estados de Exibição
  const [sortBy, setSortBy] = useState<SortOption>('nome');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');

  useEffect(() => {
    async function load() {
      try {
        const res = await SitePublicoService.getPublicData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, []);

  const filteredAndSortedVeiculos = useMemo(() => {
    if (!data) return [];
    
    // 1. Filtragem
    let result = data.veiculos.filter(v => {
      const vAny = v as any;
      const term = searchTerm.toLowerCase();
      
      const matchSearch = 
        vAny.modelo?.nome?.toLowerCase().includes(term) ||
        vAny.versao?.nome?.toLowerCase().includes(term) ||
        vAny.montadora?.nome?.toLowerCase().includes(term) ||
        vAny.placa?.toLowerCase().includes(term);

      const matchBrand = selectedBrand ? v.montadora_id === selectedBrand : true;
      
      const matchMin = minPrice !== '' ? v.valor_venda >= minPrice : true;
      const matchMax = maxPrice !== '' ? v.valor_venda <= maxPrice : true;

      return matchSearch && matchBrand && matchMin && matchMax;
    });

    // 2. Ordenação
    result.sort((a, b) => {
      if (sortBy === 'preco_asc') return a.valor_venda - b.valor_venda;
      if (sortBy === 'preco_desc') return b.valor_venda - a.valor_venda;
      
      const nameA = `${(a as any).montadora?.nome} ${(a as any).modelo?.nome}`.toLowerCase();
      const nameB = `${(b as any).montadora?.nome} ${(b as any).modelo?.nome}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [data, searchTerm, selectedBrand, minPrice, maxPrice, sortBy]);

  const processedData = useMemo(() => {
    if (groupBy === 'none') return filteredAndSortedVeiculos;

    return filteredAndSortedVeiculos.reduce((acc: { [key: string]: any[] }, v) => {
      const vAny = v as any;
      let key = 'Outros';
      if (groupBy === 'montadora') key = vAny.montadora?.nome || 'Sem Marca';
      if (groupBy === 'tipo') key = vAny.tipo_veiculo?.nome || 'Sem Categoria';
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    }, {});
  }, [filteredAndSortedVeiculos, groupBy]);

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] antialiased">
      <PublicNavbar empresa={data?.empresa || {} as any} />
      
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* SIDEBAR - FILTROS E CONTROLES DE VISÃO */}
            <aside className="w-full lg:w-80 shrink-0 space-y-10">
              <EstoquePublicoFilters 
                montadoras={data?.montadoras || []}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sortBy={sortBy}
                setSortBy={setSortBy}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
              />
            </aside>

            {/* CONTEÚDO PRINCIPAL - BUSCA E LISTAGEM */}
            <div className="flex-1 space-y-8">
              {/* Barra de Busca Refinada (Substituindo a antiga toolbar) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex-1 relative min-w-0">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-[#004691]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Pesquisar por modelo, marca ou placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#004691]/5 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="shrink-0 flex flex-col items-end px-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Resultados</p>
                   <p className="text-sm font-black text-[#004691] uppercase tracking-tighter">
                      {filteredAndSortedVeiculos.length} Veículos
                   </p>
                </div>
              </div>

              {loading ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-[#004691] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acessando pátio...</p>
                </div>
              ) : (
                <EstoquePublicoList 
                  veiculos={processedData} 
                  isGrouped={groupBy !== 'none'} 
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter empresa={data?.empresa || {} as any} />
    </div>
  );
};

export default EstoquePublicoPage;