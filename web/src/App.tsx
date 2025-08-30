import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./auth";
import AuthGuard from "./AuthGuard";
import { RBACGuard } from "./RBACGuard";
import { FEATURE } from "./rbac";
import { useAuth } from "./auth";

function Login() {
  const { login } = useAuth();
  const [ident, setIdent] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(ident, password);
    nav("/");
  };
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <input placeholder="Email ou username" value={ident} onChange={(e) => setIdent(e.target.value)} />
      <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Se connecter</button>
    </form>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        Bonjour <b>{user?.username}</b> — rôle: <b>{user?.role}</b>
      </div>
      <RBACGuard feature={FEATURE.PLANNING_ME}>
        <button onClick={() => nav("/planning/moi")}>Mon planning</button>
      </RBACGuard>
      <RBACGuard feature={FEATURE.PLANNING_TEAM}>
        <button onClick={() => nav("/planning/equipe")}>Planning équipe</button>
      </RBACGuard>
      <RBACGuard feature={FEATURE.INTERVENTIONS_MINE}>
        <button onClick={() => nav("/interventions?scope=me")}>Mes interventions</button>
      </RBACGuard>
      <RBACGuard feature={FEATURE.INTERVENTIONS_ALL}>
        <button onClick={() => nav("/interventions?scope=all")}>Toutes les interventions</button>
      </RBACGuard>
    </div>
  );
}

function PlanningMe() { return <div>Planning — moi</div>; }
function PlanningTeam() { return <div>Planning — équipe</div>; }
function Interventions() { return <div>Liste interventions</div>; }

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/planning/moi" element={<AuthGuard><PlanningMe /></AuthGuard>} />
        <Route path="/planning/equipe" element={<AuthGuard><PlanningTeam /></AuthGuard>} />
        <Route path="/interventions" element={<AuthGuard><Interventions /></AuthGuard>} />
      </Routes>
    </AuthProvider>
  );
}

