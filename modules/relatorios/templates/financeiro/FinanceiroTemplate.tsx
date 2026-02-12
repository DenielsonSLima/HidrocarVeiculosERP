import React from 'react';
import BaseReportLayout from '../BaseReportLayout';

interface Props {
  empresa: any;
  watermark: any;
  data: any;
}

const FinanceiroTemplate: React.FC<Props> = ({ empresa, watermark, data }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <BaseReportLayout 
      empresa={empresa} 
      watermark={watermark} 
      title="Extrato de Movimentação Financeira"
      subtitle={`Período: ${data.periodo || 'Mensal'}`}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Entradas</p>
              <p className="text-lg font-black text-emerald-700">{formatCur(data.totalEntradas || 0)}</p>
           </div>
           <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Saídas</p>
              <p className="text-lg font-black text-rose-700">{formatCur(data.totalSaidas || 0)}</p>
           </div>
           <div className="bg-slate-900 p-4 rounded-xl text-white">
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Saldo Líquido</p>
              <p className="text-lg font-black">{formatCur((data.totalEntradas || 0) - (data.totalSaidas || 0))}</p>
           </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 uppercase text-slate-500 font-black">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição / Lançamento</th>
                <th className="px-4 py-3">Conta</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3">{item.data}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase">{item.descricao}</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-tighter">{item.categoria}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.conta}</td>
                  <td className={`px-4 py-3 text-right font-black ${item.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.tipo === 'SAIDA' ? '-' : '+'} {formatCur(item.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaseReportLayout>
  );
};

export default FinanceiroTemplate;