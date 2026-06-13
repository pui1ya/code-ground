// /**
//  * api.js — shared Axios instance for Code Ground
//  *
//  * Every component that needs to talk to the backend imports this
//  * instead of calling axios directly. This gives us one place to:
//  *   1. Set the base URL        → always hits /api/*
//  *   2. Attach the JWT          → Authorization: Bearer <token> on every request
//  *   3. Handle 401 globally     → clear token + redirect to /login
//  *
//  * Usage:
//  *   import api from '../utils/api.js';
//  *   const { data } = await api.get('/documents');
//  *   const { data } = await api.post('/documents', { title, language });
//  *
//  * The JWT is stored in localStorage under the key 'cg_token'.
//  * That key is set by useAuth.jsx on login/register and removed on logout.
//  */

// import axios from 'axios';

// const api = axios.create({
//   /*
//    * In development, Vite proxies /api → http://localhost:4000
//    * (configured in vite.config.js).
//    * In production, Nginx proxies /api → the backend container.
//    * So we never need to hard-code the backend host here.
//    */
//   baseURL: '/api',

//   /* Default timeout — prevents requests hanging forever */
//   timeout: 15000,

//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// /* ── Request interceptor ──
//    Runs before every request.
//    Reads the current token from localStorage and
//    attaches it as a Bearer header. */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('cg_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (err) => Promise.reject(err)
// );

// /* ── Response interceptor ──
//    Runs after every response (including errors).
//    On 401 — token expired or invalid:
//      1. Clear the stale token
//      2. Redirect to /login
//    This handles the case where a user's token expires
//    mid-session without requiring each component to
//    check for 401 themselves. */
// api.interceptors.response.use(
//   (response) => response,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('cg_token');
//       localStorage.removeItem('cg_user');
//       /* Hard redirect — clears all React state */
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;


// MOCK api.js — replace with real version when backend is ready
const MOCK_DOCS = [
  {
    id: 'doc-1',
    title: 'auth-service',
    language: 'javascript',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    owner_id: 'mock-user-1',
    is_public: false,
    member_count: 2,
    session_summary: 'Alice and Bob implemented JWT refresh token rotation and fixed a race condition in the token validation middleware.',
    last_session_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'doc-2',
    title: 'data-pipeline',
    language: 'python',
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    owner_id: 'mock-user-1',
    is_public: false,
    member_count: 0,
    session_summary: null,
    last_session_at: null,
  },
  {
    id: 'doc-3',
    title: 'interview-prep',
    language: 'go',
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    owner_id: 'mock-user-1',
    is_public: true,
    member_count: 1,
    session_summary: 'Solved three graph problems and optimised the BFS solution from O(n²) to O(n log n).',
    last_session_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const MOCK_DOC = {
  id: 'doc-1',
  title: 'auth-service',
  language: 'javascript',
  updated_at: new Date().toISOString(),
  owner_id: 'mock-user-1',
  is_public: false,
};

// Simulates network delay so you see loading states
function delay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const api = {
  get: async (url) => {
    await delay();
    if (url === '/documents')          return { data: MOCK_DOCS };
    if (url.startsWith('/documents/')) return { data: MOCK_DOC };
    return { data: {} };
  },

  post: async (url, body) => {
    await delay(400);
    if (url === '/documents') {
      const newDoc = {
        id: 'doc-' + Date.now(),
        title: body.title,
        language: body.language,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        owner_id: 'mock-user-1',
        is_public: false,
        member_count: 0,
        session_summary: null,
      };
      return { data: newDoc };
    }
    if (url === '/execute') {
      return {
        data: {
          stdout: `Hello from ${body.language}!\nExecution complete.`,
          stderr: '',
          elapsed_ms: 312,
          success: true,
        },
      };
    }
    // AI ask — return a fake streamed response
    if (url === '/api/ai/ask') {
      return { data: { message: 'Mock AI response' } };
    }
    return { data: {} };
  },

  patch: async (url, body) => {
    await delay(300);
    return { data: { ...MOCK_DOC, ...body } };
  },

  delete: async () => {
    await delay(300);
    return { data: { success: true } };
  },
};

export default api;