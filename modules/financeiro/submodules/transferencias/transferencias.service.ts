import { supabase } from '../../../../lib/supabase';
import { ITransferencia, TransferenciaTab } from './transferencias.types';

const TABLE = 'fin_transferencias';

export const TransferenciasService = {
  async getAll(tab: TransferenciaTab): Promise<ITransferencia[]> {
    let query = supabase
      .from(TABLE)
      .select(`
        *,
        conta_origem:fin_contas_bancarias!fin_transferencias_conta_origem_id_fkey(banco_nome, conta, titular),
        conta_destino:fin_contas_bancarias!fin_transferencias_conta_destino_id_fkey(banco_nome, conta, titular)
      `);

    if (tab === 'MES_ATUAL') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      query = query.gte('data', firstDay).lte('data', lastDay);
    }

    const { data, error } = await query.order('data', { ascending: false });
    if (error) throw error;
    return data as ITransferencia[];
  },

  async save(payload: Partial<ITransferencia>): Promise<void> {
    const isUpdate = !!payload.id;

    if (isUpdate) {
      // 1. Antes de atualizar, reverte o impacto da transferência antiga nos saldos
      const { data: old } = await supabase.from(TABLE).select('*').eq('id', payload.id).single();
      if (old) {
        await this.adjustBalances(old.conta_origem_id, old.conta_destino_id, old.valor, true);
      }
      // Remove transações antigas do extrato vinculadas
      await supabase.from('fin_transacoes').delete().eq('transferencia_id', payload.id);
    }

    // 2. Salva/Atualiza a Transferência
    const { data: transf, error: errTransf } = await supabase
      .from(TABLE)
      .upsert(payload)
      .select()
      .single();

    if (errTransf) throw errTransf;

    // 3. Aplica o novo impacto nos saldos
    await this.adjustBalances(payload.conta_origem_id!, payload.conta_destino_id!, payload.valor!, false);

    // 4. Lança no Extrato (Vínculo para exclusão em cascata configurado no SQL)
    await supabase.from('fin_transacoes').insert([
      {
        transferencia_id: transf.id,
        conta_origem_id: payload.conta_origem_id,
        valor: payload.valor,
        tipo: 'SAIDA',
        data_pagamento: payload.data,
        tipo_transacao: 'TRANSFERENCIA_SAIDA',
        descricao: `[SAÍDA] ${payload.descricao}`
      },
      {
        transferencia_id: transf.id,
        conta_origem_id: payload.conta_destino_id,
        valor: payload.valor,
        tipo: 'ENTRADA',
        data_pagamento: payload.data,
        tipo_transacao: 'TRANSFERENCIA_ENTRADA',
        descricao: `[ENTRADA] ${payload.descricao}`
      }
    ]);
  },

  async delete(id: string): Promise<void> {
    // 1. Busca dados para reverter saldo
    const { data: transf } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (transf) {
      // Reverte: Devolve para origem, tira do destino
      await this.adjustBalances(transf.conta_origem_id, transf.conta_destino_id, transf.valor, true);
    }

    // 2. Deleta (fin_transacoes vinculadas cairão por Cascade se configurado, ou deletamos manual)
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  // Helper para ajuste de saldos
  async adjustBalances(origemId: string, destinoId: string, valor: number, reverse: boolean) {
    // Se reverse for true: Devolve valor para origem (+) e retira do destino (-)
    // Se reverse for false: Retira da origem (-) e adiciona no destino (+)
    
    // Ajuste Origem
    const { data: cOrigem, error: errOrigem } = await supabase.from('fin_contas_bancarias').select('saldo_atual').eq('id', origemId).single();
    if (errOrigem || !cOrigem) throw new Error('Conta de origem não encontrada para ajuste de saldo.');
    const novoSaldoOrigem = reverse ? (Number(cOrigem.saldo_atual) + valor) : (Number(cOrigem.saldo_atual) - valor);
    await supabase.from('fin_contas_bancarias').update({ saldo_atual: novoSaldoOrigem, updated_at: new Date().toISOString() }).eq('id', origemId);

    // Ajuste Destino
    const { data: cDestino, error: errDestino } = await supabase.from('fin_contas_bancarias').select('saldo_atual').eq('id', destinoId).single();
    if (errDestino || !cDestino) throw new Error('Conta de destino não encontrada para ajuste de saldo.');
    const novoSaldoDestino = reverse ? (Number(cDestino.saldo_atual) - valor) : (Number(cDestino.saldo_atual) + valor);
    await supabase.from('fin_contas_bancarias').update({ saldo_atual: novoSaldoDestino, updated_at: new Date().toISOString() }).eq('id', destinoId);
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('fin_transferencias_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onUpdate())
      .subscribe();
  }
};
