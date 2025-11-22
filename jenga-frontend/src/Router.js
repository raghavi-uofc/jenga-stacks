import React, { useState, useEffect, createContext, useContext } from "react";
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
import TeamMemberDetail from "./features/team/TeamMemberDetail";
import UserManagementDashboard from "./features/admin/UserManagementDashboard";
import UserProfilePage from "./features/user/UserProfilePage";
import ProjectEditWrapper from "./features/projects/ProjectEditWrapper";
import ResetPassword from "./features/user/ResetPassword";
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

const PrivateRoutes = ({ isAdminRequired = false }) => {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (isAdminRequired && !isAdmin) {
    return <Navigate to="/projects" />;
  }

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
          {/* 1. Public Routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* 2. Protected Routes Group */}
          <Route element={<PrivateRoutes />}>
            {/* Routes that use the Sidebar layout */}
            <Route element={<DashboardLayout />}>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/projects" replace />} />

              {/* Projects Feature Routes */}
              <Route path="/projects" element={<ProjectsDashboard />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/:id/edit" element={<ProjectEditWrapper />} />

              {/* Team Members Feature Routes */}
              <Route
                path="/team-members"
                element={<h2>Team Members List Page (to be built)</h2>}
              />
              <Route path="/team-members/:id" element={<TeamMemberDetail />} />

              {/* User Feature Routes (Profile uses DashboardLayout but renders only Outlet) */}
              <Route path="/profile" element={<UserProfilePage />} />

              {/* Admin Only Routes (Nested Protection) */}
              <Route element={<PrivateRoutes isAdminRequired={false} />}>
                <Route
                  path="/manage-accounts"
                  element={<UserManagementDashboard />}
                />
              </Route>
            </Route>
          </Route>
<Route path="/reset-password" element={<ResetPassword />} />
          {/* 3. Catch All (404) */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default AppRouter;
