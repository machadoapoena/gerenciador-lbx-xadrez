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
  if (!databaseId || !scoresCollectionId || !playersCollectionId) return false;
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

    // Update player's total_points
    try {
      const player = await databases.getDocument(databaseId, playersCollectionId, playerId);
      const currentTotal = Number(player.total_points) || 0;
      await databases.updateDocument(databaseId, playersCollectionId, playerId, {
        total_points: currentTotal + points
      });
    } catch (e) {
      console.warn('Appwrite: Could not update total_points field.');
    }

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
  if (!databaseId || !scoresCollectionId || !playersCollectionId) return false;
  try {
    // Get old score to calculate difference
    const oldScore = await databases.getDocument(databaseId, scoresCollectionId, scoreId);
    const oldPts = Number(oldScore.pts) || 0;
    const diff = points - oldPts;

    await databases.updateDocument(databaseId, scoresCollectionId, scoreId, { pts: points });

    // Update player's total_points
    const playerRef = oldScore.players;
    let pId = '';
    if (Array.isArray(playerRef)) pId = playerRef[0]?.$id;
    else if (typeof playerRef === 'object') pId = playerRef.$id;
    else pId = playerRef;

    if (pId) {
      try {
        const player = await databases.getDocument(databaseId, playersCollectionId, pId);
        const currentTotal = Number(player.total_points) || 0;
        await databases.updateDocument(databaseId, playersCollectionId, pId, {
          total_points: currentTotal + diff
        });
      } catch (e) {
        console.warn('Appwrite: Could not update total_points field.');
      }
    }

    return true;
  } catch (error) {
    console.error('Appwrite UpdateScore Error:', error);
    return false;
  }
};

export const deleteScore = async (scoreId: string): Promise<boolean> => {
  if (!databaseId || !scoresCollectionId || !playersCollectionId) return false;
  try {
    // Get score to know how much to subtract
    const score = await databases.getDocument(databaseId, scoresCollectionId, scoreId);
    const pts = Number(score.pts) || 0;

    await databases.deleteDocument(databaseId, scoresCollectionId, scoreId);

    // Update player's total_points
    const playerRef = score.players;
    let pId = '';
    if (Array.isArray(playerRef)) pId = playerRef[0]?.$id;
    else if (typeof playerRef === 'object') pId = playerRef.$id;
    else pId = playerRef;

    if (pId) {
      try {
        const player = await databases.getDocument(databaseId, playersCollectionId, pId);
        const currentTotal = Number(player.total_points) || 0;
        await databases.updateDocument(databaseId, playersCollectionId, pId, {
          total_points: Math.max(0, currentTotal - pts)
        });
      } catch (e) {
        console.warn('Appwrite: Could not update total_points field.');
      }
    }

    return true;
  } catch (error) {
    console.error('Appwrite DeleteScore Error:', error);
    return false;
  }
};

export const getRanking = async (searchTerm?: string, limit: number = 10, forceAggregation: boolean = false): Promise<RankingEntry[]> => {
  if (!databaseId || !playersCollectionId || !scoresCollectionId) return [];

  try {
    // Attempt to use total_points field for optimized Top 10
    // This assumes a 'total_points' attribute exists in the players collection
    if (!searchTerm && !forceAggregation) {
      try {
        const response = await databases.listDocuments(
          databaseId,
          playersCollectionId,
          [
            Query.orderDesc('total_points'),
            Query.limit(limit)
          ]
        );
        
        // Only return if we actually got documents
        if (response.documents.length > 0) {
          return response.documents.map((doc: any, index: number) => ({
            id: doc.$id,
            position: index + 1,
            title: doc.title || '',
            name: doc.name || '',
            category: doc.category || 'ABSOLUTO',
            points: doc.total_points || 0,
            isTop3: index < 3,
          }));
        }
      } catch (e) {
        console.warn('Appwrite: total_points field not found or error. Falling back to aggregation.');
      }
    }

    let players: any[] = [];
    
    if (searchTerm) {
      const playersResponse = await databases.listDocuments(
        databaseId,
        playersCollectionId,
        [Query.contains('name', searchTerm), Query.limit(50)]
      );
      players = playersResponse.documents;
    } else {
      // Fallback: Fetch all to calculate
      const playersResponse = await databases.listDocuments(
        databaseId,
        playersCollectionId,
        [Query.limit(1000)]
      );
      players = playersResponse.documents;
    }

    if (players.length === 0) return [];

    const playerIds = players.map(p => p.$id);
    
    // If we have total_points but it's not indexed for sorting, we can still use it here
    const hasTotalPoints = players.some(p => p.total_points !== undefined);

    let playerScoresMap: Record<string, number> = {};

    if (hasTotalPoints && !searchTerm && !forceAggregation) {
      players.forEach(p => {
        playerScoresMap[p.$id] = p.total_points || 0;
      });
    } else {
      let scoresQueries = [Query.limit(5000)];
      if (searchTerm && playerIds.length <= 100) {
        scoresQueries.push(Query.equal('players', playerIds));
      }

      const scoresResponse = await databases.listDocuments(
        databaseId,
        scoresCollectionId,
        scoresQueries
      );

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
    }

    const ranking: RankingEntry[] = players.map((playerDoc: any) => ({
      id: playerDoc.$id,
      position: 0,
      title: playerDoc.title || '',
      name: playerDoc.name || '',
      category: playerDoc.category || 'ABSOLUTO',
      points: playerScoresMap[playerDoc.$id] || 0,
      isTop3: false,
    }));

    const sorted = ranking.sort((a, b) => b.points - a.points);
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

