/**
 * RESPONSIBILITY: Canonical Zod validation schema for user_overview filters (≤150 lines).
 * FLOW: Validates timeframe query parameters and KPI filter selections.
 */

import { z } from 'zod';

export const UserOverviewFilterSchema = z.object({
  timeframe: z.enum(['7d', '30d', '1y', 'all']).default('7d'),
  category: z.string().optional(),
});

export type UserOverviewFilterValues = z.infer<typeof UserOverviewFilterSchema>;
