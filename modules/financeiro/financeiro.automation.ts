
import { supabase } from '../../lib/supabase';
import { IFormaPagamento } from '../cadastros/formas-pagamento/formas-pagamento.types';

export const FinanceiroAutomationService = {
  /**
   * Calcula as datas e valores das parcelas baseado na regra de negócio
   */
  gerarCronograma(valorTotal: number, condicao: any) {
    const parcelas = [];
    const valorParcela = Number((valorTotal / condicao.qtd_parcelas).toFixed(2));
    const hoje = new Date();

    for (let i = 0; i < condicao.qtd_parcelas; i++) {
      const dataVenc = new Date();
      // Dias da 1ª parcela + (intervalo * índice da parcela atual)
      const diasAposVenda = condicao.dias_primeira_parcela + (i * condicao.dias_entre_parcelas);
      dataVenc.setDate(hoje.getDate() + diasAposVenda);

      parcelas.push({
        numero: i + 1,
        total_parcelas: condicao.qtd_parcelas,
        data_vencimento: dataVenc.toISOString().split('T')[0],
        valor: i === condicao.qtd_parcelas - 1
          ? Number((valorTotal - (valorParcela * (condicao.qtd_parcelas - 1))).toFixed(2))
          : valorParcela
      });
    }
    return parcelas;
  },

  /**
   * Garante que uma categoria financeira exista pelo nome e retorna o ID.
   */
  async ensureCategory(nome: string, tipo: 'FIXA' | 'VARIAVEL' | 'OUTROS', natureza: 'ENTRADA' | 'SAIDA'): Promise<string | undefined> {
    const { data: existing } = await supabase
      .from('fin_categorias')
      .select('id')
      .eq('nome', nome)
      .eq('natureza', natureza)
      .single();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from('fin_categorias')
      .insert({ nome, tipo, natureza })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao criar categoria automática:', error);
      return undefined;
    }
    return created.id;
  },

  /**
   * Processa a confirmação financeira de um pedido
   */
  async processarFinanceiroPedido(params: {
    tipo: 'PAGAR' | 'RECEBER',
    pedidoId: string,
    parceiroId: string,
    formaPagamento: IFormaPagamento,
    condicao: any,
    valorTotal: number,
    descricao: string,
    contaBancariaId?: string
  }) {
    const { tipo, pedidoId, parceiroId, formaPagamento, condicao, valorTotal, descricao, contaBancariaId } = params;

    // 1. Garante Categoria Padrão
    let categoriaId: string | undefined;
    if (tipo === 'RECEBER') {
      categoriaId = await this.ensureCategory('VENDAS DE VEÍCULOS', 'OUTROS', 'ENTRADA'); // Receita
    } else {
      categoriaId = await this.ensureCategory('AQUISIÇÃO DE VEÍCULOS', 'VARIAVEL', 'SAIDA'); // Despesa Variável
    }

    const parcelas = this.gerarCronograma(valorTotal, condicao);

    for (const p of parcelas) {
      const hojeStr = new Date().toISOString().split('T')[0];
      const isPagamentoImediato = formaPagamento.destino_lancamento === 'CAIXA' && p.data_vencimento === hojeStr;

      // 2. Cria o Título Financeiro
      const { data: titulo, error: errTitulo } = await supabase
        .from('fin_titulos')
        .insert({
          tipo,
          pedido_id: pedidoId,
          parceiro_id: parceiroId,
          descricao: `${descricao} (${p.numero}/${p.total_parcelas})`,
          valor_total: p.valor,
          valor_pago: isPagamentoImediato ? p.valor : 0,
          status: isPagamentoImediato ? 'PAGO' : 'PENDENTE',
          data_emissao: hojeStr,
          data_vencimento: p.data_vencimento,
          parcela_numero: p.numero,
          parcela_total: p.total_parcelas,
          forma_pagamento_id: formaPagamento.id,
          categoria_id: categoriaId
        })
        .select()
        .single();

      if (errTitulo) throw errTitulo;

      // 3. Se for pagamento imediato (À Vista no Caixa), gera transação e atualiza saldo
      if (isPagamentoImediato && contaBancariaId) {
        await supabase.from('fin_transacoes').insert({
          titulo_id: titulo.id,
          conta_origem_id: contaBancariaId,
          valor: p.valor,
          tipo: tipo === 'PAGAR' ? 'SAIDA' : 'ENTRADA',
          tipo_transacao: tipo === 'PAGAR' ? 'COMPRA' : 'VENDA', // Correção Crítica
          data_pagamento: new Date().toISOString(),
          forma_pagamento_id: formaPagamento.id,
          descricao: `BAIXA AUTOMÁTICA: ${descricao}`
        });

        const { data: conta } = await supabase.from('fin_contas_bancarias').select('saldo_atual').eq('id', contaBancariaId).single();
        const multiplicador = tipo === 'PAGAR' ? -1 : 1;

        await supabase.from('fin_contas_bancarias').update({
          saldo_atual: (Number(conta.saldo_atual) + (Number(p.valor) * multiplicador))
        }).eq('id', contaBancariaId);
      }
    }
  }
};
