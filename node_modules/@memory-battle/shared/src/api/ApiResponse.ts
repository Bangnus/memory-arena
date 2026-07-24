export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IApiErrorResponse {
  success: false;
  message: string;
  error: string;
}
