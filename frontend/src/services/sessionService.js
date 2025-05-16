import apiClient from './apiClient';

export const SessionService = {
  start: async ({ classroom, subject }) => {
    const res = await apiClient.post('/session/start', { classroom, subject });
    return res.data;
  },

  terminate: async (sessionId) => {
    const res = await apiClient.patch(`/session/terminate/${sessionId}`);
    return res.data;
  },

  getActive: async () => {
    const res = await apiClient.get('/session/active');
    return res.data;
  }
};
