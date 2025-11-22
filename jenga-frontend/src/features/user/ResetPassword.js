import React, { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import "./ResetPassword.css";
import { useNavigate } from "react-router-dom";
const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await resetPassword(oldPassword, newPassword, token);
      setMessage("Password reset successfully!");
      // Redirect to projects dashboard after short delay, e.g., 1.5s
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="profile-breadcrumb">
        <Link to="/profile" className="breadcrumb-link">
          Profile
        </Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">ResetPassword</span>
      </div>

      <h2 className="reset-password-title">Reset Password</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="reset-password-form">
        <label>
          Old Password:
          <input
            type="password"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </label>

        <label>
          New Password:
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
