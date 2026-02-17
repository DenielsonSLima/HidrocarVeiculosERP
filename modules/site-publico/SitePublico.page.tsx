import React, { useState, useEffect } from 'react';
import { SitePublicoService } from './site-publico.service';
import { IPublicPageData } from './site-publico.types';
import { IEmpresa } from '../ajustes/empresa/empresa.types';

// Componentes corrigidos conforme nomes reais dos arquivos
import PublicNavbar from './components/PublicNavbar';
import PublicHero from './components/PublicHero';
import PublicBrands from './components/PublicBrands';
import RecentVehicles from './components/RecentVehicles';
import AboutUs from './components/AboutUs';
import PublicContact from './components/PublicContact';
import PublicFooter from './components/PublicFooter';
import LazyMap from './components/LazyMap';
import PublicHomeSkeleton from './components/PublicHomeSkeleton';
import { setSEO, setDealerJsonLd, removeJsonLd } from './utils/seo';

const SitePublicoPage: React.FC = () => {
  const [data, setData] = useState<IPublicPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await SitePublicoService.getHomePageData();
        setData(res);
      } catch (err) {
        console.error("Erro ao carregar site público:", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Realtime: atualiza automaticamente quando veículos são adicionados, vendidos ou removidos
    // Usa debounce de 2s para evitar múltiplas re-fetches seguidas
    let realtimeTimeout: ReturnType<typeof setTimeout>;
    const subscription = SitePublicoService.subscribe(() => {
      clearTimeout(realtimeTimeout);
      realtimeTimeout = setTimeout(() => load(), 2000);
    });

    return () => {
      clearTimeout(realtimeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // SEO dinâmico: atualiza título, meta tags e JSON-LD quando os dados da empresa carregam
  useEffect(() => {
    const empresa = data?.empresa;
    const nome = empresa?.nome_fantasia || 'Hidrocar Veículos';
    const cidade = empresa?.cidade || 'Aracaju';
    const uf = empresa?.uf || 'SE';
    const telefone = empresa?.telefone || '';
    const logoUrl = empresa?.logo_url || `${window.location.origin}/logos/logohidrocarsimbolo.png`;

    setSEO({
      title: 'Hidrocar Veículos',
      description: `Encontre veículos selecionados com procedência comprovada na ${nome}. Referência em ${cidade}/${uf} para quem busca exclusividade e qualidade.`,
      url: window.location.origin
    });

    setDealerJsonLd({
      name: nome,
      description: `Loja de veículos selecionados com procedência comprovada em ${cidade}/${uf}.`,
      url: window.location.origin,
      phone: telefone.replace(/\D/g, '') ? `+55${telefone.replace(/\D/g, '')}` : undefined,
      address: {
        street: empresa?.logradouro ? `${empresa.logradouro}, ${empresa.numero}` : undefined,
        city: cidade,
        state: uf,
        zip: empresa?.cep,
      },
      image: logoUrl,
    });

    return () => {
      removeJsonLd();
    };
  }, [data?.empresa]);

  return (
    <div className="min-h-screen bg-white font-['Inter'] scroll-smooth antialiased">
      {/* Menu de Navegação Superior */}
      <PublicNavbar empresa={data?.empresa || {} as IEmpresa} />

      <main>
        {/* Hero Section */}
        <PublicHero />

        {loading ? (
          <PublicHomeSkeleton />
        ) : (
          <>
            {/* Vitrine de Marcas */}
            <PublicBrands montadoras={data?.montadoras || []} />

            {/* Últimos Veículos */}
            <RecentVehicles veiculos={data?.veiculos || []} />
          </>
        )}

        {/* Seções Institucionais */}
        <AboutUs />

        {/* Contatos Imersivo */}
        <PublicContact telefone={data?.empresa?.telefone} />

        {/* Localização - Espaçamentos reduzidos e Mapa Satélite Restaurado */}
        <section id="localizacao" className="pt-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center mb-6">
            <p className="text-[9px] font-black text-[#004691] uppercase tracking-[0.6em] mb-2">Nossa Localização</p>
            <h2 className="text-4xl font-[900] text-slate-900 uppercase tracking-tighter leading-none">
              {data?.empresa?.cidade || 'Aracaju'} / {data?.empresa?.uf || 'SE'}
            </h2>
          </div>

          {/* Container do Mapa: Borda a Borda em Modo Satélite Real */}
          <div className="w-full h-[350px] bg-slate-100 relative group overflow-hidden border-y border-slate-100">
            <LazyMap
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                data?.empresa
                  ? `${data.empresa.logradouro}, ${data.empresa.numero}, ${data.empresa.bairro}, ${data.empresa.cidade} - ${data.empresa.uf}`
                  : '-10.9155494,-37.0575372'
              )}&z=17&t=k&output=embed`}
              title={`Localização ${data?.empresa?.nome_fantasia || 'Hidrocar Veículos'}`}
            />
            <div className="absolute bottom-6 right-6 pointer-events-none bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#004691]">{data?.empresa?.nome_fantasia || 'Hidrocar Veículos'}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <PublicFooter empresa={data?.empresa || {} as IEmpresa} />
    </div >
  );
};

export default SitePublicoPage;