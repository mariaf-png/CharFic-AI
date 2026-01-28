
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden text-gray-900 dark:text-zinc-100 transition-colors">
      {/* Overlay para fechar o menu ao clicar fora */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar (Drawer no Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-900 z-[50] transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {sidebar}
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {children}
      </main>
    </div>
  );
};
