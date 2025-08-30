import React, { createContext, useContext, useState } from "react";

export type Role = "admin" | "manager" | "technician" | "sales" | "viewer";
export type User = { id: number; role: Role; username: string; email: string };

type AuthCtx = {
  user?: User;
  token?: string;
  login: (ident: string, pwd: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(() => {
    const raw = localStorage.getItem("ga_user");
    return raw ? (JSON.parse(raw) as User) : undefined;
  });
  const [token, setToken] = useState<string | undefined>(() => localStorage.getItem("ga_token") || undefined);

  async function login(ident: string, password: string) {
    const r = await fetch(import.meta.env.VITE_API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ident, password }),
    });
    if (!r.ok) throw new Error("bad_credentials");
    const data = await r.json();
    setToken(data.access);
    setUser(data.user);
    localStorage.setItem("ga_token", data.access);
    localStorage.setItem("ga_user", JSON.stringify(data.user));
  }

  function logout() {
    setToken(undefined);
    setUser(undefined);
    localStorage.removeItem("ga_token");
    localStorage.removeItem("ga_user");
  }

  return <Ctx.Provider value={{ user, token, login, logout }}>{children}</Ctx.Provider>;
};
