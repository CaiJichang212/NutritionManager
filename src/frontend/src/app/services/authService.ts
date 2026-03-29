import api, { handleApiError } from './api';
import { useAuthStore, User } from '../stores/authStore';

export interface LoginRequest {
  phone?: string;
  email?: string;
  password: string;
  code?: string;
}

export interface RegisterRequest {
  phone?: string;
  email?: string;
  password: string;
  nickname?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: string;
  goal_type?: string;
  target_weight?: number;
}

export interface UpdateProfileRequest {
  nickname?: string;
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
}

export interface UserResponse {
  id: number;
  phone?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: string;
  goal_type?: string;
  target_weight?: number;
  health_conditions: string[];
  allergies: string[];
  bmr?: number;
  tdee?: number;
  daily_calorie_goal?: number;
  protein_goal?: number;
  fat_goal?: number;
  carbs_goal?: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

const mapUserResponse = (data: UserResponse): User => ({
  id: String(data.id),
  phone: data.phone,
  email: data.email,
  username: data.nickname || data.phone || data.email?.split('@')[0] || '用户',
  avatar: data.avatar,
  gender: data.gender as User['gender'],
  age: data.age,
  height: data.height,
  weight: data.weight,
  activity_level: data.activity_level as User['activity_level'],
  goal_type: data.goal_type as User['goal_type'],
  target_weight: data.target_weight,
  health_conditions: data.health_conditions,
  allergies: data.allergies,
  bmr: data.bmr,
  tdee: data.tdee,
  daily_calorie_goal: data.daily_calorie_goal,
  protein_goal: data.protein_goal,
  fat_goal: data.fat_goal,
  carbs_goal: data.carbs_goal,
  createdAt: data.created_at,
  updatedAt: data.created_at,
});

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<TokenResponse>('/auth/login', data);
      const token = response.data.access_token;
      
      const userResponse = await api.get<UserResponse>('/auth/me');
      const user = mapUserResponse(userResponse.data);
      useAuthStore.getState().login(user, token);
      
      return { user, token };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<TokenResponse>('/auth/register', data);
      const token = response.data.access_token;
      
      const userResponse = await api.get<UserResponse>('/auth/me');
      const user = mapUserResponse(userResponse.data);
      useAuthStore.getState().login(user, token);
      
      return { user, token };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<UserResponse>('/auth/me');
      const user = mapUserResponse(response.data);
      useAuthStore.getState().updateUser(user);
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response = await api.put<UserResponse>('/auth/profile', data);
      const user = mapUserResponse(response.data);
      useAuthStore.getState().updateUser(user);
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async sendVerificationCode(phone: string): Promise<void> {
    try {
      await api.post('/auth/send-code', { phone });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout(): void {
    useAuthStore.getState().logout();
  },
};

export default authService;
