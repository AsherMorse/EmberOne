export type Entry = {
  id: string; // UUID
  content: string;
  created_at: string; // ISO timestamp
  user_id: string; // UUID
};

export type NewEntry = Omit<Entry, 'id' | 'created_at'>;

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
