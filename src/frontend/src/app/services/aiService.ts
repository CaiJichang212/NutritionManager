import api, { handleApiError } from './api';
import { useNutritionStore } from '../stores/nutritionStore';
import { useAuthStore } from '../stores/authStore';

export interface AIChatRequest {
  message: string;
  context?: Record<string, unknown>;
}

export interface AIChatResponse {
  response: string;
  model_used: string;
}

export const aiService = {
  async chat(message: string, additionalContext?: Record<string, unknown>): Promise<AIChatResponse> {
    try {
      const nutritionStore = useNutritionStore.getState();
      const authStore = useAuthStore.getState();
      
      const context: Record<string, unknown> = {
        today_intake: nutritionStore.todayNutrition.calories,
        today_protein: nutritionStore.todayNutrition.protein,
        today_fat: nutritionStore.todayNutrition.fat,
        today_carbs: nutritionStore.todayNutrition.carbohydrates,
        calorie_goal: nutritionStore.calorieTarget,
        ...additionalContext,
      };
      
      if (authStore.user) {
        context.user_id = authStore.user.id;
      }
      
      const response = await api.post<AIChatResponse>('/ai/chat', {
        message,
        context,
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default aiService;
