/**
 * api.js — shared Axios instance for Code Ground
 *
 * Every component that needs to talk to the backend imports this
 * instead of calling axios directly. This gives us one place to:
 *   1. Set the base URL        → always hits /api/*
 *   2. Attach the JWT          → Authorization: Bearer <token> on every request
 *   3. Handle 401 globally     → clear token + redirect to /login
 *
 * Usage:
 *   import api from '../utils/api.js';
 *   const { data } = await api.get('/documents');
 *   const { data } = await api.post('/documents', { title, language });
 *
 * The JWT is stored in localStorage under the key 'cg_token'.
 * That key is set by useAuth.jsx on login/register and removed on logout.
 */

import axios from 'axios';

const api = axios.create({
  /*
   * In development, Vite proxies /api → http://localhost:4000
   * (configured in vite.config.js).
   * In production, Nginx proxies /api → the backend container.
   * So we never need to hard-code the backend host here.
   */
  baseURL: '/api',

  /* Default timeout — prevents requests hanging forever */
  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request interceptor ──
   Runs before every request.
   Reads the current token from localStorage and
   attaches it as a Bearer header. */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ── Response interceptor ──
   Runs after every response (including errors).
   On 401 — token expired or invalid:
     1. Clear the stale token
     2. Redirect to /login
   This handles the case where a user's token expires
   mid-session without requiring each component to
   check for 401 themselves. */
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cg_token');
      localStorage.removeItem('cg_user');
      /* Hard redirect — clears all React state */
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
