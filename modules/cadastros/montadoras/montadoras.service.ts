
import { supabase } from '../../../lib/supabase';
import { IMontadora, IMontadoraFiltros, IMontadoraResponse, IMontadorasKpis } from './montadoras.types';

const TABLE = 'cad_montadoras';

export const MontadorasService = {
  /**
   * Busca todas as montadoras ordenadas alfabeticamente.
   */
  async getAll(): Promise<IMontadora[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error(`Erro ao buscar dados de ${TABLE}:`, error);
      return [];
    }
    return (data || []) as IMontadora[];
  },

  async getPaginated(filters: IMontadoraFiltros): Promise<IMontadoraResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' });

    if (filters.search) {
      query = query.ilike('nome', `%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('nome', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as IMontadora[],
      count: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getKpis(): Promise<IMontadorasKpis> {
    const { count: total } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });

    // Recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recent } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    return {
      total: total || 0,
      recentes: recent || 0
    };
  },

  /**
   * Salva ou atualiza uma montadora.
   */
  async save(payload: Partial<IMontadora>): Promise<IMontadora> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(`Erro ao salvar em ${TABLE}:`, error);
      throw error;
    }
    return data as IMontadora;
  },

  /**
   * Remove uma montadora pelo ID.
   */
  async remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao deletar de ${TABLE}:`, error);
      throw error;
    }
    return true;
  },

  /**
   * Ativa a escuta em tempo real.
   * @param onUpdate Callback disparado em qualquer mudança (INSERT, UPDATE, DELETE)
   */
  subscribe(onUpdate: () => void) {
    return supabase
      .channel('public:cad_montadoras')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => {
          onUpdate(); // Notifica o componente para recarregar os dados
        }
      )
      .subscribe();
  }
};
