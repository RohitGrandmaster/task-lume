/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_todos UI state (≤180 lines).
 * FLOW: Manages active category filter, search query, selected view mode, and batch selection.
 */

import { create } from 'zustand';

export interface UserTodosState {
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  activeFilter: 'all' | 'active' | 'completed';
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedPriority: (priority: string) => void;
  setActiveFilter: (filter: 'all' | 'active' | 'completed') => void;
  resetFilters: () => void;
}

export const useUserTodosStore = create<UserTodosState>((set) => ({
  searchQuery: '',
  selectedCategory: 'all',
  selectedPriority: 'all',
  activeFilter: 'all',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedPriority: (selectedPriority) => set({ selectedPriority }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'all',
      selectedPriority: 'all',
      activeFilter: 'all',
    }),
}));
