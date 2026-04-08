/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsCards from './components/StatsCards';
import RankingTable from './components/RankingTable';
import CTA from './components/CTA';
import Footer from './components/Footer';
import TournamentsModal from './components/TournamentsModal';
import LoginModal from './components/LoginModal';
import PlayersManagementModal from './components/PlayersManagementModal';
import ImportModal from './components/ImportModal';
import PlayerSearch from './components/PlayerSearch';
import { getDashboardData, getEvents } from './services/appwriteService';
import { RankingEntry, StatCard, TournamentEvent } from './types';
import { RANKING_DATA as MOCK_RANKING, STATS as MOCK_STATS } from './constants';

export default function App() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [stats, setStats] = useState<StatCard[]>(MOCK_STATS);
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('lbx_admin_session') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('lbx_admin_session', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('lbx_admin_session');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredRanking = searchQuery 
    ? ranking.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : ranking.slice(0, 10);

  const rankingTitle = searchQuery ? `Resultados para: "${searchQuery}"` : "Top 10 Ranking Geral";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ ranking: dbRanking, stats: dbStats }, dbEvents] = await Promise.all([
          getDashboardData(),
          getEvents()
        ]);
        
        const isConfigured = !!import.meta.env.VITE_APPWRITE_PROJECT_ID;

        if (isConfigured) {
          setRanking(dbRanking);
        } else if (dbRanking.length > 0) {
          setRanking(dbRanking);
        } else {
          setRanking(MOCK_RANKING);
        }

        setStats(dbStats);
        setEvents(dbEvents);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setRanking(MOCK_RANKING);
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        onOpenTournaments={() => setIsTournamentsOpen(true)} 
        onOpenPlayers={() => setIsPlayersOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        <Hero />
        <StatsCards stats={stats} />
        <PlayerSearch onSearch={handleSearch} />
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000829]"></div>
          </div>
        ) : (
          <RankingTable 
            ranking={filteredRanking} 
            title={rankingTitle}
          />
        )}
        <CTA />
      </main>
      <Footer />
      
      <TournamentsModal 
        isOpen={isTournamentsOpen} 
        onClose={() => setIsTournamentsOpen(false)} 
        events={events}
        isLoggedIn={isLoggedIn}
        onRefreshEvents={async () => {
          const dbEvents = await getEvents();
          setEvents(dbEvents);
        }}
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin}
      />

      <PlayersManagementModal 
        isOpen={isPlayersOpen} 
        onClose={() => setIsPlayersOpen(false)} 
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        events={events}
      />
    </div>
  );
}




