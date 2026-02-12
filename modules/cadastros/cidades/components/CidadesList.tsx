
import React from 'react';
import { ICidade, ICidadesAgrupadas } from '../cidades.types';

interface ListProps {
  agrupadas: ICidadesAgrupadas;
  loading: boolean;
  onEdit: (c: ICidade) => void;
  onDelete: (id: string) => void;
}

// Mapa auxiliar para nomes completos (Opcional, mas melhora a UI)
const UFNames: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
};

const CidadesList: React.FC<ListProps> = ({ agrupadas, loading, onEdit, onDelete }) => {
  // Garante a ordenação alfabética dos estados
  const ufs = Object.keys(agrupadas).sort();

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Carregando mapa territorial...</p>
      </div>
    );
  }

  if (ufs.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-200">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <h3 className="text-slate-900 font-bold text-lg">Nenhuma cidade encontrada</h3>
        <p className="text-slate-400 text-sm mt-1">Utilize o botão "Nova Cidade" para começar o cadastro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {ufs.map(uf => (
        <div key={uf} className="animate-in slide-in-from-bottom-4 duration-500">
          {/* Header do Estado */}
          <div className="flex items-center space-x-4 mb-6 sticky top-0 bg-white/95 backdrop-blur-sm py-4 z-10 border-b border-slate-100">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 shrink-0">
              {uf}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {UFNames[uf] || uf}
              </h3>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">
                {agrupadas[uf].length} {agrupadas[uf].length === 1 ? 'Município Cadastrado' : 'Municípios Cadastrados'}
              </p>
            </div>
          </div>

          {/* Grid de Cidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agrupadas[uf].map(cidade => (
              <div 
                key={cidade.id} 
                className="group bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="min-w-0 pr-2">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors" title={cidade.nome}>
                    {cidade.nome}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[9px] font-black text-slate-500 font-mono">
                      {uf}
                    </span>
                  </div>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1 shrink-0 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                  <button 
                    onClick={() => onEdit(cidade)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDelete(cidade.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CidadesList;
