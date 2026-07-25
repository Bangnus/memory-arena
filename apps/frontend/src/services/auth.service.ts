import { api } from './api';

export interface LineLoginRequest {
  code: string;
  redirectUri: string;
}

export interface AuthResponse {
  token: string;
  player: {
    id: string;
    lineId: string;
    displayName: string;
    pictureUrl: string | null;
  };
}

export const authService = {
  loginWithLine: async (data: LineLoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/line', data);
    return response.data.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
