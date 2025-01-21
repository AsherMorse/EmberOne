import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums.js';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').unique().notNull(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
