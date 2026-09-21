import api from './api';

export const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/api/courses');
    return response.data;
  },

  getCourseById: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}`);
    return response.data;
  },
};

export default courseService;
