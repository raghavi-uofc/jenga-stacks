import React, { useState, useEffect } from 'react';
import './ProjectForm.css';
import { useNavigate } from 'react-router-dom';
import { saveProjectDraft } from '../../api/projectApi';
import { submitProject } from '../../api/projectApi';
import SuggestionsArea from './SuggestionsArea';

const initialMemberRow = {
  member: '',
  language: '',
  framework: '',
};

const defaultStartDate = new Date();
const defaultEndDate = new Date();
defaultStartDate.setDate(defaultStartDate.getDate() + 1);
defaultEndDate.setDate(defaultEndDate.getDate() + 100);

const formatDate = (d) => d.toISOString().split("T")[0];

const emptyFormData = {
  name: '',
  goal_description: '',
  requirement_description: '',
  budget_floor: '',
  budget_ceiling: '',

  start_date: formatDate(defaultStartDate),
  end_date: formatDate(defaultEndDate),
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
        budget_floor: initialData.budget_floor || '',
        budget_ceiling: initialData.budget_ceiling || '',
        start_date: initialData.start_date ? formatDate(new Date(initialData.start_date)) : '',
        end_date: initialData.end_date ? formatDate(new Date(initialData.end_date)) : '',
        team_members:
          initialData.team_members && initialData.team_members.length > 0
            ? initialData.team_members
            : [initialMemberRow],
      });
      setLlmSuggestions(initialData.llm_response||null);
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

  // Handle saving draft
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("draft");

    const draftPayload = {
      id: projectId,
      name: formData.name,
      goal_description: formData.goal_description,
      requirement_description: formData.requirement_description,
      budget_floor: formData.budget_floor,
      budget_ceiling: formData.budget_ceiling,
      start_date: formData.start_date,
      end_date: formData.end_date,
      team_members: formData.team_members,
    };

    try {
      const result = await saveProjectDraft(draftPayload);

      if (result.ok) {
        if (!projectId) {
          setProjectId(result.project_id);
          navigate(`/projects/${result.project_id}`);
        }
        alert("Project saved as draft!");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      alert("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };


  // Handle final submission
  // im here
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("submitted");

    const payload = {
      id: projectId,
      name: formData.name,
      goal_description: formData.goal_description,
      requirement_description: formData.requirement_description,
      budget_floor: formData.budget_floor,
      budget_ceiling: formData.budget_ceiling,
      start_date: formData.start_date,
      end_date: formData.end_date,
      team_members: formData.team_members,
    };

    try {
      const data = await submitProject(payload);

      if (!projectId) {
        setProjectId(data.project_id);
        navigate(`/projects/${data.project_id}`);
      }
      setLlmSuggestions(data.llm_response || null);
      setProjectStatus("submitted");
      alert("Project submitted successfully!");
    } catch (error) {
      alert("Failed to submit project");
    } finally {
      setLoading(false);
    }
  };


  // Render form
  return (
    <div className="project-form-container">
      <h2 className="form-title">{isEditMode ? 'Edit Project' : 'New Project'}</h2>

      <form className="project-form" onSubmit={(e) => e.preventDefault()}>
        <h4>Project Name <span style={{ color: 'red' }}>*</span></h4>
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={formData.name}
          onChange={handleInputChange}
          className="form-input"
          required
        />

        <h4>Project Goal <span style={{ color: 'red' }}>*</span></h4>
        <textarea
          name="goal_description"
          placeholder="Project Goal/Idea"
          value={formData.goal_description}
          onChange={handleInputChange}
          className="form-input"
          rows="3"
          required
        />

        <h4>Project Requirements</h4>
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
          <button type="button" disabled={loading || projectStatus === 'submitted'} onClick={addMemberRow} className="add-member-button">
            + Add Member
          </button>
        </div>

        <h4>Budge</h4>
        <div className="budget-wrapper">
          <input
            type="number"
            name="budget_floor"
            placeholder="Budget Floor"
            value={formData.budget_floor}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          <p> - </p>
          <input
            type="number"
            name="budget_ceiling"
            placeholder="Budget Ceiling"
            value={formData.budget_ceiling}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <h4>Start Date <span style={{ color: 'red' }}>*</span> </h4>
        <input
          type="date"
          name="start_date"
          placeholder="Start Date"
          value={formData.start_date}
          onChange={handleInputChange}
          className="form-input"
          required
        />

        <h4>End Date <span style={{ color: 'red' }}>*</span> </h4>
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

      <SuggestionsArea projectName={formData.name} llmSuggestions={llmSuggestions} loading={loading} status={projectStatus} />
    </div>
  );
};

export default ProjectForm;
