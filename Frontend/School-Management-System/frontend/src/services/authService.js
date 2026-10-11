import api from './api';

export const authService = {
  login: async (username, password, expectedRole = null) => {
    const payload = { username, password };
    if (expectedRole) {
      payload.expectedRole = expectedRole;
    }
    const response = await api.post('/api/auth/login', payload);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('sms_user');
    }
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
};

export default authService;
