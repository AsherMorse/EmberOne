import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { tickets } from './tickets.js';
import { profiles } from './profiles.js';
import { index } from 'drizzle-orm/pg-core';

export const history = pgTable(
  'history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
    actorId: uuid('actor_id').references(() => profiles.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow()
  },
  (table) => ({
    ticketIdIdx: index('history_ticket_id_idx').on(table.ticketId),
    actorIdIdx: index('history_actor_id_idx').on(table.actorId),
    createdAtIdx: index('history_created_at_idx').on(table.createdAt)
  })
);
