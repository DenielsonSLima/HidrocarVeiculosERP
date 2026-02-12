
import { supabase } from '../../../lib/supabase';
import { IContaBancaria } from './contas.types';

const TABLE = 'fin_contas_bancarias';

export const ContasBancariasService = {
  async getAll(): Promise<IContaBancaria[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('ativo', { ascending: false }) // Ativos primeiro
      .order('banco_nome', { ascending: true });

    if (error) throw error;
    return data as IContaBancaria[];
  },

  async save(payload: Partial<IContaBancaria>): Promise<IContaBancaria> {
    const dataToSave = {
      ...payload,
      updated_at: new Date().toISOString()
    };
    if (!dataToSave.id) delete dataToSave.id;

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as IContaBancaria;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleStatus(id: string, novoStatus: boolean): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({
        ativo: novoStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Atualiza especificamente o saldo inicial e a data de corte
  async setSaldoInicial(id: string, valor: number, dataReferencia: string): Promise<void> {
    // 1. Busca saldo atual e inicial antigo para calcular a diferença
    const { data: conta, error: fetchError } = await supabase
      .from(TABLE)
      .select('saldo_inicial, saldo_atual')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const saldoInicialAntigo = Number(conta.saldo_inicial) || 0;
    const saldoAtualAntigo = Number(conta.saldo_atual) || 0;
    const diferenca = valor - saldoInicialAntigo;
    const novoSaldoAtual = saldoAtualAntigo + diferenca;

    // 2. Atualiza respeitando o histórico
    const { error } = await supabase
      .from(TABLE)
      .update({
        saldo_inicial: valor,
        data_saldo_inicial: dataReferencia,
        saldo_atual: novoSaldoAtual,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  subscribe(onUpdate: (eventType: string) => void) {
    return supabase
      .channel('public:fin_contas_bancarias_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => onUpdate(payload.eventType)
      )
      .subscribe();
  }
};
