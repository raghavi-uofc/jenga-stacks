// src/features/projects/ProjectEditWrapper.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectForm from './ProjectForm'; 
// NOTE: AuthContext is removed as requested.

const ProjectEditWrapper = () => {
    const { id } = useParams(); 
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const apiUrl = `http://localhost:5000/api/projects/${id}`;

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
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
                    
                    // 💡 CRITICAL FIX: Normalize the API response structure 💡
                    const projectData = data.project || data; // Extract the nested 'project' object
                    
                    const normalizedProject = {
                        // 1. Core fields
                        id: projectData.id,
                        name: projectData.name || '',
                        goal_description: projectData.goal_description || '',
                        requirement_description: projectData.requirement_description || '',
                        
                        // 2. Budget (Use 'ceiling' value from the budget object)
                        budget: projectData.budget?.ceiling || '',
                        
                        // 3. Dates (Extract from 'timeframe' and format to 'YYYY-MM-DD')
                        start_date: projectData.timeframe?.start_date 
                            ? new Date(projectData.timeframe.start_date).toISOString().split('T')[0] 
                            : '',
                        end_date: projectData.timeframe?.end_date
                            ? new Date(projectData.timeframe.end_date).toISOString().split('T')[0] 
                            : '',

                        // 4. Team Members (Ensure it's an array and map names to the 'member' field)
                        team_members: Array.isArray(projectData.team_members) 
                            ? projectData.team_members.map(member => ({
                                // Map first_name and last_name to the 'member' field
                                member: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
                                // Ensure form-expected fields are present, even if empty
                                language: member.language || '', 
                                framework: member.framework || '',
                            }))
                            : [], // Default to an empty array for safety
                    };
                    
                    setProject(normalizedProject);
                }
            } catch (err) {
                console.error("Fetch error:", err);
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

    // Safety check: ensure project is not null before rendering
    if (!project) {
        return <div style={{ padding: '20px' }}>Project data could not be retrieved or is empty.</div>;
    }

    // Pass the pre-processed, normalized data to ProjectForm
    return <ProjectForm initialData={project} isEditMode={true} />;
};

export default ProjectEditWrapper;