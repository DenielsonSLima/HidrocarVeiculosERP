import React from 'react';
import { ICaixaDashboardData } from '../caixa.types';

interface Props {
    data: ICaixaDashboardData;
    empresa: any;
    watermark: any;
    periodo: string;
}

const CaixaPrint: React.FC<Props> = ({ data, empresa, watermark, periodo }) => {
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const now = new Date();

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 relative p-12 mx-auto print-container font-sans">

            {/* MARCA D'ÁGUA (Background) */}
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
                            printColorAdjust: 'exact'
                        }}
                        alt=""
                        className="print:opacity-[0.1]"
                    />
                </div>
            )}

            {/* CONTEÚDO */}
            <div className="relative z-10 flex flex-col h-full">

                {/* CABEÇALHO DA EMPRESA */}
                <header className="flex items-center justify-between border-b-[3px] border-slate-900 pb-8 mb-10">
                    <div className="flex items-center space-x-8">
                        {empresa?.logo_url && (
                            <img src={empresa.logo_url} alt="Logo" className="h-32 w-auto object-contain max-w-[220px]" />
                        )}
                        <div>
                            <h1 className="text-3xl font-[900] text-slate-900 uppercase tracking-tighter leading-none mb-1">{empresa?.nome_fantasia || 'NOME DA EMPRESA'}</h1>
                            <div className="flex items-center space-x-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <span>{empresa?.razao_social}</span>
                                <span className="w-1 h-3 border-l border-slate-300"></span>
                                <span>CNPJ: {empresa?.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") || 'CNPJ NÃO INFORMADO'}</span>
                            </div>
                            <div className="mt-3 text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-snug">
                                <p>{empresa?.logradouro}, {empresa?.numero} - {empresa?.bairro} • {empresa?.cidade}/{empresa?.uf}</p>
                                <p className="mt-0.5">{empresa?.email} • {empresa?.telefone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="inline-block bg-slate-900 text-white px-5 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-sm mb-3 shadow-sm">
                            Relatório Financeiro
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período de Análise</p>
                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{periodo}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                            Emitido em: {now.toLocaleDateString()} às {now.toLocaleTimeString()}
                        </p>
                    </div>
                </header>

                {/* 1. KPI HIGHLIGHTS - DESIGN MODERNO */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-5 px-1">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">Resumo Executivo do Patrimônio</h2>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {/* Card 1 */}
                        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-200 rounded-full -mr-8 -mt-8 opacity-20 group-hover:scale-150 transition-transform"></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Patrimônio Líquido</p>
                            <p className="text-xl font-[900] text-slate-900 tracking-tight">{fmt(data.patrimonio_liquido)}</p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200 rounded-full -mr-8 -mt-8 opacity-20"></div>
                            <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest mb-2">Disponível (Caixa)</p>
                            <p className="text-xl font-[900] text-emerald-700 tracking-tight">{fmt(data.saldo_disponivel)}</p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200 rounded-full -mr-8 -mt-8 opacity-20"></div>
                            <p className="text-[9px] font-black text-indigo-600/70 uppercase tracking-widest mb-2">Ativos (Estoque)</p>
                            <p className="text-xl font-[900] text-indigo-700 tracking-tight">{fmt(data.total_ativos_estoque)}</p>
                        </div>

                        {/* Card 4 */}
                        <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-200 rounded-full -mr-8 -mt-8 opacity-20"></div>
                            <p className="text-[9px] font-black text-rose-600/70 uppercase tracking-widest mb-2">Passivos (À Pagar)</p>
                            <p className="text-xl font-[900] text-rose-600 tracking-tight">{fmt(data.total_passivo_circulante)}</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-12 gap-10">

                    {/* COLUNA ESQUERDA - PRINCIPAL */}
                    <div className="col-span-8 flex flex-col gap-10">

                        {/* 3. INVESTIMENTO SÓCIOS (DESIGN CARD PREMIUM) */}
                        <section className="keep-together">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">Detalhamento de Investimentos & Estoque</h2>
                            </div>

                            <div className="space-y-6">
                                {data.investimento_socios.map((socio, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden break-inside-avoid shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)]">
                                        {/* Header do Card do Sócio */}
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-black text-sm rounded-lg shadow-sm">
                                                    {socio.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-[900] uppercase text-slate-800">{socio.nome}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Participação no Estoque: <span className="text-indigo-600">{socio.porcentagem_estoque.toFixed(1)}%</span></p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capital Investido</p>
                                                <p className="text-base font-[900] text-slate-900 tracking-tight">{fmt(socio.valor_investido)}</p>
                                            </div>
                                        </div>

                                        {/* Lista de Veículos - GRID */}
                                        <div className="p-5 bg-white">
                                            {socio.veiculos.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                                    {socio.veiculos.map((v, vIdx) => (
                                                        <div key={vIdx} className="flex justify-between items-center text-xs py-2 border-b border-dashed border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
                                                            <div className="flex flex-col">
                                                                <span className="font-extrabold text-slate-700 uppercase tracking-tight">{v.modelo}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{v.placa}</span>
                                                            </div>
                                                            <span className="font-bold text-slate-900">{fmt(v.valor)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-2 text-center">
                                                    <p className="text-[10px] uppercase font-bold text-slate-300 italic">Nenhum veículo vinculado a este sócio no momento.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* COLUNA DIREITA - SIDEBAR */}
                    <div className="col-span-4 flex flex-col gap-10">

                        {/* 2. SALDOS BANCÁRIOS (LINPO E MINIMALISTA) */}
                        <section>
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">Saldos em Conta</h2>
                            </div>

                            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-100">
                                            <th className="pl-4 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Instituição</th>
                                            <th className="pr-4 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.contas.map((conta, idx) => (
                                            <tr key={idx} className="bg-white">
                                                <td className="pl-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                                                    {conta.banco_nome}
                                                    <span className="block text-[8px] text-slate-400 font-medium mt-0.5">{conta.tipo_conta}</span>
                                                </td>
                                                <td className="pr-4 py-3 text-[10px] font-black text-slate-900 text-right">{fmt(Number(conta.saldo_atual))}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50/50">
                                            <td className="pl-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Disponível</td>
                                            <td className="pr-4 py-3 text-[10px] font-black text-emerald-600 text-right">{fmt(data.saldo_disponivel)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 4. PERFORMANCE (DESTACADA) */}
                        <section className="break-inside-avoid">
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">DRE Simplificado</h2>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                                {/* Backglow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mt-10 -mr-10"></div>

                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendas</span>
                                        <span className="text-sm font-black text-emerald-400">{fmt(data.total_vendas)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compras</span>
                                        <span className="text-sm font-black text-rose-400">{fmt(data.total_compras)}</span>
                                    </div>

                                    <div className="pt-2 mt-2">
                                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Lucro Líquido</p>
                                        <p className={`text-2xl font-[900] tracking-tighter ${data.lucro_mensal >= 0 ? 'text-white' : 'text-rose-500'}`}>
                                            {data.lucro_mensal > 0 ? '+' : ''}{fmt(data.lucro_mensal)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

                {/* 5. HISTÓRICO DE MOVIMENTAÇÕES (NOVO) */}
                <section className="mt-8 pt-8 border-t border-slate-100 break-before-page">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">Registro de Movimentações</h2>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Data</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Descrição</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">Tipo</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.transacoes?.map((t, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">
                                            {new Date(t.data_pagamento).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-2.5 text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                                            {t.descricao || t.titulo?.descricao || 'SEM DESCRIÇÃO'}
                                            {t.forma_pagamento?.nome && (
                                                <span className="block text-[8px] text-slate-400 font-medium">{t.forma_pagamento.nome}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${t.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' :
                                                    t.tipo === 'SAIDA' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {t.tipo}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-2.5 text-[10px] font-black text-right tracking-tight ${t.tipo === 'ENTRADA' ? 'text-emerald-600' : t.tipo === 'SAIDA' ? 'text-rose-600' : 'text-slate-900'
                                            }`}>
                                            {fmt(t.valor)}
                                        </td>
                                    </tr>
                                ))}
                                {(!data.transacoes || data.transacoes.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-[10px] text-slate-400 font-medium italic uppercase">
                                            Nenhuma movimentação registrada no período selecionado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* FOOTER AUTOMÁTICO - FIXADO NO FINAL */}
                <div className="mt-auto border-t border-slate-100 pt-6 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">HCV Operating System • Documento Oficial</p>
                </div>
            </div>
        </div>
    );
};

export default CaixaPrint;
