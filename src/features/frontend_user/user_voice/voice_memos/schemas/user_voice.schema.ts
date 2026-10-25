/**
 * RESPONSIBILITY: Canonical Zod validation schema for voice recordings (≤150 lines).
 * FLOW: Validates voice note metadata, duration bounds, and rename actions.
 */

import { z } from 'zod';

export const UserVoiceMemoSchema = z.object({
  title: z.string().min(1, 'Title cannot be blank').max(100),
  durationMs: z.number().nonnegative(),
  filePath: z.string().min(1, 'Audio file path required'),
});

export type UserVoiceMemoValues = z.infer<typeof UserVoiceMemoSchema>;
