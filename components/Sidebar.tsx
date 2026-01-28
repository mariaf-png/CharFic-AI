
import React from 'react';
import { Story, AppView, Language, Theme } from '../types.ts';
import { TRANSLATIONS } from '../constants.tsx';

interface SidebarProps {
  stories: Story[];
  currentStoryId: string | null;
  onSelectStory: (id: string) => void;
  onNewStory: () => void;
  onDeleteStory: (id: string) => void;
  setView: (view: AppView) => void;
  currentView: AppView;
  onOpenSettings: () => void;
  lang: Language;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  stories, currentStoryId, onSelectStory, onNewStory, onDeleteStory, setView, currentView, onOpenSettings, lang, theme, onToggleTheme
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Logo e Theme Toggle */}
      <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            ChatFic
          </h1>
        </div>
        <button 
          onClick={onToggleTheme}
          className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-400 hover:text-indigo-600 transition-all"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m3.343-5.657l-.707.707m12.728 0l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" /></svg>
          )}
        </button>
      </div>

      <div className="p-4 space-y-2">
        <button 
          onClick={onNewStory}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          {t.new_story}
        </button>
        
        <button 
          onClick={() => setView('community')}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${currentView === 'community' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
        >
          <span>🌍</span> {t.community}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
          <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.history}</p>
        </div>
        <div className="space-y-1">
          {stories.length === 0 ? (
            <div className="px-4 py-6 text-xs text-gray-400 italic text-center bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl">Nenhuma história...</div>
          ) : (
            stories.map(story => (
              <button
                key={story.id}
                onClick={() => onSelectStory(story.id)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold truncate transition-all ${currentStoryId === story.id && currentView === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-600 dark:text-zinc-400'}`}
              >
                {story.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-gray-50 dark:border-zinc-900">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          {t.settings}
        </button>
      </div>
    </div>
  );
};
