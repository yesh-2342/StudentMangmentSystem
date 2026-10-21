import api from './api';

export const chatbotService = {
  sendMessage: async (message, sessionId = null) => {
    const response = await api.post('/api/chat/message', {
      message,
      sessionId,
    });
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/api/chat/suggestions');
    return response.data;
  },

  getHistory: async (sessionId) => {
    const params = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const response = await api.get(`/api/chat/history${params}`);
    return response.data;
  },

  resetSession: async (sessionId = null) => {
    const response = await api.post('/api/chat/reset', { sessionId });
    return response.data;
  },
};

export default chatbotService;
