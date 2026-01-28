
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900 overflow-hidden text-gray-900 dark:text-zinc-100 transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
};
