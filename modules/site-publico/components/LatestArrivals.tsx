
import React from 'react';
import { IVeiculo } from '../../estoque/estoque.types';
import PublicVehicleCard from './PublicVehicleCard';

interface Props {
  veiculos: IVeiculo[];
}

const LatestArrivals: React.FC<Props> = ({ veiculos }) => {
  return (
    <section id="estoque" className="py-28 bg-[#f8fafc] relative overflow-hidden">
      {/* Elemento visual decorativo para diferenciar o fundo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-[#004691] text-[10px] font-[900] uppercase tracking-[0.6em] mb-2">Check-in de Novos Ativos</p>
            <h2 className="text-5xl font-[900] text-slate-900 uppercase tracking-tighter">Recém Chegados</h2>
          </div>
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#004691] hover:text-white hover:border-[#004691] transition-all shadow-sm active:scale-95">
            Ver Estoque Completo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {veiculos.slice(0, 4).map((v) => (
            <div key={v.id} className="animate-in fade-in zoom-in-95 duration-700">
              <PublicVehicleCard 
                veiculo={v} 
                onClick={() => {}} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestArrivals;
