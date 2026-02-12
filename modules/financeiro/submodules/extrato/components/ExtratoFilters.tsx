import React from 'react';

interface Props {
  filtros: any;
  onChange: (f: any) => void;
}

const ExtratoFilters: React.FC<Props> = ({ filtros, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-in fade-in duration-500">
       <div className="flex-1 w-full">
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">Período de Análise</label>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
             <input 
               type="date" 
               value={filtros.dataInicio} 
               onChange={e => onChange({...filtros, dataInicio: e.target.value})}
               className="bg-transparent text-xs font-bold text-slate-600 px-3 py-1.5 outline-none cursor-pointer"
             />
             <span className="text-slate-300">até</span>
             <input 
               type="date" 
               value={filtros.dataFim} 
               onChange={e => onChange({...filtros, dataFim: e.target.value})}
               className="bg-transparent text-xs font-bold text-slate-600 px-3 py-1.5 outline-none cursor-pointer"
             />
          </div>
       </div>

       <div className="w-full md:w-56">
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">Tipo Movimentação</label>
          <select 
            value={filtros.tipo} 
            onChange={e => onChange({...filtros, tipo: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
          >
             <option value="">Todas</option>
             <option value="ENTRADA">Entradas</option>
             <option value="SAIDA">Saídas</option>
             <option value="TRANSFERENCIA">Transferências</option>
          </select>
       </div>

       <button 
         onClick={() => onChange({ dataInicio: '', dataFim: '', tipo: '' })}
         className="px-6 py-2.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
       >
         Limpar
       </button>
    </div>
  );
};

export default ExtratoFilters;