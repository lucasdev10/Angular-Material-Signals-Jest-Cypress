/**
 * Modelo padrão para respostas de API
 */
export interface IApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * Modelo para respostas paginadas
 */
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Modelo para erros de API
 */
export interface IApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
