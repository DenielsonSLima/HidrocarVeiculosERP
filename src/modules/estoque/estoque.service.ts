
import { supabase } from '../../lib/supabase';
import { IVeiculo } from './estoque.types';

const TABLE = 'est_veiculos';

export const EstoqueService = {
  async getAll(): Promise<IVeiculo[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        montadora:cad_montadoras(nome),
        modelo:cad_modelos(nome),
        versao:cad_versoes(nome)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar estoque:', error);
      return [];
    }
    return data as IVeiculo[];
  },

  async getById(id: string): Promise<IVeiculo | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as IVeiculo;
  },

  async save(payload: Partial<IVeiculo>): Promise<IVeiculo> {
    const { id, fotos, caracteristicas_ids, opcionais_ids, ...rest } = payload;

    // Tratamento de dados antes de enviar
    const dataToSave = {
      ...rest,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(id ? { id, ...dataToSave } : dataToSave)
      .select()
      .single();

    if (error) throw error;

    const veiculoId = data.id;

    // TODO: Salvar relacionamentos N:N (Fotos, Caracteristicas, Opcionais) em tabelas pivo
    // Por enquanto, assumimos que o backend lida com isso ou simplificamos no protótipo.

    return data as IVeiculo;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Upload real para o Supabase Storage
  async uploadFoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `vehicles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('company-assets') // Utilizando o bucket existente identificado
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao fazer upload da foto:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('company-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
