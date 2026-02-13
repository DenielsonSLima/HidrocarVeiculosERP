
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { IEmpresa } from '../../ajustes/empresa/empresa.types';

interface Props {
  empresa: IEmpresa;
}

const PublicNavbar: React.FC<Props> = ({ empresa }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    const offset = 140; // Ajuste para descer mais um pouco (aprox 30px a mais que o padrão)

    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[120] bg-[#001d3d] shadow-2xl transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo à Esquerda */}
        <div
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div className="bg-white p-2 rounded-xl transform group-hover:rotate-6 transition-transform shadow-lg">
            <img src="/logos/logohidrocarsimbolo.png" alt="Hidrocar" className="w-14 h-14 object-contain" />
          </div>
          <span className="text-2xl font-[900] tracking-tighter uppercase text-white">
            Hidrocar<span className="bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent">VEÍCULOS</span>
          </span>
        </div>

        {/* Menu Centralizado */}
        <div className="hidden lg:flex items-center space-x-10">
          <div
            onClick={() => {
              if (location.pathname === '/estoque-publico') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/estoque-publico');
              }
            }}
            className="font-['Outfit'] text-sm font-bold uppercase tracking-widest text-blue-50 hover:text-white transition-all relative group cursor-pointer"
          >
            Estoque
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
          </div>
          <a href="#" onClick={(e) => handleScroll(e, 'sobre')} className="font-['Outfit'] text-sm font-bold uppercase tracking-widest text-blue-50 hover:text-white transition-all relative group">
            Quem Somos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
          </a>
          <a href="#" onClick={(e) => handleScroll(e, 'localizacao')} className="font-['Outfit'] text-sm font-bold uppercase tracking-widest text-blue-50 hover:text-white transition-all relative group">
            Localização
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
          </a>
          <a href="#" onClick={(e) => handleScroll(e, 'contato')} className="font-['Outfit'] text-sm font-bold uppercase tracking-widest text-blue-50 hover:text-white transition-all relative group">
            Contato
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
          </a>
        </div>

        {/* Ações à Direita */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-[9px] font-black text-blue-200 uppercase tracking-widest hover:text-white transition-colors border border-blue-400/30 px-4 py-2 rounded-xl"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Área Restrita</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
