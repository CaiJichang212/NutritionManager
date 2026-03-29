import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  username: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal_type?: 'lose_weight' | 'maintain' | 'gain_weight' | 'muscle_gain';
  target_weight?: number;
  health_conditions?: string[];
  allergies?: string[];
  bmr?: number;
  tdee?: number;
  daily_calorie_goal?: number;
  protein_goal?: number;
  fat_goal?: number;
  carbs_goal?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
