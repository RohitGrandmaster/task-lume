/**
 * RESPONSIBILITY: Canonical Zod validation schema for user settings and profile edit (≤150 lines).
 * FLOW: Validates user profile fields, notification preferences, and backup payloads.
 */

import { z } from 'zod';

export const UserProfileEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Please enter a valid mobile number').optional().or(z.literal('')),
});

export const UserFeedbackSubmitSchema = z.object({
  category: z.enum(['bug', 'feature', 'praise', 'other']),
  rating: z.number().min(1).max(5),
  message: z.string().min(5, 'Feedback must be at least 5 characters').max(1000),
});

export type UserProfileEditValues = z.infer<typeof UserProfileEditSchema>;
export type UserFeedbackSubmitValues = z.infer<typeof UserFeedbackSubmitSchema>;
