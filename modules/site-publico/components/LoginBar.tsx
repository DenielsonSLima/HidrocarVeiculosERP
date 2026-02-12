
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginBar: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full bg-[#002d5d] py-2 px-6 border-b border-white/10 relative z-[110]">
      <div className="max-w-7xl mx-auto flex justify-end items-center space-x-6">
        <span className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] hidden sm:block">
          Hidrocar Experience Center • Aracaju/SE
        </span>
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center space-x-2 text-[9px] font-black text-white uppercase tracking-widest hover:text-blue-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>Acesso Restrito</span>
        </button>
      </div>
    </div>
  );
};

export default LoginBar;
