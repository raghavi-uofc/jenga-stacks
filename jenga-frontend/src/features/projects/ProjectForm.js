import React, { useState, useEffect } from 'react';
import './ProjectForm.css';
import { useNavigate } from 'react-router-dom';

const initialMemberRow = {
  member: '',
  language: '',
  framework: '',
};

const emptyFormData = {
  name: '',
  goal_description: '',
  requirement_description: '',
  budget: '',
  start_date: '',
  end_date: '',
  team_members: [initialMemberRow],
};

const ProjectForm = ({ initialData = null, isEditMode = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyFormData);
  const [llmSuggestions, setLlmSuggestions] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize form data with initialData on mount or when it changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        goal_description: initialData.goal_description || '',
        requirement_description: initialData.requirement_description || '',
        budget: initialData.budget || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        team_members:
          initialData.team_members && initialData.team_members.length > 0
            ? initialData.team_members
            : [initialMemberRow],
      });
      setLlmSuggestions(null);
    } else {
      setFormData(emptyFormData);
      setLlmSuggestions(null);
    }
  }, [initialData]);

  // Use projectId from initialData if present, else null (for new projects)
const [projectId, setProjectId] = useState(initialData?.id || null);  
const [projectStatus, setProjectStatus] = useState(initialData?.status || '');
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const newMembers = formData.team_members.map((member, i) => {
      if (i === index) {
        return { ...member, [name]: value };
      }
      return member;
    });
    setFormData({ ...formData, team_members: newMembers });
  };

  const addMemberRow = () => {
    setFormData({
      ...formData,
      team_members: [...formData.team_members, initialMemberRow],
    });
  };

  const removeMemberRow = (index) => {
    const newMembers = formData.team_members.filter((_, i) => i !== index);
    setFormData({ ...formData, team_members: newMembers });
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('draft');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: projectId,
          name: formData.name,
          goal_description: formData.goal_description,
          requirement_description: formData.requirement_description,
          budget: formData.budget,
          start_date: formData.start_date,
          end_date: formData.end_date,
          team_members: formData.team_members,
          project_status: 'draft',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update projectId so that subsequent submits/updates know the project
        if (!projectId) {
          // Only update if it was a new project create
          setProjectId(data.project_id);
          navigate(`/projects/${data.project_id}`);
        }
        alert('Project saved as draft!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('submitted');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/projects/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: projectId,
          name: formData.name,
          goal_description: formData.goal_description,
          requirement_description: formData.requirement_description,
          budget: formData.budget,
          start_date: formData.start_date,
          end_date: formData.end_date,
          team_members: formData.team_members,
          project_status: 'submitted',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!projectId) {
          setProjectId(data.project_id);
          navigate(`/projects/${data.project_id}`);
        }
        setLlmSuggestions(data.llm_response);
        setProjectStatus('submitted');
        alert('Project submitted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form-container">
      <h2 className="form-title">{isEditMode ? 'Edit Project' : 'New Project'}</h2>

      <form className="project-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={formData.name}
          onChange={handleInputChange}
          className="form-input"
          required
        />

        <textarea
          name="goal_description"
          placeholder="Project Goal/Idea"
          value={formData.goal_description}
          onChange={handleInputChange}
          className="form-input"
          rows="3"
          required
        />

        <textarea
          name="requirement_description"
          placeholder="Requirements"
          value={formData.requirement_description}
          onChange={handleInputChange}
          className="form-input"
          rows="4"
          required
        />

        <div className="table-wrapper">
          <h4>Team Members</h4>
          <table className="member-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Language</th>
                <th>Framework</th>
                <th className="action-column"></th>
              </tr>
            </thead>
            <tbody>
              {formData.team_members.map((member, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="member"
                      value={member.member}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="Name/Role"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="language"
                      value={member.language}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="e.g., Python"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="framework"
                      value={member.framework}
                      onChange={(e) => handleMemberChange(index, e)}
                      placeholder="e.g., Django"
                    />
                  </td>
                  <td className="action-column">
                    {formData.team_members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMemberRow(index)}
                        className="remove-row-button"
                      >
                        X
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addMemberRow} className="add-member-button">
            + Add Row
          </button>
        </div>

        <input
          type="number"
          name="budget"
          placeholder="Budget"
          value={formData.budget}
          onChange={handleInputChange}
          className="form-input"
          required
        />

        <input
          type="date"
          name="start_date"
          placeholder="Start Date"
          value={formData.start_date}
          onChange={handleInputChange}
          className="form-input"
          required
        />

        <input
          type="date"
          name="end_date"
          placeholder="End Date"
          value={formData.end_date}
          onChange={handleInputChange}
          className="form-input"
          required
        />

        <div className="action-buttons">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="draft-button"
            disabled={loading || projectStatus === 'submitted'}
          >
            {loading && status === 'draft' ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="submit-button"
           disabled={loading || projectStatus === 'submitted'}
          >
            {loading && status !== 'draft' ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      <div className="suggestions-area">
        <h3 className="suggestions-title">LLM Suggestions</h3>
        {loading && status !== 'draft' ? (
          <p>Generating suggestions...</p>
        ) : llmSuggestions ? (
          <div className="llm-response">
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {llmSuggestions}
            </pre>
          </div>
        ) : (
          <p>Submit your project to generate AI-powered suggestions.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectForm;
