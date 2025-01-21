import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { commentTypeEnum } from './enums.js';
import { tickets } from './tickets.js';
import { profiles } from './profiles.js';
import { index } from 'drizzle-orm/pg-core';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => profiles.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    type: commentTypeEnum('type').notNull().default('USER'),
    isInternal: boolean('is_internal').notNull().default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => ({
    ticketIdIdx: index('comment_ticket_id_idx').on(table.ticketId),
    authorIdIdx: index('comment_author_id_idx').on(table.authorId),
    createdAtIdx: index('comment_created_at_idx').on(table.createdAt)
  })
);
