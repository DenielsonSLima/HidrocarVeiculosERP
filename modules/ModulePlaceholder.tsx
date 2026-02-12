import React from 'react';
// Fix: Splitting react-router-dom imports to resolve "no exported member" errors
import { useNavigate } from 'react-router-dom';

interface SubmoduleDef {
  label: string;
  path?: string;
  status: 'pronto' | 'desenvolvimento';
}

interface ModulePlaceholderProps {
  title: string;
  description?: string;
  submodules?: SubmoduleDef[];
  backPath?: string;
}

// Fix: Complete implementation of ModulePlaceholder and added export default
const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, description, submodules, backPath }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          {backPath && (
            <button 
              onClick={() => navigate(backPath)}
              className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">{title}</h1>
            {description && <p className="text-slate-500 mt-1">{description}</p>}
          </div>
        </div>
      </div>

      {submodules && submodules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {submodules.map((sub, idx) => (
            <div 
              key={idx}
              onClick={() => sub.path && navigate(sub.path)}
              className={`p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm transition-all relative overflow-hidden ${
                sub.path ? 'cursor-pointer hover:border-indigo-400 hover:shadow-xl' : 'opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                  sub.status === 'pronto' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {sub.status === 'pronto' ? 'Disponível' : 'Em Breve'}
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{sub.label}</h3>
              {sub.path && (
                <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
                  <span>Acessar Módulo</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModulePlaceholder;