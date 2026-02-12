
import { supabase } from '../../lib/supabase';
import { IDashboardStats } from './inicio.types';

export const InicioService = {
  async getDashboardStats(): Promise<IDashboardStats> {
    // Busca dados essenciais em paralelo para evitar gargalos de rede (Supabase Speed Fix)
    const [veiculosRes, parceirosRes] = await Promise.all([
      supabase
        .from('est_veiculos')
        .select('valor_venda')
        .eq('status', 'DISPONIVEL'),
      
      supabase
        .from('parceiros')
        .select('*', { count: 'exact', head: true })
    ]);

    const valorGlobal = (veiculosRes.data || []).reduce((acc, v) => acc + (v.valor_venda || 0), 0);

    return {
      totalEstoque: veiculosRes.data?.length || 0,
      valorGlobalEstoque: valorGlobal,
      totalParceiros: parceirosRes.count || 0,
      vendasMesAtual: 0, 
      lucroProjetado: 0
    };
  },

  async getRecentArrivals() {
    // Carrega apenas o necessário para o dashboard inicial, otimizando o peso da query
    const { data } = await supabase
      .from('est_veiculos')
      .select(`
        id, 
        placa, 
        montadora:cad_montadoras(nome, logo_url), 
        modelo:cad_modelos(nome),
        fotos
      `)
      .eq('status', 'DISPONIVEL')
      .order('created_at', { ascending: false })
      .limit(3);
    
    return data || [];
  }
};
