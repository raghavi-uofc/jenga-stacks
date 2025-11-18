import React from "react";
import "./Layout.css";

const Sidebar = ({ isAdmin, activeLink, onNavigate }) => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <span
          className={`sidebar-link ${activeLink === "projects" ? "active" : ""}`}
          onClick={() => onNavigate("projects")}
        >
          Projects
        </span>
        {isAdmin && (
          <div className="admin-section">
            <span
              className={`sidebar-link ${activeLink === "manage-accounts" ? "active" : ""}`}
              onClick={() => onNavigate("manage-accounts")}
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
