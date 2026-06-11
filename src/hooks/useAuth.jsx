import { createContext, useContext, useState } from 'react';
const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login    = async () => {};
  const register = async () => {};
  const logout   = () => {};
  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);