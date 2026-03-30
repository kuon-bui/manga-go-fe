import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';

interface ExampleState {
  // State
  count: number;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (_count: number) => void;
  setUser: (_user: User | null) => void;
  setLoading: (_isLoading: boolean) => void;
  setError: (_error: string | null) => void;
}

const initialState = {
  count: 0,
  user: null,
  isLoading: false,
  error: null,
};

export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),

        decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement'),

        reset: () => set({ count: 0 }, false, 'reset'),

        setCount: (count: number) => set({ count }, false, 'setCount'),

        setUser: (user: User | null) => set({ user }, false, 'setUser'),

        setLoading: (isLoading: boolean) => set({ isLoading }, false, 'setLoading'),

        setError: (error: string | null) => set({ error }, false, 'setError'),
      }),
      {
        name: 'example-store',
        // Only persist specific fields
        partialize: (state) => ({ count: state.count, user: state.user }),
      }
    ),
    {
      name: 'ExampleStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
