import { API_BASE_URL } from "./config";

export const createProject = async (projectData) => {
}

export const updateProject = async (projectId, projectData) => {
}

export const saveProjectDraft = async (projectData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(projectData),
    });

    const result = await res.json();
    return { ok: res.ok, ...result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

// Delete a project by its ID
export const deleteProject = async (projectId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete project. You may not have permission.");
    }
  } catch (error) {
    console.error(`API Delete Project Error for ID ${projectId}:`, error);
    throw error;
  }
};

// Get project details by ID
export const getProjectDetailsById = async (projectId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch project details.");
    }

    const data = await response.json();
    return data.project; // Return the nested project object
  } catch (error) {
    console.error(
      `API Fetch Project Details Error for ID ${projectId}:`,
      error
    );
    throw error;
  }
};