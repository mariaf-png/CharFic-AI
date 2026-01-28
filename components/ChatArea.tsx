
import React, { useState, useRef, useEffect } from 'react';
import { Message, Story, WritingModel, Language, FontFamily, FontSize } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChatAreaProps {
  story: Story | null;
  onSendMessage: (content: string, setup?: { title: string, universe: string, model: WritingModel }) => void;
  isGenerating: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onDeleteStory: (storyId: string) => void;
  onExport: () => void;
  onModelChange: (model: WritingModel) => void;
  onPublish: (story: Story) => void;
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
  onDeleteStory,
  onModelChange,
  onPublish,
  lang,
  fontFamily,
  fontSize
}) => {
  const [inputValue, setInputValue] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUniverse, setNewUniverse] = useState('');
  const [selectedModel, setSelectedModel] = useState<WritingModel>('balanced');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [story?.messages, isGenerating]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setIsHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePublishClick = () => {
    if (!story) return;
    onPublish(story);
    setIsHeaderMenuOpen(false);
    triggerToast(t.published_success);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(lang === 'pt' ? 'Copiado!' : 'Copied!');
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const saveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      onEditMessage(editingMessageId, editContent);
      setEditingMessageId(null);
    }
  };

  const handleRegenerate = (msg: Message) => {
    if (isGenerating || !story) return;
    const msgIndex = story.messages.findIndex(m => m.id === msg.id);
    const lastUserMsg = story.messages.slice(0, msgIndex).reverse().find(m => m.role === 'user');
    
    if (lastUserMsg) {
      onSendMessage(`[COMANDO DE REESCRITA]: Por favor, tente uma abordagem diferente para esta cena. Explore novos ângulos, reações alternativas dos personagens ou mude levemente o tom da narrativa, mantendo a coerência com o que veio antes. Baseie-se no meu último pedido: ${lastUserMsg.content}`);
    }
  };

  const handleExportPDF = () => {
    if (!story) return;
    setIsHeaderMenuOpen(false);
    const content = `TITLE: ${story.title.toUpperCase()}\nUNIVERSE: ${story.universe}\n\n${story.messages.map(m => `[${m.role === 'user' ? 'AUTOR' : 'IA'}]:\n${m.content}\n`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title}.txt`;
    link.click();
  };

  const handleExportMarkdown = () => {
    if (!story) return;
    setIsHeaderMenuOpen(false);
    const content = `# ${story.title}\n\n**Universo:** ${story.universe}\n\n` + story.messages.map(m => `## ${m.role === 'user' ? 'Autor' : 'IA'}\n\n${m.content}\n\n`).join('');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title}.md`;
    link.click();
  };

  const handleDeleteChatClick = () => {
    setIsHeaderMenuOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteStory = () => {
    if (story) {
      onDeleteStory(story.id);
      setIsDeleteConfirmOpen(false);
    }
  };

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

  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const sizeClass = `text-${fontSize}`;

  return (
    <div className={`flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 transition-colors overflow-hidden ${fontClass} ${sizeClass}`}>
      {/* Modais e Toasts */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 font-bold text-sm">
          {toastMessage}
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-8 border border-gray-100 dark:border-zinc-800">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-black mb-2">{t.delete_chat}</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
              {t.delete_confirm}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                {t.cancel}
              </button>
              <button 
                onClick={confirmDeleteStory}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
              >
                {t.delete_action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20 sticky top-0">
        {story ? (
          <>
            <div className="flex flex-col">
              <h2 className="text-sm font-black truncate max-w-[200px]">{story.title}</h2>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{story.universe}</span>
            </div>
            <div className="relative" ref={headerMenuRef}>
              <button 
                onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {isHeaderMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 space-y-1">
                    <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3">
                      <span>📄</span> {t.save_pdf}
                    </button>
                    <button onClick={handleExportMarkdown} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3">
                      <span>📝</span> {t.save_markdown}
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                    <button onClick={handlePublishClick} className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex items-center gap-3">
                      <span>🌍</span> {t.publish_community}
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                    <button onClick={handleDeleteChatClick} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl flex items-center gap-3">
                      <span>🗑️</span> {t.delete_chat}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.new_story}</h2>
          </div>
        )}
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {!story ? (
          <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center flex flex-col items-center">
              <div 
                className="text-8xl mb-6 animate-page-flip cursor-default select-none" 
                style={{ transformOrigin: 'center' }}
              >
                📖
              </div>
              <h3 className="text-3xl font-black">{t.new_story}</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">Pronto para escrever sua próxima obra-prima?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">{t.title}</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: O Retorno do Rei"
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">{t.universe}</label>
                <input 
                  type="text" 
                  value={newUniverse}
                  onChange={(e) => setNewUniverse(e.target.value)}
                  placeholder="Ex: Senhor dos Anéis"
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          story.messages.map((msg, i) => (
            <div key={msg.id} className={`group animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'max-w-[85%] ml-auto' : 'max-w-full'}`}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">
                  {msg.role === 'user' ? (lang === 'pt' ? 'Autor' : 'Author') : 'ChatFic AI'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleCopy(msg.content)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 transition-colors" title="Copiar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                  <button onClick={() => startEditing(msg)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 transition-colors" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  {msg.role === 'model' && (
                    <button onClick={() => handleRegenerate(msg)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-indigo-500 transition-colors" title="Explorar novas direções">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  )}
                  <button onClick={() => onDeleteMessage(msg.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-400 transition-colors" title="Apagar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {editingMessageId === msg.id ? (
                <div className="space-y-2">
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-indigo-50 dark:bg-zinc-800 border-2 border-indigo-200 dark:border-zinc-700 rounded-2xl p-4 text-sm outline-none resize-none min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingMessageId(null)} className="px-4 py-2 text-xs font-bold text-gray-400">{t.cancel}</button>
                    <button onClick={saveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">{lang === 'pt' ? 'Salvar' : 'Save'}</button>
                  </div>
                </div>
              ) : (
                <div className={`p-5 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none' : 'bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-800 dark:text-zinc-200'}`}>
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex flex-col gap-3 animate-pulse max-w-[90%]">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{t.writing}</span>
            </div>
            <div className="h-32 bg-gray-100 dark:bg-zinc-900 rounded-3xl" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-6 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative" ref={menuRef}>
              <button 
                type="button"
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="h-14 px-4 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-xl">{MODEL_LABELS[selectedModel].icon}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isModelMenuOpen && (
                <div className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {(Object.entries(MODEL_LABELS) as [WritingModel, typeof MODEL_LABELS['balanced']][]).map(([key, info]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setSelectedModel(key); onModelChange(key); setIsModelMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${selectedModel === key ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                      >
                        <span className="text-2xl mt-1">{info.icon}</span>
                        <div>
                          <p className={`text-sm font-bold ${selectedModel === key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-zinc-300'}`}>{info.label}</p>
                          <p className="text-[10px] text-gray-400 font-medium leading-tight">{info.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 relative group">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.placeholder}
                disabled={isGenerating}
                className="w-full h-14 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl px-6 pr-14 text-sm focus:ring-2 ring-indigo-500/50 transition-all outline-none disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isGenerating || !inputValue.trim() || (!story && (!newTitle.trim() || !newUniverse.trim()))}
                className="absolute right-2 top-2 h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 disabled:grayscale disabled:opacity-30 active:scale-90 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
};
