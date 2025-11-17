import React from "react";
import "./Layout.css";

const Sidebar = ({ isAdmin, activeLink }) => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <a
          href="/projects"
          className={`sidebar-link ${
            activeLink === "projects" ? "active" : ""
          }`}
        >
          Projects
        </a>
        <a
          href="/team-members"
          className={`sidebar-link ${
            activeLink === "team-members" ? "active" : ""
          }`}
        >
          Team Members
        </a>

        {isAdmin && (
          <div className="admin-section">
            <span className="admin-label">admin only</span>
            <a
              href="/manage-accounts"
              className={`sidebar-link ${
                activeLink === "manage-accounts" ? "active" : ""
              }`}
            >
              Manage Accounts
            </a>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
