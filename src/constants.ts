import { RankingEntry, StatCard } from './types';

export const RANKING_DATA: RankingEntry[] = [
  { id: '1', position: 1, title: 'GM', name: 'Rafael Leitão', category: 'Absoluto', points: 2625, isTop3: true },
  { id: '2', position: 2, title: 'GM', name: 'Alexandr Fier', category: 'Absoluto', points: 2602, isTop3: true },
  { id: '3', position: 3, title: 'GM', name: 'Luis Paulo Supi', category: 'Absoluto', points: 2588, isTop3: true },
  { id: '4', position: 4, title: 'GM', name: 'Renato Quintiliano', category: 'Absoluto', points: 2554 },
  { id: '5', position: 5, title: 'GM', name: 'Krikor Mekhitarian', category: 'Absoluto', points: 2549 },
  { id: '6', position: 6, title: 'IM', name: 'Evandro Barbosa', category: 'Absoluto', points: 2515 },
  { id: '7', position: 7, title: 'IM', name: 'Diego Di Berardino', category: 'Absoluto', points: 2498 },
  { id: '8', position: 8, title: 'FM', name: 'Julia Alboredo', category: 'Feminino', points: 2482 },
  { id: '9', position: 9, title: 'IM', name: 'Felipe El Debs', category: 'Absoluto', points: 2475 },
  { id: '10', position: 10, title: 'WIM', name: 'Kathie Librelato', category: 'Feminino', points: 2460 },
];

export const STATS: StatCard[] = [
  { label: 'ÚLTIMA ATUALIZAÇÃO', value: 'Hoje, 09:45', icon: 'clock', color: 'bg-yellow-400' },
  { label: 'JOGADORES ATIVOS', value: '4,281 Filiados', icon: 'users', color: 'bg-green-600' },
  { label: 'TEMPORADA 2026', value: 'Circuito Ouro', icon: 'trophy', color: 'bg-blue-800' },
];
