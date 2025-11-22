import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../Router";
import "./Layout.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const initials = user ? user.first_name[0].toUpperCase() : "U";

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate("/profile");
  };
  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/auth");
  };

  console.log("Header Render - User:", user);

  return (
    <header className="main-header">
      <div className="header-branding">
        <h1>JengaStacks / Dashboard</h1>
      </div>
      <div className="header-actions">
       
       
        {user?.role !== 'admin' && (
          <Link to="/projects/new" className="new-project-button">
            New Project
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
                <strong> {user?.first_name || ""} {user?.last_name || ""} </strong>
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
