import apiClient from './apiClient';

export const UserService = {
  getClassrooms: async () => {
    const res = await apiClient.get('/get-classrooms');
    return res.data.data || []; // return array directly
  },

  getSubjects: async () => {
    const res = await apiClient.get('/get-subjects');
    return res.data.data || [];
  },

  getProfile: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  }
};
