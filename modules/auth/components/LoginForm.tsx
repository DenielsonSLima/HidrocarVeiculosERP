
import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[10px] font-black text-white/70 uppercase mb-2 tracking-widest ml-1">E-mail</label>
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-black/40 group-focus-within:text-black transition-colors z-10 transition-transform duration-300 group-focus-within:scale-110">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
            </svg>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 outline-none transition-all font-bold backdrop-blur-sm"
            placeholder="exemplo@nexus.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-white/70 uppercase mb-2 tracking-widest ml-1">Senha de Acesso</label>
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-black/40 group-focus-within:text-black transition-colors z-10 transition-transform duration-300 group-focus-within:scale-110">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 outline-none transition-all font-mono backdrop-blur-sm"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
          <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">Lembrar acesso</span>
        </label>
        <button type="button" className="text-xs font-black text-white/80 hover:text-white hover:underline uppercase tracking-tighter transition-colors">Esqueceu a senha?</button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white text-[#004691] py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/20 hover:bg-emerald-400 hover:text-emerald-950 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-[#004691]/30 border-t-[#004691] rounded-full animate-spin" />
        ) : (
          <span>Entrar no Sistema</span>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
