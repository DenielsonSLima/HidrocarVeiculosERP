import React from 'react';
import BaseReportLayout from '../BaseReportLayout';

interface Props {
  empresa: any;
  watermark: any;
  data: any;
}

const FinanceiroTemplate: React.FC<Props> = ({ empresa, watermark, data }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const saldoLiquido = (data.totalEntradas || 0) - (data.totalSaidas || 0);

  const entradas = (data.items || []).filter((i: any) => i.tipo === 'ENTRADA');
  const saidas = (data.items || []).filter((i: any) => i.tipo === 'SAIDA');

  return (
    <BaseReportLayout 
      empresa={empresa} 
      watermark={watermark} 
      title="Extrato de Movimentação Financeira"
      subtitle={`Período: ${data.periodo || 'Geral'}`}
    >
      <div className="space-y-8">
        {/* KPIs Superiores */}
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Entradas</p>
              <p className="text-lg font-black text-emerald-700">{formatCur(data.totalEntradas || 0)}</p>
              {data.entradasRealizadas !== undefined && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[7px] font-bold text-emerald-500 uppercase">Realizado: {formatCur(data.entradasRealizadas)}</span>
                  <span className="text-[7px] font-bold text-emerald-400 uppercase">Previsto: {formatCur(data.aReceber || 0)}</span>
                </div>
              )}
           </div>
           <div className="bg-rose-50 p-4 rounded-xl border border-rose-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Saídas</p>
              <p className="text-lg font-black text-rose-700">{formatCur(data.totalSaidas || 0)}</p>
              {data.saidasRealizadas !== undefined && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[7px] font-bold text-rose-500 uppercase">Realizado: {formatCur(data.saidasRealizadas)}</span>
                  <span className="text-[7px] font-bold text-rose-400 uppercase">Pendente: {formatCur(data.aPagar || 0)}</span>
                </div>
              )}
           </div>
           <div className="bg-slate-900 p-4 rounded-xl text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Saldo Líquido</p>
              <p className={`text-lg font-black ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{saldoLiquido > 0 ? '+' : ''}{formatCur(saldoLiquido)}</p>
           </div>
        </div>

        {/* Tabela Dupla - Entradas e Saídas */}
        <div className="grid grid-cols-2 gap-4">
           {/* Coluna Entradas */}
           <div className="border border-emerald-200 rounded-2xl overflow-hidden">
             <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                 <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider">Receitas ({entradas.length})</span>
               </div>
               <span className="text-[8px] font-black text-emerald-600">{formatCur(entradas.reduce((a: number, i: any) => a + i.valor, 0))}</span>
             </div>
             <table className="w-full text-left border-collapse text-[9px]">
               <tbody className="divide-y divide-emerald-50">
                 {entradas.slice(0, 20).map((item: any, i: number) => (
                   <tr key={i}>
                     <td className="px-3 py-1.5">
                       <span className="font-bold text-slate-800 block uppercase">{item.descricao}</span>
                       <span className="text-[8px] text-slate-400">{item.data} • {item.conta}</span>
                     </td>
                     <td className="px-3 py-1.5 text-right font-black text-emerald-600 whitespace-nowrap">+{formatCur(item.valor)}</td>
                   </tr>
                 ))}
                 {entradas.length === 0 && (
                   <tr><td colSpan={2} className="px-3 py-4 text-center text-[9px] text-slate-400 italic">Nenhuma receita no período</td></tr>
                 )}
                 {entradas.length > 20 && (
                   <tr><td colSpan={2} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{entradas.length - 20} mais registros...</td></tr>
                 )}
               </tbody>
             </table>
           </div>

           {/* Coluna Saídas */}
           <div className="border border-rose-200 rounded-2xl overflow-hidden">
             <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                 <span className="text-[9px] font-black text-rose-800 uppercase tracking-wider">Despesas ({saidas.length})</span>
               </div>
               <span className="text-[8px] font-black text-rose-600">{formatCur(saidas.reduce((a: number, i: any) => a + i.valor, 0))}</span>
             </div>
             <table className="w-full text-left border-collapse text-[9px]">
               <tbody className="divide-y divide-rose-50">
                 {saidas.slice(0, 20).map((item: any, i: number) => (
                   <tr key={i}>
                     <td className="px-3 py-1.5">
                       <span className="font-bold text-slate-800 block uppercase">{item.descricao}</span>
                       <span className="text-[8px] text-slate-400">{item.data} • {item.conta}</span>
                     </td>
                     <td className="px-3 py-1.5 text-right font-black text-rose-600 whitespace-nowrap">-{formatCur(item.valor)}</td>
                   </tr>
                 ))}
                 {saidas.length === 0 && (
                   <tr><td colSpan={2} className="px-3 py-4 text-center text-[9px] text-slate-400 italic">Nenhuma despesa no período</td></tr>
                 )}
                 {saidas.length > 20 && (
                   <tr><td colSpan={2} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{saidas.length - 20} mais registros...</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Tabela Completa Alternativa */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Extrato Consolidado — {(data.items || []).length} lançamentos</span>
          </div>
          <table className="w-full text-left border-collapse text-[9px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                <th className="px-3 py-2 font-black uppercase text-slate-500">Data</th>
                <th className="px-3 py-2 font-black uppercase text-slate-500">Descrição / Lançamento</th>
                <th className="px-3 py-2 font-black uppercase text-slate-500">Conta</th>
                <th className="px-3 py-2 font-black uppercase text-slate-500">Status</th>
                <th className="px-3 py-2 font-black uppercase text-slate-500 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.items || []).slice(0, 40).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-3 py-2">{item.data}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase text-slate-800">{item.descricao}</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-tighter">{item.categoria}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{item.conta}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                      item.status === 'REALIZADO' ? 'bg-emerald-50 text-emerald-600' :
                      item.status === 'ATRASADO' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>{item.status}</span>
                  </td>
                  <td className={`px-3 py-2 text-right font-black ${item.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.tipo === 'SAIDA' ? '-' : '+'} {formatCur(item.valor)}
                  </td>
                </tr>
              ))}
              {(data.items || []).length > 40 && (
                <tr><td colSpan={5} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{(data.items || []).length - 40} registros adicionais não exibidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </BaseReportLayout>
  );
};

export default FinanceiroTemplate;