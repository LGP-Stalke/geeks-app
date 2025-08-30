import React from "react";
import { useAuth } from "./auth";
import { can } from "./rbac";

export const RBACGuard: React.FC<{ feature: string, children: React.ReactNode }> = ({feature, children})=>{
  const { user } = useAuth();
  if(!user) return null;
  return can(user.role as any, feature as any) ? <>{children}</> : null;
};
