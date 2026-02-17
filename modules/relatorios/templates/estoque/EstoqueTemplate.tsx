import React from 'react';
import BaseReportLayout from '../BaseReportLayout';

interface Props {
  empresa: any;
  watermark: any;
  data: any;
}

const EstoqueTemplate: React.FC<Props> = ({ empresa, watermark, data }) => {
  const formatCur = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <BaseReportLayout 
      empresa={empresa} 
      watermark={watermark} 
      title="Inventário de Estoque Físico"
      subtitle="Posição Analítica de Ativos"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidades em Pátio</p>
              <p className="text-lg font-black text-slate-900">{data.totalUnidades || 0}</p>
           </div>
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital Imobilizado</p>
              <p className="text-lg font-black text-indigo-600">{formatCur(data.valorTotalCusto || 0)}</p>
           </div>
           <div className="bg-slate-900 p-4 rounded-xl text-white">
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Potencial de Venda (VGV)</p>
              <p className="text-lg font-black">{formatCur(data.valorTotalVenda || 0)}</p>
           </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-[9px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 uppercase text-slate-500 font-black">
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Descrição do Ativo</th>
                <th className="px-4 py-3">Ano</th>
                <th className="px-4 py-3">Cor</th>
                <th className="px-4 py-3 text-right">Custo Base</th>
                <th className="px-4 py-3 text-right">Preço Sugerido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.items || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Nenhum veículo encontrado no estoque
                  </td>
                </tr>
              ) : (data.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-mono font-black">{item.placa}</td>
                  <td className="px-4 py-3 font-bold uppercase">{item.modelo} {item.versao}</td>
                  <td className="px-4 py-3">{item.ano}</td>
                  <td className="px-4 py-3 uppercase">{item.cor}</td>
                  <td className="px-4 py-3 text-right">{formatCur(item.custo)}</td>
                  <td className="px-4 py-3 text-right font-black text-indigo-600">{formatCur(item.venda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaseReportLayout>
  );
};

export default EstoqueTemplate;