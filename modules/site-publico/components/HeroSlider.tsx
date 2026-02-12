
import React, { useState, useEffect } from 'react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920',
    title: 'A Elite Automotiva',
    subtitle: 'Curadoria exclusiva de veículos selecionados em Sergipe.'
  },
  {
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920',
    title: 'Performance e Luxo',
    subtitle: 'Onde o seu sonho encontra a potência que você merece.'
  },
  {
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1920',
    title: 'Sua Próxima Conquista',
    subtitle: 'Segurança absoluta e procedência garantida HCV.'
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-slate-900">
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.image} className="w-full h-full object-cover scale-105" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-center relative z-10">
             <div className={`max-w-3xl space-y-6 transition-all duration-1000 delay-300 ${index === current ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                <p className="text-[#00c6ff] text-xs font-black uppercase tracking-[0.5em]">HCV Experience</p>
                <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase drop-shadow-2xl">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/70 font-medium max-w-xl leading-relaxed">
                  {slide.subtitle}
                </p>
             </div>
          </div>
        </div>
      ))}

      {/* Navegação de Pontos */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
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

export default HeroSlider;
