import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../Router";
import RegisterForm from "../../features/auth/RegisterForm";
import "./Layout.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // state to toggle register form
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const initials = user ? user.firstName[0].toUpperCase() : "U";

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate("/profile");
  };
  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/auth");
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  if (showRegister) {
    return (
      <RegisterForm switchToLogin={switchToLogin} isCurrentUserAdmin={user?.role === "admin"} />
    );
  }

  return (
    <header className="main-header">
      <div className="header-branding">
        <h1>JengaStacks / Dashboard</h1>
      </div>
      <div className="header-actions">
        {user?.role !== "admin" && (
          <Link to="/projects/new" className="new-project-button">
            New Project
          </Link>
        )}
        {user?.role === "admin" && (
          <Link to="/register-admin" className="register-admin-button">
            Register New User
          </Link>
        )}

        <div className="profile-dropdown-container">
          <div
            className="profile-circle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>{initials}</span>
          </div>

          {isMenuOpen && (
            <div className="profile-dropdown-menu">
              <div className="user-info">
                <strong>
                  {" "}
                  {user?.first_name || ""} {user?.last_name || ""}{" "}
                </strong>
                ({user?.email || "Guest"})
              </div>
              <button className="menu-item" onClick={handleProfileClick}>
                Profile
              </button>
              <button
                className="menu-item logout-item"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
