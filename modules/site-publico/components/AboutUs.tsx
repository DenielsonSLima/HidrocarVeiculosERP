import React from 'react';
import StoreFront from '../../../src/assets/153705.jpg';

const AboutUs: React.FC = () => {
  return (
    <section id="sobre" className="py-20 bg-white relative overflow-hidden scroll-mt-32">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Cabeçalho da Seção */}
        <div className="mb-10 space-y-4">
          <span className="inline-block text-[#004691] text-[10px] font-black uppercase tracking-[0.6em] border-b-2 border-indigo-600 pb-2">HCV Veículos</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
            Quem <span className="text-slate-400">Somos.</span>
          </h2>
        </div>

        {/* Conteúdo Principal + Imagem */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch mb-20">
          <div className="space-y-6 text-lg text-slate-700 font-medium leading-relaxed flex flex-col justify-center">
            <p>
              A Hidrocar Veículos é uma empresa sergipana especializada na compra e venda de veículos novos e seminovos. Atuamos com transparência, responsabilidade e compromisso, oferecendo aos nossos clientes segurança e tranquilidade em cada negociação.
            </p>
            <p>
              Trabalhamos com veículos revisados e procedência garantida, sempre buscando as melhores oportunidades do mercado para atender às necessidades da nossa região.
            </p>
            <p>
              Mais do que vender carros, construímos relacionamentos baseados em confiança, credibilidade e atendimento personalizado.
            </p>
          </div>

          <div className="relative w-full h-full min-h-[450px]">
            <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-slate-50">
              {/* Imagem Institucional (Fachada) */}
              <img src={StoreFront} className="w-full h-full object-cover" alt="Fachada Hidrocar Veículos" />
            </div>
          </div>
        </div>

        {/* Cards de Destaque - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-[#004691] to-[#001d3d] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/10 group">
            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <svg className="w-7 h-7 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-2xl font-black text-white leading-tight mb-3">Veículos revisados</h4>
            <p className="text-sm font-medium text-blue-100/80 leading-relaxed">Garantia de qualidade e procedência comprovada para sua segurança.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-br from-[#004691] to-[#001d3d] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/10 group">
            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <svg className="w-7 h-7 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-2xl font-black text-white leading-tight mb-3">Atendimento personalizado</h4>
            <p className="text-sm font-medium text-blue-100/80 leading-relaxed">Negociação transparente e suporte completo do início ao fim.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-br from-[#004691] to-[#001d3d] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/10 group">
            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <svg className="w-7 h-7 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h4 className="text-2xl font-black text-white leading-tight mb-3">+ de 20 anos de mercado</h4>
            <p className="text-sm font-medium text-blue-100/80 leading-relaxed">Tradição e credibilidade consolidada em todo o estado de Sergipe.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;