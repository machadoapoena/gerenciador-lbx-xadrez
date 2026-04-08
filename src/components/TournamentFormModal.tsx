import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, UserPlus, Trash2, Trophy, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TournamentEvent, Player } from '../types';
import { 
  createEvent, 
  updateEvent, 
  getPlayers, 
  getScoresByEvent, 
  createScore, 
  updateScore, 
  deleteScore,
  getScoreByPlayerAndEvent
} from '../services/appwriteService';

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TournamentEvent | null;
  onSuccess: () => void;
}

interface TournamentPlayer {
  scoreId: string;
  playerId: string;
  name: string;
  points: number;
}

export default function TournamentFormModal({ isOpen, onClose, event, onSuccess }: TournamentFormModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [idChessResults, setIdChessResults] = useState('');
  
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [tournamentPlayers, setTournamentPlayers] = useState<TournamentPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerPoints, setPlayerPoints] = useState('0');
  
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setName(event.name);
        setDate(event.date ? new Date(event.date).toISOString().split('T')[0] : '');
        setUrl(event.url || '');
        setIdChessResults(event.idChessResults || '');
        fetchTournamentPlayers(event.id);
      } else {
        setName('');
        setDate(new Date().toISOString().split('T')[0]);
        setUrl('');
        setIdChessResults('');
        setTournamentPlayers([]);
      }
      fetchAllPlayers();
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, event]);

  const fetchAllPlayers = async () => {
    const players = await getPlayers();
    setAllPlayers(players);
  };

  const fetchTournamentPlayers = async (eventId: string) => {
    setLoadingPlayers(true);
    try {
      const scores = await getScoresByEvent(eventId);
      const players = await getPlayers();
      
      const mapped = scores.map((score: any) => {
        const playerRef = score.players;
        let pId = '';
        if (Array.isArray(playerRef)) pId = playerRef[0]?.$id;
        else if (typeof playerRef === 'object') pId = playerRef.$id;
        else pId = playerRef;

        const player = players.find(p => p.id === pId);
        return {
          scoreId: score.$id,
          playerId: pId,
          name: player?.name || 'Jogador Desconhecido',
          points: score.pts || 0
        };
      });
      
      setTournamentPlayers(mapped);
    } catch (err) {
      console.error('Error fetching tournament players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handleSaveTournament = async () => {
    if (!name || !date) {
      setError('Nome e data são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (event) {
        const success = await updateEvent(event.id, {
          name,
          date,
          url,
          idChessResults
        });
        if (success) {
          setSuccessMsg('Torneio atualizado com sucesso!');
          setTimeout(() => onSuccess(), 1500);
        } else {
          setError('Erro ao atualizar torneio.');
        }
      } else {
        const newEvent = await createEvent({
          name,
          date,
          url,
          idChessResults
        });
        if (newEvent) {
          setSuccessMsg('Torneio criado com sucesso!');
          setTimeout(() => onSuccess(), 1500);
        } else {
          setError('Erro ao criar torneio.');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdatePlayer = async () => {
    if (!event) {
      setError('Salve o torneio primeiro antes de adicionar jogadores.');
      return;
    }
    if (!selectedPlayerId) {
      setError('Selecione um jogador.');
      return;
    }

    setAddingPlayer(true);
    setError('');
    const pts = parseFloat(playerPoints.replace(',', '.')) || 0;

    try {
      // Check if player already in tournament
      const existingScore = await getScoreByPlayerAndEvent(selectedPlayerId, event.id);
      
      if (existingScore) {
        const success = await updateScore(existingScore.$id, pts);
        if (success) {
          setSuccessMsg('Pontuação atualizada!');
          fetchTournamentPlayers(event.id);
        } else {
          setError('Erro ao atualizar pontuação.');
        }
      } else {
        const success = await createScore(selectedPlayerId, event.id, pts);
        if (success) {
          setSuccessMsg('Jogador adicionado!');
          fetchTournamentPlayers(event.id);
        } else {
          setError('Erro ao adicionar jogador.');
        }
      }
      setSelectedPlayerId('');
      setPlayerPoints('0');
    } catch (err) {
      setError('Erro ao processar jogador.');
    } finally {
      setAddingPlayer(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDeletePlayer = async (scoreId: string) => {
    if (!window.confirm('Deseja remover este jogador do torneio?')) return;
    
    try {
      const success = await deleteScore(scoreId);
      if (success) {
        setTournamentPlayers(prev => prev.filter(p => p.scoreId !== scoreId));
      }
    } catch (err) {
      console.error('Error deleting score:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900 p-2 rounded-lg text-white">
                  <Trophy size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#000829]">
                  {event ? 'Editar Torneio' : 'Novo Torneio'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Tournament Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Informações Básicas</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nome do Torneio</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                        placeholder="Ex: III Etapa Circuito Ouro"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Data</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">URL de Resultados (Opcional)</label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                        placeholder="https://chess-results.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">ID Chess-Results (Opcional)</label>
                      <input
                        type="text"
                        value={idChessResults}
                        onChange={(e) => setIdChessResults(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                        placeholder="Ex: 123456"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTournament}
                    disabled={loading}
                    className="w-full bg-[#000829] text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {event ? 'Salvar Alterações' : 'Criar Torneio'}
                  </button>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium">
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm font-medium">
                      {successMsg}
                    </div>
                  )}
                </div>

                {/* Right Side: Players Management */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Jogadores e Pontuações</h3>
                  
                  {!event ? (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
                      <User size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Crie o torneio primeiro para poder adicionar jogadores.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Add Player Form */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Jogador</label>
                            <select
                              value={selectedPlayerId}
                              onChange={(e) => setSelectedPlayerId(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm"
                            >
                              <option value="">Selecione...</option>
                              {allPlayers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Pontos</label>
                            <input
                              type="text"
                              value={playerPoints}
                              onChange={(e) => setPlayerPoints(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleAddOrUpdatePlayer}
                          disabled={addingPlayer || !selectedPlayerId}
                          className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {addingPlayer ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                          Adicionar / Atualizar
                        </button>
                      </div>

                      {/* Players List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-tighter">Inscritos no Torneio</h4>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {tournamentPlayers.length} {tournamentPlayers.length === 1 ? 'Inscrito' : 'Inscritos'}
                          </span>
                        </div>
                        <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-white shadow-inner">
                          {loadingPlayers ? (
                            <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>
                          ) : tournamentPlayers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 italic text-sm">Nenhum jogador vinculado.</div>
                          ) : (
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                                <tr>
                                  <th className="px-4 py-2">Nome</th>
                                  <th className="px-4 py-2 text-right">Pts</th>
                                  <th className="px-4 py-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {tournamentPlayers.map(p => (
                                  <tr key={p.scoreId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{p.name}</td>
                                    <td className="px-4 py-3 text-right font-black text-blue-900">{p.points}</td>
                                    <td className="px-4 py-3">
                                      <button 
                                        onClick={() => handleDeletePlayer(p.scoreId)}
                                        className="text-slate-300 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
