
import { supabase } from '../../lib/supabase';
import { IPublicPageData, IMontadoraPublic, IGetStockParams, IPaginatedStock } from './site-publico.types';

export const SitePublicoService = {
  async getStockData(params: IGetStockParams): Promise<IPaginatedStock> {
    const { page, pageSize, brand, minPrice, maxPrice, search, sort, includeMontadoras = true } = params;

    // 1. Query Base
    let query = supabase
      .from('est_veiculos')
      .select(`
        *,
        montadora:cad_montadoras(id, nome, logo_url),
        modelo:cad_modelos(nome),
        versao:cad_versoes(nome),
        tipo_veiculo:cad_tipos_veiculos(nome)
      `, { count: 'exact' })
      .eq('status', 'DISPONIVEL')
      .eq('publicado_site', true);

    // 2. Filtros
    if (brand) {
      query = query.eq('montadora_id', brand);
    }

    if (minPrice) {
      query = query.gte('valor_venda', minPrice);
    }

    if (maxPrice) {
      query = query.lte('valor_venda', maxPrice);
    }

    // Busca Textual (Nome do modelo, versão ou placa)
    // Supabase não tem um "deep search" fácil em relações, então vamos simplificar:
    // Pesquisa apenas na placa ou tenta usar filtro de texto se houver coluna indexada.
    // Como os nomes de modelo/versão estão em outras tabelas, o ideal seria uma View ou função RPC.
    // Para simplificar agora, vamos assumir que o filtro de texto busca apenas na placa ou se tiver colunas desnormalizadas.
    // *Melhoria*: Buscar IDs compatíveis antes ou usar uma View. 
    // *Solução Fase 2*: Vamos buscar tudo e filtrar? Não, isso mata o propósito.
    // *Solução Robusta*: Usar o filtro or() nos campos da tabela principal (placa, chassi).
    // Se o usuário quiser buscar por nome do carro ("Corolla"), o ideal é termos o nome do modelo desnormalizado na tabela est_veiculos ou fazer um join.
    // Como não posso alterar o banco agora, vou filtrar pelo que der na tabela est_veiculos ou ignorar busca complexa de texto por enquanto.
    // *Ajuste*: Vou verificar se existe campo de busca textual. Se não, vou pular o search por texto em tabelas relacionadas por enquanto para não travar.
    if (search) {
      query = query.or(`placa.ilike.%${search}%`);
    }

    // 3. Ordenação
    if (sort === 'preco_asc') {
      query = query.order('valor_venda', { ascending: true });
    } else if (sort === 'preco_desc') {
      query = query.order('valor_venda', { ascending: false });
    } else {
      // Padrão: Mais recentes primeiro (equivalente a "nome" ou "recentes")
      query = query.order('created_at', { ascending: false });
    }

    // 4. Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error('Erro ao buscar estoque paginado:', error);
      throw error;
    }

    // 5. Montadoras (opcional para economizar egress/processamento)
    const montadoras = includeMontadoras ? await this.getMontadorasComEstoque() : undefined;

    return {
      veiculos: (data || []) as any,
      total: count || 0,
      page,
      pageSize,
      montadoras
    };
  },

  async getMontadorasComEstoque(): Promise<IMontadoraPublic[]> {
    const { data: allVeiculosIds } = await supabase
      .from('est_veiculos')
      .select('montadora_id')
      .eq('status', 'DISPONIVEL')
      .eq('publicado_site', true);

    const { data: allMontadoras } = await supabase
      .from('cad_montadoras')
      .select('id, nome, logo_url');

    const montadorasMap = new Map<string, IMontadoraPublic>();

    if (allVeiculosIds && allMontadoras) {
      const montadorasBase = new Map(allMontadoras.map(m => [m.id, m]));
      allVeiculosIds.forEach(v => {
        const mId = v.montadora_id;
        if (mId && montadorasBase.has(mId)) {
          if (!montadorasMap.has(mId)) {
            const mData = montadorasBase.get(mId)!;
            montadorasMap.set(mId, {
              id: mData.id,
              nome: mData.nome,
              logo_url: mData.logo_url,
              total_veiculos: 0
            });
          }
          montadorasMap.get(mId)!.total_veiculos += 1;
        }
      });
    }

    return Array.from(montadorasMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  },
  async getHomePageData(): Promise<IPublicPageData> {
    // 1. Busca Empresa
    const { data: empresa } = await supabase
      .from('config_empresa')
      .select('*')
      .limit(1)
      .maybeSingle();

    // 2. Busca Veículos Recentes (Limitado a 8)
    const { data: veiculosRecentes, error: vError } = await supabase
      .from('est_veiculos')
      .select(`
        *,
        montadora:cad_montadoras(id, nome, logo_url),
        modelo:cad_modelos(nome),
        versao:cad_versoes(nome),
        tipo_veiculo:cad_tipos_veiculos(nome)
      `)
      .eq('status', 'DISPONIVEL')
      .eq('publicado_site', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (vError) console.error('Erro ao buscar veículos recentes:', vError);

    // 3. Busca APENAS IDs e Montadoras para contagem (Query Leve)
    const { data: allVeiculosIds } = await supabase
      .from('est_veiculos')
      .select('montadora_id')
      .eq('status', 'DISPONIVEL')
      .eq('publicado_site', true);

    // 4. Busca dados das montadoras para montar o objeto completo
    const { data: allMontadoras } = await supabase
      .from('cad_montadoras')
      .select('id, nome, logo_url');

    // 5. Agrupa contagem em memória (muito rápido pois só tem IDs)
    const montadorasMap = new Map<string, IMontadoraPublic>();

    if (allVeiculosIds && allMontadoras) {
      // Cria mapa de montadoras base primeiro
      const montadorasBase = new Map(allMontadoras.map(m => [m.id, m]));

      allVeiculosIds.forEach(v => {
        const mId = v.montadora_id;
        if (mId && montadorasBase.has(mId)) {
          if (!montadorasMap.has(mId)) {
            const mData = montadorasBase.get(mId)!;
            montadorasMap.set(mId, {
              id: mData.id,
              nome: mData.nome,
              logo_url: mData.logo_url,
              total_veiculos: 0
            });
          }
          montadorasMap.get(mId)!.total_veiculos += 1;
        }
      });
    }

    const montadorasComEstoque = Array.from(montadorasMap.values())
      .sort((a, b) => a.nome.localeCompare(b.nome));

    return {
      empresa: (empresa || {}) as any,
      veiculos: (veiculosRecentes || []) as any,
      montadoras: montadorasComEstoque
    };
  },

  async getPublicData(): Promise<IPublicPageData> {
    // Busca veículos que estejam DISPONIVEIS E PUBLICADOS para o site
    const { data: allVeiculos, error: vError } = await supabase
      .from('est_veiculos')
      .select(`
        *,
        montadora:cad_montadoras(id, nome, logo_url),
        modelo:cad_modelos(nome),
        versao:cad_versoes(nome),
        tipo_veiculo:cad_tipos_veiculos(nome)
      `)
      .eq('status', 'DISPONIVEL')
      .eq('publicado_site', true)
      .order('created_at', { ascending: false });

    if (vError) console.error('Erro ao buscar veículos:', vError);

    const { data: empresa } = await supabase
      .from('config_empresa')
      .select('*')
      .limit(1)
      .maybeSingle();

    const montadorasMap = new Map<string, IMontadoraPublic>();

    (allVeiculos || []).forEach(v => {
      const m = (v as any).montadora;
      if (m && m.id) {
        if (!montadorasMap.has(m.id)) {
          montadorasMap.set(m.id, {
            id: m.id,
            nome: m.nome,
            logo_url: m.logo_url,
            total_veiculos: 0
          });
        }
        const entry = montadorasMap.get(m.id)!;
        entry.total_veiculos += 1;
      }
    });

    const montadorasComEstoque = Array.from(montadorasMap.values())
      .sort((a, b) => a.nome.localeCompare(b.nome));

    return {
      empresa: (empresa || {}) as any,
      veiculos: (allVeiculos || []) as any, // Sem slice agora para carregar tudo
      montadoras: montadorasComEstoque
    };
  }
};
