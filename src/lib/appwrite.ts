import { Client, Databases, Functions } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const databases = new Databases(client);
export const functions = new Functions(client);
export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const playersCollectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PLAYERS_ID;
export const eventsCollectionId = import.meta.env.VITE_APPWRITE_COLLECTION_EVENTS_ID;
export const matchesCollectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MATCHES_ID;
export const scoresCollectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SCORES_ID;
export const syncFunctionId = import.meta.env.VITE_APPWRITE_FUNCTION_SYNC_ID;

export default client;
