import { pgEnum } from 'drizzle-orm/pg-core';

// Role Types
export const roleEnum = pgEnum('role', ['ADMIN', 'AGENT', 'CUSTOMER']);

// Ticket Status
export const ticketStatusEnum = pgEnum('ticket_status', ['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']);

// Priority Levels
export const priorityEnum = pgEnum('priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

// Comment Types
export const commentTypeEnum = pgEnum('comment_type', ['USER', 'SYSTEM', 'INTERNAL']); 