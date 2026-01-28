
import React, { useState, useRef, useEffect } from 'react';
import { Message, Story, WritingModel, Language, FontFamily, FontSize } from '../types.ts';
import { TRANSLATIONS } from '../constants.tsx';

interface ChatAreaProps {
  story: Story | null;
  onSendMessage: (content: string, setup?: { title: string, universe: string, model: WritingModel }) => void;
  isGenerating: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onDeleteStory: (storyId: string) => void;
  onExport: (format: 'md' | 'pdf') => void;
  onModelChange: (model: WritingModel) => void;
  onPublish: (story: Story) => void;
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  lang: Language;
  fontFamily: FontFamily;
  fontSize: FontSize;
}

const MODEL_LABELS: Record<WritingModel, { label: string, icon: string, desc: string }> = {
  balanced: { label: 'Equilibrado', icon: '⚖️', desc: 'Narrativa fluída e coerente' },
  descriptive: { label: 'Descritivo', icon: '🌲', desc: 'Rico em detalhes e world-building' },
  dramatic: { label: 'Dramático', icon: '🎭', desc: 'Intensidade e emoção profunda' },
  angst: { label: 'Angst', icon: '💧', desc: 'Sofrimento e introspecção' },
  action: { label: 'Ação', icon: '⚔️', desc: 'Ritmo rápido e coreografado' },
  humorous: { label: 'Cômico', icon: '🤡', desc: 'Diálogos rápidos e sarcasmo' },
  horror: { label: 'Terror', icon: '👁️', desc: 'Suspense e atmosfera sombria' },
  unchained: { label: 'Sem Limites', icon: '🔓', desc: 'Liberdade criativa total' }
};

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  story, 
  onSendMessage, 
  isGenerating, 
  onModelChange,
  onOpenSidebar,
  onOpenSettings,
  lang,
  fontFamily,
  fontSize
}) => {
  const [inputValue, setInputValue] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUniverse, setNewUniverse] = useState('');
  const [selectedModel, setSelectedModel] = useState<WritingModel>('balanced');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [story?.messages, isGenerating]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    
    if (!story) {
      if (!newTitle.trim() || !newUniverse.trim()) return;
      onSendMessage(inputValue, { title: newTitle, universe: newUniverse, model: selectedModel });
    } else {
      onSendMessage(inputValue);
    }
    setInputValue('');
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (!line.trim() && i > 0) return <div key={i} className="h-4" />;

      const isChapter = line.trim().match(/^Capítulo/i);
      
      // Markdown-ish processing: **bold** and *italic*
      // First, handle bold
      let processed = line;
      const parts = processed.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      const elements = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-black text-zinc-950 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={j} className="italic text-indigo-700/80 dark:text-indigo-400/80">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isChapter) {
        return (
          <h2 key={i} className="text-4xl md:text-6xl font-black text-indigo-600 dark:text-indigo-400 mt-12 mb-8 tracking-tighter leading-none animate-in fade-in slide-in-from-left-4 duration-500">
            {elements}
          </h2>
        );
      }

      return <p key={i} className="mb-3 leading-relaxed">{elements}</p>;
    });
  };

  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const sizeClass = `text-${fontSize}`;

  return (
    <div className={`flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 transition-colors overflow-hidden ${fontClass} ${sizeClass}`}>
      <header className="h-16 lg:h-20 border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSidebar}
            className="lg:hidden p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {story ? (
            <div className="flex flex-col truncate">
              <h2 className="text-sm font-black truncate max-w-[150px] md:max-w-md">{story.title}</h2>
              <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{story.universe}</span>
            </div>
          ) : (
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.new_story}</h2>
          )}
        </div>

        <button 
          onClick={onOpenSettings}
          className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl text-gray-500 hover:text-indigo-600 hover:rotate-90 transition-all duration-300 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-12 custom-scrollbar print-area">
        {!story ? (
          <div className="max-w-2xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4">
              <div className="text-7xl md:text-9xl mb-6 animate-page-flip inline-block">📖</div>
              <h3 className="text-3xl md:text-5xl font-black tracking-tight">{t.new_story}</h3>
              <p className="text-gray-400 font-medium">Sua próxima obra-prima começa agora.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{t.title}</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Dê um nome épico..." className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-3xl px-8 py-5 text-sm md:text-base outline-none focus:ring-2 ring-indigo-500/20 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{t.universe}</label>
                <input type="text" value={newUniverse} onChange={(e) => setNewUniverse(e.target.value)} placeholder="Hogwarts, Gotham, Multiverso..." className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-3xl px-8 py-5 text-sm md:text-base outline-none focus:ring-2 ring-indigo-500/20 transition-all" />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 pb-10">
            {story.messages.map((msg) => (
              <div key={msg.id} className={`group animate-in fade-in slide-in-from-bottom-2 duration-400 ${msg.role === 'user' ? 'ml-auto max-w-[90%]' : 'max-w-full'}`}>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-25">{msg.role === 'user' ? 'Autor' : 'IA'}</span>
                </div>
                <div className={`p-6 md:p-8 rounded-[2.5rem] shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 border border-gray-100 dark:border-zinc-800'}`}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            
            {isGenerating && (
              <div className="max-w-[80%] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{t.writing}</span>
                </div>
                <div className="p-6 md:p-8 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 shimmer-bg animate-shimmer shadow-inner flex items-center">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-dot-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-dot-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-dot-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <footer className="p-4 md:p-8 bg-white dark:bg-zinc-950 border-t border-gray-50 dark:border-zinc-900 z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <div className="relative" ref={menuRef}>
            <button type="button" onClick={() => setIsModelMenuOpen(!isModelMenuOpen)} className="h-14 md:h-16 w-14 md:w-16 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-2xl hover:bg-gray-100 transition-all">
              {MODEL_LABELS[selectedModel].icon}
            </button>
            {isModelMenuOpen && (
              <div className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {(Object.entries(MODEL_LABELS) as [WritingModel, typeof MODEL_LABELS['balanced']][]).map(([key, info]) => (
                    <button key={key} type="button" onClick={() => { setSelectedModel(key); onModelChange(key); setIsModelMenuOpen(false); }} className={`w-full text-left p-3 rounded-2xl flex items-start gap-4 transition-all ${selectedModel === key ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-100' : 'hover:bg-gray-50'}`}>
                      <span className="text-2xl mt-1">{info.icon}</span>
                      <div>
                        <p className="text-xs font-black text-indigo-600 uppercase">{info.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium leading-tight mt-1">{info.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={t.placeholder} 
              disabled={isGenerating} 
              className="w-full h-14 md:h-16 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl px-6 md:px-8 pr-16 text-sm md:text-base outline-none focus:ring-2 ring-indigo-500/20 transition-all disabled:opacity-50" 
            />
            <button type="submit" disabled={isGenerating || !inputValue.trim() || (!story && (!newTitle.trim() || !newUniverse.trim()))} className="absolute right-2 top-2 h-10 md:h-12 w-10 md:w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </form>
      </footer>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; padding: 20px; }
        }
      `}</style>
    </div>
  );
};
