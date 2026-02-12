
import { supabase } from '../../../lib/supabase';
import { IModelo, IModelosAgrupados } from './modelos.types';

const TABLE = 'cad_modelos';

export const ModelosService = {
  async getAll(): Promise<(IModelo & { versoes_count: number })[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, montadora:cad_montadoras(*), tipo_veiculo:cad_tipos_veiculos(*), versoes:cad_versoes(count)')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar modelos:', error);
      return [];
    }

    return (data || []).map(m => ({
      ...m,
      versoes_count: m.versoes?.[0]?.count || 0
    })) as (IModelo & { versoes_count: number })[];
  },

  // Novo método otimizado para o formulário de estoque
  async getByMontadoraAndTipo(montadoraId: string, tipoId: string): Promise<IModelo[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, nome') // Traz apenas o necessário para o dropdown
      .eq('montadora_id', montadoraId)
      .eq('tipo_veiculo_id', tipoId)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar modelos filtrados:', error);
      return [];
    }
    return data as IModelo[];
  },

  async getByMontadora(montadoraId: string): Promise<IModelo[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, montadora:cad_montadoras(*), tipo_veiculo:cad_tipos_veiculos(*), versoes:cad_versoes(count)')
      .eq('montadora_id', montadoraId)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar modelos da montadora:', error);
      return [];
    }

    return (data || []).map(m => ({
      ...m,
      versoes_count: m.versoes?.[0]?.count || 0
    })) as IModelo[];
  },

  async getAgrupados(): Promise<IModelosAgrupados> {
    const modelos = await this.getAll();

    const agrupado = modelos.reduce((acc: IModelosAgrupados, modelo) => {
      const montadora = modelo.montadora;
      if (!montadora) return acc;

      if (!acc[montadora.nome]) {
        acc[montadora.nome] = {
          montadora,
          modelos: []
        };
      }
      acc[montadora.nome].modelos.push(modelo);
      return acc;
    }, {});

    return agrupado;
  },

  async save(payload: Partial<IModelo>): Promise<IModelo> {
    const cleanData: any = {
      nome: payload.nome,
      montadora_id: payload.montadora_id,
      tipo_veiculo_id: payload.tipo_veiculo_id,
      foto_url: payload.foto_url,
      updated_at: new Date().toISOString()
    };

    if (payload.id) {
      cleanData.id = payload.id;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(cleanData)
      .select()
      .single();

    if (error) {
      console.error('Erro detalhado ao salvar modelo:', error);
      throw error;
    }
    return data as IModelo;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  subscribe(onUpdate: () => void) {
    return supabase
      .channel('public:cad_modelos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        () => onUpdate()
      )
      .subscribe();
  }
};
