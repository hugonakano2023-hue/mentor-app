import { create } from 'zustand';
import type { MentorMode } from '@/types';

interface AppState {
  currentDate: Date;
  selectedDate: Date;
  sidebarOpen: boolean;
  mentorMode: MentorMode;

  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMentorMode: (mode: MentorMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentDate: new Date(),
  selectedDate: new Date(),
  sidebarOpen: true,
  mentorMode: 'planner',

  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMentorMode: (mode) => set({ mentorMode: mode }),
}));
