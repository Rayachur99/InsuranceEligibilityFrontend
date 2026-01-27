import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminPage from "../pages/AdminPage";
import PayerPage from "../pages/PayerPage";
import ProviderPage from "../pages/ProviderPage";
import { useAuth } from "../auth/AuthContext";

const AppRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  switch (user.role) {
    case "SYSTEM_ADMIN":
      return <AdminPage />;
    case "PAYER_USER":
      return <PayerPage />;
    case "PROVIDER_USER":
      return <ProviderPage />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default AppRouter;
