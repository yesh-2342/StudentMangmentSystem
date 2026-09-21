import api from './api';

export const studentService = {
  getDashboard: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/dashboard`);
    return response.data;
  },

  getCourses: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/courses`);
    return response.data;
  },

  getCourseDetails: async (studentId, courseId) => {
    const response = await api.get(`/api/students/${studentId}/courses/${courseId}`);
    return response.data;
  },

  getAssignments: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/assignments`);
    return response.data;
  },

  getAssignmentDetails: async (studentId, courseId, assignmentId) => {
    const response = await api.get(`/api/students/${studentId}/courses/${courseId}/assignment/${assignmentId}`);
    return response.data;
  },

  markAssignmentCompleted: async (studentId, courseId, assignmentId) => {
    const response = await api.post(`/api/students/${studentId}/courses/${courseId}/markAsCompleted/${assignmentId}`);
    return response.data;
  },

  getGrades: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/grades`);
    return response.data;
  },

  getProfile: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/profile`);
    return response.data;
  },
};

export default studentService;
