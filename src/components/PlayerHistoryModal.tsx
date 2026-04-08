import React, { useState, useEffect } from 'react';
import { X, History, Calendar, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPlayerHistory } from '../services/appwriteService';
import { RankingEntry } from '../types';

interface PlayerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: RankingEntry | null;
}

export default function PlayerHistoryModal({ isOpen, onClose, player }: PlayerHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && player) {
      const fetchHistory = async () => {
        setLoading(true);
        const data = await getPlayerHistory(player.id);
        setHistory(data);
        setLoading(false);
      };
      fetchHistory();
    }
  }, [isOpen, player]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <History size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#000829] tracking-tight">Histórico de Torneios</h2>
                <p className="text-sm text-slate-500 font-medium">
                  {player?.name} • <span className="text-blue-600">{player?.points} pts totais</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Carregando histórico...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy size={32} className="text-slate-200" />
                </div>
                <p className="text-slate-400 italic">Nenhum torneio registrado para este jogador.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                          {item.eventName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.eventDate ? new Date(item.eventDate).toLocaleDateString('pt-BR') : 'Data não informada'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-lg font-black text-[#000829]">{item.points}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">pts</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-center">
            <button
              onClick={onClose}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
            >
              Fechar Visualização
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
