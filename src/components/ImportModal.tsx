import React, { useState, useEffect } from 'react';
import { X, FileDown, Table, Play, Loader2, CheckCircle2, AlertCircle, Save, Trophy, Search, Link as LinkIcon, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { TournamentEvent, Player } from '../types';
import { getPlayers, createPlayer, createScore, getEvents } from '../services/appwriteService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExtractedPlayer {
  id_lbx: string;
  title: string;
  name: string;
  points: number;
  selected: boolean;
  isRegistered: boolean;
  dbId?: string;
  similarPlayers?: Player[];
  linkedPlayer?: Player;
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  // Registration File Config
  const [startRow, setStartRow] = useState(1);
  const [colTitle, setColTitle] = useState('A');
  const [colName, setColName] = useState('B');
  const [colIdLbx, setColIdLbx] = useState('C');
  
  // Score File Config
  const [startRowScores, setStartRowScores] = useState(1);
  const [colNameScores, setColNameScores] = useState('B');
  const [colPoints, setColPoints] = useState('D');
  
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [extractedPlayers, setExtractedPlayers] = useState<ExtractedPlayer[]>([]);
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);
  const [success, setSuccess] = useState(false);

  // Similarity Modal State
  const [similarityModalOpen, setSimilarityModalOpen] = useState(false);
  const [activePlayerIdx, setActivePlayerIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const [players, eventsData] = await Promise.all([
          getPlayers(),
          getEvents()
        ]);
        setExistingPlayers(players);
        setEvents(eventsData);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen]);

  const columnToIndex = (col: string) => {
    let index = 0;
    const upperCol = col.toUpperCase();
    for (let i = 0; i < upperCol.length; i++) {
      index = index * 26 + upperCol.charCodeAt(i) - 64;
    }
    return index - 1;
  };

  const normalizeName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[,.]/g, ' ') // Replace commas and dots with spaces
      .toUpperCase()
      .replace(/\s+/g, ' ') // Collapse spaces
      .trim();
  };

  const findSimilarPlayers = (name: string, allPlayers: Player[]) => {
    const normalizedSearch = normalizeName(name);
    const searchParts = normalizedSearch.split(' ').filter(p => p.length > 2);
    
    return allPlayers.filter(p => {
      const dbName = normalizeName(p.name);
      // Check if any part of the search name is in the db name or vice versa
      return searchParts.some(part => dbName.includes(part)) || dbName.includes(normalizedSearch);
    }).slice(0, 5); // Limit to top 5 matches
  };

  const handleProcess = async () => {
    if (!selectedEventId) {
      setError('Por favor, selecione um evento.');
      return;
    }

    const event = events.find(e => e.id === selectedEventId);
    if (!event?.idChessResults) {
      setError('Este evento não possui um ID do Chess-Results configurado.');
      return;
    }

    setLoading(true);
    setError('');
    setExtractedPlayers([]);
    setSuccess(false);

    try {
      // 1. Fetch Registration Data (art=0)
      const regResponse = await axios.get(`/api/proxy-chess-results?id=${event.idChessResults}&art=0`, {
        responseType: 'arraybuffer'
      });

      // 2. Fetch Score Data (art=1)
      const scoreResponse = await axios.get(`/api/proxy-chess-results?id=${event.idChessResults}&art=1`, {
        responseType: 'arraybuffer'
      });

      // Process Registration
      const regWorkbook = XLSX.read(regResponse.data, { type: 'array' });
      const regSheet = regWorkbook.Sheets[regWorkbook.SheetNames[0]];
      const regJson: any[][] = XLSX.utils.sheet_to_json(regSheet, { header: 1 });

      // Process Scores
      const scoreWorkbook = XLSX.read(scoreResponse.data, { type: 'array' });
      const scoreSheet = scoreWorkbook.Sheets[scoreWorkbook.SheetNames[0]];
      const scoreJson: any[][] = XLSX.utils.sheet_to_json(scoreSheet, { header: 1 });

      // Build Score Map (Name -> Points)
      const scoreMap = new Map<string, number>();
      const scoreNameIdx = columnToIndex(colNameScores);
      const scorePointsIdx = columnToIndex(colPoints);

      for (let i = startRowScores - 1; i < scoreJson.length; i++) {
        const row = scoreJson[i];
        if (!row || row.length === 0) continue;
        const rawName = String(row[scoreNameIdx] || '').trim();
        if (!rawName) continue;
        const name = normalizeName(rawName);
        const pts = parseFloat(String(row[scorePointsIdx] || '0').replace(',', '.')) || 0;
        scoreMap.set(name, pts);
      }

      const players: ExtractedPlayer[] = [];
      const titleIdx = columnToIndex(colTitle);
      const nameIdx = columnToIndex(colName);
      const idLbxIdx = columnToIndex(colIdLbx);

      // Extract Players and Match Scores
      for (let i = startRow - 1; i < regJson.length; i++) {
        const row = regJson[i];
        if (!row || row.length === 0) continue;

        const name = String(row[nameIdx] || '').trim();
        if (!name) continue;

        const idLbxValue = String(row[idLbxIdx] || '').trim();
        const normalizedName = normalizeName(name);
        const points = scoreMap.get(normalizedName) || 0;
        
        // Check if already registered
        const existingPlayer = existingPlayers.find(p => {
          const dbIdLbx = String(p.id_lbx || '').trim();
          const dbNameNormalized = normalizeName(p.name);
          const excelIdLbx = idLbxValue;
          const excelNameNormalized = normalizedName;

          return (excelIdLbx && dbIdLbx === excelIdLbx) || (dbNameNormalized === excelNameNormalized);
        });

        players.push({
          title: String(row[titleIdx] || '').trim(),
          name: name,
          id_lbx: idLbxValue,
          points: points,
          selected: !existingPlayer, // Auto-select only new players
          isRegistered: !!existingPlayer,
          dbId: existingPlayer?.id,
          similarPlayers: !existingPlayer ? findSimilarPlayers(name, existingPlayers) : []
        });
      }

      setExtractedPlayers(players);
      if (players.length > 0) {
        setSuccess(true);
      } else {
        setError('Nenhum dado encontrado com as configurações informadas.');
      }
    } catch (err) {
      console.error('Import Error:', err);
      setError('Erro ao buscar ou processar os dados do Chess-Results.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setExtractedPlayers(prev => prev.map((p, i) => 
      i === index ? { ...p, selected: !p.selected } : p
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = extractedPlayers.every(p => p.selected);
    setExtractedPlayers(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const handleConfirmImport = async () => {
    const toImport = extractedPlayers.filter(p => p.selected);
    if (toImport.length === 0) {
      setError('Selecione pelo menos um jogador para importar.');
      return;
    }

    if (!selectedEventId) {
      setError('Por favor, selecione um evento para vincular os jogadores.');
      return;
    }

    setImporting(true);
    setError('');
    let playerCounter = 0;
    let relationshipCounter = 0;

    try {
      for (const player of toImport) {
        let playerId = player.dbId || player.linkedPlayer?.id;

        // 1. If "Novo" and no linked player, create player first
        if (!playerId) {
          const newPlayer = await createPlayer({
            name: player.name,
            title: player.title,
            category: 'ABSOLUTO',
            id_lbx: player.id_lbx
          });
          if (newPlayer) {
            playerId = newPlayer.id;
            playerCounter++;
          }
        }

        // 2. Create relationship with event (score record)
        if (playerId) {
          const success = await createScore(playerId, selectedEventId, player.points);
          if (success) {
            relationshipCounter++;
          }
        }
      }

      setSuccess(true);
      setError(`${playerCounter} novos jogadores criados e ${relationshipCounter} vínculos com o evento realizados!`);
      
      // Refresh existing players
      const updatedPlayers = await getPlayers();
      setExistingPlayers(updatedPlayers);
      
      // Update local state
      setExtractedPlayers(prev => prev.map(p => {
        if (p.selected) {
          return { ...p, selected: false, isRegistered: true };
        }
        return p;
      }));
    } catch (err) {
      console.error('Confirm Import Error:', err);
      setError('Ocorreu um erro durante a importação. Verifique as permissões do Appwrite.');
    } finally {
      setImporting(false);
    }
  };

  const linkPlayer = (extractedIdx: number, dbPlayer: Player | null) => {
    setExtractedPlayers(prev => prev.map((p, i) => {
      if (i === extractedIdx) {
        return {
          ...p,
          linkedPlayer: dbPlayer || undefined,
          isRegistered: !!dbPlayer,
          selected: true // Auto-select if linked
        };
      }
      return p;
    }));
    setSimilarityModalOpen(false);
    setActivePlayerIdx(null);
  };

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
            className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-green-700 p-2 rounded-lg text-white">
                  <FileDown size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#000829]">Importar do Chess-Results</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Form */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Table size={14} />
                      Configuração da Tabela
                    </h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Selecionar Evento</label>
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                      >
                        <option value="">Selecione um evento...</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.name} {event.idChessResults ? `(ID: ${event.idChessResults})` : '(Sem ID Chess-Results)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Linha Inicial</label>
                        <input
                          type="number"
                          min="1"
                          value={startRow}
                          onChange={(e) => setStartRow(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Coluna Titulação</label>
                        <input
                          type="text"
                          value={colTitle}
                          onChange={(e) => setColTitle(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                          placeholder="Ex: A"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Coluna Nome</label>
                        <input
                          type="text"
                          value={colName}
                          onChange={(e) => setColName(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                          placeholder="Ex: B"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Coluna ID LBX</label>
                        <input
                          type="text"
                          value={colIdLbx}
                          onChange={(e) => setColIdLbx(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                          placeholder="Ex: C"
                        />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pt-4 flex items-center gap-2">
                      <Trophy size={14} />
                      Configuração de Pontuação
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Linha Inicial (Pts)</label>
                        <input
                          type="number"
                          min="1"
                          value={startRowScores}
                          onChange={(e) => setStartRowScores(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Coluna Nome (Pts)</label>
                        <input
                          type="text"
                          value={colNameScores}
                          onChange={(e) => setColNameScores(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                          placeholder="Ex: B"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Coluna Pontos</label>
                        <input
                          type="text"
                          value={colPoints}
                          onChange={(e) => setColPoints(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                          placeholder="Ex: D"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleProcess}
                      disabled={loading}
                      className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Play size={18} />
                          Processar
                        </>
                      )}
                    </button>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Results List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-[#000829] flex items-center justify-between">
                    Dados Extraídos
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {extractedPlayers.length} itens
                    </span>
                  </h3>
                  
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30 h-[450px] overflow-y-auto shadow-inner">
                    {extractedPlayers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <Table size={48} className="mb-4 opacity-20" />
                        <p className="text-sm italic">Configure os campos e clique em processar para ver os dados aqui.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 w-10">
                              <input 
                                type="checkbox" 
                                className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                                checked={extractedPlayers.length > 0 && extractedPlayers.every(p => p.selected)}
                                onChange={toggleSelectAll}
                              />
                            </th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">ID LBX</th>
                            <th className="px-4 py-3">Tít.</th>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3 text-right">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {extractedPlayers.map((player, idx) => (
                            <tr key={idx} className={`hover:bg-slate-50 transition-colors ${player.isRegistered ? 'bg-slate-50/50' : ''}`}>
                              <td className="px-4 py-3">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                                  checked={player.selected}
                                  onChange={() => toggleSelect(idx)}
                                />
                              </td>
                              <td className="px-4 py-3">
                                {player.isRegistered || player.linkedPlayer ? (
                                  <div className="flex flex-col gap-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                                      <CheckCircle2 size={10} /> {player.linkedPlayer ? 'Vinculado' : 'Cadastrado'}
                                    </span>
                                    {player.linkedPlayer && (
                                      <button 
                                        onClick={() => {
                                          setActivePlayerIdx(idx);
                                          setSimilarityModalOpen(true);
                                        }}
                                        className="text-[9px] text-blue-600 hover:underline text-left font-medium"
                                      >
                                        Alterar vínculo
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                                      Novo
                                    </span>
                                    {player.similarPlayers && player.similarPlayers.length > 0 && (
                                      <button
                                        onClick={() => {
                                          setActivePlayerIdx(idx);
                                          setSimilarityModalOpen(true);
                                        }}
                                        className="p-1 hover:bg-slate-100 rounded-full text-blue-600 transition-colors"
                                        title="Ver jogadores parecidos no banco"
                                      >
                                        <Search size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-blue-600">{player.id_lbx || '-'}</td>
                              <td className="px-4 py-3">
                                {player.title ? (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-900 text-yellow-400">
                                    {player.title}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">{player.name}</td>
                              <td className="px-4 py-3 text-right font-black text-blue-900">{player.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4">
              <button
                onClick={handleConfirmImport}
                disabled={importing || extractedPlayers.length === 0}
                className="bg-[#000829] text-white px-12 py-3 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {importing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Confirmar Importação
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Apenas os jogadores selecionados serão cadastrados no sistema
              </p>
            </div>
          </motion.div>

          {/* Similarity Modal */}
          <AnimatePresence>
            {similarityModalOpen && activePlayerIdx !== null && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSimilarityModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Search size={18} className="text-blue-600" />
                      Jogadores Parecidos
                    </h3>
                    <button onClick={() => setSimilarityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Buscando por:</p>
                      <p className="font-bold text-slate-800">{extractedPlayers[activePlayerIdx].name}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resultados na Base:</p>
                      {extractedPlayers[activePlayerIdx].similarPlayers?.length === 0 ? (
                        <p className="text-sm text-slate-500 italic py-4 text-center">Nenhum jogador parecido encontrado.</p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                          {extractedPlayers[activePlayerIdx].similarPlayers?.map(p => (
                            <button
                              key={p.id}
                              onClick={() => linkPlayer(activePlayerIdx, p)}
                              className="w-full p-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-bold text-slate-800 group-hover:text-blue-700">{p.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">ID LBX: {p.id_lbx || 'Não informado'}</p>
                              </div>
                              <LinkIcon size={16} className="text-slate-300 group-hover:text-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => linkPlayer(activePlayerIdx, null)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} />
                        Manter como Novo Jogador
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
