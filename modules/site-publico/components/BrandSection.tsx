
import React, { useRef } from 'react';
import { IMontadoraPublic } from '../site-publico.types';

interface Props {
  montadoras: IMontadoraPublic[];
}

const BrandSection: React.FC<Props> = ({ montadoras }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Se não houver marcas com estoque, a seção nem é renderizada para manter o site limpo
  if (!montadoras || montadoras.length === 0) return null;

  return (
    <section className="py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[#004691] text-[9px] font-black uppercase tracking-[0.6em] mb-1.5">Navegue por fabricante</p>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Marcas em Destaque</h2>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#004691] hover:text-white transition-all shadow-sm active:scale-90 group"
             >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg>
             </button>
             <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#004691] hover:text-white transition-all shadow-sm active:scale-90 group"
             >
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg>
             </button>
          </div>
        </div>

        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex items-center gap-5 overflow-x-auto scrollbar-hide pb-8 pt-2 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {montadoras.map((m) => (
              <div 
                key={m.id} 
                className="min-w-[180px] md:min-w-[220px] snap-start group bg-white border border-slate-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] hover:border-[#004691] hover:shadow-xl transition-all duration-500 cursor-pointer relative"
              >
                {/* Badge de Quantidade - Removido o nome 'CARROS' para evitar redundância */}
                <div className="absolute top-4 right-4 bg-[#004691] text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-blue-400/20 flex flex-col items-center leading-none">
                  <span>{m.total_veiculos}</span>
                  <span className="text-[6px] opacity-60 mt-0.5">UNID.</span>
                </div>

                <div className="h-16 w-full flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-500">
                  {m.logo_url ? (
                    <img src={m.logo_url} className="max-h-full max-w-full object-contain" alt={m.nome} />
                  ) : (
                    <span className="text-2xl font-black text-slate-300">{m.nome.charAt(0)}</span>
                  )}
                </div>
                
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3">{m.nome}</h4>
                <div className="w-8 h-0.5 bg-slate-100 group-hover:bg-[#004691] group-hover:w-16 transition-all rounded-full"></div>
              </div>
            ))}
          </div>
          
          <div className="absolute right-0 top-0 bottom-8 w-14 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
          <div className="absolute left-0 top-0 bottom-8 w-14 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
