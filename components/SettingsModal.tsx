
import React, { useState } from 'react';
import { Theme, Language, User, FontFamily, FontSize, Story } from '../types.ts';
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
  currentStory: Story | null;
  onPublishStory: (s: Story) => void;
  onDeleteStory: (id: string) => void;
  onExport: (format: 'md' | 'pdf') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, theme, setTheme, lang, setLang, user, setUser,
  fontFamily, setFontFamily, fontSize, setFontSize,
  currentStory, onPublishStory, onDeleteStory, onExport
}) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const t = TRANSLATIONS[lang];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ 
      id: Date.now().toString(), 
      name: name || 'Escritor Criativo', 
      email: email || 'autor@chatfic.ai' 
    });
  };

  const handleShare = () => {
    if (!currentStory) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${btoa(unescape(encodeURIComponent(JSON.stringify(currentStory))))}`;
    navigator.clipboard.writeText(shareUrl);
    alert(t.link_copied);
  };

  const fontOptions: { id: FontFamily; label: string; class: string }[] = [
    { id: 'sans', label: t.font_sans, class: 'font-sans' },
    { id: 'serif', label: t.font_serif, class: 'font-serif' },
    { id: 'mono', label: t.font_mono, class: 'font-mono' },
  ];

  const sizeOptions: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <h2 className="text-3xl font-black tracking-tighter">{t.settings}</h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-8 py-4 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
          {/* Conta Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.account}</h3>
            {user ? (
              <div className="bg-gray-50 dark:bg-zinc-800 p-5 rounded-[2rem] flex items-center justify-between border border-gray-100 dark:border-zinc-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black">{user.name}</p>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => setUser(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">{t.logout}</button>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-3 bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800">
                {!isLoginView && (
                  <input 
                    type="text" 
                    placeholder="Nome de autor" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border-0 rounded-2xl px-5 py-4 text-xs font-bold outline-none ring-1 ring-gray-100 dark:ring-zinc-700 focus:ring-indigo-500 transition-all" 
                    required 
                  />
                )}
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border-0 rounded-2xl px-5 py-4 text-xs font-bold outline-none ring-1 ring-gray-100 dark:ring-zinc-700 focus:ring-indigo-500 transition-all" 
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border-0 rounded-2xl px-5 py-4 text-xs font-bold outline-none ring-1 ring-gray-100 dark:ring-zinc-700 focus:ring-indigo-500 transition-all" 
                  required 
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                  {isLoginView ? t.login : t.signup}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="w-full text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 hover:underline"
                >
                  {isLoginView ? "Criar nova conta" : "Já tenho uma conta"}
                </button>
              </form>
            )}
          </section>

          {/* Preferências Globais */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Preferências Globais</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 ml-1">{t.lang}</label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-2xl px-4 py-4 text-xs font-black outline-none ring-1 ring-gray-100 dark:ring-zinc-700"
                >
                  <option value="pt">🇧🇷 Português</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 ml-1">{t.theme}</label>
                <div className="flex bg-gray-50 dark:bg-zinc-800 p-1.5 rounded-2xl ring-1 ring-gray-100 dark:ring-zinc-700 h-[52px]">
                  <button onClick={() => setTheme('light')} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${theme === 'light' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>{t.light}</button>
                  <button onClick={() => setTheme('dark')} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-zinc-700 shadow-md text-white' : 'text-gray-400'}`}>{t.dark}</button>
                </div>
              </div>
            </div>
          </section>

          {/* Gerenciamento do Chat */}
          {currentStory && (
            <section className="space-y-4 animate-in slide-in-from-bottom-2 duration-400">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Controle da História</h3>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onExport('md')} className="flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-gray-50 dark:border-zinc-700 hover:border-indigo-500 transition-all">
                    <span>💾</span> Markdown
                  </button>
                  <button onClick={() => onExport('pdf')} className="flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-gray-50 dark:border-zinc-700 hover:border-indigo-500 transition-all">
                    <span>🖨️</span> PDF
                  </button>
                </div>
                <button onClick={handleShare} className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 active:scale-95 transition-all">
                   <span>🔗</span> {t.share_link}
                </button>
                <button onClick={() => { onPublishStory(currentStory); onClose(); }} className="flex items-center gap-3 px-6 py-4 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-100">
                   <span>🌍</span> {t.publish_community}
                </button>
                <button onClick={() => { if(confirm(t.delete_confirm)) { onDeleteStory(currentStory.id); onClose(); } }} className="flex items-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-red-100">
                   <span>🗑️</span> {t.delete_chat}
                </button>
              </div>
            </section>
          )}

          {/* Visual da Prosa */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Estética Literária</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-black block">{t.font_family}</label>
              <div className="grid grid-cols-3 gap-2">
                {fontOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFontFamily(opt.id)}
                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${fontFamily === opt.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm' : 'border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                  >
                    <span className={`${opt.class} text-2xl font-black`}>Ab</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black block">{t.font_size}</label>
              <div className="flex bg-gray-50 dark:bg-zinc-800 p-1.5 rounded-2xl ring-1 ring-gray-100 dark:ring-zinc-700">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${fontSize === size ? 'bg-white dark:bg-zinc-700 shadow-md text-indigo-600 dark:text-white' : 'text-gray-400'}`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-gray-50 dark:border-zinc-800 text-center bg-gray-50/50 dark:bg-zinc-900/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">ChatFic AI • Build 1.9</p>
        </div>
      </div>
    </div>
  );
};
