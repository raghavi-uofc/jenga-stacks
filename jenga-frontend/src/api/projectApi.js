import { API_BASE_URL } from "./config";

export const submitProject = async (projectData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/projects/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(projectData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit project");
    }

    return data; // return the response to the caller
  } catch (error) {
    console.error("API Submit Project Error:", error);
    throw error;
  }
};

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


// Get all projects for a specific user by user ID
export const getProjectsByUserId = async (userId) => {
   const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}/projects/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user projects.");
    }

    const data = await response.json();

    return data.projects; // Return the array of projects
  } catch (error) {
    console.error("API Fetch Projects Error:", error);
    throw error;
  }
};