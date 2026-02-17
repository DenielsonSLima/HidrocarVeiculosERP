import React, { useState } from 'react';
import { IPerformanceData } from '../performance.types';

interface Props {
  data: IPerformanceData;
  periodoLabel: string;
}

type SecaoAberta = 'vendas' | 'compras' | 'pagar' | 'receber' | 'despesas' | 'retiradas' | 'estoque' | 'contas' | null;

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (d: string) => {
  if (!d) return '-';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

const statusColor: Record<string, string> = {
  PAGO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  PARCIAL: 'bg-blue-50 text-blue-700 border-blue-200',
  ATRASADO: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PerformanceContent: React.FC<Props> = ({ data, periodoLabel }) => {
  const [secaoAberta, setSecaoAberta] = useState<SecaoAberta>(null);
  const r = data.resumo;

  const toggle = (secao: SecaoAberta) => {
    setSecaoAberta(prev => (prev === secao ? null : secao));
  };

  // ===================== KPI CARD =====================
  const KpiCard = ({ label, valor, sub, color = 'slate', isCurrency = true, icon }: {
    label: string; valor: number; sub?: string; color?: string; isCurrency?: boolean; icon: string;
  }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-xl bg-${color}-50 border border-${color}-100 flex items-center justify-center`}>
          <svg className={`w-4 h-4 text-${color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">
        {isCurrency ? formatCurrency(valor) : valor}
      </h3>
      {sub && <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5">{sub}</p>}
    </div>
  );

  // ===================== SEÇÃO EXPANSÍVEL =====================
  const SecaoHeader = ({ id, titulo, subtitulo, count, valor, icon, color }: {
    id: SecaoAberta; titulo: string; subtitulo: string; count: number; valor?: number; icon: string; color: string;
  }) => (
    <button
      onClick={() => toggle(id)}
      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
        secaoAberta === id
          ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
          : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          secaoAberta === id ? 'bg-white/10' : `bg-${color}-50 border border-${color}-100`
        }`}>
          <svg className={`w-5 h-5 ${secaoAberta === id ? 'text-white' : `text-${color}-500`}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="text-left">
          <h4 className="text-sm font-black uppercase tracking-tight">{titulo}</h4>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${secaoAberta === id ? 'text-white/50' : 'text-slate-400'}`}>{subtitulo}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className={`text-[10px] font-black uppercase tracking-widest ${secaoAberta === id ? 'text-white/50' : 'text-slate-400'}`}>
            {count} {count === 1 ? 'registro' : 'registros'}
          </span>
          {valor !== undefined && (
            <p className={`text-sm font-black ${secaoAberta === id ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(valor)}</p>
          )}
        </div>
        <svg className={`w-5 h-5 transition-transform ${secaoAberta === id ? 'rotate-180 text-white/60' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Período Label */}
      <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{periodoLabel}</span>
      </div>

      {/* ================== KPIs GRID ================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Vendas"
          valor={r.total_vendas_valor}
          sub={`${r.total_vendas_qtd} veículo${r.total_vendas_qtd !== 1 ? 's' : ''} vendido${r.total_vendas_qtd !== 1 ? 's' : ''}`}
          color="emerald"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <KpiCard
          label="Compras"
          valor={r.total_compras_valor}
          sub={`${r.total_compras_qtd} veículo${r.total_compras_qtd !== 1 ? 's' : ''} comprado${r.total_compras_qtd !== 1 ? 's' : ''}`}
          color="blue"
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <KpiCard
          label="Lucro Bruto"
          valor={r.lucro_bruto}
          sub={`Margem média: ${r.margem_media.toFixed(1)}%`}
          color={r.lucro_bruto >= 0 ? 'emerald' : 'rose'}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <KpiCard
          label="Ticket Médio"
          valor={r.ticket_medio_venda}
          sub="Valor médio por venda"
          color="indigo"
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <KpiCard
          label="Entradas"
          valor={r.total_entradas}
          sub="Total recebido no período"
          color="emerald"
          icon="M7 11l5-5m0 0l5 5m-5-5v12"
        />
        <KpiCard
          label="Saídas"
          valor={r.total_saidas}
          sub="Total pago no período"
          color="rose"
          icon="M17 13l-5 5m0 0l-5-5m5 5V6"
        />
        <KpiCard
          label="A Receber"
          valor={r.contas_receber_pendente}
          sub={`Recebido: ${formatCurrency(r.contas_receber_pago)}`}
          color="amber"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <KpiCard
          label="A Pagar"
          valor={r.contas_pagar_pendente}
          sub={`Pago: ${formatCurrency(r.contas_pagar_pago)}`}
          color="rose"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </div>

      {/* ================== CARDS DESTAQUE ================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Saldo Total Contas</p>
          <h3 className="text-2xl font-black tracking-tight">{formatCurrency(r.saldo_contas_bancarias)}</h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">{data.contas_bancarias.length} conta{data.contas_bancarias.length !== 1 ? 's' : ''} ativa{data.contas_bancarias.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Despesas Veículos</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(r.despesas_veiculos)}</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{data.despesas_veiculos.length} lançamento{data.despesas_veiculos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Retiradas Sócios</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(r.retiradas_socios)}</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{data.retiradas.length} retirada{data.retiradas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ================== SEÇÕES EXPANSÍVEIS ================== */}
      <div className="space-y-3">

        {/* ---- VENDAS ---- */}
        <SecaoHeader
          id="vendas"
          titulo="Vendas Realizadas"
          subtitulo="Detalhamento das vendas concluídas"
          count={data.vendas.length}
          valor={r.total_vendas_valor}
          icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          color="emerald"
        />
        {secaoAberta === 'vendas' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.vendas.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhuma venda neste período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Nº</th>
                      <th className="px-5 py-4">Data</th>
                      <th className="px-5 py-4">Cliente</th>
                      <th className="px-5 py-4">Veículo</th>
                      <th className="px-5 py-4 text-right">Custo</th>
                      <th className="px-5 py-4 text-right">Venda</th>
                      <th className="px-5 py-4 text-right">Lucro</th>
                      <th className="px-5 py-4 text-center">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.vendas.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-[11px] font-black text-slate-500">{v.numero_venda}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{formatDate(v.data_venda)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-700">{v.cliente_nome}</td>
                        <td className="px-5 py-3">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{v.veiculo_modelo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{v.veiculo_placa}</p>
                        </td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-500 text-right">{formatCurrency(v.custo_veiculo + v.custo_servicos)}</td>
                        <td className="px-5 py-3 text-xs font-black text-indigo-600 text-right">{formatCurrency(v.valor_venda)}</td>
                        <td className={`px-5 py-3 text-xs font-black text-right ${v.lucro_bruto >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(v.lucro_bruto)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black border ${v.margem_percent >= 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : v.margem_percent >= 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                            {v.margem_percent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- COMPRAS ---- */}
        <SecaoHeader
          id="compras"
          titulo="Compras Realizadas"
          subtitulo="Aquisições concluídas no período"
          count={data.compras.length}
          valor={r.total_compras_valor}
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          color="blue"
        />
        {secaoAberta === 'compras' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.compras.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhuma compra neste período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Nº</th>
                      <th className="px-5 py-4">Data</th>
                      <th className="px-5 py-4">Fornecedor</th>
                      <th className="px-5 py-4">Veículo</th>
                      <th className="px-5 py-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.compras.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-[11px] font-black text-slate-500">{c.numero_pedido}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{formatDate(c.data_compra)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-700">{c.fornecedor_nome}</td>
                        <td className="px-5 py-3">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{c.veiculo_modelo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.veiculo_placa}</p>
                        </td>
                        <td className="px-5 py-3 text-xs font-black text-slate-900 text-right">{formatCurrency(c.valor_negociado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- CONTAS A RECEBER ---- */}
        <SecaoHeader
          id="receber"
          titulo="Contas a Receber"
          subtitulo="Títulos com vencimento no período"
          count={data.titulos_receber.length}
          valor={data.titulos_receber.reduce((s, t) => s + t.valor_total, 0)}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="amber"
        />
        {secaoAberta === 'receber' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.titulos_receber.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhum título a receber neste período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Descrição</th>
                      <th className="px-5 py-4">Parceiro</th>
                      <th className="px-5 py-4">Categoria</th>
                      <th className="px-5 py-4">Vencimento</th>
                      <th className="px-5 py-4 text-right">Valor</th>
                      <th className="px-5 py-4 text-right">Pago</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.titulos_receber.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-xs font-bold text-slate-700 max-w-[200px] truncate">{t.descricao}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{t.parceiro_nome}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-400">{t.categoria_nome}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{formatDate(t.data_vencimento)}</td>
                        <td className="px-5 py-3 text-xs font-black text-slate-900 text-right">{formatCurrency(t.valor_total)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-emerald-600 text-right">{formatCurrency(t.valor_pago)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black border ${statusColor[t.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- CONTAS A PAGAR ---- */}
        <SecaoHeader
          id="pagar"
          titulo="Contas a Pagar"
          subtitulo="Títulos com vencimento no período"
          count={data.titulos_pagar.length}
          valor={data.titulos_pagar.reduce((s, t) => s + t.valor_total, 0)}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="rose"
        />
        {secaoAberta === 'pagar' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.titulos_pagar.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhum título a pagar neste período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Descrição</th>
                      <th className="px-5 py-4">Parceiro</th>
                      <th className="px-5 py-4">Categoria</th>
                      <th className="px-5 py-4">Vencimento</th>
                      <th className="px-5 py-4 text-right">Valor</th>
                      <th className="px-5 py-4 text-right">Pago</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.titulos_pagar.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-xs font-bold text-slate-700 max-w-[200px] truncate">{t.descricao}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{t.parceiro_nome}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-400">{t.categoria_nome}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{formatDate(t.data_vencimento)}</td>
                        <td className="px-5 py-3 text-xs font-black text-slate-900 text-right">{formatCurrency(t.valor_total)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-emerald-600 text-right">{formatCurrency(t.valor_pago)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black border ${statusColor[t.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- DESPESAS VEÍCULOS ---- */}
        <SecaoHeader
          id="despesas"
          titulo="Despesas com Veículos"
          subtitulo="Serviços, reformas e custos veiculares"
          count={data.despesas_veiculos.length}
          valor={r.despesas_veiculos}
          icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          color="orange"
        />
        {secaoAberta === 'despesas' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.despesas_veiculos.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhuma despesa de veículo neste período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Veículo</th>
                      <th className="px-5 py-4">Descrição</th>
                      <th className="px-5 py-4">Data</th>
                      <th className="px-5 py-4 text-right">Valor</th>
                      <th className="px-5 py-4 text-center">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.despesas_veiculos.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{d.veiculo_modelo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{d.veiculo_placa}</p>
                        </td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-700">{d.descricao}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{formatDate(d.data)}</td>
                        <td className="px-5 py-3 text-xs font-black text-rose-600 text-right">{formatCurrency(d.valor_total)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black border ${statusColor[d.status_pagamento] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {d.status_pagamento}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- RETIRADAS SÓCIOS ---- */}
        <SecaoHeader
          id="retiradas"
          titulo="Retiradas de Sócios"
          subtitulo="Distribuições e pró-labore"
          count={data.retiradas.length}
          valor={r.retiradas_socios}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          color="purple"
        />
        {secaoAberta === 'retiradas' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.retiradas.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhuma retirada neste período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Sócio</th>
                      <th className="px-5 py-4">Tipo</th>
                      <th className="px-5 py-4">Descrição</th>
                      <th className="px-5 py-4">Data</th>
                      <th className="px-5 py-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.retiradas.map(ret => (
                      <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-xs font-black text-slate-800">{ret.socio_nome}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 uppercase">{ret.tipo}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{ret.descricao}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{formatDate(ret.data)}</td>
                        <td className="px-5 py-3 text-xs font-black text-rose-600 text-right">{formatCurrency(ret.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- ESTOQUE ATUAL ---- */}
        <SecaoHeader
          id="estoque"
          titulo="Estoque Atual"
          subtitulo="Veículos disponíveis no pátio"
          count={data.estoque.length}
          valor={data.estoque.reduce((s, e) => s + e.valor_venda, 0)}
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          color="indigo"
        />
        {secaoAberta === 'estoque' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.estoque.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhum veículo em estoque.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-4">Veículo</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Custo</th>
                      <th className="px-5 py-4 text-right">Serviços</th>
                      <th className="px-5 py-4 text-right">Preço Venda</th>
                      <th className="px-5 py-4 text-center">Margem</th>
                      <th className="px-5 py-4 text-center">Dias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.estoque.map(e => (
                      <tr key={e.id} className={`hover:bg-slate-50/50 transition-colors ${e.dias_estoque > 60 ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-5 py-3">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{e.modelo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{e.placa}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black border ${
                            e.status === 'DISPONIVEL' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            e.status === 'RESERVADO' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>{e.status}</span>
                        </td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-500 text-right">{formatCurrency(e.valor_custo)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-500 text-right">{formatCurrency(e.valor_custo_servicos)}</td>
                        <td className="px-5 py-3 text-xs font-black text-indigo-600 text-right">{formatCurrency(e.valor_venda)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black border ${e.margem_percent >= 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : e.margem_percent >= 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                            {e.margem_percent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-black ${e.dias_estoque > 60 ? 'text-rose-500' : e.dias_estoque > 30 ? 'text-amber-500' : 'text-slate-700'}`}>
                            {e.dias_estoque}d
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- CONTAS BANCÁRIAS ---- */}
        <SecaoHeader
          id="contas"
          titulo="Contas Bancárias"
          subtitulo="Saldos atuais das contas ativas"
          count={data.contas_bancarias.length}
          valor={r.saldo_contas_bancarias}
          icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          color="slate"
        />
        {secaoAberta === 'contas' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {data.contas_bancarias.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10">Nenhuma conta bancária ativa.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {data.contas_bancarias.map(c => (
                  <div key={c.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{c.banco_nome}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase px-2 py-0.5 bg-white rounded border border-slate-200">{c.tipo}</span>
                    </div>
                    <h4 className={`text-lg font-black tracking-tight ${c.saldo_atual >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(c.saldo_atual)}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PerformanceContent;
