import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/account'),
};

// Student
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getModules: () => api.get('/student/modules'),
  getModuleContent: (moduleId, params) => api.get(`/student/modules/${moduleId}/content`, { params }),
  logActivity: (data) => api.post('/student/log', data),
  getAnnouncements: () => api.get('/student/announcements'),
  markAnnouncementRead: (id) => api.post(`/student/announcements/${id}/read`),
};

// Admin
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats/overview'),

  // Students
  getStudents: (params) => api.get('/admin/students', { params }),
  approveStudent: (id, data) => api.put(`/admin/students/${id}/approve`, data),
  updateStudentStatus: (id, data) => api.put(`/admin/students/${id}/status`, data),
  updateStudentModules: (id, data) => api.put(`/admin/students/${id}/modules`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  // Modules
  getModules: () => api.get('/admin/modules'),
  createModule: (data) => api.post('/admin/modules', data),
  updateModule: (id, data) => api.put(`/admin/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/admin/modules/${id}`),
  getModuleContent: (id) => api.get(`/admin/modules/${id}/content`),
  uploadContent: (moduleId, formData, onProgress) =>
    api.post(`/admin/modules/${moduleId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),

  // Content
  updateContent: (id, data) => api.put(`/admin/content/${id}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),

  // Announcements
  getAnnouncements: (params) => api.get('/admin/announcements', { params }),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),

  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

export default api;
