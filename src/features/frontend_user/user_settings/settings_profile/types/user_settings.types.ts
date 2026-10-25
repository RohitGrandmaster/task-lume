/**
 * RESPONSIBILITY: Canonical TypeScript definitions for the user_settings domain and settings_profile sub-module.
 * FLOW: Consumed by schemas, components, hooks, stores, and screens within this autonomous feature sub-module.
 */

export interface UserProfileEntity {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
  phone?: string;
  createdAt?: string | number;
}

export interface UserPreferencesEntity {
  isDarkMode: boolean;
  accentColor: string;
  hapticFeedbackEnabled: boolean;
  pushNotificationsEnabled: boolean;
  taskRemindersEnabled: boolean;
  biometricLockEnabled: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
}

export interface FaqItemEntity {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FeedbackSubmissionEntity {
  feedbackType: 'bug' | 'feature' | 'general' | 'praise';
  message: string;
  userEmail?: string;
  timestamp: number;
}

export interface AppReleaseInfoEntity {
  version: string;
  buildNumber: string;
  buildDate: string;
  developerName: string;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}
