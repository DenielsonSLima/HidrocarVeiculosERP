
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  veiculos: any[];
}

const RecentStockMini: React.FC<Props> = ({ veiculos }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Últimas Entradas</h3>
        <button onClick={() => navigate('/estoque')} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 hover:underline uppercase tracking-wider">Ver Estoque Completo</button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {veiculos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nenhum veículo recente</p>
          </div>
        ) : (
          veiculos.map(v => (
            <div
              key={v.id}
              onClick={() => navigate(`/estoque/${v.id}`)}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
            >
              <div className="w-16 h-12 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm shrink-0 relative">
                {v.fotos?.[0] ? (
                  <img src={v.fotos[0].url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase truncate">{v.montadora?.nome} {v.modelo?.nome}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{v.verso?.nome || 'Base'}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{v.placa}</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentStockMini;
