import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api("/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(username, password) {
        const data = await api("/login", { method: "POST", body: { username, password } });
        setUser(data.user);
        return data.user;
      },
      async register(username, password) {
        const data = await api("/register", { method: "POST", body: { username, password } });
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await api("/logout", { method: "POST", body: {} });
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
