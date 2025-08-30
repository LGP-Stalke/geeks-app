import React, { createContext, useContext, useState } from "react";

type User = { id:number; role:"admin"|"manager"|"technician"|"sales"|"viewer"; username:string; email:string };
type AuthCtx = { user?:User, token?:string, login:(ident:string,pwd:string)=>Promise<void>, logout:()=>void };

const Ctx = createContext<AuthCtx>({} as any);
export const useAuth = ()=>useContext(Ctx);

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({children})=>{
  const [user,setUser] = useState<User|undefined>();
  const [token,setToken] = useState<string|undefined>();

  async function login(ident:string,password:string){
    const r = await fetch(import.meta.env.VITE_API_URL+"/auth/login",{
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ident, password })
    });
    if(!r.ok) throw new Error("bad_credentials");
    const data = await r.json();
    setToken(data.access); setUser(data.user);
  }
  function logout(){ setToken(undefined); setUser(undefined); }
  return <Ctx.Provider value={{user,token,login,logout}}>{children}</Ctx.Provider>;
};
