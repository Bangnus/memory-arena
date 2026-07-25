export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface IJwtPayload {
  sub: string;
  lineUserId: string;
  displayName: string;
}
