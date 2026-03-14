/**
 * Global API response interfaces.
 * Every API response must have a corresponding TypeScript interface here.
 * Properties use snake_case to match the backend 1:1.
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
