import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Food {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  imageUrl?: string;
  barcode?: string;
}

interface FoodState {
  searchResults: Food[];
  recentFoods: Food[];
  favoriteFoods: Food[];
  setSearchResults: (results: Food[]) => void;
  addRecent: (food: Food) => void;
  removeRecent: (foodId: string) => void;
  toggleFavorite: (food: Food) => void;
  isFavorite: (foodId: string) => boolean;
  clearSearchResults: () => void;
}

const MAX_RECENT_FOODS = 20;

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      searchResults: [],
      recentFoods: [],
      favoriteFoods: [],

      setSearchResults: (results) => set({ searchResults: results }),

      addRecent: (food) =>
        set((state) => {
          const filteredRecent = state.recentFoods.filter(
            (f) => f.id !== food.id
          );
          const newRecentFoods = [food, ...filteredRecent].slice(
            0,
            MAX_RECENT_FOODS
          );
          return { recentFoods: newRecentFoods };
        }),

      removeRecent: (foodId) =>
        set((state) => ({
          recentFoods: state.recentFoods.filter((f) => f.id !== foodId),
        })),

      toggleFavorite: (food) =>
        set((state) => {
          const isAlreadyFavorite = state.favoriteFoods.some(
            (f) => f.id === food.id
          );

          if (isAlreadyFavorite) {
            return {
              favoriteFoods: state.favoriteFoods.filter((f) => f.id !== food.id),
            };
          }

          return {
            favoriteFoods: [...state.favoriteFoods, food],
          };
        }),

      isFavorite: (foodId) => {
        const { favoriteFoods } = get();
        return favoriteFoods.some((f) => f.id === foodId);
      },

      clearSearchResults: () => set({ searchResults: [] }),
    }),
    {
      name: 'food-storage',
      partialize: (state) => ({
        recentFoods: state.recentFoods,
        favoriteFoods: state.favoriteFoods,
      }),
    }
  )
);
