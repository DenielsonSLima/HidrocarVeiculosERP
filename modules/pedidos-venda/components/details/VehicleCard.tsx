
import React from 'react';
import { IVeiculo } from '../../../estoque/estoque.types';

interface Props {
  veiculo?: IVeiculo | null;
}

const VehicleCard: React.FC<Props> = ({ veiculo }) => {
  if (!veiculo) {
    return (
      <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center shadow-sm">
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum veículo vinculado.</p>
      </div>
    );
  }

  const v = veiculo as any;
  const capaUrl = v?.fotos?.find((f: any) => f.is_capa)?.url || v?.fotos?.[0]?.url;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-left-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-12">
         <div className="md:col-span-4 h-56 md:h-auto bg-slate-900 relative">
            {capaUrl ? (
              <img src={capaUrl} className="w-full h-full object-cover" alt="Veículo" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700 uppercase font-black text-[10px]">Sem Foto</div>
            )}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-black uppercase shadow-xl border border-white/50">
              {veiculo.placa || 'SEM PLACA'}
            </div>
         </div>
         <div className="md:col-span-8 p-8">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{v.montadora?.nome}</p>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{v.modelo?.nome}</h2>
            <p className="text-sm font-medium text-slate-500 mb-6">{v.versao?.nome}</p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">KM</p>
                  <p className="text-xs font-bold text-slate-800">{veiculo.km?.toLocaleString() || '0'} km</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Câmbio</p>
                  <p className="text-xs font-bold text-slate-800 uppercase">{veiculo.transmissao}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Motor</p>
                  <p className="text-xs font-bold text-slate-800">{veiculo.motorizacao}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Ano/Mod</p>
                  <p className="text-xs font-bold text-slate-800">{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default VehicleCard;
