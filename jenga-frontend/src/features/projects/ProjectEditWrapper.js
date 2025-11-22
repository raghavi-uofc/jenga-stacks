import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import { getProjectDetailsById } from "../../api/projectApi";

const ProjectEditWrapper = () => {
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await getProjectDetailsById(id);
        setProjectData(data);
      } catch (err) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return <ProjectForm initialData={projectData} isEditMode={true} />;
};

export default ProjectEditWrapper;
