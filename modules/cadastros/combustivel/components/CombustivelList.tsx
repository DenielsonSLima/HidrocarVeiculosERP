
import React from 'react';
import { ICombustivel } from '../combustivel.types';

interface Props {
  items: ICombustivel[];
  onEdit: (item: ICombustivel) => void;
  onDelete: (id: string) => void;
}

const CombustivelList: React.FC<Props> = ({ items, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="group relative bg-slate-50 p-3 sm:p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-12 w-full">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 shrink-0">
               <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
            </div>
            <span className="font-bold text-slate-700 uppercase text-[10px] sm:text-xs truncate tracking-tighter leading-tight">
              {item.nome}
            </span>
          </div>
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-100 shadow-sm">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Excluir"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CombustivelList;
