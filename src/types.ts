export interface RankingEntry {
  id: string;
  position: number;
  title: string;
  name: string;
  category: string;
  points: number;
  isTop3?: boolean;
}

export interface StatCard {
  label: string;
  value: string;
  icon: 'clock' | 'users' | 'trophy';
  color: string;
}

export interface TournamentEvent {
  id: string;
  name: string;
  date: string;
  url?: string;
  idChessResults?: string;
}

export interface Player {
  id: string;
  name: string;
  title: string;
  category: string;
  id_lbx?: string;
}
