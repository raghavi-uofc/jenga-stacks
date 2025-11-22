import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProject } from "../../api/projectApi";
import "./ProjectCard.css";

const ProjectCard = ({ project, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const statusKey = project.project_status
    ? project.project_status.toLowerCase()
    : "draft";
  const statusClass =
    statusKey === "draft" ? "status-draft" : "status-submitted";

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete the project: "${project.name}"? This action cannot be undone.`
      )
    ) {
      setIsMenuOpen(false);
      return;
    }

    setDeleting(true);
    setIsMenuOpen(false);

    try {
      await deleteProject(project.id);
      onDelete(project.id);
    } catch (error) {
      alert(
        error.message ||
          "Failed to delete project. Check permissions or network connection."
      );
      setDeleting(false);
    }
  };

  if (deleting) {
    return (
      <div className="project-card deleting-state">
        Deleting "{project.name}"...
      </div>
    );
  }

  return (
    <div className="project-card" onClick={handleCardClick}>
      <div className="card-header">
        <h3 className="project-name">{project.name}</h3>
        <div className="ellipses-menu" onClick={(e) => e.stopPropagation()}>
          <button
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ...
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              <button
                className="menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                Edit
              </button>
              <button
                className="menu-item delete-item"
                onClick={handleDelete}
                disabled={deleting}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer">
        <div className={`project-status ${statusClass}`}>
          {project.project_status || "Draft"}
        </div>

        {project.goalDescription && (
          <p className="status-note">
            {project.goalDescription.substring(0, 50)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
