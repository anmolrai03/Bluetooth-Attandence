import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth token interceptor
api.interceptors.request.use((config) => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post("api/auth/login", { email, password }),
  signup: (data) => api.post("api/auth/signup", data),
};

export const sessionService = {
  startSession: (data) => api.post("api/session/start", data),
  getSessions: () => api.get("api/session"),
  getSessionById: (id) => api.get(`api/session/${id}`),
};

export const attendanceService = {
  markAttendance: (data) => api.post("api/attendance/mark", data),
  getAttendance: (sessionId) => api.get(`api/attendance/${sessionId}`),
};

export default api;