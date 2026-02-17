import React from 'react';
import { IPerformanceData } from '../performance.types';

interface Props {
  data: IPerformanceData;
  empresa: any;
  watermark: any;
  periodo: string;
}

const PerformancePrint: React.FC<Props> = ({ data, empresa, watermark, periodo }) => {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const now = new Date();
  const r = data.resumo;

  const formatDate = (d: string) => {
    if (!d) return '-';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  };

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 relative p-12 mx-auto print-container font-sans" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>

      {/* MARCA D'ÁGUA */}
      {watermark?.logo_url && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img
            src={watermark.logo_url}
            style={{
              opacity: (watermark.opacidade || 20) / 200,
              transform: `scale(${(watermark.tamanho || 50) / 100})`,
              maxWidth: '60%',
              maxHeight: '60%',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact' as any,
            }}
            alt=""
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col">

        {/* ═══════════ CABEÇALHO DA EMPRESA ═══════════ */}
        <header className="flex items-center justify-between border-b-[3px] border-slate-900 pb-8 mb-10">
          <div className="flex items-center space-x-8">
            {empresa?.logo_url && (
              <img src={empresa.logo_url} alt="Logo" className="h-28 w-auto object-contain max-w-[200px]" />
            )}
            <div>
              <h1 className="text-2xl font-[900] text-slate-900 uppercase tracking-tighter leading-none mb-1">{empresa?.nome_fantasia || 'NOME DA EMPRESA'}</h1>
              <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{empresa?.razao_social}</span>
                <span className="w-1 h-3 border-l border-slate-300"></span>
                <span>CNPJ: {empresa?.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') || '—'}</span>
              </div>
              <div className="mt-2 text-[9px] font-medium text-slate-400 uppercase tracking-wide leading-snug">
                <p>{empresa?.logradouro}, {empresa?.numero} - {empresa?.bairro} • {empresa?.cidade}/{empresa?.uf}</p>
                <p className="mt-0.5">{empresa?.email} • {empresa?.telefone}</p>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-block bg-slate-900 text-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm mb-3" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              Relatório de Performance
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Período</p>
              <p className="text-base font-black text-slate-900 uppercase tracking-tight">{periodo}</p>
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              Emitido: {now.toLocaleDateString('pt-BR')} às {now.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </header>

        {/* ═══════════ 1. KPIs EXECUTIVOS ═══════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
            <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Resumo Executivo</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Vendas', val: r.total_vendas_valor, sub: `${r.total_vendas_qtd} un.`, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
              { label: 'Compras', val: r.total_compras_valor, sub: `${r.total_compras_qtd} un.`, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
              { label: 'Lucro Bruto', val: r.lucro_bruto, sub: `${r.margem_media.toFixed(1)}% margem`, bg: r.lucro_bruto >= 0 ? 'bg-emerald-50' : 'bg-rose-50', border: r.lucro_bruto >= 0 ? 'border-emerald-100' : 'border-rose-100', text: r.lucro_bruto >= 0 ? 'text-emerald-700' : 'text-rose-700' },
              { label: 'Ticket Médio', val: r.ticket_medio_venda, sub: 'por venda', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
            ].map((k, i) => (
              <div key={i} className={`p-3 rounded-xl border ${k.border} ${k.bg}`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                <p className={`text-sm font-[900] tracking-tight ${k.text}`}>{fmt(k.val)}</p>
                <p className="text-[7px] font-bold text-slate-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 2. FLUXO FINANCEIRO ═══════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
            <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Fluxo Financeiro</h2>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Entradas', val: r.total_entradas, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
              { label: 'Saídas', val: r.total_saidas, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' },
              { label: 'A Receber', val: r.contas_receber_pendente, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
              { label: 'A Pagar', val: r.contas_pagar_pendente, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' },
              { label: 'Saldo Contas', val: r.saldo_contas_bancarias, bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-900' },
            ].map((k, i) => (
              <div key={i} className={`p-3 rounded-xl border ${k.border} ${k.bg}`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                <p className={`text-sm font-[900] tracking-tight ${k.text}`}>{fmt(k.val)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[7px] font-black text-rose-500 uppercase tracking-widest mb-1">Despesas com Veículos</p>
              <p className="text-sm font-[900] text-rose-700">{fmt(r.despesas_veiculos)}</p>
            </div>
            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
              <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest mb-1">Retiradas Sócios</p>
              <p className="text-sm font-[900] text-amber-700">{fmt(r.retiradas_socios)}</p>
            </div>
          </div>
        </section>

        {/* ═══════════ 3. CONTAS BANCÁRIAS ═══════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
            <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Saldos Bancários</h2>
          </div>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                  <th className="pl-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Banco</th>
                  <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Tipo</th>
                  <th className="pr-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.contas_bancarias.map((c, i) => (
                  <tr key={i}>
                    <td className="pl-3 py-2 text-[9px] font-bold text-slate-700 uppercase">{c.banco_nome}</td>
                    <td className="py-2 text-[8px] font-medium text-slate-400 uppercase">{c.tipo}</td>
                    <td className={`pr-3 py-2 text-[9px] font-black text-right ${c.saldo_atual >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(c.saldo_atual)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                  <td colSpan={2} className="pl-3 py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">Total</td>
                  <td className="pr-3 py-2 text-[9px] font-black text-emerald-600 text-right">{fmt(r.saldo_contas_bancarias)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══════════ 4. VENDAS REALIZADAS ═══════════ */}
        {data.vendas.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Vendas Realizadas</h2>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">{data.vendas.length} venda{data.vendas.length !== 1 ? 's' : ''} • {fmt(r.total_vendas_valor)}</span>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                    <th className="pl-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Nº</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Data</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Cliente</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Veículo</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Custo</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Venda</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Lucro</th>
                    <th className="pr-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.vendas.slice(0, 20).map((v, i) => (
                    <tr key={i}>
                      <td className="pl-3 py-1.5 text-[9px] font-bold text-slate-500">{v.numero_venda}</td>
                      <td className="py-1.5 text-[8px] font-medium text-slate-400">{formatDate(v.data_venda)}</td>
                      <td className="py-1.5 text-[9px] font-bold text-slate-700 max-w-[100px] truncate">{v.cliente_nome}</td>
                      <td className="py-1.5">
                        <span className="text-[9px] font-bold text-slate-800 uppercase">{v.veiculo_modelo}</span>
                        <span className="text-[8px] text-slate-400 ml-1">{v.veiculo_placa}</span>
                      </td>
                      <td className="py-1.5 text-[9px] font-bold text-slate-500 text-right">{fmt(v.custo_veiculo + v.custo_servicos)}</td>
                      <td className="py-1.5 text-[9px] font-black text-indigo-600 text-right">{fmt(v.valor_venda)}</td>
                      <td className={`py-1.5 text-[9px] font-black text-right ${v.lucro_bruto >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(v.lucro_bruto)}</td>
                      <td className={`pr-3 py-1.5 text-[9px] font-black text-right ${v.margem_percent >= 10 ? 'text-emerald-600' : v.margem_percent >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>{v.margem_percent.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {data.vendas.length > 20 && (
                    <tr><td colSpan={8} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{data.vendas.length - 20} mais registros...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════ 5. COMPRAS REALIZADAS ═══════════ */}
        {data.compras.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Compras Realizadas</h2>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">{data.compras.length} compra{data.compras.length !== 1 ? 's' : ''} • {fmt(r.total_compras_valor)}</span>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                    <th className="pl-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Nº</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Data</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Fornecedor</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Veículo</th>
                    <th className="pr-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.compras.slice(0, 20).map((c, i) => (
                    <tr key={i}>
                      <td className="pl-3 py-1.5 text-[9px] font-bold text-slate-500">{c.numero_pedido}</td>
                      <td className="py-1.5 text-[8px] font-medium text-slate-400">{formatDate(c.data_compra)}</td>
                      <td className="py-1.5 text-[9px] font-bold text-slate-700">{c.fornecedor_nome}</td>
                      <td className="py-1.5">
                        <span className="text-[9px] font-bold text-slate-800 uppercase">{c.veiculo_modelo}</span>
                        <span className="text-[8px] text-slate-400 ml-1">{c.veiculo_placa}</span>
                      </td>
                      <td className="pr-3 py-1.5 text-[9px] font-black text-slate-900 text-right">{fmt(c.valor_negociado)}</td>
                    </tr>
                  ))}
                  {data.compras.length > 20 && (
                    <tr><td colSpan={5} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{data.compras.length - 20} mais registros...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════ 6. CONTAS A RECEBER / PAGAR ═══════════ */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            {/* Contas a Receber */}
            <div className="break-inside-avoid">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                  <h2 className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Contas a Receber</h2>
                </div>
                <span className="text-[8px] font-black text-emerald-600">{fmt(data.titulos_receber.reduce((s, t) => s + t.valor_total, 0))}</span>
              </div>
              <div className="rounded-xl border border-emerald-100 overflow-hidden">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-emerald-50">
                    {data.titulos_receber.slice(0, 15).map((t, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-[9px] text-slate-600">
                          <span className="font-bold text-slate-800 block max-w-[150px] truncate">{t.descricao}</span>
                          <span className="text-[8px] text-slate-400">{formatDate(t.data_vencimento)} • {t.parceiro_nome}</span>
                        </td>
                        <td className="px-3 py-1.5 text-[9px] font-black text-emerald-600 text-right">{fmt(t.valor_total)}</td>
                      </tr>
                    ))}
                    {data.titulos_receber.length === 0 && (
                      <tr><td colSpan={2} className="px-3 py-4 text-center text-[9px] text-slate-400 italic">Nenhum título a receber.</td></tr>
                    )}
                    {data.titulos_receber.length > 15 && (
                      <tr><td colSpan={2} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{data.titulos_receber.length - 15} mais...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contas a Pagar */}
            <div className="break-inside-avoid">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                  <h2 className="text-[10px] font-black text-rose-900 uppercase tracking-[0.2em]">Contas a Pagar</h2>
                </div>
                <span className="text-[8px] font-black text-rose-600">{fmt(data.titulos_pagar.reduce((s, t) => s + t.valor_total, 0))}</span>
              </div>
              <div className="rounded-xl border border-rose-100 overflow-hidden">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-rose-50">
                    {data.titulos_pagar.slice(0, 15).map((t, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-[9px] text-slate-600">
                          <span className="font-bold text-slate-800 block max-w-[150px] truncate">{t.descricao}</span>
                          <span className="text-[8px] text-slate-400">{formatDate(t.data_vencimento)} • {t.parceiro_nome}</span>
                        </td>
                        <td className="px-3 py-1.5 text-[9px] font-black text-rose-600 text-right">{fmt(t.valor_total)}</td>
                      </tr>
                    ))}
                    {data.titulos_pagar.length === 0 && (
                      <tr><td colSpan={2} className="px-3 py-4 text-center text-[9px] text-slate-400 italic">Nenhum título a pagar.</td></tr>
                    )}
                    {data.titulos_pagar.length > 15 && (
                      <tr><td colSpan={2} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{data.titulos_pagar.length - 15} mais...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 7. DESPESAS COM VEÍCULOS ═══════════ */}
        {data.despesas_veiculos.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Despesas com Veículos</h2>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">{fmt(r.despesas_veiculos)}</span>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                    <th className="pl-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Veículo</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Descrição</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Data</th>
                    <th className="pr-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.despesas_veiculos.slice(0, 20).map((d, i) => (
                    <tr key={i}>
                      <td className="pl-3 py-1.5">
                        <span className="text-[9px] font-bold text-slate-800 uppercase">{d.veiculo_modelo}</span>
                        <span className="text-[8px] text-slate-400 ml-1">{d.veiculo_placa}</span>
                      </td>
                      <td className="py-1.5 text-[9px] font-medium text-slate-600 max-w-[140px] truncate">{d.descricao}</td>
                      <td className="py-1.5 text-[8px] font-medium text-slate-400">{formatDate(d.data)}</td>
                      <td className="pr-3 py-1.5 text-[9px] font-black text-rose-600 text-right">{fmt(d.valor_total)}</td>
                    </tr>
                  ))}
                  {data.despesas_veiculos.length > 20 && (
                    <tr><td colSpan={4} className="px-3 py-2 text-center text-[8px] text-slate-400 font-bold">+{data.despesas_veiculos.length - 20} mais registros...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════ 8. RETIRADAS SÓCIOS ═══════════ */}
        {data.retiradas.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Retiradas de Sócios</h2>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">{fmt(r.retiradas_socios)}</span>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                    <th className="pl-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Sócio</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Tipo</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Descrição</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Data</th>
                    <th className="pr-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.retiradas.map((ret, i) => (
                    <tr key={i}>
                      <td className="pl-3 py-1.5 text-[9px] font-bold text-slate-800 uppercase">{ret.socio_nome}</td>
                      <td className="py-1.5 text-[8px] font-medium text-slate-500 uppercase">{ret.tipo}</td>
                      <td className="py-1.5 text-[9px] font-medium text-slate-600 max-w-[120px] truncate">{ret.descricao}</td>
                      <td className="py-1.5 text-[8px] font-medium text-slate-400">{formatDate(ret.data)}</td>
                      <td className="pr-3 py-1.5 text-[9px] font-black text-rose-600 text-right">{fmt(ret.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════ 9. ESTOQUE ATUAL ═══════════ */}
        {data.estoque.length > 0 && (
          <section className="mb-8 break-before-page">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}></div>
                <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Estoque Atual</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[8px] font-black text-slate-400 uppercase">{data.estoque.length} veículo{data.estoque.length !== 1 ? 's' : ''}</span>
                <span className="text-[8px] font-black text-indigo-600 uppercase">{fmt(data.estoque.reduce((s, e) => s + e.valor_venda, 0))} em venda</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                    <th className="pl-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Veículo</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Custo</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Venda</th>
                    <th className="py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Margem</th>
                    <th className="pr-3 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest text-right">Dias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.estoque.map((e, i) => (
                    <tr key={i} className={e.dias_estoque > 60 ? 'bg-rose-50/30' : ''} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>
                      <td className="pl-3 py-1.5">
                        <span className="text-[9px] font-bold text-slate-800 uppercase">{e.modelo}</span>
                        <span className="text-[8px] text-slate-400 ml-1">{e.placa}</span>
                      </td>
                      <td className="py-1.5">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          e.status === 'DISPONIVEL' ? 'bg-emerald-50 text-emerald-600' :
                          e.status === 'RESERVADO' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' as any }}>{e.status}</span>
                      </td>
                      <td className="py-1.5 text-[9px] font-bold text-slate-500 text-right">{fmt(e.valor_custo + e.valor_custo_servicos)}</td>
                      <td className="py-1.5 text-[9px] font-black text-indigo-600 text-right">{fmt(e.valor_venda)}</td>
                      <td className={`py-1.5 text-[9px] font-black text-right ${e.margem_percent >= 10 ? 'text-emerald-600' : e.margem_percent >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>{e.margem_percent.toFixed(1)}%</td>
                      <td className={`pr-3 py-1.5 text-[9px] font-black text-right ${e.dias_estoque > 60 ? 'text-rose-500' : e.dias_estoque > 30 ? 'text-amber-500' : 'text-slate-700'}`}>{e.dias_estoque}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════ FOOTER ═══════════ */}
        <div className="mt-auto border-t-2 border-slate-900 pt-6 flex items-center justify-between">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Nexus ERP • Relatório de Performance</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Página 1</p>
        </div>
      </div>
    </div>
  );
};

export default PerformancePrint;
