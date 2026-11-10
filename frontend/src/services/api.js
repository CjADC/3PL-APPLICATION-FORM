import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://cj-application-form.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`,
  headers: { Accept: 'application/json' },
});

export default api;
