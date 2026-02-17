import { supabase } from '../../lib/supabase';
import { StorageService } from '../../lib/storage.service';
import { IVeiculo, IVeiculoDespesa, IEstoqueFilters, IEstoqueResponse, IVeiculoFoto } from './estoque.types';

const TABLE = 'est_veiculos';

export const EstoqueService = {
  async getAll(filters?: IEstoqueFilters): Promise<IEstoqueResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(`
        *,
        montadora:cad_montadoras(nome, logo_url),
        modelo:cad_modelos(nome),
        versao:cad_versoes(nome),
        tipo_veiculo:cad_tipos_veiculos(nome)
      `, { count: 'exact' });

    // Aplicar Filtros
    if (filters) {
      if (filters.search) {
        // Busca simples por placa (pode ser expandido via RPC se necessário)
        query = query.ilike('placa', `%${filters.search}%`);
      }
      if (filters.montadoraId) query = query.eq('montadora_id', filters.montadoraId);
      if (filters.tipoId) query = query.eq('tipo_veiculo_id', filters.tipoId);

      if (filters.statusTab) {
        if (filters.statusTab === 'DISPONIVEL') query = query.eq('status', 'DISPONIVEL');
        else if (filters.statusTab === 'RASCUNHO') query = query.eq('status', 'PREPARACAO');
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Erro ao buscar estoque:', error);
      throw error;
    }

    return {
      data: (data || []) as IVeiculo[],
      count: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getDashboardStats(filters?: IEstoqueFilters): Promise<IVeiculo[]> {
    // Busca leve para cálculo de KPIs (apenas colunas numéricas e de filtro)
    let query = supabase
      .from(TABLE)
      .select(`
        id,
        valor_venda,
        valor_custo,
        valor_custo_servicos,
        socios,
        status,
        montadora_id,
        tipo_veiculo_id,
        placa
      `);

    // Reaplicar os mesmos filtros para que os KPIs batam com a lista
    if (filters) {
      if (filters.search) query = query.ilike('placa', `%${filters.search}%`);
      if (filters.montadoraId) query = query.eq('montadora_id', filters.montadoraId);
      if (filters.tipoId) query = query.eq('tipo_veiculo_id', filters.tipoId);
      if (filters.statusTab) {
        if (filters.statusTab === 'DISPONIVEL') query = query.eq('status', 'DISPONIVEL');
        else if (filters.statusTab === 'RASCUNHO') query = query.eq('status', 'PREPARACAO');
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return [];
    }
    return data as IVeiculo[];
  },

  async getById(id: string): Promise<IVeiculo | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        montadora:cad_montadoras(nome, logo_url),
        modelo:cad_modelos(nome),
        versao:cad_versoes(nome),
        tipo_veiculo:cad_tipos_veiculos(nome),
        despesas:est_veiculos_despesas(
          *,
          categoria:fin_categorias(nome)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar veículo por ID:', error);
      return null;
    }

    const veiculo = data as any;
    if (veiculo?.despesas) {
      veiculo.despesas = veiculo.despesas.map((d: any) => ({
        ...d,
        categoria_nome: d.categoria?.nome
      }));
    }

    return veiculo as IVeiculo;
  },

  async save(payload: Partial<IVeiculo>): Promise<IVeiculo> {
    const {
      id,
      montadora,
      modelo,
      versao,
      tipo_veiculo,
      created_at,
      updated_at,
      despesas,
      ...rest
    } = payload as any;

    const dataToSave = {
      ...rest,
      updated_at: new Date().toISOString()
    };

    // Processamento de Imagens (Base64 -> Storage) com Upload Paralelo Otimizado
    if (dataToSave.fotos && Array.isArray(dataToSave.fotos)) {
      const uploadPromises = dataToSave.fotos.map(async (photo: any) => {
        if (photo.url && photo.url.startsWith('data:')) {
          try {
            const file = StorageService.base64ToFile(photo.url, `vehicle-photo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`);
            const publicUrl = await StorageService.uploadImage(file, 'veiculos');
            return { ...photo, url: publicUrl };
          } catch (err) {
            console.error('Erro crítico ao fazer upload de foto de veículo para o Storage:', err);
            // Retorna null para sinalizar falha no upload e não persistir Base64 no banco
            return null;
          }
        }
        return photo;
      });

      const processedPhotos = await Promise.all(uploadPromises);

      // Filtra fotos que falharam no upload (null)
      dataToSave.fotos = processedPhotos.filter(p => p !== null);

      // Se o usuário enviou fotos novas (Base64) e todas falharam, talvez seja melhor interromper
      // para evitar que ele ache que salvou as fotos quando na verdade não salvou nada.
      const sentBase64 = payload.fotos?.some((p: any) => p.url?.startsWith('data:'));
      if (sentBase64 && dataToSave.fotos.length === 0 && payload.fotos!.length > 0) {
        throw new Error('Falha ao processar e fazer upload das imagens para o servidor de arquivos. O registro não foi salvo.');
      }
    }

    let query;
    if (id) {
      query = supabase
        .from(TABLE)
        .update(dataToSave)
        .eq('id', id);
    } else {
      query = supabase
        .from(TABLE)
        .insert(dataToSave);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Erro ao salvar veículo:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('O registro foi salvo mas o banco não retornou os dados. Verifique as políticas de RLS.');
    }

    return data[0] as IVeiculo;
  },

  async saveExpensesBatch(veiculoId: string, expenses: Partial<IVeiculoDespesa>[]): Promise<void> {
    for (const exp of expenses) {
      const { data: savedExp, error: errExp } = await supabase
        .from('est_veiculos_despesas')
        .insert({ ...exp, veiculo_id: veiculoId })
        .select()
        .single();

      if (errExp) throw errExp;

      const { data: titulo, error: errTitulo } = await supabase
        .from('fin_titulos')
        .insert({
          tipo: 'PAGAR',
          veiculo_id: veiculoId,
          despesa_veiculo_id: savedExp.id,
          categoria_id: exp.categoria_id,
          descricao: `DESPESA VEÍCULO (${savedExp.descricao})`,
          status: exp.status_pagamento,
          valor_total: exp.valor_total,
          valor_pago: exp.status_pagamento === 'PAGO' ? exp.valor_total : 0,
          data_emissao: exp.data,
          data_vencimento: exp.data_vencimento || exp.data,
          forma_pagamento_id: exp.forma_pagamento_id
        })
        .select()
        .single();

      if (errTitulo) throw errTitulo;

      if (exp.status_pagamento === 'PAGO' && exp.conta_bancaria_id) {
        await supabase.from('fin_transacoes').insert({
          titulo_id: titulo.id,
          conta_origem_id: exp.conta_bancaria_id,
          valor: exp.valor_total,
          tipo: 'SAIDA',
          data_pagamento: new Date().toISOString(),
          forma_pagamento_id: exp.forma_pagamento_id,
          descricao: `PGTO IMEDIATO: ${savedExp.descricao}`,
          tipo_transacao: 'DESPESA_VE_ICULO'
        });

        const { data: conta } = await supabase
          .from('fin_contas_bancarias')
          .select('saldo_atual')
          .eq('id', exp.conta_bancaria_id)
          .single();

        await supabase
          .from('fin_contas_bancarias')
          .update({ saldo_atual: (conta.saldo_atual - exp.valor_total!) })
          .eq('id', exp.conta_bancaria_id);
      }
    }
    await this.recalculateVehicleTotalCost(veiculoId);
  },

  async deleteExpense(id: string): Promise<void> {
    const { data: exp } = await supabase.from('est_veiculos_despesas').select('veiculo_id').eq('id', id).single();
    const { error } = await supabase.from('est_veiculos_despesas').delete().eq('id', id);
    if (error) throw error;
    if (exp) await this.recalculateVehicleTotalCost(exp.veiculo_id);
  },

  async recalculateVehicleTotalCost(veiculoId: string) {
    const { data: despesas } = await supabase
      .from('est_veiculos_despesas')
      .select('valor_total')
      .eq('veiculo_id', veiculoId);

    const total = (despesas || []).reduce((acc, d) => acc + (Number(d.valor_total) || 0), 0);

    await supabase
      .from(TABLE)
      .update({ valor_custo_servicos: total, updated_at: new Date().toISOString() })
      .eq('id', veiculoId);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};