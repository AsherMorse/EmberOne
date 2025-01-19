import { pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Reference to Supabase's auth schema
const authSchema = pgSchema('auth');

// Reference to Supabase's auth.users table
export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const entries = pgTable('entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});
