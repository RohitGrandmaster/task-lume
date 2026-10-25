/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_reminders UI state (≤180 lines).
 * FLOW: Manages active reminder filters (all, overdue, today, upcoming) and snooze sheet state.
 */

import { create } from 'zustand';

export interface UserRemindersState {
  filterScope: 'all' | 'overdue' | 'today' | 'upcoming';
  searchQuery: string;
  activeSnoozeId: string | null;
  setFilterScope: (scope: 'all' | 'overdue' | 'today' | 'upcoming') => void;
  setSearchQuery: (query: string) => void;
  setActiveSnoozeId: (id: string | null) => void;
}

export const useUserRemindersStore = create<UserRemindersState>((set) => ({
  filterScope: 'all',
  searchQuery: '',
  activeSnoozeId: null,

  setFilterScope: (filterScope) => set({ filterScope }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveSnoozeId: (activeSnoozeId) => set({ activeSnoozeId }),
}));
