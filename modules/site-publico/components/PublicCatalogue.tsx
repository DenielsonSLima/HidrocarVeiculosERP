
import React from 'react';
import { IVeiculo } from '../../estoque/estoque.types';
import PublicVehicleCard from './PublicVehicleCard';

interface Props {
  veiculos: IVeiculo[];
}

const PublicCatalogue: React.FC<Props> = ({ veiculos }) => {
  return (
    <section id="estoque-completo" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
             <p className="text-[#004691] text-[11px] font-[900] uppercase tracking-[0.5em]">Vitrine Hidrocar</p>
             <h2 className="text-5xl md:text-6xl font-[900] text-slate-900 uppercase tracking-tighter leading-none">
                Estoque <span className="text-slate-300">Premium</span>
             </h2>
          </div>
          <div className="flex items-center space-x-6">
             <button className="text-[10px] font-black uppercase tracking-widest text-[#004691] border-b-2 border-[#004691] pb-1">Novos</button>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors pb-1">Seminovos</button>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors pb-1">Colecionáveis</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {veiculos.map((v) => (
            <PublicVehicleCard 
              key={v.id} 
              veiculo={v} 
              onClick={() => {}} 
            />
          ))}
        </div>
        
        <div className="mt-24 text-center">
           <button className="px-12 py-6 bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white hover:shadow-2xl transition-all active:scale-95">
             Explorar Catálogo Completo
           </button>
        </div>
      </div>
    </section>
  );
};

export default PublicCatalogue;
