import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IVeiculo } from '../../estoque/estoque.types';
import { ICor } from '../../cadastros/cores/cores.types';

interface Props {
  veiculo: IVeiculo;
  cores?: ICor[];
  onClick?: () => void;
}

const PublicVehicleCard: React.FC<Props> = ({ veiculo, cores = [] }) => {
  const navigate = useNavigate();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const v = veiculo as any;
  
  const fotos = veiculo.fotos || [];
  const hasPhotos = fotos.length > 0;
  const currentPhoto = hasPhotos ? fotos[activePhotoIndex] : null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 0 
  }).format(val);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % fotos.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  const handleClick = () => {
    navigate(`/veiculo/${veiculo.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-[#004691] transition-all duration-500 cursor-pointer flex flex-col h-full animate-in fade-in"
    >
      {/* 1. Mídia / Carrossel */}
      <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden shrink-0">
        {hasPhotos ? (
          <>
            <img src={currentPhoto?.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Veículo" />
            {fotos.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={handlePrev} className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[#004691] transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={handleNext} className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[#004691] transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-100">
             <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
           <div className="bg-[#004691] text-white px-4 py-1.5 rounded-full text-[8px] font-black shadow-xl border border-white/20 uppercase tracking-[0.2em]">
              Seleção HCV
           </div>
           {veiculo.km < 10000 && (
             <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black shadow-xl uppercase tracking-widest animate-pulse w-fit">
               Baixa KM
             </div>
           )}
        </div>
      </div>

      {/* 2. Conteúdo Info */}
      <div className="p-7 flex flex-col flex-1">
        <div className="mb-6 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {v.montadora?.logo_url && <img src={v.montadora.logo_url} className="h-4 w-auto object-contain opacity-60" alt="" />}
            <p className="text-[10px] font-black text-[#004691] uppercase tracking-[0.3em] truncate">{v.montadora?.nome}</p>
          </div>
          <h3 className="text-2xl font-[900] text-slate-900 uppercase tracking-tighter truncate leading-none mb-1 group-hover:text-[#004691] transition-colors">{v.modelo?.nome}</h3>
          <p className="text-xs font-medium text-slate-400 uppercase truncate tracking-tight">{v.versao?.nome}</p>
        </div>

        {/* Ficha Técnica Reestruturada */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Ano</span>
              <span className="text-xs font-black text-slate-800">{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</span>
           </div>
           <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Uso</span>
              <span className="text-xs font-black text-slate-800">{veiculo.km.toLocaleString('pt-BR')} <small className="text-[8px]">KM</small></span>
           </div>
           <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Motor</span>
              <span className="text-xs font-black text-slate-800 truncate">{veiculo.motorizacao}</span>
           </div>
           <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Câmbio</span>
              <span className="text-xs font-black text-slate-800 truncate">{veiculo.transmissao}</span>
           </div>
        </div>

        {/* 3. Preço e Ação Final */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Investimento Premium</p>
             <p className="text-3xl font-[900] text-slate-900 tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">{formatCurrency(veiculo.valor_venda)}</p>
           </div>
           
           <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:bg-[#004691] group-hover:scale-110 transition-all active:scale-95">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVehicleCard;