import React, { useState, useContext, useEffect } from "react"; 
import { Link } from "react-router-dom";
import { AuthContext } from "../../Router";
import { updateUserProfile } from "../../api/authApi";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  const { user, login } = useContext(AuthContext);

  // Initialize formData with safe defaults
  const [formData, setFormData] = useState({
    email: user?.email || "",
    first_name: user?.first_name || user?.firstName|| "",
    last_name: user?.last_name || user?.lastName || "",
    password: "", // for security verification
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update formData if user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user?.email,
        first_name: user?.first_name,
        last_name: user?.last_name,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(null);

    const { email, first_name, last_name, password } = formData;

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    const apiBody = { email, first_name, last_name, password };

    try {
      const response = await updateUserProfile(apiBody); // call backend
      if (response?.message === "Profile updated successfully") {
        const token = localStorage.getItem("token");

        // update frontend state directly with entered names
        login(token, { 
          ...user, 
          first_name: formData.first_name, 
          last_name: formData.last_name 
        });

        setMessage(response.message); // show success message
        setFormData((prev) => ({ ...prev, password: "" })); // clear password
      } else {
        setError(response?.error || "Could not save profile changes.");
      }
    } catch (err) {
      setError(err.message || "Could not save profile changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-breadcrumb">
        <Link to="/projects" className="breadcrumb-link">
          Projects Dashboard
        </Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Profile</span>
      </div>

      <h2 className="profile-title">Profile</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form className="profile-form" onSubmit={handleSave}>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="profile-input"
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="profile-input"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          className="profile-input read-only-input"
          readOnly
        />

        <input
          type="password"
          name="password"
          placeholder="Current Password (for security verification)"
          value={formData.password}
          onChange={handleChange}
          className="profile-input"
          required
        />

        <Link to="/reset-password" className="secondary-action-link">
          Reset Password
        </Link>

        <div className="save-button-area">
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
