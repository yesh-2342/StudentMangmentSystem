import api from './api';

export const teacherService = {
  getDashboard: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/dashboard`);
    return response.data;
  },

  getCourses: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/courses`);
    return response.data;
  },

  getCourseDetails: async (teacherId, courseId) => {
    const response = await api.get(`/api/teachers/${teacherId}/courses/${courseId}`);
    return response.data;
  },

  addAssignment: async (teacherId, courseId, assignmentData) => {
    const response = await api.post(`/api/teachers/${teacherId}/courses/${courseId}/assignments`, assignmentData);
    return response.data;
  },

  deleteAssignment: async (teacherId, courseId, assignmentId) => {
    const response = await api.delete(`/api/teachers/${teacherId}/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  },

  getAssignmentStatus: async (teacherId, courseId, assignmentId) => {
    const response = await api.get(`/api/teachers/${teacherId}/courses/${courseId}/assignments/${assignmentId}/status`);
    return response.data;
  },

  modifyGrades: async (teacherId, courseId, gradeDetailsId, grades) => {
    const response = await api.post(`/api/teachers/${teacherId}/courses/${courseId}/editGrades/save/${gradeDetailsId}`, grades);
    return response.data;
  },

  getStudents: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/students`);
    return response.data;
  },
};

export default teacherService;
