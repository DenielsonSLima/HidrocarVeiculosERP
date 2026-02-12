
import { supabase } from '../../lib/supabase';
import { IPublicPageData, IMontadoraPublic } from './site-publico.types';

export const SitePublicoService = {
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
