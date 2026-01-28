
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatArea } from './components/ChatArea.tsx';
import { IdeaBank } from './components/IdeaBank.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { CommunityView } from './components/CommunityView.tsx';
import { Message, Story, AppView, WritingModel, Theme, Language, User, FontFamily, FontSize } from './types.ts';
import { generateStoryPart } from './services/geminiService.ts';

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

  useEffect(() => {
    localStorage.setItem('chatfic_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('chatfic_community', JSON.stringify(communityStories));
  }, [communityStories]);

  useEffect(() => {
    localStorage.setItem('chatfic_current_id', currentStoryId || '');
  }, [currentStoryId]);

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

  const currentStory = stories.find(s => s.id === currentStoryId) || null;

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
      const currentStoryRef = stories.find(s => s.id === activeStoryId);
      const messagesToGen = currentStoryRef ? [...currentStoryRef.messages, userMsg] : [userMsg];
      const aiResponse = await generateStoryPart(messagesToGen, activeModel, activeUniverse);
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: aiResponse, timestamp: Date.now() };
      setStories(prev => prev.map(s => s.id === activeStoryId ? { ...s, messages: [...s.messages, aiMsg], updatedAt: Date.now() } : s));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = (story: Story) => {
    if (!communityStories.some(s => s.id === story.id)) {
      setCommunityStories(prev => [story, ...prev]);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!currentStoryId) return;
    setStories(prev => prev.map(s => s.id === currentStoryId ? { ...s, messages: s.messages.filter(m => m.id !== messageId), updatedAt: Date.now() } : s));
  };

  const handleDeleteStory = (id: string) => {
    setStories(s => s.filter(x => x.id !== id));
    if(currentStoryId === id) setCurrentStoryId(null);
  };

  return (
    <Layout 
      isSidebarOpen={isSidebarOpen} 
      setIsSidebarOpen={setIsSidebarOpen}
      sidebar={
        <Sidebar 
          stories={stories} 
          currentStoryId={currentStoryId}
          onSelectStory={(id) => { setCurrentStoryId(id); setView('chat'); setIsSidebarOpen(false); }}
          onNewStory={() => { setCurrentStoryId(null); setView('chat'); setIsSidebarOpen(false); }}
          onDeleteStory={handleDeleteStory}
          setView={setView}
          currentView={view}
          onOpenSettings={() => setIsSettingsOpen(true)}
          lang={lang}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
    >
      {view === 'chat' && (
        <ChatArea 
          story={currentStory} 
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onEditMessage={(mid, cont) => setStories(s => s.map(st => st.id === currentStoryId ? {...st, messages: st.messages.map(m => m.id === mid ? {...m, content: cont} : m)} : st))}
          onDeleteMessage={handleDeleteMessage}
          onDeleteStory={handleDeleteStory}
          onExport={() => {}}
          onModelChange={(m) => setStories(s => s.map(st => st.id === currentStoryId ? {...st, model: m} : st))}
          onPublish={handlePublish}
          lang={lang}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      )}

      {view === 'community' && (
        <CommunityView stories={communityStories} onRead={() => {}} lang={lang} />
      )}

      {view === 'ideas' && (
        <IdeaBank onUseIdea={(idea) => {}} />
      )}

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
        />
      )}
    </Layout>
  );
};

export default App;
