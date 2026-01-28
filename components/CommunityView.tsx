
import React, { useState } from 'react';
import { Story, Language } from '../types.ts';
import { TRANSLATIONS } from '../constants.tsx';

interface CommunityViewProps {
  stories: Story[];
  onRead: (story: Story) => void;
  onOpenSidebar?: () => void;
  lang: Language;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ stories, onRead, onOpenSidebar, lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  if (selectedStory) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-y-auto">
        <header className="px-6 py-6 border-b border-gray-50 dark:border-zinc-900 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
          <button onClick={() => setSelectedStory(null)} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar
          </button>
          <h2 className="font-black text-sm truncate px-4">{selectedStory.title}</h2>
          <div className="w-20"></div>
        </header>
        <article className="max-w-3xl mx-auto p-6 md:p-16 space-y-12">
          <div className="text-center space-y-4 mb-20">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">{selectedStory.title}</h1>
            <div className="flex items-center justify-center gap-3">
              <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{selectedStory.universe}</span>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Autor: {selectedStory.authorName || 'Anônimo'}</span>
            </div>
          </div>
          {selectedStory.messages.filter(m => m.role === 'model').map((msg, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed text-lg md:text-xl text-gray-800 dark:text-zinc-200">
              {msg.content}
            </div>
          ))}
        </article>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-900 flex flex-col h-full">
       <header className="h-16 lg:h-20 border-b border-gray-100 dark:border-zinc-900 flex items-center px-4 lg:px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20 sticky top-0 lg:hidden">
          <button 
            onClick={onOpenSidebar}
            className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="ml-4 text-xs font-black uppercase tracking-widest">{t.community}</h2>
      </header>

      <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Explorar</h2>
          <p className="text-gray-500 font-medium">Leia as melhores criações da comunidade ChatFic.</p>
        </header>

        {stories.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-zinc-700">
            <div className="text-6xl mb-6">🌵</div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">O deserto está vazio...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map(story => (
              <div key={story.id} className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col h-full border border-gray-50 dark:border-zinc-700">
                <div className="mb-6">
                  <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {story.universe}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-6 leading-tight group-hover:text-indigo-600">
                  {story.title}
                </h3>
                <div className="flex-1 mb-10 overflow-hidden">
                  <p className="text-gray-400 text-sm line-clamp-4 italic leading-relaxed">
                    {story.messages.find(m => m.role === 'model')?.content.substring(0, 200)}...
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedStory(story)}
                  className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {t.read_more}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
