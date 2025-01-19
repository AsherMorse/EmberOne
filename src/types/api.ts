import { type z } from 'zod';

import {
  type createEntrySchema,
  type getUserEntriesSchema,
  type getRecentEntriesSchema,
} from '@/server/schemas/entry';

/** Type for validated create entry input */
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

/** Type for validated get user entries input */
export type GetUserEntriesInput = z.infer<typeof getUserEntriesSchema>;

/** Type for validated get recent entries input */
export type GetRecentEntriesInput = z.infer<typeof getRecentEntriesSchema>;
