// src/hooks/useAuth.jsx — updated stub for Dashboard preview
// import { createContext, useContext, useState } from 'react';

// const Ctx = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState({
//     username: 'devuser',          // fake user so the greeting renders
//     email: 'dev@example.com',
//     avatar_color: '#3B82F6',
//   });

//   const login    = async () => {};
//   const register = async () => {};
//   const logout   = () => setUser(null);

//   return (
//     <Ctx.Provider value={{ user, login, register, logout }}>
//       {children}
//     </Ctx.Provider>
//   );
// }

// export const useAuth = () => useContext(Ctx);

import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'mock-user-1',
    username: 'punyashree',
    email: 'punyashree@example.com',
    is_paid: false,
    avatar_color: '#3B82F6',
  });

  const login    = async () => {};
  const register = async () => {};
  const logout   = () => setUser(null);

  return (
    <Ctx.Provider value={{ user, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);