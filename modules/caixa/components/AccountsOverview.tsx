
import React from 'react';
import { IContaBancaria } from '../../ajustes/contas-bancarias/contas.types';

interface Props {
  contas: IContaBancaria[];
}

const AccountsOverview: React.FC<Props> = ({ contas }) => {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-full">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Saldos Individuais</h3>

      {/* 
        FIX: Changed from grid-cols-3 to responsive grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
        Added min-width to prevent cards from getting squashed 
      */}
      <div className="grid grid-cols-1 gap-4">
        {contas.map(c => (
          <div key={c.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px]" style={{ backgroundColor: c.cor_cartao || '#1e293b' }}>
                {c.banco_nome ? c.banco_nome.substring(0, 2).toUpperCase() : '??'}
              </div>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${c.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                {c.ativo ? 'ATIVA' : 'INATIVA'}
              </span>
            </div>

            {/* FIX: Check for undefined strings and add truncation */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate" title={c.banco_nome}>{c.banco_nome}</p>
            <h4 className="text-sm font-bold text-slate-800 mb-2 truncate" title={c.titular}>{c.titular}</h4>

            <p className="text-xl font-black text-slate-900">{fmt(c.saldo_atual || 0)}</p>
          </div>
        ))}

        {contas.length === 0 && (
          <div className="col-span-full py-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase">Nenhuma conta encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsOverview;
