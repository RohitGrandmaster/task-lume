/**
 * RESPONSIBILITY: Canonical Zod validation schema for user settings and profile edit (≤150 lines).
 * FLOW: Validates user profile fields, notification preferences, and backup payloads.
 */

import { z } from 'zod';

export const UserProfileEditSchema = z.object({
  name: z.string().trim().min(2, 'user_settings_profile.VALIDATION_NAME_MIN').max(50, 'user_settings_profile.VALIDATION_NAME_MAX'),
  email: z.string().trim().email('user_settings_profile.VALIDATION_EMAIL_INVALID'),
  phone: z.string().trim().regex(/^\+?[0-9]{10,14}$/, 'user_settings_profile.VALIDATION_PHONE_INVALID').or(z.literal('')),
});

export const UserFeedbackSubmitSchema = z.object({
  category: z.enum(['bug', 'feature', 'praise', 'other']),
  rating: z.number().min(1).max(5),
  message: z.string().min(5, 'Feedback must be at least 5 characters').max(1000),
});

export type UserProfileEditValues = z.infer<typeof UserProfileEditSchema>;
export type UserFeedbackSubmitValues = z.infer<typeof UserFeedbackSubmitSchema>;
