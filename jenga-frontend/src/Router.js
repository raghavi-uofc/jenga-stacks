import React, { useState, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

import AuthPage from "./features/auth/AuthPage";
import ProjectsDashboard from "./features/projects/ProjectsDashboard";
import ProjectForm from "./features/projects/ProjectForm";
import UserManagementDashboard from "./features/admin/UserManagementDashboard";
import UserProfilePage from "./features/user/UserProfilePage";
import ProjectEditWrapper from "./features/projects/ProjectEditWrapper";
import ResetPassword from "./features/user/ResetPassword";
import RegisterForm from "./features/auth/RegisterForm";

export const AuthContext = createContext(null);

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const isAuthenticated = !!token;
  const isAdmin = user && user.role === "admin";

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return { isAuthenticated, isAdmin, user, login, logout };
};

const PrivateRoutes = ({ adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/projects" replace />;
  if (!adminOnly && isAdmin) return <Navigate to="/manage-accounts" replace />;

  return <Outlet />;
};


const DashboardLayout = () => {
  const { isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const activeLink = pathSegments[1] || "projects";

  return (
    <div className="app-container">
      <Header />
      <div className="layout-body">
        <Sidebar isAdmin={isAdmin} activeLink={activeLink} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRouter = () => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to={auth.isAdmin ? "/manage-accounts" : "/projects"} replace />} />

            {/* Non-admin */}
            <Route element={<PrivateRoutes adminOnly={false} />}>
              <Route path="/projects" element={<ProjectsDashboard />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/:id" element={<ProjectEditWrapper />} />
            </Route>

            {/* Admin-only */}
            <Route element={<PrivateRoutes adminOnly={true} />}>
              <Route path="/manage-accounts" element={<UserManagementDashboard />} />
              <Route path="/register-admin" element={<RegisterForm isCurrentUserAdmin={true} />}/>
            </Route>

            {/* Shared */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>

      </Router>
    </AuthContext.Provider>
  );
};

export default AppRouter;
