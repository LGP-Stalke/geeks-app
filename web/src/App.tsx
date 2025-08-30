// ...
import AuthGuard from "./AuthGuard";
// ...
export default function App(){
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<AuthGuard><Dashboard/></AuthGuard>}/>
        <Route path="/planning/moi" element={<AuthGuard><PlanningMe/></AuthGuard>}/>
        <Route path="/planning/equipe" element={<AuthGuard><PlanningTeam/></AuthGuard>}/>
        <Route path="/interventions" element={<AuthGuard><Interventions/></AuthGuard>}/>
      </Routes>
    </AuthProvider>
  );
}
