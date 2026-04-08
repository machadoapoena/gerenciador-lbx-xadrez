import { Query, ID } from 'appwrite';
import { databases, databaseId, playersCollectionId, scoresCollectionId, eventsCollectionId } from '../lib/appwrite';
import { RankingEntry, StatCard, TournamentEvent, Player } from '../types';

export interface DashboardData {
  ranking: RankingEntry[];
  stats: StatCard[];
}

export const getPlayers = async (): Promise<Player[]> => {
  if (!databaseId || !playersCollectionId) return [];
  try {
    const response = await databases.listDocuments(
      databaseId,
      playersCollectionId,
      [Query.orderAsc('name'), Query.limit(1000)]
    );
    return response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name || '',
      title: doc.title || '',
      category: doc.category || 'ABSOLUTO',
      id_lbx: doc.id_lbx || doc.ID_LBX || doc.idLbx || '',
    }));
  } catch (error) {
    console.error('Appwrite GetPlayers Error:', error);
    return [];
  }
};

export const searchPlayers = async (searchTerm: string): Promise<Player[]> => {
  if (!databaseId || !playersCollectionId) return [];
  try {
    const queries = [Query.orderAsc('name'), Query.limit(100)];
    if (searchTerm) {
      queries.push(Query.contains('name', searchTerm));
    }
    
    const response = await databases.listDocuments(
      databaseId,
      playersCollectionId,
      queries
    );
    return response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name || '',
      title: doc.title || '',
      category: doc.category || 'ABSOLUTO',
      id_lbx: doc.id_lbx || doc.ID_LBX || doc.idLbx || '',
    }));
  } catch (error) {
    console.error('Appwrite SearchPlayers Error:', error);
    return [];
  }
};

export const createPlayer = async (data: Omit<Player, 'id'>): Promise<Player | null> => {
  if (!databaseId || !playersCollectionId) return null;
  try {
    const response: any = await databases.createDocument(
      databaseId,
      playersCollectionId,
      ID.unique(),
      data
    );
    return {
      id: response.$id,
      name: response.name,
      title: response.title,
      category: response.category,
      id_lbx: response.id_lbx || response.ID_LBX || response.idLbx,
    };
  } catch (error) {
    console.error('Appwrite CreatePlayer Error:', error);
    return null;
  }
};

export const createScore = async (playerId: string, eventId: string, points: number = 0): Promise<boolean> => {
  if (!databaseId || !scoresCollectionId) return false;
  try {
    await databases.createDocument(
      databaseId,
      scoresCollectionId,
      ID.unique(),
      {
        players: playerId,
        event: eventId,
        pts: points
      }
    );
    return true;
  } catch (error) {
    console.error('Appwrite CreateScore Error:', error);
    return false;
  }
};

export const updatePlayer = async (id: string, data: Partial<Omit<Player, 'id'>>): Promise<boolean> => {
  if (!databaseId || !playersCollectionId) return false;
  try {
    await databases.updateDocument(databaseId, playersCollectionId, id, data);
    return true;
  } catch (error) {
    console.error('Appwrite UpdatePlayer Error:', error);
    return false;
  }
};

export const getEvents = async (): Promise<TournamentEvent[]> => {
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  
  if (!projectId || !databaseId || !eventsCollectionId) {
    return [];
  }

  try {
    const response = await databases.listDocuments(
      databaseId,
      eventsCollectionId,
      [Query.orderDesc('data'), Query.limit(100)]
    );

    return response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name || 'Torneio sem nome',
      date: doc.data || '',
      url: doc.url || '',
      idChessResults: doc.id_chess_results || '',
    }));
  } catch (error) {
    console.error('Appwrite Events Error:', error);
    return [];
  }
};

export const createEvent = async (data: Omit<TournamentEvent, 'id'>): Promise<TournamentEvent | null> => {
  if (!databaseId || !eventsCollectionId) return null;
  try {
    const response: any = await databases.createDocument(
      databaseId,
      eventsCollectionId,
      ID.unique(),
      {
        name: data.name,
        data: data.date,
        url: data.url,
        id_chess_results: data.idChessResults
      }
    );
    return {
      id: response.$id,
      name: response.name,
      date: response.data,
      url: response.url,
      idChessResults: response.id_chess_results
    };
  } catch (error) {
    console.error('Appwrite CreateEvent Error:', error);
    return null;
  }
};

export const updateEvent = async (id: string, data: Partial<Omit<TournamentEvent, 'id'>>): Promise<boolean> => {
  if (!databaseId || !eventsCollectionId) return false;
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.date !== undefined) updateData.data = data.date;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.idChessResults !== undefined) updateData.id_chess_results = data.idChessResults;
    
    await databases.updateDocument(databaseId, eventsCollectionId, id, updateData);
    return true;
  } catch (error) {
    console.error('Appwrite UpdateEvent Error:', error);
    return false;
  }
};

export const getScoresByEvent = async (eventId: string): Promise<any[]> => {
  if (!databaseId || !scoresCollectionId) return [];
  try {
    const response = await databases.listDocuments(
      databaseId,
      scoresCollectionId,
      [Query.equal('event', eventId), Query.limit(1000)]
    );
    return response.documents;
  } catch (error) {
    console.error('Appwrite GetScoresByEvent Error:', error);
    return [];
  }
};

export const getScoreByPlayerAndEvent = async (playerId: string, eventId: string): Promise<any | null> => {
  if (!databaseId || !scoresCollectionId) return null;
  try {
    const response = await databases.listDocuments(
      databaseId,
      scoresCollectionId,
      [Query.equal('players', playerId), Query.equal('event', eventId), Query.limit(1)]
    );
    return response.documents[0] || null;
  } catch (error) {
    console.error('Appwrite GetScoreByPlayerAndEvent Error:', error);
    return null;
  }
};

export const updateScore = async (scoreId: string, points: number): Promise<boolean> => {
  if (!databaseId || !scoresCollectionId) return false;
  try {
    await databases.updateDocument(databaseId, scoresCollectionId, scoreId, { pts: points });
    return true;
  } catch (error) {
    console.error('Appwrite UpdateScore Error:', error);
    return false;
  }
};

export const deleteScore = async (scoreId: string): Promise<boolean> => {
  if (!databaseId || !scoresCollectionId) return false;
  try {
    await databases.deleteDocument(databaseId, scoresCollectionId, scoreId);
    return true;
  } catch (error) {
    console.error('Appwrite DeleteScore Error:', error);
    return false;
  }
};

export const getRanking = async (searchTerm?: string, limit: number = 10): Promise<RankingEntry[]> => {
  if (!databaseId || !playersCollectionId || !scoresCollectionId) return [];

  try {
    let players: any[] = [];
    
    if (searchTerm) {
      // Search mode: Fetch players matching name
      const playersResponse = await databases.listDocuments(
        databaseId,
        playersCollectionId,
        [Query.contains('name', searchTerm), Query.limit(50)]
      );
      players = playersResponse.documents;
    } else {
      // Initial mode: Still need all to calculate top 10 accurately 
      // unless we have a total_points field. 
      // For now, we'll fetch all players but we could optimize this 
      // if we add a total_points field to the Player document.
      const playersResponse = await databases.listDocuments(
        databaseId,
        playersCollectionId,
        [Query.limit(1000)]
      );
      players = playersResponse.documents;
    }

    if (players.length === 0) return [];

    // Fetch scores for the players we found
    // If we have many players, we fetch all scores (up to 5000)
    // If we have few (from search), we could filter by player IDs
    const playerIds = players.map(p => p.$id);
    
    let scoresQueries = [Query.limit(5000)];
    if (searchTerm && playerIds.length <= 100) {
      scoresQueries.push(Query.equal('players', playerIds));
    }

    const scoresResponse = await databases.listDocuments(
      databaseId,
      scoresCollectionId,
      scoresQueries
    );

    // Aggregate scores
    const playerScoresMap: Record<string, number> = {};
    scoresResponse.documents.forEach((scoreDoc: any) => {
      const playerRef = scoreDoc.players;
      const points = Number(scoreDoc.pts) || 0;
      
      let pId = '';
      if (Array.isArray(playerRef)) pId = playerRef[0]?.$id;
      else if (typeof playerRef === 'object') pId = playerRef.$id;
      else pId = playerRef;

      if (pId) {
        playerScoresMap[pId] = (playerScoresMap[pId] || 0) + points;
      }
    });

    // Create ranking entries
    const ranking: RankingEntry[] = players.map((playerDoc: any) => ({
      id: playerDoc.$id,
      position: 0,
      title: playerDoc.title || '',
      name: playerDoc.name || '',
      category: playerDoc.category || 'ABSOLUTO',
      points: playerScoresMap[playerDoc.$id] || 0,
      isTop3: false,
    }));

    // Sort and return
    const sorted = ranking.sort((a, b) => b.points - a.points);
    
    // If it's the initial load, we return only the top 10
    // If it's a search, we return all matches (up to the search limit)
    const result = searchTerm ? sorted : sorted.slice(0, limit);

    return result.map((entry, index) => ({
      ...entry,
      position: index + 1,
      isTop3: index < 3,
    }));

  } catch (error) {
    console.error('Appwrite GetRanking Error:', error);
    return [];
  }
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  
  // Default stats
  const defaultStats: StatCard[] = [
    { label: 'ÚLTIMA ATUALIZAÇÃO', value: new Date().toLocaleDateString('pt-BR'), icon: 'clock', color: 'bg-yellow-400' },
    { label: 'JOGADORES ATIVOS', value: '---', icon: 'users', color: 'bg-green-600' },
    { label: 'TEMPORADA 2026', value: 'Circuito Ouro', icon: 'trophy', color: 'bg-blue-800' },
  ];

  if (!projectId || !databaseId || !playersCollectionId || !scoresCollectionId) {
    return { ranking: [], stats: defaultStats };
  }

  try {
    // Fetch top 10 ranking
    const ranking = await getRanking(undefined, 10);

    // Fetch total players for stats
    const playersResponse = await databases.listDocuments(
      databaseId,
      playersCollectionId,
      [Query.limit(1)]
    );

    const dynamicStats: StatCard[] = [
      { 
        label: 'ÚLTIMA ATUALIZAÇÃO', 
        value: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 
        icon: 'clock', 
        color: 'bg-yellow-400' 
      },
      { 
        label: 'JOGADORES ATIVOS', 
        value: `${playersResponse.total} Filiados`, 
        icon: 'users', 
        color: 'bg-green-600' 
      },
      { 
        label: 'TEMPORADA 2026', 
        value: 'Circuito Ouro', 
        icon: 'trophy', 
        color: 'bg-blue-800' 
      },
    ];

    return { ranking, stats: dynamicStats };

  } catch (error: any) {
    console.error('Appwrite Dashboard Error:', error.message);
    return { ranking: [], stats: defaultStats };
  }
};

export const getPlayerHistory = async (playerId: string): Promise<any[]> => {
  if (!databaseId || !scoresCollectionId || !eventsCollectionId) return [];
  try {
    // 1. Fetch player scores
    const scoresResponse = await databases.listDocuments(
      databaseId,
      scoresCollectionId,
      [Query.equal('players', playerId), Query.limit(100)]
    );

    // 2. Fetch all events to map names (in case relationship doesn't auto-expand)
    const eventsResponse = await databases.listDocuments(
      databaseId,
      eventsCollectionId,
      [Query.limit(100)]
    );

    const eventsMap: Record<string, { name: string; date: string }> = {};
    eventsResponse.documents.forEach((eventDoc: any) => {
      eventsMap[eventDoc.$id] = {
        name: eventDoc.name || 'Torneio sem nome',
        date: eventDoc.data || '',
      };
    });

    // 3. Map history
    const history = scoresResponse.documents.map((doc: any) => {
      const eventRef = doc.event;
      let eventName = 'Torneio Desconhecido';
      let eventDate = '';

      // Handle Appwrite relationship (can be object, array or string ID)
      if (eventRef) {
        if (typeof eventRef === 'object' && !Array.isArray(eventRef)) {
          eventName = eventRef.name || 'Torneio sem nome';
          eventDate = eventRef.data || '';
        } else if (Array.isArray(eventRef) && eventRef[0]) {
          eventName = eventRef[0].name || 'Torneio sem nome';
          eventDate = eventRef[0].data || '';
        } else if (typeof eventRef === 'string') {
          // Use the map if we only have the ID
          const mappedEvent = eventsMap[eventRef];
          if (mappedEvent) {
            eventName = mappedEvent.name;
            eventDate = mappedEvent.date;
          }
        }
      }

      return {
        id: doc.$id,
        points: doc.pts,
        eventName,
        eventDate,
      };
    });

    return history.sort((a, b) => {
      const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Appwrite GetPlayerHistory Error:', error);
    return [];
  }
};

