import api, { handleApiError } from './api';
import { Food, useFoodStore } from '../stores/foodStore';

export interface FoodSearchResult {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  calories: number;
  protein: number;
  health_score: number;
}

export interface FoodDetail {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  barcode?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
  health_score: number;
  nova_class: number;
  ingredients: string[];
  allergens: string[];
  serving_size: number;
  serving_unit: string;
}

const mapToFood = (data: FoodDetail): Food => ({
  id: String(data.id),
  name: data.name,
  brand: data.brand,
  servingSize: data.serving_size,
  servingUnit: data.serving_unit,
  calories: data.calories,
  protein: data.protein,
  carbohydrates: data.carbs,
  fat: data.fat,
  fiber: data.fiber,
  sodium: data.sodium,
  sugar: data.sugar,
  barcode: data.barcode,
});

export const foodService = {
  async searchFoods(query: string, category?: string, limit: number = 20): Promise<FoodSearchResult[]> {
    try {
      const params = new URLSearchParams({ q: query, limit: String(limit) });
      if (category) params.append('category', category);
      
      const response = await api.get<FoodSearchResult[]>(`/foods/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getFoodDetail(foodId: number): Promise<FoodDetail> {
    try {
      const response = await api.get<FoodDetail>(`/foods/${foodId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getFoodByBarcode(barcode: string): Promise<FoodDetail> {
    try {
      const response = await api.get<FoodDetail>(`/foods/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/foods/categories/list');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getPopularFoods(limit: number = 10): Promise<FoodSearchResult[]> {
    try {
      const response = await api.get<FoodSearchResult[]>(`/foods/popular/list?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addToRecent(food: Food): void {
    useFoodStore.getState().addRecent(food);
  },

  toggleFavorite(food: Food): void {
    useFoodStore.getState().toggleFavorite(food);
  },

  isFavorite(foodId: string): boolean {
    return useFoodStore.getState().isFavorite(foodId);
  },
};

export default foodService;
