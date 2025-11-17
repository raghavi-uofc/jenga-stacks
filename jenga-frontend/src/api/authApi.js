const API_BASE_URL = "http://localhost:5000/api";

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Throw an error if the HTTP status is not 2xx
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed due to server error.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Login Error:", error);
    throw error; // Re-throw to be handled by the component
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Registration failed due to server error."
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Registration Error:", error);
    throw error;
  }
};

export const getProjectsByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
export const updateUserProfile = async (userData) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update profile.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Profile Update Error:", error);
    throw error;
  }
};

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
