import { AuthProvider } from "./auth/AuthContext";
import AppRouter from "./router/Approuter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
