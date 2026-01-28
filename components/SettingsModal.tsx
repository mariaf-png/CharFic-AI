
import React, { useState } from 'react';
import { Theme, Language, User, FontFamily, FontSize } from '../types.ts';
import { TRANSLATIONS } from '../constants.tsx';

interface SettingsModalProps {
  onClose: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, theme, setTheme, lang, setLang, user, setUser,
  fontFamily, setFontFamily, fontSize, setFontSize
}) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const t = TRANSLATIONS[lang];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ id: '1', name: 'Escritor Criativo', email: 'autor@chatfic.ai' });
  };

  const fontOptions: { id: FontFamily; label: string; class: string }[] = [
    { id: 'sans', label: t.font_sans, class: 'font-sans' },
    { id: 'serif', label: t.font_serif, class: 'font-serif' },
    { id: 'mono', label: t.font_mono, class: 'font-mono' },
  ];

  const sizeOptions: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">{t.settings}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-8 py-4 space-y-8 overflow-y-auto flex-1 max-h-[70vh] custom-scrollbar">
          {/* Conta Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.account}</h3>
            {user ? (
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">EC</div>
                  <div>
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-[10px] opacity-50">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => setUser(null)} className="text-xs text-red-500 font-bold hover:underline">{t.logout}</button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="email" placeholder="E-mail" className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 py-3 text-sm" required />
                <input type="password" placeholder="Senha" className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 py-3 text-sm" required />
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                  {isLoginView ? t.login : t.signup}
                </button>
                <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="w-full text-xs text-gray-400 hover:text-indigo-500">
                  {isLoginView ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
                </button>
              </form>
            )}
          </section>

          {/* Chat Customization */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Customização do Chat</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-bold block">{t.font_family}</label>
              <div className="grid grid-cols-3 gap-2">
                {fontOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFontFamily(opt.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm flex flex-col items-center gap-1 ${fontFamily === opt.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                  >
                    <span className={`${opt.class} text-lg`}>Aa</span>
                    <span className="text-[10px] font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold block">{t.font_size}</label>
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl justify-between">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${fontSize === size ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Preferências Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{t.theme}</h3>
                <p className="text-[10px] text-gray-400">Personalize a aparência</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button 
                  onClick={() => setTheme('light')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >
                  {t.light}
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-zinc-700 shadow-sm text-white' : 'text-gray-400'}`}
                >
                  {t.dark}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{t.lang}</h3>
                <p className="text-[10px] text-gray-400">Idioma da interface</p>
              </div>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-gray-100 dark:bg-zinc-800 border-0 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
              >
                <option value="pt">Português (BR)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
            
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase mb-1">{t.fandom_fidelity}</h4>
              <p className="text-[10px] text-indigo-800/60 dark:text-indigo-300/60">{t.fandom_desc}</p>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 text-center text-[9px] text-gray-400 opacity-50">
          ChatFic AI v1.3.0 • 📖
        </div>
      </div>
    </div>
  );
};
