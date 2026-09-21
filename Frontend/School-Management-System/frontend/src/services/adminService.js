import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get('/api/admin/students');
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/api/admin/students/${studentId}`);
    return response.data;
  },

  getStudentCourses: async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/courses`);
    return response.data;
  },

  enrollStudent: async (studentId, courseId) => {
    const response = await api.post(`/api/admin/students/${studentId}/courses`, { courseId });
    return response.data;
  },

  removeStudentCourse: async (studentId, courseId) => {
    const response = await api.delete(`/api/admin/students/${studentId}/courses/${courseId}`);
    return response.data;
  },

  getTeachers: async () => {
    const response = await api.get('/api/admin/teachers');
    return response.data;
  },

  deleteTeacher: async (teacherId) => {
    const response = await api.delete(`/api/admin/teachers/${teacherId}`);
    return response.data;
  },

  getCourses: async () => {
    const response = await api.get('/api/admin/courses');
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/api/admin/courses', courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/api/admin/courses/${courseId}`);
    return response.data;
  },

  getCourseStudents: async (courseId) => {
    const response = await api.get(`/api/admin/courses/${courseId}/students`);
    return response.data;
  },

  addStudentToCourse: async (courseId, studentId) => {
    const response = await api.post(`/api/admin/courses/${courseId}/students`, { studentId });
    return response.data;
  },

  removeStudentFromCourse: async (courseId, studentId) => {
    const response = await api.delete(`/api/admin/courses/${courseId}/students/${studentId}`);
    return response.data;
  },
};

export default adminService;
