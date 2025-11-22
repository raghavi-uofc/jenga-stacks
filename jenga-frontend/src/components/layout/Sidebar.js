import React from "react";
import { useNavigate } from "react-router-dom";
import "./Layout.css";

const Sidebar = ({ isAdmin, activeLink }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">

        {/* Only show Projects to non-admins */}
        {!isAdmin && (
          <span
            className={`sidebar-link ${activeLink === "projects" ? "active" : ""}`}
            onClick={() => navigate("/projects")}
          >
            Projects
          </span>
        )}

        {/* Admin-only section */}
        {isAdmin && (
          <div className="admin-section">
            <span
              className={`sidebar-link ${activeLink === "manage-accounts" ? "active" : ""}`}
              onClick={() => navigate("/manage-accounts")}
            >
              Manage Accounts
            </span>
          </div>
        )}

      </nav>
    </div>
  );
};

export default Sidebar;
