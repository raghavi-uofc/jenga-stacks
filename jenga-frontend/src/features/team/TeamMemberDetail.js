import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import "./TeamMemberDetail.css";

const initialMemberData = {
  name: "Jane Doe",
  languages: [
    { id: 1, name: "JavaScript", skill: "Expert", notes: "Strong with ES6+" },
    { id: 2, name: "Python", skill: "Intermediate", notes: "Flask experience" },
  ],
  frameworks: [
    { id: 1, name: "React", skill: "Expert", notes: "Current project stack" },
  ],
  projects: [
    { id: 1, name: "Internal Tool V2", role: "Frontend Lead" },
    { id: 2, name: "Website Redesign", role: "Developer" },
  ],
};

const TeamMemberDetail = () => {
  const [member, setMember] = useState(initialMemberData);
  const [isEditingName, setIsEditingName] = useState(false);
  const currentUser = { isAdmin: true };

  const handleNameChange = (e) => {
    setMember({ ...member, name: e.target.value });
  };

  const handleRemoveRole = (projectId) => {
    setMember({
      ...member,
      projects: member.projects.filter((p) => p.id !== projectId),
    });
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={currentUser.isAdmin} activeLink="team-members" />

      <div className="main-content-area">
        <header className="main-header member-header">
          <div className="header-branding">
            <h1>JengaStacks / Team</h1>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search Member"
                className="search-input"
              />
            </div>
            <button className="filter-button">Filter by...</button>
            <button className="new-member-button">New Member</button>
            <div className="profile-circle">
              <span>Profile</span>
            </div>
          </div>
        </header>

        <main className="member-detail-container">
          <div className="detail-header">
            <div className="title-block">
              {isEditingName ? (
                <input
                  type="text"
                  value={member.name}
                  onChange={handleNameChange}
                  onBlur={() => setIsEditingName(false)}
                  className="member-name-input"
                  autoFocus
                />
              ) : (
                <h2 className="member-name">{member.name}</h2>
              )}
              <span
                className="edit-icon"
                onClick={() => setIsEditingName(true)}
                title="Click to change name"
              >
                [open icon]
              </span>
            </div>
            <button className="close-button">X</button>
          </div>

          <h3 className="section-title">Language</h3>
          <table className="skill-table">
            <thead>
              <tr>
                <th>Language</th>
                <th>Skill Level</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {member.languages.map((lang) => (
                <tr key={lang.id}>
                  <td>{lang.name}</td>
                  <td>{lang.skill}</td>
                  <td>{lang.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-button">add</button>

          <h3 className="section-title">Framework</h3>
          <table className="skill-table">
            <thead>
              <tr>
                <th>Framework</th>
                <th>Skill Level</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {member.frameworks.map((frame) => (
                <tr key={frame.id}>
                  <td>{frame.name}</td>
                  <td>{frame.skill}</td>
                  <td>{frame.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-button">add</button>

          <h3 className="section-title project-roles-title">
            is a team member of
          </h3>
          <table className="roles-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Role</th>
                <th className="action-column"></th>
              </tr>
            </thead>
            <tbody>
              {member.projects.map((proj) => (
                <tr key={proj.id}>
                  <td>{proj.name}</td>
                  <td>{proj.role}</td>
                  <td className="action-column">
                    <button
                      className="remove-role-button"
                      onClick={() => handleRemoveRole(proj.id)}
                    >
                      &lt;remove from this role&gt;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default TeamMemberDetail;
