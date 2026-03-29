import api, { handleApiError } from './api';
import { useDietStore, DietRecord, FoodItem } from '../stores/dietStore';
import { useNutritionStore } from '../stores/nutritionStore';

export interface FoodItemInput {
  food_id: number;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface CreateRecordRequest {
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItemInput[];
  notes?: string;
}

export interface UpdateRecordRequest {
  date?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods?: FoodItemInput[];
  notes?: string;
}

export interface DietRecordResponse {
  id: number;
  user_id: number;
  date: string;
  meal_type: string;
  foods: FoodItemInput[];
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  notes?: string;
  created_at: string;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  calorie_goal?: number;
  records: DietRecordResponse[];
}

export interface HistorySummary {
  daily_summaries: Array<{
    date: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }>;
  calorie_goal: number;
}

const mapToDietRecord = (data: DietRecordResponse): DietRecord => ({
  id: String(data.id),
  date: data.date.split('T')[0],
  mealType: data.meal_type as DietRecord['mealType'],
  foods: data.foods.map(f => ({
    id: String(f.food_id),
    name: f.name,
    amount: f.amount,
    unit: f.unit,
    calories: f.calories,
    protein: f.protein,
    carbohydrates: f.carbs,
    fat: f.fat,
  })),
  totalCalories: data.total_calories,
  totalProtein: data.total_protein,
  totalCarbohydrates: data.total_carbs,
  totalFat: data.total_fat,
  notes: data.notes,
  createdAt: data.created_at,
  updatedAt: data.created_at,
});

export const recordService = {
  async getTodayRecords(): Promise<DailyNutritionSummary> {
    try {
      const response = await api.get<DailyNutritionSummary>('/records/today');
      
      const records = response.data.records.map(mapToDietRecord);
      useDietStore.getState().setTodayRecords(records);
      
      useNutritionStore.getState().updateNutrition({
        calories: response.data.total_calories,
        protein: response.data.total_protein,
        fat: response.data.total_fat,
        carbohydrates: response.data.total_carbs,
      });
      
      if (response.data.calorie_goal) {
        useNutritionStore.getState().setCalorieTarget(response.data.calorie_goal);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getRecordsByDate(date: string): Promise<DailyNutritionSummary> {
    try {
      const response = await api.get<DailyNutritionSummary>(`/records/date/${date}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addRecord(data: CreateRecordRequest): Promise<DietRecord> {
    try {
      const response = await api.post<DietRecordResponse>('/records', data);
      const record = mapToDietRecord(response.data);
      
      useDietStore.getState().addRecord(record);
      
      const nutrition = useNutritionStore.getState();
      nutrition.updateNutrition({
        calories: nutrition.todayNutrition.calories + record.totalCalories,
        protein: nutrition.todayNutrition.protein + record.totalProtein,
        fat: nutrition.todayNutrition.fat + record.totalFat,
        carbohydrates: nutrition.todayNutrition.carbohydrates + record.totalCarbohydrates,
      });
      
      return record;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateRecord(recordId: number, data: UpdateRecordRequest): Promise<DietRecord> {
    try {
      const response = await api.put<DietRecordResponse>(`/records/${recordId}`, data);
      const record = mapToDietRecord(response.data);
      
      useDietStore.getState().updateRecord(String(recordId), record);
      
      return record;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteRecord(recordId: number): Promise<void> {
    try {
      await api.delete(`/records/${recordId}`);
      useDietStore.getState().deleteRecord(String(recordId));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getHistorySummary(days: number = 7): Promise<HistorySummary> {
    try {
      const response = await api.get<HistorySummary>(`/records/history/summary?days=${days}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default recordService;
