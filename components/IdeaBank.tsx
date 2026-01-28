
import React from 'react';
import { IDEAS } from '../constants';
import { PromptIdea } from '../types';

interface IdeaBankProps {
  onUseIdea: (idea: PromptIdea) => void;
}

export const IdeaBank: React.FC<IdeaBankProps> = ({ onUseIdea }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h2 className="text-3xl font-bold mb-3">Banco de Ideias</h2>
          <p className="text-gray-500 dark:text-zinc-400">Precisa de inspiração? Escolha um prompt abaixo para começar sua próxima grande aventura.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {IDEAS.map((idea, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => onUseIdea(idea)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {idea.category}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{idea.title}</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">
                {idea.description}
              </p>
              <button 
                className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex items-center gap-1 group-hover:underline"
              >
                Usar este prompt
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
