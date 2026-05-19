import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '../contexts/GoalsContext';

interface GoalState {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [],
      setGoals: (goals) => set({ goals }),
    }),
    {
      name: 'bytebank-goals',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.goals = state.goals.map(g => ({
            ...g,
            createdAt: new Date(g.createdAt)
          }));
        }
      }
    }
  )
);
