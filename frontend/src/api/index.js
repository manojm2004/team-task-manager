import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Restore token on page load
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Projects
export const getProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const getProject = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Members
export const addMember = (projectId, data) => api.post(`/projects/${projectId}/members`, data);
export const updateMember = (projectId, userId, data) => api.put(`/projects/${projectId}/members/${userId}`, data);
export const removeMember = (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`);

// Tasks
export const getTasks = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const updateTask = (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data);
export const updateTaskStatus = (projectId, taskId, status) => api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
export const deleteTask = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`);

// Users
export const searchUsers = (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`);
export const getDashboard = () => api.get('/users/dashboard');

export default api;
