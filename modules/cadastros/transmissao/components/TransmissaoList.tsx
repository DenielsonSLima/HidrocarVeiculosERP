
import React from 'react';
import { ITransmissao } from '../transmissao.types';

interface Props {
  items: ITransmissao[];
  onEdit: (item: ITransmissao) => void;
  onDelete: (id: string) => void;
}

const TransmissaoList: React.FC<Props> = ({ items, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="group relative bg-slate-50 p-3 sm:p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-12 w-full">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-500 shrink-0">
               <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

export default TransmissaoList;
