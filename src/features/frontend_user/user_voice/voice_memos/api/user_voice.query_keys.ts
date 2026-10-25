/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_voice domain.
 * FLOW: Consumed by voice memos list and speech-to-text transcript processing.
 */

export const USER_VOICE_QUERY_KEYS = {
  all: ['user_voice'] as const,
  memos: () => [...USER_VOICE_QUERY_KEYS.all, 'memos'] as const,
  memo: (id: string) => [...USER_VOICE_QUERY_KEYS.all, 'memo', id] as const,
  transcriptions: () => [...USER_VOICE_QUERY_KEYS.all, 'transcriptions'] as const,
} as const;
