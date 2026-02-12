
import { supabase } from '../../../lib/supabase';
import { IGrupoDespesa, ICategoriaDespesa, TipoMacroDespesa } from './tipos-despesas.types';

const TABLE_GRUPOS = 'fin_despesas_grupos';
const TABLE_CATEGORIAS = 'fin_despesas_categorias';

export const TiposDespesasService = {
  // Busca Grupos e já faz o join com Categorias
  async getByTipo(tipo: TipoMacroDespesa): Promise<IGrupoDespesa[]> {
    const { data, error } = await supabase
      .from(TABLE_GRUPOS)
      .select(`
        *,
        categorias:fin_despesas_categorias(*)
      `)
      .eq('tipo', tipo)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar despesas:', error);
      return [];
    }

    // Ordenar as categorias via JS pois o Supabase order no join pode ser complexo
    const grupos = data as IGrupoDespesa[];
    grupos.forEach(g => {
      if (g.categorias) {
        g.categorias.sort((a, b) => a.nome.localeCompare(b.nome));
      }
    });

    return grupos;
  },

  // --- GRUPOS ---
  async saveGrupo(payload: Partial<IGrupoDespesa>): Promise<void> {
    const { categorias, ...rest } = payload; // Remove o array de categorias do payload
    const { error } = await supabase
      .from(TABLE_GRUPOS)
      .upsert({ ...rest, updated_at: new Date().toISOString() });

    if (error) throw error;
  },

  async deleteGrupo(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_GRUPOS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- CATEGORIAS ---
  async saveCategoria(payload: Partial<ICategoriaDespesa>): Promise<void> {
    const { error } = await supabase
      .from(TABLE_CATEGORIAS)
      .upsert({ ...payload, updated_at: new Date().toISOString() });

    if (error) throw error;
  },

  async deleteCategoria(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_CATEGORIAS)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  subscribe(onUpdate: () => void) {
    // Escuta mudanças em ambas as tabelas
    const channel = supabase.channel('public:despesas_tree');
    
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_GRUPOS }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_CATEGORIAS }, () => onUpdate())
      .subscribe();

    return channel;
  }
};
