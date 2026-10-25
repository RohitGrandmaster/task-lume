/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_overview UI state (≤180 lines).
 * FLOW: Manages active analytics timeframe, metric card expansion, and focus display mode.
 */

import { create } from 'zustand';

export interface UserOverviewState {
  timeframe: '7d' | '30d' | '1y' | 'all';
  selectedMetricId: string | null;
  setTimeframe: (timeframe: '7d' | '30d' | '1y' | 'all') => void;
  setSelectedMetricId: (id: string | null) => void;
}

export const useUserOverviewStore = create<UserOverviewState>((set) => ({
  timeframe: '7d',
  selectedMetricId: null,

  setTimeframe: (timeframe) => set({ timeframe }),
  setSelectedMetricId: (selectedMetricId) => set({ selectedMetricId }),
}));
