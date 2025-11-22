import React, { useState, useEffect, useContext } from "react";
import ProjectCard from "../../components/projects/ProjectCard";
import { getProjectsByUserId } from "../../api/projectApi";
import { AuthContext } from "../../Router";
import "./ProjectsDashboard.css";

const ProjectsDashboard = () => {
  const { user } = useContext(AuthContext);

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
  }, [user]);

  const handleProjectDelete = (deletedProjectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedProjectId));
  };

  if (loading) return <p className="loading-message">Loading projects...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="projects-list-area">
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleProjectDelete}
          />
        ))
      ) : (
        <p className="no-projects-message">
          You have not created any projects yet.
        </p>
      )}
    </div>
  );
};

export default ProjectsDashboard;
