/** Type for a new entry being created */
export interface NewEntry {
  content: string;
  user_id: string;
}

/** Type for an entry from the database */
export interface Entry {
  id: string; // UUID
  content: string;
  created_at: string; // ISO timestamp
  user_id: string; // UUID
}

/** Type for query results with error handling */
export interface QueryResult<T> {
  data: T;
  count?: number;
  error: string | null;
}

/** Type for the database schema */
export type Database = {
  public: {
    Tables: {
      entries: {
        Row: Entry; // Return type when querying the table
        Insert: NewEntry; // Type for inserting into the table
        Update: never; // Entries are immutable
      };
    };
  };
};
