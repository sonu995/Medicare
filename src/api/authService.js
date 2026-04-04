import apiClient from './authApi';

export const register = async (data) => {
  const res = await apiClient.post('/auth/register', data);
  if (res.data.success) {
    localStorage.setItem('token', res.data.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
  }
  return res.data;
};

export const login = async (data) => {
  const res = await apiClient.post('/auth/login', data);
  if (res.data.success) {
    localStorage.setItem('token', res.data.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
  }
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await apiClient.put('/auth/profile', data);
  if (res.data.success) {
    localStorage.setItem('user', JSON.stringify(res.data.data));
  }
  return res.data;
};

export const changePassword = async (data) => {
  const res = await apiClient.put('/auth/change-password', data);
  if (res.data.success) {
    localStorage.setItem('token', res.data.data.token);
  }
  return res.data;
};

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!getToken();
