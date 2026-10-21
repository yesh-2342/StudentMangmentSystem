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

  getFacultyMembers: async () => {
    try {
      const response = await api.get('/api/academic/faculty-members');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      try {
        const fallback = await api.get('/api/v1/faculty/available-for-consultation');
        return Array.isArray(fallback.data) ? fallback.data : [];
      } catch {
        return [];
      }
    }
  },

  createConsultation: async (payload) => {
    const response = await api.post('/api/academic/consultations', payload);
    return response.data;
  },

  bookConsultation: async (payload) => {
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

  // Smart Academic To-Do List
  getTodos: async () => {
    const response = await api.get('/api/academic/todos');
    return response.data;
  },

  createTodo: async (payload) => {
    const response = await api.post('/api/academic/todos', payload);
    return response.data;
  },

  toggleTodo: async (id) => {
    const response = await api.put(`/api/academic/todos/${id}/toggle`);
    return response.data;
  },

  deleteTodo: async (id) => {
    const response = await api.delete(`/api/academic/todos/${id}`);
    return response.data;
  },

  // Attendance Recovery Calculator
  getAttendanceRecovery: async (targetPercentage = 75, studentId = null) => {
    const params = new URLSearchParams();
    if (targetPercentage) params.append('targetPercentage', targetPercentage);
    if (studentId) params.append('studentId', studentId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/academic/attendance/recovery${queryString}`);
    return response.data;
  },

  // Personalized Study Planner
  getStudyPlan: async () => {
    const response = await api.get('/api/academic/study-plan');
    return response.data;
  },

  generateStudyPlan: async (payload = {}) => {
    const response = await api.post('/api/academic/study-plan', payload);
    return response.data;
  },

  // Course Resource Bookmarking
  toggleBookmarkResource: async (resourceId) => {
    const response = await api.post(`/api/academic/resources/${resourceId}/bookmark`);
    return response.data;
  },

  getBookmarkedResources: async () => {
    const response = await api.get('/api/academic/resources/bookmarks');
    return response.data;
  },

  // Doubt & Clarification Requests
  getDoubts: async (courseId = null) => {
    const params = courseId ? `?courseId=${courseId}` : '';
    const response = await api.get(`/api/academic/doubts${params}`);
    return response.data;
  },

  createDoubt: async (payload) => {
    const response = await api.post('/api/academic/doubts', payload);
    return response.data;
  },

  replyDoubt: async (id, payload) => {
    const response = await api.put(`/api/academic/doubts/${id}/reply`, payload);
    return response.data;
  },

  // Teacher Class Health Dashboard
  getClassHealth: async () => {
    const response = await api.get('/api/academic/class-health');
    return response.data;
  },

  // Bulk Attendance & Marks Entry
  saveBulkMarks: async (payload) => {
    const response = await api.post('/api/academic/bulk-marks', payload);
    return response.data;
  },

  // Assignment Submission Tracker
  getAssignmentSubmissions: async (assignmentId) => {
    const response = await api.get(`/api/academic/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  updateAssignmentSubmission: async (assignmentId, studentId, payload) => {
    const response = await api.put(`/api/academic/assignments/${assignmentId}/submissions/${studentId}`, payload);
    return response.data;
  },

  // Student Progress Change Alerts & Notifications
  markAllNotificationsRead: async () => {
    const response = await api.put('/api/academic/notifications/read-all');
    return response.data;
  },
};

export default academicService;

