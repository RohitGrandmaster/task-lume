/**
 * RESPONSIBILITY: Canonical Zod validation schema for calendar schedule queries and event dates (≤150 lines).
 * FLOW: Validates ISO date formats and agenda query filters.
 */

import { z } from 'zod';

export const UserCalendarQuerySchema = z.object({
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD date'),
  viewMode: z.enum(['month', 'week', 'agenda']).default('month'),
});

export type UserCalendarQueryValues = z.infer<typeof UserCalendarQuerySchema>;
