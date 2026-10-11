import api from './api';

export const academicService = {
  getOverview: async () => {
    const response = await api.get('/api/academic/overview');
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/api/academic/insights');
    return response.data;
  },

  getAtRisk: async () => {
    const response = await api.get('/api/academic/at-risk');
    return response.data;
  },

  getAvailability: async () => {
    const response = await api.get('/api/academic/availability');
    return response.data;
  },

  saveAvailability: async (payload) => {
    const response = await api.post('/api/academic/availability', payload);
    return response.data;
  },

  getConsultations: async () => {
    const response = await api.get('/api/academic/consultations');
    return response.data;
  },

  createConsultation: async (payload) => {
    const response = await api.post('/api/academic/consultations', payload);
    return response.data;
  },

  updateConsultation: async (id, payload) => {
    const response = await api.put(`/api/academic/consultations/${id}`, payload);
    return response.data;
  },

  getLibrary: async (query = '', category = '') => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/academic/library${queryString}`);
    return response.data;
  },

  saveBook: async (payload) => {
    const response = await api.post('/api/academic/library', payload);
    return response.data;
  },

  getResources: async (query = '') => {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    const response = await api.get(`/api/academic/resources${params}`);
    return response.data;
  },

  saveResource: async (payload) => {
    const response = await api.post('/api/academic/resources', payload);
    return response.data;
  },

  getAttendance: async (courseId = null) => {
    const params = courseId ? `?courseId=${courseId}` : '';
    const response = await api.get(`/api/academic/attendance${params}`);
    return response.data;
  },

  recordAttendance: async (payload) => {
    const response = await api.post('/api/academic/attendance', payload);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/api/academic/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.put(`/api/academic/notifications/${id}/read`);
    return response.data;
  },

  createAnnouncement: async (payload) => {
    const response = await api.post('/api/academic/announcements', payload);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get('/api/academic/reports');
    return response.data;
  },

  simulate: async (payload = {}) => {
    const response = await api.post('/api/academic/simulator', payload);
    return response.data;
  },

  // Deep Learning Academic Intelligence Endpoints
  getAiHealth: async () => {
    const response = await api.get('/api/ai/health');
    return response.data;
  },

  getAiModelInfo: async () => {
    const response = await api.get('/api/ai/model-info');
    return response.data;
  },

  getStudentAiPrediction: async (studentId, courseId = null) => {
    const params = courseId ? `?courseId=${courseId}` : '';
    const response = await api.get(`/api/ai/students/${studentId}/prediction${params}`);
    return response.data;
  },

  simulateAiScenario: async (studentId, payload) => {
    const response = await api.post(`/api/ai/students/${studentId}/simulate`, payload);
    return response.data;
  },

  getCourseAiPredictions: async (courseId) => {
    const response = await api.get(`/api/ai/courses/${courseId}/predictions`);
    return response.data;
  },

  getInstitutionalAiAnalytics: async () => {
    const response = await api.get('/api/ai/analytics/institutional');
    return response.data;
  },
};

export default academicService;
