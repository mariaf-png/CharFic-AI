
import React, { useState } from 'react';
import { Story, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CommunityViewProps {
  stories: Story[];
  onRead: (story: Story) => void;
  lang: Language;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ stories, onRead, lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  if (selectedStory) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-y-auto">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-10">
          <button onClick={() => setSelectedStory(null)} className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar
          </button>
          <h2 className="font-bold text-center flex-1">{selectedStory.title}</h2>
          <div className="w-16"></div>
        </header>
        <article className="max-w-3xl mx-auto p-8 md:p-16 space-y-12 serif-font">
          <div className="text-center space-y-2 mb-16">
            <h1 className="text-4xl md:text-5xl font-black">{selectedStory.title}</h1>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">{selectedStory.universe}</p>
            <p className="text-gray-400 text-xs italic">Escrito por: {selectedStory.authorName || 'Anônimo'}</p>
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
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-black mb-4 tracking-tight">Comunidade ChatFic</h2>
          <p className="text-gray-500 dark:text-zinc-400">Descubra e leia as melhores fanfics criadas pela nossa comunidade.</p>
        </header>

        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-700">
            <div className="text-5xl mb-4">🌵</div>
            <p className="text-gray-400">Ainda não há histórias publicadas. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {story.universe}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                  {story.title}
                </h3>
                <div className="flex-1 mb-8">
                  <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-3 italic">
                    {story.messages.find(m => m.role === 'model')?.content.substring(0, 150)}...
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedStory(story)}
                  className="w-full py-4 bg-gray-50 dark:bg-zinc-900 hover:bg-indigo-600 hover:text-white rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2"
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
