import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit2, Save, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';
import { searchPlayers, getPlayers, createPlayer, updatePlayer, getRanking, recalculateRankingWithFunction } from '../services/appwriteService';
import { databaseId, playersCollectionId, databases } from '../lib/appwrite';

interface PlayersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayersManagementModal({ isOpen, onClose }: PlayersManagementModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showConfirmSync, setShowConfirmSync] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    category: 'ABSOLUTO',
    id_lbx: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlayersList = async () => {
    setLoading(true);
    const data = await getPlayers();
    setPlayers(data);
    setLoading(false);
    setShowAll(true);
    setHasSearched(true);
  };

  const handleSyncPoints = async () => {
    setShowConfirmSync(false);
    setSyncing(true);
    setSyncStatus('Chamando função Appwrite...');
    
    try {
      const result = await recalculateRankingWithFunction();
      
      if (result.success) {
        setSyncStatus('Sucesso! Totais atualizados.');
        setTimeout(() => setSyncStatus(null), 5000);
      } else {
        console.error('Sync: Falha na função Appwrite:', result.message);
        setSyncStatus(`Erro: ${result.message}`);
        // Keep error visible for 15 seconds
        setTimeout(() => setSyncStatus(null), 15000);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Erro ao executar função.');
      setTimeout(() => setSyncStatus(null), 10000);
    } finally {
      setSyncing(false);
    }
  };

  /**
   * BACKUP: Lógica original de sincronização via cliente
   * Mantida para referência ou caso a função Appwrite não esteja disponível
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSyncPointsBackup = async () => {
    setSyncing(true);
    setSyncStatus('Iniciando backup local...');
    console.log('Sync Backup: Iniciando recálculo de totais...');
    
    try {
      setSyncStatus('Buscando pontuações no banco...');
      const fullRanking = await getRanking(undefined, 1000, true);
      console.log(`Sync Backup: ${fullRanking.length} jogadores para processar.`);
      
      if (fullRanking.length === 0) {
        setSyncStatus('Nenhum jogador encontrado para sincronizar.');
        setTimeout(() => setSyncStatus(null), 3000);
        return;
      }

      let count = 0;
      for (const entry of fullRanking) {
        try {
          setSyncStatus(`Atualizando: ${entry.name} (${count + 1}/${fullRanking.length})`);
          await databases.updateDocument(databaseId!, playersCollectionId!, entry.id, {
            total_points: entry.points
          });
          count++;
        } catch (e) {
          console.error(`Sync Backup: Falha ao atualizar jogador ${entry.name} (${entry.id})`, e);
        }
      }
      
      setSyncStatus(`Sucesso! ${count} jogadores atualizados.`);
      console.log(`Sync Backup: Finalizado. ${count} jogadores atualizados.`);
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (error) {
      console.error('Sync Backup error:', error);
      setSyncStatus('Erro no backup local.');
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    const data = await searchPlayers(searchTerm);
    setPlayers(data);
    setLoading(false);
    setHasSearched(true);
    setShowAll(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setPlayers([]);
      setSearchTerm('');
      setHasSearched(false);
      setShowAll(false);
    }
  }, [isOpen]);

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      title: player.title,
      category: player.category,
      id_lbx: player.id_lbx || ''
    });
    // Scroll to top of modal to see form
    const modalContent = document.getElementById('players-modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', title: '', category: 'ABSOLUTO', id_lbx: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        const success = await updatePlayer(editingId, formData);
        if (success) {
          setPlayers(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
          resetForm();
        }
      } else {
        const newPlayer = await createPlayer(formData);
        if (newPlayer) {
          setPlayers(prev => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)));
          resetForm();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedPlayers = players;

  return (
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
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900 p-2 rounded-lg text-white">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#000829]">Gerenciar Jogadores</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div id="players-modal-content" className="flex-grow overflow-y-auto p-6">
              {/* Form Section */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  {editingId ? <Edit2 size={14} /> : <UserPlus size={14} />}
                  {editingId ? 'Editar Jogador' : 'Novo Jogador'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                      placeholder="Ex: Magnus Carlsen"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Titulação</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                      placeholder="Ex: GM, IM, FM..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    >
                      <option value="Sênior">Sênior</option>
                      <option value="ABSOLUTO">ABSOLUTO</option>
                      <option value="FEMININO">FEMININO</option>
                      <option value="SUB20">SUB20</option>
                      <option value="SUB18">SUB18</option>
                      <option value="SUB16">SUB16</option>
                      <option value="SUB14">SUB14</option>
                      <option value="SUB12">SUB12</option>
                      <option value="SUB10">SUB10</option>
                      <option value="SUB08">SUB08</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">ID LBX</label>
                    <input
                      type="text"
                      value={formData.id_lbx}
                      onChange={e => setFormData({ ...formData, id_lbx: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                      placeholder="Ex: 12345"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-[#000829] text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                      <Save size={18} />
                    </button>
                  </div>
                </form>
              </div>

              {/* List Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#000829]">
                    {showAll ? 'Todos os Jogadores' : 'Resultados da Busca'} ({players.length})
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {showConfirmSync ? (
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50">
                          <p className="text-xs text-slate-600 mb-3">Isso irá recalcular e atualizar o campo <strong>total_points</strong> de todos os jogadores. Continuar?</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setShowConfirmSync(false)}
                              className="flex-1 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              CANCELAR
                            </button>
                            <button 
                              onClick={handleSyncPoints}
                              className="flex-1 py-1.5 text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-colors shadow-sm"
                            >
                              SIM, RECALCULAR
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      <button
                        onClick={() => setShowConfirmSync(true)}
                        disabled={syncing}
                        title="Sincronizar total_points (necessário se o campo foi criado agora)"
                        className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {syncing ? (
                          <>
                            <span className="animate-spin h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full"></span>
                            PROCESSANDO...
                          </>
                        ) : 'RECALCULAR TOTAIS'}
                      </button>
                      
                      {syncStatus && (
                        <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-blue-900 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg font-bold animate-pulse z-50">
                          {syncStatus}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={fetchPlayersList}
                      className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${
                        showAll 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      MOSTRAR TODOS
                    </button>
                    <form onSubmit={handleSearch} className="relative w-64 flex gap-2">
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          placeholder="Buscar por nome..."
                          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        BUSCAR
                      </button>
                    </form>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-slate-400 italic">Buscando jogadores...</div>
                ) : displayedPlayers.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm italic">
                      {hasSearched 
                        ? 'Nenhum jogador encontrado para esta busca.' 
                        : 'Digite um nome e clique em "BUSCAR" ou use "MOSTRAR TODOS".'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedPlayers.map(player => (
                      <div key={player.id} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-blue-200 transition-all group">
                        <div>
                          <div className="flex items-center gap-2">
                            {player.title && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-900 text-yellow-400">
                                {player.title}
                              </span>
                            )}
                            <p className="font-bold text-slate-800">{player.name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500">{player.category}</p>
                            {player.id_lbx && (
                              <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 rounded">
                                ID: {player.id_lbx}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEdit(player)}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar Jogador"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
