import { EventEmitter } from 'events';

/** Event emitter for broadcasting entry updates */
export const emitter = new EventEmitter();

/** Event name for new entries */
export const NEW_ENTRY_EVENT = 'new-entry';
