import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getAuth } from '../api';
import { AuthContext } from './useAuth';

const fromStorage = () => {
  const a = getAuth();
  return a ? { username: a.username, role: a.role } : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(fromStorage);
  const [checking, setChecking] = useState(() => !!getAuth());

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('pupigo:logout', onLogout);
    if (getAuth()) {
      api.me()
        .then((u) => setUser({ username: u.username, role: u.role }))
        .catch(() => { if (!getAuth()) setUser(null); })
        .finally(() => setChecking(false));
    }
    return () => window.removeEventListener('pupigo:logout', onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const a = await api.login(username, password);
    const u = { username: a.username, role: a.role };
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // el token local ya se descarto en api.logout
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
