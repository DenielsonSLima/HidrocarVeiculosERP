
import React from 'react';
import { IPedidoCompra } from '../../pedidos-compra.types';

interface Props {
  pedido: IPedidoCompra;
}

const InfoNegociacaoHeader: React.FC<Props> = ({ pedido }) => {
  const p = pedido.fornecedor;
  const c = pedido.corretor;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* PARCEIRO / FORNECEDOR */}
        <div className="lg:col-span-8 p-8 border-r border-slate-50">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
              {p?.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Origem / Parceiro</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{p?.documento || 'Sem Documento'}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter truncate mb-4">
                {p?.nome || 'NÃO IDENTIFICADO'}
              </h2>
              
              <div className="flex flex-wrap gap-y-2 gap-x-8 text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                   <span className="uppercase">{p?.logradouro}, {p?.numero} - {p?.bairro}</span>
                </div>
                <div className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <span className="uppercase text-indigo-600 font-black">{p?.cidade} / {p?.uf}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CORRETOR */}
        <div className="lg:col-span-4 p-8 bg-slate-50/50 flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm shrink-0">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Intermediação</p>
              <h4 className="text-sm font-black text-slate-800 uppercase truncate">
                {c ? `${c.nome} ${c.sobrenome}` : 'VENDA DIRETA / SEM CORRETOR'}
              </h4>
              {c && <p className="text-[10px] font-mono text-slate-400 font-bold mt-0.5">CPF: {c.cpf}</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoNegociacaoHeader;
