
import React from 'react';
import { ITransacao } from '../../../financeiro.types';

interface Props {
  transacoes: ITransacao[];
  loading: boolean;
}

const ExtratoTable: React.FC<Props> = ({ transacoes, loading }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Consolidando Lançamentos...</p>
      </div>
    );
  }

  if (transacoes.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-slate-200">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Sem movimentações no período selecionado</p>
      </div>
    );
  }

  const getTransactionLabel = (t: any) => {
    if (t.tipo_transacao === 'SALDO_INICIAL') return 'Abertura de Caixa';
    if (t.tipo_transacao === 'RETIRADA_SOCIO') return 'Retirada Sócio';
    if (t.tipo_transacao?.includes('TRANSFERENCIA')) return 'Transferência Interna';
    if (t.tipo_transacao === 'RECEBIMENTO_TITULO') return 'Recebimento de Título';
    if (t.tipo_transacao === 'PAGAMENTO_TITULO') return 'Pagamento de Conta';
    return t.tipo_transacao || 'Lançamento Avulso';
  };

  const getTagColor = (t: any) => {
    if (t.tipo_transacao === 'SALDO_INICIAL') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (t.tipo === 'ENTRADA') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (t.tipo === 'SAIDA') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-8 py-5">Data Operação</th>
            <th className="px-8 py-5">Identificação do Lançamento</th>
            <th className="px-8 py-5 text-center">Forma</th>
            <th className="px-8 py-5">Conta / Carteira</th>
            <th className="px-8 py-5 text-right">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transacoes.map((t: any) => (
            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-4">
                <span className="text-xs font-bold text-slate-600">{formatDate(t.data_pagamento)}</span>
              </td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                   <div className="flex items-center space-x-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.tipo === 'ENTRADA' ? 'bg-emerald-500' : 
                        t.tipo === 'SAIDA' ? 'bg-rose-500' : 'bg-blue-500'
                      }`}></span>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
                        {t.descricao || t.titulo?.descricao}
                      </span>
                   </div>
                   <div className="mt-1 flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${getTagColor(t)}`}>
                        {getTransactionLabel(t)}
                      </span>
                   </div>
                </div>
              </td>
              <td className="px-8 py-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100">
                   {t.forma_pagamento?.nome || 'DIRETO'}
                </span>
              </td>
              <td className="px-8 py-4">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{t.conta_origem?.banco_nome}</p>
                <p className="text-[9px] text-slate-400 font-mono">CC: {t.conta_origem?.conta || '---'}</p>
              </td>
              <td className="px-8 py-4 text-right">
                <span className={`text-base font-black ${
                  t.tipo === 'ENTRADA' ? 'text-emerald-600' : 
                  t.tipo === 'SAIDA' ? 'text-rose-600' : 'text-blue-600'
                }`}>
                  {t.tipo === 'SAIDA' ? '-' : t.tipo === 'ENTRADA' ? '+' : ''} {formatCurrency(t.valor)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtratoTable;
