
import React from 'react';

const WelcomeHeader: React.FC = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">HCV Operating System v4.0</p>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
          {greeting}, <span className="text-indigo-600 not-italic">Administrador</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">Sua central de inteligência para gestão automotiva está pronta.</p>
      </div>
    </div>
  );
};

export default WelcomeHeader;
