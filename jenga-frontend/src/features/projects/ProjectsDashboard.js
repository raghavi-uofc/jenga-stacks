import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import ProjectCard from "../../components/projects/ProjectCard";
import { getProjectsByUserId } from "../../api/authApi";
import { AuthContext } from "../../Router";
import "./ProjectsDashboard.css";

const ProjectsDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = user?.id;

    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
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
  }, [user]);

  const handleProjectDelete = (deletedProjectId) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== deletedProjectId)
    );
  };

  const renderContent = () => {
    if (loading) {
      return <p className="loading-message">Loading projects...</p>;
    }

    if (error) {
      return <p className="error-message">Error: {error}</p>;
    }

    return projects.length > 0 ? (
      projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={handleProjectDelete}
        />
      ))
    ) : (
      <p className="no-projects-message">
        You have not created any projects yet. Click 'New Project' to start one.
      </p>
    );
  };

  return (
    <div className="app-container">
      <Header />

      <div className="layout-body">
        <Sidebar isAdmin={isAdmin} activeLink="projects" />

        <main className="projects-list-area">{renderContent()}</main>
      </div>
    </div>
  );
};

export default ProjectsDashboard;
