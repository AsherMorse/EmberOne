import { pgTable, uuid, text, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { ticketStatusEnum, priorityEnum } from './enums.js';
import { profiles } from './profiles.js';

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('OPEN'),
    priority: priorityEnum('priority').notNull().default('MEDIUM'),
    customerId: uuid('customer_id').notNull().references(() => profiles.id),
    assignedAgentId: uuid('assigned_agent_id').references(() => profiles.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    closedAt: timestamp('closed_at'),
    feedbackRating: integer('feedback_rating'),
    feedbackText: text('feedback_text')
  },
  (table) => ({
    customerIdIdx: index('ticket_customer_id_idx').on(table.customerId),
    agentIdIdx: index('ticket_agent_id_idx').on(table.assignedAgentId),
    statusIdx: index('ticket_status_idx').on(table.status),
    priorityIdx: index('ticket_priority_idx').on(table.priority)
  })
);
