import { ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./auth"; // <- important : import nommé

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <>{children}</>;
}
