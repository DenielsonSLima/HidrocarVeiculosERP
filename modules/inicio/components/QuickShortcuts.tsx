
import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickShortcuts: React.FC = () => {
  const navigate = useNavigate();

  const links = [
    { label: 'Novo Veículo', path: '/estoque/novo', color: 'indigo', icon: 'M12 4v16m8-8H4' },
    { label: 'Venda Rápida', path: '/pedidos-venda/novo', color: 'emerald', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { label: 'Financeiro', path: '/financeiro', color: 'rose', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
      <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8">Ações Recomendadas</h3>
      <div className="space-y-4">
        {links.map((link, i) => (
          <button
            key={i}
            onClick={() => navigate(link.path)}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl bg-${link.color}-500/20 text-${link.color}-400 flex items-center justify-center`}>
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={link.icon} />
                 </svg>
              </div>
              <span className="text-sm font-black text-white uppercase tracking-widest">{link.label}</span>
            </div>
            <svg className="w-4 h-4 text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickShortcuts;
