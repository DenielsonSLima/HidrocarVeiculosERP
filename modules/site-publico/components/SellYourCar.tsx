
import React from 'react';

const SellYourCar: React.FC = () => {
  return (
    <section id="contato" className="py-24 bg-[#004691] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-12 md:p-20 border border-white/20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">Venda seu veículo <span className="text-blue-300">hoje mesmo.</span></h2>
            <p className="text-lg text-white/70 font-medium">Temos a melhor avaliação do mercado e pagamento à vista. Simples, rápido e seguro.</p>
          </div>
          <button className="px-12 py-6 bg-white text-[#004691] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-all shadow-2xl active:scale-95 whitespace-nowrap">
            Solicitar Avaliação
          </button>
        </div>
      </div>
    </section>
  );
};

export default SellYourCar;
