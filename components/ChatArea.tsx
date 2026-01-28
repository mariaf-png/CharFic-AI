
import React, { useState, useRef, useEffect } from 'react';
import { Message, Story, WritingModel, Language, FontFamily, FontSize } from '../types.ts';
import { TRANSLATIONS } from '../constants.tsx';

interface ChatAreaProps {
  story: Story | null;
  onSendMessage: (content: string, setup?: { title: string, universe: string, model: WritingModel }) => void;
  isGenerating: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onRegenerateMessage: (messageId: string) => void;
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
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage,
  onDeleteStory,
  onExport,
  onPublish,
  onModelChange,
  onOpenSidebar,
  lang,
  fontFamily,
  fontSize
}) => {
  const [inputValue, setInputValue] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUniverse, setNewUniverse] = useState('');
  const [selectedModel, setSelectedModel] = useState<WritingModel>('balanced');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [story?.messages, isGenerating]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setIsOptionsMenuOpen(false);
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

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditValue(msg.content);
  };

  const saveEdit = () => {
    if (editingMessageId && editValue.trim()) {
      onEditMessage(editingMessageId, editValue);
      setEditingMessageId(null);
      setEditValue('');
    }
  };

  const handleShare = () => {
    if (!story) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${btoa(unescape(encodeURIComponent(JSON.stringify(story))))}`;
    navigator.clipboard.writeText(shareUrl);
    alert(t.link_copied);
    setIsOptionsMenuOpen(false);
  };

  const confirmDelete = () => {
    if (story) {
      onDeleteStory(story.id);
      setShowDeleteModal(false);
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (!line.trim() && i > 0) return <div key={i} className="h-4" />;
      const isChapter = line.trim().match(/^Capítulo/i);
      let processed = line;
      const parts = processed.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const elements = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="font-black text-zinc-950 dark:text-white">{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={j} className="italic text-indigo-700/80 dark:text-indigo-400/80">{part.slice(1, -1)}</em>;
        return part;
      });
      if (isChapter) return <h2 key={i} className="text-3xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 mt-10 mb-6 tracking-tighter leading-none">{elements}</h2>;
      return <p key={i} className="mb-3 leading-relaxed">{elements}</p>;
    });
  };

  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const sizeClass = `text-${fontSize}`;

  return (
    <div className={`flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 transition-colors overflow-hidden ${fontClass} ${sizeClass}`}>
      {/* Modal de Confirmação de Deleção */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl border border-gray-100 dark:border-zinc-800 text-center animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-xl font-black tracking-tight">{t.delete_chat}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{t.delete_confirm}</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                {t.delete_action}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

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

        {story && (
          <div className="relative" ref={optionsMenuRef}>
            <button 
              onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
              className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl text-gray-500 hover:text-indigo-600 transition-all shadow-sm"
              title={t.menu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {isOptionsMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-[100]">
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={handleShare} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl flex items-center gap-3 transition-colors">
                    <span className="text-lg">🔗</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.share_link}</span>
                  </button>
                  <button onClick={() => { onPublish(story); setIsOptionsMenuOpen(false); }} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl flex items-center gap-3 transition-colors">
                    <span className="text-lg">🌍</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.publish_community}</span>
                  </button>
                  <button onClick={() => { onExport('md'); setIsOptionsMenuOpen(false); }} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl flex items-center gap-3 transition-colors">
                    <span className="text-lg">💾</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Baixar Markdown</span>
                  </button>
                  <button onClick={() => { onExport('pdf'); setIsOptionsMenuOpen(false); }} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl flex items-center gap-3 transition-colors">
                    <span className="text-lg">🖨️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Baixar PDF</span>
                  </button>
                  <div className="h-px bg-gray-50 dark:bg-zinc-800 my-1 mx-4"></div>
                  <button onClick={() => { setIsOptionsMenuOpen(false); setShowDeleteModal(true); }} className="w-full text-left px-5 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl flex items-center gap-3 transition-colors text-red-500">
                    <span className="text-lg">🗑️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.delete_chat}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
            {story.messages.map((msg, index) => (
              <div key={msg.id} className={`group relative animate-in fade-in slide-in-from-bottom-2 duration-400 ${msg.role === 'user' ? 'ml-auto max-w-[90%]' : 'max-w-full'}`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-25">{msg.role === 'user' ? 'Autor' : 'IA'}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(msg)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title={t.edit}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => handleCopy(msg.content, msg.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Copiar">{copySuccess === msg.id ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}</button>
                    {msg.role === 'model' && index === story.messages.length - 1 && <button onClick={() => onRegenerateMessage(msg.id)} disabled={isGenerating} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-30" title="Regenerar"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>}
                    <button onClick={() => onDeleteMessage(msg.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
                <div className={`p-6 md:p-8 rounded-[2.5rem] shadow-sm transition-all ${msg.role === 'user' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 border border-gray-100 dark:border-zinc-800'}`}>
                  {editingMessageId === msg.id ? (
                    <div className="space-y-4">
                      <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className={`w-full bg-white/10 dark:bg-black/20 border-2 border-white/20 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-white/40 min-h-[150px] resize-none ${msg.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-zinc-100'}`} autoFocus />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingMessageId(null)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500'}`}>{t.cancel}</button>
                        <button onClick={saveEdit} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'bg-white text-indigo-600 shadow-xl' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}>{t.save}</button>
                      </div>
                    </div>
                  ) : renderContent(msg.content)}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="max-w-[80%] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3 px-1"><span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{t.writing}</span></div>
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
          <div className="relative" ref={modelMenuRef}>
            <button type="button" onClick={() => setIsModelMenuOpen(!isModelMenuOpen)} className="h-14 md:h-16 w-14 md:w-16 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-2xl hover:bg-gray-100 transition-all">{MODEL_LABELS[selectedModel].icon}</button>
            {isModelMenuOpen && (
              <div className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {(Object.entries(MODEL_LABELS) as [WritingModel, typeof MODEL_LABELS['balanced']][]).map(([key, info]) => (
                    <button key={key} type="button" onClick={() => { setSelectedModel(key); onModelChange(key); setIsModelMenuOpen(false); }} className={`w-full text-left p-3 rounded-2xl flex items-start gap-4 transition-all ${selectedModel === key ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-100' : 'hover:bg-gray-50'}`}>
                      <span className="text-2xl mt-1">{info.icon}</span>
                      <div><p className="text-xs font-black text-indigo-600 uppercase">{info.label}</p><p className="text-[10px] text-gray-400 font-medium leading-tight mt-1">{info.desc}</p></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={t.placeholder} disabled={isGenerating} className="w-full h-14 md:h-16 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl px-6 md:px-8 pr-16 text-sm md:text-base outline-none focus:ring-2 ring-indigo-500/20 transition-all disabled:opacity-50" />
            <button type="submit" disabled={isGenerating || !inputValue.trim() || (!story && (!newTitle.trim() || !newUniverse.trim()))} className="absolute right-2 top-2 h-10 md:h-12 w-10 md:w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
          </div>
        </form>
      </footer>
    </div>
  );
};
