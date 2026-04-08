import React, { useState } from 'react';
import { Search, User } from 'lucide-react';

interface PlayerSearchProps {
  onSearch: (query: string) => void;
}

export default function PlayerSearch({ onSearch }: PlayerSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jogador pelo nome..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition-all text-slate-700 font-medium"
            />
          </div>
          <button
            type="submit"
            className="bg-[#000829] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
          >
            <Search size={20} />
            Consultar
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-400 flex items-center gap-2 px-1">
          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
          Busque seu nome para ver sua posição e pontuação atualizada no ranking geral.
        </p>
      </div>
    </section>
  );
}
