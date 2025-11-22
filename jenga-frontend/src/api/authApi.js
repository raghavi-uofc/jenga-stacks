import { API_BASE_URL } from "./config";

// User login
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

// User registration
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

// ? Delete a project by its ID
// not tested yet
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


// Update user profile information
export const updateUserProfile = async (userData) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData), // includes current_password now
    });

    const text = await response.text(); // get raw text first
    let data;
    try {
      data = JSON.parse(text); // try parsing as JSON
    } catch {
      data = { error: text }; // fallback if not JSON
    }

    if (!response.ok) {
      throw new Error(data.error || "Failed to update profile.");
    }

    return data;
  } catch (error) {
    console.error("API Profile Update Error:", error);
    throw error;
  }
};


// ADMIN ROUTES
// Get all users (admin only)
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users.");
    }

    const data = await response.json();
    
    // Return the 'users' array from the API response
    return data.users || [];
  } catch (error) {
    console.error("API Fetch Users Error:", error);
    throw error;
  }
};

// Delete a user by ID (admin only)
export const deleteUserById = async (userId) => {
    const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user.");
    }

    return true; // Indicate successful deletion
  } catch (error) {
    console.error("API Delete User Error:", error);
    throw error;
  }
};



// Reset user password
export const resetPassword = async (old_password, new_password, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/reset_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Pass token for authentication
      },
      body: JSON.stringify({ old_password, new_password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to reset password");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};