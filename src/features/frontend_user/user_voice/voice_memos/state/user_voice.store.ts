/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_voice UI state (≤180 lines).
 * FLOW: Manages active recording status, playback memo ID, and audio search query.
 */

import { create } from 'zustand';

export interface UserVoiceState {
  isRecording: boolean;
  activePlayingId: string | null;
  searchQuery: string;
  activeFilter: 'all' | 'today' | 'week';
  setIsRecording: (recording: boolean) => void;
  setActivePlayingId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'today' | 'week') => void;
}

export const useUserVoiceStore = create<UserVoiceState>((set) => ({
  isRecording: false,
  activePlayingId: null,
  searchQuery: '',
  activeFilter: 'all',

  setIsRecording: (isRecording) => set({ isRecording }),
  setActivePlayingId: (activePlayingId) => set({ activePlayingId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
}));
