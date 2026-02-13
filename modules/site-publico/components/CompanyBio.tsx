
import React from 'react';

const CompanyBio: React.FC = () => {
  return (
    <section id="sobre" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <span className="inline-block text-[#004691] text-[10px] font-black uppercase tracking-[0.8em] border-b-2 border-[#004691] pb-2">Tradição e Segurança</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
            Quem Somos <br /><span className="text-slate-400">HCV Veículos!!!!</span>
          </h2>

          <div className="space-y-8">
            <p className="text-xl text-slate-900 font-bold leading-relaxed">
              Um novo conceito de empresa!!!! Temos nos consagrado como uma das agências de automóveis de maior prestígio no mercado da Região.
            </p>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Somos especializados na venda de veículos novos e usados, nacionais e importados. Com certeza você não só apreciará como irá comprar seu veículo conosco. Todos nossos veículos são revisados criteriosamente, possibilitando dar aos nossos clientes tranquilidade na hora da compra.
            </p>
            <p className="text-lg text-[#004691] font-black uppercase tracking-tight">
              Não perca tempo! Compre seu veículo com quem mais entende do assunto. Nossos vendedores terão o prazer em atendê-lo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-l-4 border-[#004691] pl-6">
              <h4 className="text-4xl font-black text-slate-900">100%</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Revisados criteriosamente</p>
            </div>
            <div className="border-l-4 border-[#004691] pl-6">
              <h4 className="text-4xl font-black text-slate-900">Elite</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Maior Prestígio da Região</p>
            </div>
          </div>
        </div>

        <div className="relative h-full flex items-center justify-center">
          <div className="w-full aspect-[4/3] lg:aspect-video rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-slate-50 relative z-10">
            {/* Imagem Institucional Hidrocar Veículos */}
            <img src="/fachada-hidrocar.jpg" className="w-full h-full object-cover" alt="Fachada Hidrocar Veículos" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-[#004691] text-white p-8 rounded-[2rem] shadow-2xl max-w-[240px] z-20 animate-bounce-slow">
            <p className="text-3xl font-black mb-1">HCV</p>
            <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Excelência Sergipe em cada negociação automotiva.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyBio;
