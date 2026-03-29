import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || '请求失败',
      status: error.response?.status || 500,
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);

export const handleApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }
  return {
    message: '未知错误',
    status: 500,
  };
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
};

export default api;
