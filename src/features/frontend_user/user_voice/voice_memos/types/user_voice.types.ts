/**
 * RESPONSIBILITY: Canonical TypeScript definitions for the user_voice domain and voice_memos sub-module.
 * FLOW: Consumed by schemas, components, hooks, stores, and screens within this autonomous feature sub-module.
 */

export type VoiceRecordingStatus = 'idle' | 'recording' | 'paused' | 'transcribing' | 'completed' | 'error';

export interface VoiceMemoEntity {
  id: string;
  title: string;
  transcript: string;
  audioPath?: string;
  durationMs: number;
  createdAt: number;
  category?: string;
  isFavorite?: boolean;
}

export interface VoiceFilterOptions {
  searchQuery: string;
  categoryFilter?: string | null;
}
