import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'recipe' | 'profile';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SyncState {
  queue: SyncAction[];
  addToQueue: (action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  getQueue: () => SyncAction[];
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      
      addToQueue: (action) => set((state) => ({
        queue: [...state.queue, {
          ...action,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          retryCount: 0
        }]
      })),

      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter(item => item.id !== id)
      })),

      clearQueue: () => set({ queue: [] }),

      getQueue: () => get().queue,
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
