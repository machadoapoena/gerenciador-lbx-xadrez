import { Trophy, History } from 'lucide-react';
import { motion } from 'motion/react';
import { RankingEntry } from '../types';

interface RankingTableProps {
  ranking: RankingEntry[];
  title?: string;
  onViewHistory: (player: RankingEntry) => void;
}

export default function RankingTable({ ranking, title = "Ranking Geral", onViewHistory }: RankingTableProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-[#000829] tracking-tight flex items-center gap-3">
          <Trophy className="text-yellow-500" size={24} />
          {title}
        </h2>
        {ranking.length > 0 && (
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
            {ranking.length} Jogadores
          </span>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-5 text-[10px] font-bold text-slate-500 tracking-widest uppercase w-24">Posição</th>
                <th className="px-2 py-5 text-[10px] font-bold text-slate-500 tracking-widest uppercase w-16"></th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Nome</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 tracking-widest uppercase text-center">Histórico</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 tracking-widest uppercase text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                    Nenhum jogador com pontuação encontrado.
                  </td>
                </tr>
              ) : (
                ranking.map((entry, index) => (
                  <motion.tr
                    key={`${entry.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className={`border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/50 ${
                    entry.isTop3 ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      {entry.position === 1 && <Trophy size={18} className="text-yellow-500" />}
                      {entry.position === 2 && <Trophy size={18} className="text-slate-400" />}
                      {entry.position === 3 && <Trophy size={18} className="text-amber-600" />}
                      <span className={`font-bold text-lg ${entry.position <= 3 ? 'text-[#000829]' : 'text-slate-600'}`}>
                        {entry.position}º
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-6">
                    {entry.title && (
                      <span className="px-2 py-1 rounded text-[10px] font-black tracking-tighter bg-blue-900 text-yellow-400 border border-blue-800 whitespace-nowrap">
                        {entry.title}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-800">{entry.name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => onViewHistory(entry)}
                      className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-all hover:scale-110 active:scale-95"
                      title="Ver histórico de torneios"
                    >
                      <History size={18} />
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-lg text-[#000829]">{entry.points}</span>
                  </td>
                </motion.tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

