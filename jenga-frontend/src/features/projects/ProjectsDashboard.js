import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import ProjectCard from "../../components/projects/ProjectCard";
import { getProjectsByUserId } from "../../api/authApi";
import { AuthContext } from "../../Router";
import "./ProjectsDashboard.css";
import UserManagementDashboard from "../admin/UserManagementDashboard";


const ProjectsDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);

  // State for projects
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for active sidebar section
  const [activeSection, setActiveSection] = useState("projects");

  useEffect(() => {
    if (activeSection === "projects") {
      const userId = user?.id;

      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
          const userProjects = await getProjectsByUserId(userId);
          setProjects(userProjects);
        } catch (err) {
          setError("Could not load your projects. Please try again.");
          console.error("Fetch Projects Error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    }
  }, [user, activeSection]);

  const handleProjectDelete = (deletedProjectId) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== deletedProjectId)
    );
  };

  const renderProjectsContent = () => {
    if (loading) {
      return <p className="loading-message">Loading projects...</p>;
    }

    if (error) {
      return <p className="error-message">Error: {error}</p>;
    }

    return projects.length > 0 ? (
      projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={handleProjectDelete} />
      ))
    ) : (
      <p className="no-projects-message">
        You have not created any projects yet. Click 'New Project' to start one.
      </p>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "projects":
        return renderProjectsContent();

      case "manage-accounts":
        return isAdmin ? <UserManagementDashboard />  : <p>Access denied.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Header />

      <div className="layout-body">
        <Sidebar isAdmin={isAdmin} activeLink={activeSection} onNavigate={setActiveSection} />
        <main className="projects-list-area">{renderContent()}</main>
      </div>
    </div>
  );
};

export default ProjectsDashboard;
