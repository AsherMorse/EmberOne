import type { Entry } from './database';

/** Base message structure for SSE events */
export interface BaseSSEMessage<T extends string, D = unknown> {
  type: T;
  data: D;
}

/** Message sent when SSE connection is established */
export type ConnectedMessage = BaseSSEMessage<'connected', undefined>;

/** Message sent when a new entry is created */
export type EntryMessage = BaseSSEMessage<'entry', Pick<Entry, 'id' | 'content' | 'created_at'>>;

/** Union of all SSE message types */
export type SSEMessage = ConnectedMessage | EntryMessage;
// Add future message types here

/** SSE event name constants */
export const SSE_EVENTS = {
  CONNECTED: 'connected',
  ENTRY: 'entry',
  // Add future event names here
} as const;

/** Type for SSE event names */
export type SSEEventType = (typeof SSE_EVENTS)[keyof typeof SSE_EVENTS];
