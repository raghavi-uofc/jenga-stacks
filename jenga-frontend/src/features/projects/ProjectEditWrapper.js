import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectForm from './ProjectForm';

const ProjectEditWrapper = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const apiUrl = `http://localhost:5000/api/projects/${id}`;
        const token = localStorage.getItem('token'); // pass token if needed

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Project with ID ${id} not found.`);
          } else {
            throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
          }
        } else {
          const data = await response.json();

          const projectData = data.project || data;

          const normalizedProject = {
            id: projectData.id,
            name: projectData.name || '',
            goalDescription: projectData.goalDescription || '',
            requirementDescription: projectData.requirementDescription || '',
            budget: projectData.budget?.ceiling || '',
            start_date: projectData.timeframe?.start_date
              ? new Date(projectData.timeframe.start_date).toISOString().slice(0, 10)
              : '',
            end_date: projectData.timeframe?.end_date
              ? new Date(projectData.timeframe.end_date).toISOString().slice(0, 10)
              : '',
            team_members: Array.isArray(projectData.team_members)
              ? projectData.team_members.map((member) => ({
                  member: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
                  language: member.language || '',
                  framework: member.framework || '',
                }))
              : [],
          };

          setProject(normalizedProject);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Could not load project data. Check network or server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }

  if (!project) {
    return <div style={{ padding: '20px' }}>Project data could not be retrieved or is empty.</div>;
  }

  return <ProjectForm initialData={project} isEditMode={true} />;
};

export default ProjectEditWrapper;
