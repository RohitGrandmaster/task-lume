/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_voice domain.
 * FLOW: Consumed by navigation and speech-to-text recording handlers.
 */

export const USER_VOICE_ROUTES = {
  MEMOS: 'UserVoiceMemos',
} as const;

export const USER_VOICE_ENDPOINTS = {
  MEMOS: '/api/v1/user/voice/memos',
} as const;
