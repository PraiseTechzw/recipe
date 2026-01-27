import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Timer {
  id: string;
  stepIndex: number;
  duration: number; // seconds
  remaining: number; // seconds
  status: 'idle' | 'running' | 'paused' | 'completed';
}

interface CookingState {
  activeRecipeId: string | null;
  currentStepIndex: number;
  timers: Record<string, Timer>; // Keyed by timer ID or step index

  startCooking: (recipeId: string) => void;
  stopCooking: () => void;
  setStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Timer logic
  addTimer: (stepIndex: number, duration: number) => void;
  updateTimer: (timerId: string, remaining: number) => void;
  startTimer: (timerId: string) => void;
  pauseTimer: (timerId: string) => void;
  resetTimer: (timerId: string) => void;
}

export const useCookingStore = create<CookingState>()(
  persist(
    (set, get) => ({
      activeRecipeId: null,
      currentStepIndex: 0,
      timers: {},

      startCooking: (recipeId) => set({ 
        activeRecipeId: recipeId, 
        currentStepIndex: 0, 
        timers: {} 
      }),
      
      stopCooking: () => set({ 
        activeRecipeId: null, 
        currentStepIndex: 0, 
        timers: {} 
      }),

      setStep: (index) => set({ currentStepIndex: index }),
      
      nextStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
      
      prevStep: () => set((state) => ({ 
        currentStepIndex: Math.max(0, state.currentStepIndex - 1) 
      })),

      addTimer: (stepIndex, duration) => set((state) => {
        const id = `timer_${stepIndex}_${Date.now()}`;
        return {
          timers: {
            ...state.timers,
            [id]: {
              id,
              stepIndex,
              duration,
              remaining: duration,
              status: 'idle'
            }
          }
        };
      }),

      updateTimer: (timerId, remaining) => set((state) => {
        const timer = state.timers[timerId];
        if (!timer) return state;
        return {
          timers: {
            ...state.timers,
            [timerId]: {
              ...timer,
              remaining,
              status: remaining <= 0 ? 'completed' : timer.status
            }
          }
        };
      }),

      startTimer: (timerId) => set((state) => {
        const timer = state.timers[timerId];
        if (!timer) return state;
        return {
          timers: {
            ...state.timers,
            [timerId]: { ...timer, status: 'running' }
          }
        };
      }),

      pauseTimer: (timerId) => set((state) => {
        const timer = state.timers[timerId];
        if (!timer) return state;
        return {
          timers: {
            ...state.timers,
            [timerId]: { ...timer, status: 'paused' }
          }
        };
      }),

      resetTimer: (timerId) => set((state) => {
        const timer = state.timers[timerId];
        if (!timer) return state;
        return {
          timers: {
            ...state.timers,
            [timerId]: { ...timer, remaining: timer.duration, status: 'idle' }
          }
        };
      }),
    }),
    {
      name: 'cooking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
