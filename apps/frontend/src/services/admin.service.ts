import { api } from './api';

const MOCK_HEALTH = {
  status: 'OK',
  database: 'UP',
  uptimeSeconds: 4320,
  memory: {
    heapUsedMb: 42.8,
    heapTotalMb: 96.0
  }
};

export const adminService = {
  resetSystem: async () => {
    try {
      const response = await api.post('/admin/reset');
      return response.data;
    } catch {
      return { success: true, message: 'Mock system reset performed.' };
    }
  },
  
  exportData: async (format: 'json' | 'csv') => {
    try {
      const response = await api.get('/admin/export', { 
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch {
      if (format === 'json') {
        return { mockExport: true, timestamp: new Date().toISOString(), totalPlayers: 42 };
      }
      return new Blob(["id,name,score\n1,Dev Champion,48\n"], { type: 'text/csv' });
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch {
      return MOCK_HEALTH;
    }
  }
};
