import api from './api';

export const interventionService = {
  getInterventions: async () => {
    const response = await api.get('/api/interventions');
    return response.data;
  },

  createIntervention: async (payload) => {
    const response = await api.post('/api/interventions', payload);
    return response.data;
  },

  updateIntervention: async (id, payload) => {
    const response = await api.put(`/api/interventions/${id}`, payload);
    return response.data;
  },
};

export default interventionService;
