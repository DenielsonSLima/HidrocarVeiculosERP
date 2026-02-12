
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Buscar em todo o sistema..."
            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notificações */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        {/* Perfil Simplificado */}
        <div className="flex items-center space-x-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">Admin Nexus</p>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Acesso Gestor</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm border border-indigo-100 shadow-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
