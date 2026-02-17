
import { supabase } from '../../lib/supabase';
import { IPublicPageData, IMontadoraPublic, IGetStockParams, IPaginatedStock, IVeiculoPublic } from './site-publico.types';
import { IEmpresa } from '../ajustes/empresa/empresa.types';

// ─── Select padrão para veículos (evita duplicação) ───
const VEICULO_SELECT = `
  *,
  montadora:cad_montadoras(id, nome, logo_url),
  modelo:cad_modelos(nome),
  versao:cad_versoes(nome),
  tipo_veiculo:cad_tipos_veiculos(nome)
`;

// ─── Cache simples em memória para dados da empresa (raramente muda) ───
let _empresaCache: { data: IEmpresa | null; ts: number } | null = null;
const EMPRESA_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const SitePublicoService = {

  /**
   * Busca dados da empresa com cache em memória (TTL: 5 min).
   * Evita re-fetch desnecessário já que raramente muda.
   */
  async getEmpresa(): Promise<IEmpresa> {
    const now = Date.now();
    if (_empresaCache && (now - _empresaCache.ts < EMPRESA_CACHE_TTL)) {
      return _empresaCache.data as IEmpresa;
    }

    const { data: empresa } = await supabase
      .from('config_empresa')
      .select('*')
      .limit(1)
      .maybeSingle();

    _empresaCache = { data: empresa as IEmpresa | null, ts: now };
    return (empresa || {}) as IEmpresa;
  },

  /**
   * Busca montadoras que possuem veículos disponíveis no site.
   * Faz apenas 2 queries leves (IDs + montadoras) e agrupa em memória.
   */
  async getMontadorasComEstoque(): Promise<IMontadoraPublic[]> {
    const [{ data: veiculoIds }, { data: allMontadoras }] = await Promise.all([
      supabase
        .from('est_veiculos')
        .select('montadora_id')
        .eq('status', 'DISPONIVEL')
        .eq('publicado_site', true),
      supabase
        .from('cad_montadoras')
        .select('id, nome, logo_url')
    ]);

    if (!veiculoIds || !allMontadoras) return [];

    const montadorasBase = new Map(allMontadoras.map(m => [m.id, m]));
    const montadorasMap = new Map<string, IMontadoraPublic>();

    for (const v of veiculoIds) {
      const mId = v.montadora_id;
      if (!mId || !montadorasBase.has(mId)) continue;

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

    return Array.from(montadorasMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  },

  /**
   * Busca estoque paginado com filtros. Usa o método compartilhado getMontadorasComEstoque
   * em vez de duplicar a lógica.
   */
  async getStockData(params: IGetStockParams): Promise<IPaginatedStock> {
    const { page, pageSize, brand, minPrice, maxPrice, search, sort, includeMontadoras = true } = params;

    let query = supabase
      .from('est_veiculos')
      .select(VEICULO_SELECT, { count: 'exact' })
      .eq('status', 'DISPONIVEL')
      .eq('publicado_site', true);

    if (brand) query = query.eq('montadora_id', brand);
    if (minPrice) query = query.gte('valor_venda', minPrice);
    if (maxPrice) query = query.lte('valor_venda', maxPrice);

    // Busca por placa ou modelo (sanitiza caracteres especiais do Postgres LIKE)
    if (search) {
      const sanitized = search.replace(/[%_\\]/g, '');
      if (sanitized.length > 0) {
        query = query.or(`placa.ilike.%${sanitized}%,modelo.nome.ilike.%${sanitized}%,montadora.nome.ilike.%${sanitized}%`);
      }
    }

    // Ordenação
    if (sort === 'preco_asc') {
      query = query.order('valor_venda', { ascending: true });
    } else if (sort === 'preco_desc') {
      query = query.order('valor_venda', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Executa em paralelo: veículos + montadoras (se necessário)
    const [queryResult, montadoras] = await Promise.all([
      query.range(from, to),
      includeMontadoras ? this.getMontadorasComEstoque() : Promise.resolve(undefined)
    ]);

    if (queryResult.error) {
      console.error('Erro ao buscar estoque paginado:', queryResult.error);
      throw queryResult.error;
    }

    return {
      veiculos: (queryResult.data || []) as IVeiculoPublic[],
      total: queryResult.count || 0,
      page,
      pageSize,
      montadoras
    };
  },

  /**
   * Dados da home page: empresa, veículos recentes (8) e montadoras.
   * Executa todas as queries em paralelo para máxima velocidade.
   */
  async getHomePageData(): Promise<IPublicPageData> {
    const [empresa, veiculosResult, montadoras] = await Promise.all([
      this.getEmpresa(),
      supabase
        .from('est_veiculos')
        .select(VEICULO_SELECT)
        .eq('status', 'DISPONIVEL')
        .eq('publicado_site', true)
        .order('created_at', { ascending: false })
        .limit(8),
      this.getMontadorasComEstoque()
    ]);

    if (veiculosResult.error) {
      console.error('Erro ao buscar veículos recentes:', veiculosResult.error);
    }

    return {
      empresa,
      veiculos: (veiculosResult.data || []) as IVeiculoPublic[],
      montadoras
    };
  },

  /** Invalida cache da empresa (chamar ao editar dados da empresa) */
  invalidateEmpresaCache() {
    _empresaCache = null;
  },

  /**
   * Busca um veículo específico por ID com todas as relações,
   * características, opcionais e cores para a página de detalhes pública.
   */
  async getVeiculoDetails(id: string): Promise<{
    veiculo: IVeiculoPublic | null;
    caracteristicas: { id: string; nome: string }[];
    opcionais: { id: string; nome: string }[];
    cores: { id: string; nome: string; rgb_hex: string }[];
    empresa: IEmpresa;
  }> {
    const [veiculoResult, caracResult, opResult, coresResult, empresa] = await Promise.all([
      supabase
        .from('est_veiculos')
        .select(VEICULO_SELECT)
        .eq('id', id)
        .eq('status', 'DISPONIVEL')
        .maybeSingle(),
      supabase.from('cad_caracteristicas').select('id, nome'),
      supabase.from('cad_opcionais').select('id, nome'),
      supabase.from('cad_cores').select('id, nome, rgb_hex'),
      this.getEmpresa()
    ]);

    return {
      veiculo: veiculoResult.data as IVeiculoPublic | null,
      caracteristicas: caracResult.data || [],
      opcionais: opResult.data || [],
      cores: coresResult.data || [],
      empresa
    };
  },

  /**
   * Realtime: escuta INSERT, UPDATE e DELETE na tabela est_veiculos
   * para atualizar automaticamente o site público.
   */
  subscribe(onUpdate: () => void) {
    return supabase
      .channel('site_publico_estoque_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'est_veiculos' }, () => onUpdate())
      .subscribe();
  }
};
