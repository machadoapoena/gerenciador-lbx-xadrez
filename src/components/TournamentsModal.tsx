import { X, Calendar, Trophy, ExternalLink, Plus, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TournamentEvent } from '../types';
import { useState } from 'react';
import TournamentFormModal from './TournamentFormModal';

interface TournamentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TournamentEvent[];
  isLoggedIn?: boolean;
  onRefreshEvents?: () => void;
}

export default function TournamentsModal({ isOpen, onClose, events, isLoggedIn, onRefreshEvents }: TournamentsModalProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TournamentEvent | null>(null);

  const handleNewTournament = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditTournament = (event: TournamentEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900 p-2 rounded-lg text-white">
                    <Trophy size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-[#000829]">Torneios e Eventos</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isLoggedIn && (
                    <button
                      onClick={handleNewTournament}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      <Plus size={14} />
                      NOVO TORNEIO
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 italic">Nenhum torneio cadastrado no momento.</p>
                  </div>
                ) : (
                  events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                            {event.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-blue-600" />
                              {event.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'Data não informada'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isLoggedIn && (
                            <button
                              onClick={() => handleEditTournament(event)}
                              className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-all"
                              title="Editar Torneio"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {event.url && (
                            <a 
                              href={event.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all"
                            >
                              Resultados
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-center">
                <p className="text-xs text-slate-400">
                  Os pontos destes torneios são computados automaticamente no ranking geral.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TournamentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        event={editingEvent}
        onSuccess={() => {
          setIsFormOpen(false);
          onRefreshEvents?.();
        }}
      />
    </>
  );
}
