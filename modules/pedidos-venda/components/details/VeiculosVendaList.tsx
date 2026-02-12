
import React, { useState } from 'react';
import { IPedidoVenda } from '../../pedidos-venda.types';
import { IVeiculo } from '../../../estoque/estoque.types';
import VehicleInSaleCard from './vehicle-card/VehicleInSaleCard';
import { EstoqueService } from '../../../estoque/estoque.service';

interface Props {
  pedido: IPedidoVenda;
  veiculosDisponiveis: IVeiculo[];
  onLink: (id: string) => void;
  onUnlink: (id: string) => void;
  isConcluido: boolean;
}

const VeiculosVendaList: React.FC<Props> = ({ pedido, veiculosDisponiveis, onLink, onUnlink, isConcluido }) => {
  const [showSelector, setShowSelector] = useState(false);
  
  const veiculosList = (pedido as any).veiculos || (pedido.veiculo ? [pedido.veiculo] : []);

  const handleUpdatePrice = async (vId: string, newPrice: number) => {
    try {
      // O preço de venda é alterado no cadastro do veículo para refletir na rentabilidade do lote
      await EstoqueService.save({ id: vId, valor_venda: newPrice });
      // O PedidoVendaDetalhes atualizará os dados via Realtime
    } catch (e) {
      alert("Erro ao atualizar preço negociado.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2M7 7h10" /></svg>
          Produtos no Pedido ({veiculosList.length})
        </h3>
        
        {!isConcluido && (
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showSelector ? 'bg-slate-200 text-slate-600' : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
            }`}
          >
            {showSelector ? 'Cancelar Adição' : 'Adicionar Outro Veículo'}
          </button>
        )}
      </div>

      {showSelector && !isConcluido && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 ml-1 tracking-widest">Buscar Veículo em Estoque</label>
          <div className="relative">
            <select 
              autoFocus
              onChange={(e) => {
                if (e.target.value) {
                  onLink(e.target.value);
                  setShowSelector(false);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
            >
              <option value="">Clique para buscar...</option>
              {veiculosDisponiveis.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.montadora?.nome} {v.modelo?.nome} • {v.placa} ({v.ano_modelo})
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      )}

      {veiculosList.length === 0 && !showSelector && (
         <div 
          onClick={() => !isConcluido && setShowSelector(true)}
          className="bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-200 p-16 text-center cursor-pointer hover:bg-indigo-50/10 transition-all group"
        >
            <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Nenhum veículo vinculado</h4>
            <p className="text-slate-500 text-sm mt-2">Clique aqui para adicionar o primeiro item desta venda.</p>
         </div>
      )}

      <div className="flex flex-col gap-6">
        {veiculosList.map((v: any) => (
          <VehicleInSaleCard 
            key={v.id} 
            veiculo={v} 
            isConcluido={isConcluido} 
            onUnlink={() => onUnlink(v.id)} 
            onUpdatePrice={(newPrice) => handleUpdatePrice(v.id, newPrice)}
          />
        ))}
      </div>
    </div>
  );
};

export default VeiculosVendaList;
