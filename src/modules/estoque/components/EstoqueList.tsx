
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IVeiculo } from '../estoque.types';

interface Props {
  groupedData: { [key: string]: IVeiculo[] } | IVeiculo[];
  isGrouped: boolean;
  onDelete: (id: string) => void;
}

const VeiculoCard: React.FC<{ veiculo: IVeiculo; onClick: () => void }> = ({ veiculo, onClick }) => {
  const capa = veiculo.fotos?.find(f => f.is_capa) || veiculo.fotos?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'bg-emerald-500 shadow-emerald-200';
      case 'RESERVADO': return 'bg-amber-500 shadow-amber-200';
      case 'VENDIDO': return 'bg-rose-500 shadow-rose-200';
      case 'PREPARACAO': return 'bg-indigo-500 shadow-indigo-200';
      default: return 'bg-slate-400 shadow-slate-200';
    }
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Imagem */}
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {capa ? (
          <img
            src={capa.url.includes('supabase.co/storage') ? `${capa.url}?width=600&quality=80` : capa.url}
            alt={veiculo.placa}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Sem Foto</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${getStatusColor(veiculo.status)}`}>
            {veiculo.status}
          </div>
        </div>

        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm uppercase">
            {veiculo.placa || 'SEM PLACA'}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{veiculo.km.toLocaleString()} km</span>
          </div>

          <h4 className="font-black text-slate-900 text-lg leading-tight line-clamp-2 uppercase tracking-tighter">
            {(veiculo as any).montadora?.nome} {(veiculo as any).modelo?.nome}
          </h4>
          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {(veiculo as any).versao?.nome || 'Versão Base'}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Preço Venda</p>
            <p className="text-xl font-black text-emerald-600 tracking-tight">{formatPrice(veiculo.valor_venda)}</p>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const EstoqueList: React.FC<Props> = ({ groupedData, isGrouped, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/estoque/editar/${id}`);
  };

  if (!isGrouped) {
    const list = groupedData as IVeiculo[];
    if (list.length === 0) return <div className="text-center py-20 text-slate-400 italic">Nenhum veículo encontrado.</div>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {list.map(v => (
          <VeiculoCard key={v.id} veiculo={v} onClick={() => handleEdit(v.id)} />
        ))}
      </div>
    );
  }

  // Visualização Agrupada
  const groups = groupedData as { [key: string]: IVeiculo[] };
  const keys = Object.keys(groups).sort();

  if (keys.length === 0) return <div className="text-center py-20 text-slate-400 italic">Nenhum veículo encontrado.</div>;

  return (
    <div className="space-y-12">
      {keys.map(groupName => (
        <div key={groupName} className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center space-x-4 mb-6 sticky top-20 bg-slate-50/90 backdrop-blur-sm py-3 z-10 rounded-xl px-2">
            <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              {groupName} <span className="text-sm font-medium text-slate-400 ml-2">({groups[groupName].length})</span>
            </h3>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups[groupName].map(v => (
              <VeiculoCard key={v.id} veiculo={v} onClick={() => handleEdit(v.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EstoqueList;
