import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const load = () => {
  try { return JSON.parse(localStorage.getItem('nr_auth')); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(load);

  const login = useCallback((data) => {
    const value = { token: data.token, user: data.user };
    localStorage.setItem('nr_auth', JSON.stringify(value));
    setAuth(value);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nr_auth');
    setAuth(null);
  }, []);

  const updateUser = useCallback((u) => {
    setAuth((a) => {
      const next = { ...a, user: { ...a.user, ...u } };
      localStorage.setItem('nr_auth', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('auth-expired', logout);
    return () => window.removeEventListener('auth-expired', logout);
  }, [logout]);

  return (
    <Ctx.Provider value={{ user: auth?.user || null, token: auth?.token || null, login, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}
