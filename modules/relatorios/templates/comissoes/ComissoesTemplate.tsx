import React from 'react';
import BaseReportLayout from '../BaseReportLayout';

interface Props {
  empresa: any;
  watermark: any;
  data: any;
}

const ComissoesTemplate: React.FC<Props> = ({ empresa, watermark, data }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <BaseReportLayout 
      empresa={empresa} 
      watermark={watermark} 
      title="Relatório de Comissões"
      subtitle={`Período: ${data.periodo || 'Geral'}`}
    >
      <div className="space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Vendas</p>
              <p className="text-lg font-black text-slate-900">{data.totalVendas || 0}</p>
           </div>
           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Volume Vendido</p>
              <p className="text-lg font-black text-emerald-700">{formatCur(data.volumeVendido || 0)}</p>
           </div>
           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Comissões</p>
              <p className="text-lg font-black text-indigo-700">{formatCur(data.totalComissoes || 0)}</p>
           </div>
           <div className="bg-slate-900 p-4 rounded-xl text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Comissão Média</p>
              <p className="text-lg font-black">{data.comissaoMedia || '0'}%</p>
           </div>
        </div>

        {/* Resumo por Corretor */}
        {(data.resumoCorretores || []).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
              <h3 className="text-[9px] font-black text-indigo-900 uppercase tracking-[0.2em]">Resumo por Corretor</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(data.resumoCorretores || []).map((c: any, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                  <p className="text-[9px] font-black text-slate-800 uppercase mb-1">{c.nome}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-bold text-slate-400 uppercase">{c.vendas} venda{c.vendas !== 1 ? 's' : ''}</span>
                    <span className="text-[10px] font-black text-indigo-600">{formatCur(c.comissaoTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela Detalhada */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Detalhamento por Venda</span>
          </div>
          <table className="w-full text-left border-collapse text-[9px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                <th className="px-3 py-2.5 font-black uppercase text-slate-500">Data</th>
                <th className="px-3 py-2.5 font-black uppercase text-slate-500">Nº Venda</th>
                <th className="px-3 py-2.5 font-black uppercase text-slate-500">Veículo</th>
                <th className="px-3 py-2.5 font-black uppercase text-slate-500">Corretor</th>
                <th className="px-3 py-2.5 font-black uppercase text-slate-500 text-right">Vlr. Venda</th>
                <th className="px-3 py-2.5 font-black uppercase text-slate-500 text-right">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-3 py-2">{item.data}</td>
                  <td className="px-3 py-2 font-bold text-indigo-600">{item.numeroVenda}</td>
                  <td className="px-3 py-2 font-bold uppercase text-slate-800">{item.veiculo}</td>
                  <td className="px-3 py-2 uppercase text-slate-500">{item.corretor}</td>
                  <td className="px-3 py-2 text-right">{formatCur(item.valorVenda)}</td>
                  <td className="px-3 py-2 text-right font-black text-indigo-600">{formatCur(item.comissao)}</td>
                </tr>
              ))}
              {(data.items || []).length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-[9px] text-slate-400 italic">Nenhuma venda com comissão no período</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Nota Legal */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
          <p className="text-[8px] text-slate-400 font-medium italic leading-relaxed">
            * Os valores de comissão são calculados com base no percentual cadastrado para cada corretor na venda. Valores sujeitos a ajuste conforme termos contratuais vigentes.
          </p>
        </div>
      </div>
    </BaseReportLayout>
  );
};

export default ComissoesTemplate;
