/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID: string;
  readonly VITE_APPWRITE_COLLECTION_PLAYERS_ID: string;
  readonly VITE_APPWRITE_COLLECTION_EVENTS_ID: string;
  readonly VITE_APPWRITE_COLLECTION_MATCHES_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
