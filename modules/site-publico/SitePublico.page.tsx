import React, { useState, useEffect } from 'react';
import { SitePublicoService } from './site-publico.service';
import { IPublicPageData } from './site-publico.types';

// Componentes corrigidos conforme nomes reais dos arquivos
import PublicNavbar from './components/PublicNavbar';
import PublicHero from './components/PublicHero';
import PublicBrands from './components/PublicBrands';
import RecentVehicles from './components/RecentVehicles';
import AboutUs from './components/AboutUs';
import PublicContact from './components/PublicContact';
import PublicFooter from './components/PublicFooter';
import LazyMap from './components/LazyMap';

const SitePublicoPage: React.FC = () => {
  const [data, setData] = useState<IPublicPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await SitePublicoService.getPublicData();
        setData(res);
      } catch (err) {
        console.error("Erro ao carregar site público:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white font-['Inter'] scroll-smooth antialiased">
      {/* Menu de Navegação Superior */}
      <PublicNavbar empresa={data?.empresa || {} as any} />

      <main>
        {/* Hero Section */}
        <PublicHero />

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#004691] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sincronizando Vitrine...</p>
          </div>
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
        <PublicContact />

        {/* Localização - Espaçamentos reduzidos e Mapa Satélite Restaurado */}
        <section id="localizacao" className="pt-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center mb-6">
            <p className="text-[9px] font-black text-[#004691] uppercase tracking-[0.6em] mb-2">Visite nosso Showroom</p>
            <h2 className="text-4xl font-[900] text-slate-900 uppercase tracking-tighter leading-none">Aracaju / SE</h2>
          </div>

          {/* Container do Mapa: Borda a Borda em Modo Satélite Real */}
          <div className="w-full h-[350px] bg-slate-100 relative group overflow-hidden border-y border-slate-100">
            <LazyMap
              src="https://www.google.com/maps?q=-10.9255147,-37.0583626&z=17&t=k&output=embed"
              title="Localização HCV Experience"
            />
            <div className="absolute bottom-6 right-6 pointer-events-none bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#004691]">HCV Experience Center - Matriz</span>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <PublicFooter empresa={data?.empresa || {} as any} />
    </div>
  );
};

export default SitePublicoPage;