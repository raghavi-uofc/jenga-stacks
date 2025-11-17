import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Router";
import { updateUserProfile } from "../../api/authApi";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  const { user, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setMessage("");
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(null);

    const { email, first_name, last_name } = formData;
    const apiBody = { email, first_name, last_name };

    try {
      const updatedUser = await updateUserProfile(apiBody);
      const token = localStorage.getItem("token");
      login(token, updatedUser);

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Could not save profile changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    alert("Password reset link sent to your email.");
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
      {error && (
        <p
          className="error-message"
          style={{ color: "red", fontWeight: "bold" }}
        >
          {error}
        </p>
      )}

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

        <button
          type="button"
          onClick={handleResetPassword}
          className="secondary-action-link"
          disabled={loading}
        >
          Reset Password
        </button>

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
