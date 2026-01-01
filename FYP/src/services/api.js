import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  uploadResume: (formData) => api.post('/auth/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMe: () => api.get('/auth/me'),
};

export const companyAPI = {
  create: (data) => api.post('/companies', data),
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const topicAPI = {
  create: (data) => api.post('/topics', data),
  getByCompany: (companyId) => api.get(`/topics/company/${companyId}`),
  getById: (id) => api.get(`/topics/${id}`),
  delete: (id) => api.delete(`/topics/${id}`),
};

export const fileAPI = {
  upload: (formData) => api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByTopic: (topicId) => api.get(`/files/topic/${topicId}`),
  delete: (id) => api.delete(`/files/${id}`),
};

export const assessmentAPI = {
  create: (data) => api.post('/assessments', data),
  getAll: () => api.get('/assessments'),
  getAllAdmin: () => api.get('/assessments/admin/all'),
  getById: (id) => api.get(`/assessments/${id}`),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
  start: (id) => api.post(`/assessments/${id}/start`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getMyAttempts: () => api.get('/assessments/attempts/my-attempts'),
  getAttempt: (id) => api.get(`/assessments/attempts/${id}`),
  parsePDF: (formData) => api.post('/question-parser/parse-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createFromPDF: (data) => api.post('/question-parser/create-assessment-from-pdf', data),
};


export default api;
