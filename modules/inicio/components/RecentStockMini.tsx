
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  veiculos: any[];
}

const RecentStockMini: React.FC<Props> = ({ veiculos }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Últimas Entradas</h3>
        <button onClick={() => navigate('/estoque')} className="text-[10px] font-black text-indigo-600 hover:underline uppercase">Ver Tudo</button>
      </div>

      <div className="space-y-4">
        {veiculos.length === 0 ? (
          <div className="py-10 text-center text-slate-300 italic text-xs">Aguardando novos registros...</div>
        ) : (
          veiculos.map(v => (
            <div 
              key={v.id} 
              onClick={() => navigate(`/estoque/${v.id}`)}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:border-indigo-100 border border-transparent transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 overflow-hidden p-1 shadow-sm shrink-0">
                  {v.fotos?.[0] ? <img src={v.fotos[0].url} className="w-full h-full object-cover rounded-lg" /> : <div className="w-full h-full bg-slate-50"></div>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 uppercase truncate">{v.montadora?.nome} {v.modelo?.nome}</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{v.placa}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentStockMini;
