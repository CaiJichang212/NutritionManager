export { default as api, handleApiError, isApiError } from './api';
export type { ApiError, ApiResponse } from './api';

export { authService } from './authService';
export type { 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest, 
  UserResponse,
  NutritionCalculation 
} from './authService';

export { foodService } from './foodService';
export type { 
  FoodSearchResult, 
  FoodDetail 
} from './foodService';

export { recordService } from './recordService';
export type { 
  CreateRecordRequest, 
  UpdateRecordRequest, 
  DietRecordResponse,
  DailyNutritionSummary,
  HistorySummary,
  FoodItemInput
} from './recordService';

export { aiService } from './aiService';
export type { 
  AIChatRequest, 
  AIChatResponse 
} from './aiService';
