
import React, { useState, useEffect } from 'react';

// Imagens dos slides — ficam em public/slides/
// Para adicionar novos slides, coloque novas imagens nessa pasta e adicione aqui.
const slides = [
  {
    image: '/slides/slide-1.jpg',
    title: 'Seu Carro dos Sonhos Está Aqui',
    subtitle: 'Seminovos selecionados com procedência garantida e as melhores condições de Aracaju.'
  },
  {
    image: '/slides/slide-2.jpg',
    title: 'Qualidade que Você Pode Confiar',
    subtitle: 'Cada veículo passa por rigorosa inspeção. Compre com segurança na Hidrocar.'
  },
  {
    image: '/slides/slide-3.jpg',
    title: 'Facilidade na Troca e Financiamento',
    subtitle: 'Aceitamos seu usado como entrada. Parcelas que cabem no seu bolso.'
  }
];

const PublicHero: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.image} className="absolute inset-0 w-full h-full object-cover scale-105" alt="Slide" />
          {/* Névoa azul suave (intensidade reduzida) */}
          <div className="absolute inset-0 bg-slate-950/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#004691]/60 via-transparent to-transparent"></div>

          {/* Texto posicionado na parte inferior para não cobrir os carros */}
          <div className="absolute inset-0 z-10 flex items-end pb-20">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className={`max-w-2xl transition-all duration-1000 ${index === current ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 space-y-4">
                  <p className="text-[#00c6ff] text-xs font-black uppercase tracking-[0.5em]">Hidrocar Veículos · Aracaju/SE</p>
                  <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-white font-medium max-w-xl leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <a href="#estoque" className="inline-block px-8 py-4 bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-red-700 transition-all shadow-2xl">
                      Ver Estoque
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PublicHero;
