/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_calendar UI state (≤180 lines).
 * FLOW: Manages active selected date, monthly view mode, and agenda filter.
 */

import { create } from 'zustand';

export interface UserCalendarState {
  selectedDate: string;
  viewMode: 'month' | 'week' | 'agenda';
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'month' | 'week' | 'agenda') => void;
  goToToday: () => void;
}

export const useUserCalendarStore = create<UserCalendarState>((set) => ({
  selectedDate: new Date().toISOString().slice(0, 10),
  viewMode: 'month',

  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setViewMode: (viewMode) => set({ viewMode }),
  goToToday: () => set({ selectedDate: new Date().toISOString().slice(0, 10) }),
}));
