
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatArea } from './components/ChatArea.tsx';
import { IdeaBank } from './components/IdeaBank.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { CommunityView } from './components/CommunityView.tsx';
import { Message, Story, AppView, WritingModel, Theme, Language, User, FontFamily, FontSize } from './types.ts';
import { generateStoryPart } from './services/geminiService.ts';
import { TRANSLATIONS } from './constants.tsx';

const App: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('chatfic_stories');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [communityStories, setCommunityStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('chatfic_community');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(() => {
    return localStorage.getItem('chatfic_current_id');
  });

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('chatfic_theme') as Theme) || 'light');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('chatfic_lang') as Language) || 'pt');
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => (localStorage.getItem('chatfic_font') as FontFamily) || 'sans');
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('chatfic_font_size') as FontSize) || 'base');
  
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('chatfic_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const [view, setView] = useState<AppView>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [sharedStory, setSharedStory] = useState<Story | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    if (shareData) {
      try {
        const decoded = decodeURIComponent(escape(atob(shareData.replace(/ /g, '+'))));
        const story = JSON.parse(decoded) as Story;
        if (!stories.some(s => s.id === story.id)) setStories(prev => [story, ...prev]);
        setCurrentStoryId(story.id);
        setSharedStory(story);
        setView('chat');
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => { localStorage.setItem('chatfic_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('chatfic_community', JSON.stringify(communityStories)); }, [communityStories]);
  useEffect(() => { localStorage.setItem('chatfic_current_id', currentStoryId || ''); }, [currentStoryId]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('chatfic_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chatfic_lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const currentStory = stories.find(s => s.id === currentStoryId) || sharedStory || null;

  const handleSendMessage = async (content: string, setup?: { title: string, universe: string, model: WritingModel }) => {
    let activeStoryId = currentStoryId;
    let activeUniverse = currentStory?.universe || setup?.universe || 'Original';
    let activeModel = currentStory?.model || setup?.model || 'balanced';

    if (!activeStoryId && setup) {
      const newStory: Story = {
        id: Date.now().toString(),
        title: setup.title,
        universe: setup.universe,
        model: setup.model,
        messages: [],
        updatedAt: Date.now(),
        authorName: user?.name
      };
      setStories(prev => [newStory, ...prev]);
      activeStoryId = newStory.id;
      setCurrentStoryId(newStory.id);
    }

    if (!activeStoryId) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setStories(prev => prev.map(s => s.id === activeStoryId ? { ...s, messages: [...s.messages, userMsg], updatedAt: Date.now() } : s));
    
    setIsGenerating(true);
    try {
      const storyRef = stories.find(s => s.id === activeStoryId) || (activeStoryId === sharedStory?.id ? sharedStory : null);
      const messagesToGen = storyRef ? [...storyRef.messages, userMsg] : [userMsg];
      const aiResponse = await generateStoryPart(messagesToGen, activeModel, activeUniverse);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: aiResponse, timestamp: Date.now() };
      setStories(prev => prev.map(s => s.id === activeStoryId ? { ...s, messages: [...s.messages, aiMsg], updatedAt: Date.now() } : s));
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const handleExport = (format: 'md' | 'pdf') => {
    if (!currentStory) return;
    if (format === 'pdf') {
      window.print();
    } else {
      let content = `# ${currentStory.title}\n\nUniverso: ${currentStory.universe}\n\n---\n\n`;
      currentStory.messages.forEach(m => {
        if (m.role === 'model') content += `${m.content}\n\n---\n\n`;
      });
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStory.title.replace(/\s/g, '_')}.md`;
      a.click();
    }
  };

  const handlePublish = (story: Story) => {
    if (!communityStories.some(s => s.id === story.id)) setCommunityStories(prev => [story, ...prev]);
  };

  const handleDeleteStory = (id: string) => {
    setStories(s => s.filter(x => x.id !== id));
    if(currentStoryId === id) { setCurrentStoryId(null); setSharedStory(null); }
  };

  return (
    <Layout 
      isSidebarOpen={isSidebarOpen} 
      setIsSidebarOpen={setIsSidebarOpen}
      sidebar={
        <Sidebar 
          stories={stories} 
          currentStoryId={currentStoryId}
          onSelectStory={(id) => { setSharedStory(null); setCurrentStoryId(id); setView('chat'); setIsSidebarOpen(false); }}
          onNewStory={() => { setSharedStory(null); setCurrentStoryId(null); setView('chat'); setIsSidebarOpen(false); }}
          onDeleteStory={handleDeleteStory}
          setView={(v) => { setView(v); setIsSidebarOpen(false); }}
          currentView={view}
          onOpenSettings={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }}
          lang={lang}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
    >
      {sharedStory && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 z-50">
          {TRANSLATIONS[lang].view_mode} • <button onClick={() => { setSharedStory(null); setCurrentStoryId(null); }} className="underline ml-2">{TRANSLATIONS[lang].exit_view}</button>
        </div>
      )}

      {view === 'chat' && (
        <ChatArea 
          story={currentStory} 
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onEditMessage={(mid, cont) => setStories(s => s.map(st => st.id === currentStoryId ? {...st, messages: st.messages.map(m => m.id === mid ? {...m, content: cont} : m)} : st))}
          onDeleteMessage={(mid) => setStories(prev => prev.map(s => s.id === currentStoryId ? { ...s, messages: s.messages.filter(m => m.id !== mid) } : s))}
          onDeleteStory={handleDeleteStory}
          onExport={handleExport}
          onModelChange={(m) => setStories(s => s.map(st => st.id === currentStoryId ? {...st, model: m} : st))}
          onPublish={handlePublish}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          lang={lang}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      )}

      {view === 'community' && <CommunityView stories={communityStories} onRead={() => {}} onOpenSidebar={() => setIsSidebarOpen(true)} lang={lang} />}
      {view === 'ideas' && <IdeaBank onUseIdea={(idea) => { setView('chat'); handleSendMessage(idea.prompt, { title: idea.title, universe: 'Misto', model: 'balanced' }); }} />}

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
          user={user}
          setUser={setUser}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          currentStory={currentStory}
          onPublishStory={handlePublish}
          onDeleteStory={handleDeleteStory}
          onExport={handleExport}
        />
      )}
    </Layout>
  );
};

export default App;
