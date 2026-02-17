
import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickShortcuts: React.FC = () => {
  const navigate = useNavigate();

  const links = [
    { label: 'Novo Veículo', path: '/estoque/novo', color: 'indigo', icon: 'M12 4v16m8-8H4' },
    { label: 'Nova Venda', path: '/pedidos-venda/novo', color: 'emerald', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { label: 'Novo Parceiro', path: '/parceiros/novo', color: 'blue', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { label: 'Financeiro', path: '/financeiro', color: 'rose', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>

      <div className="relative z-10">
        <h3 className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-6">Acesso Rápido</h3>

        <div className="grid grid-cols-2 gap-4">
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all group aspect-square text-center"
            >
              <div className={`w-10 h-10 rounded-xl bg-${link.color}-500/20 text-${link.color}-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
              </div>
              <span className="text-[10px] font-black text-white/90 uppercase tracking-wider leading-tight">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickShortcuts;
