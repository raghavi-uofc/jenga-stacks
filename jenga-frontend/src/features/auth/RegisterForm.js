import React, { useState } from "react";
import { registerUser } from "../../api/authApi";

const RegisterForm = ({ switchToLogin, isCurrentUserAdmin }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\|]).{7,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleAdminToggle = (e) => {
    setIsAdmin(e.target.checked);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordPattern.test(formData.password)) {
      setError(
        "Password must be at least 7 characters long and include letters, numbers, and special characters."
      );
      return;
    }

    setLoading(true);
    const role = isAdmin ? "admin" : "regular";
    const { confirmPassword, ...otherData } = formData;

    const apiData = {
      ...otherData,
      role: role,
    };

    try {
      await registerUser(apiData);
      setSuccess("Registration successful! You can now log in.");
    } catch (err) {
      setError(err.message || "An unknown error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form register-form">
          <h2>Register</h2>
          {success && (
            <p style={{ color: "green", fontWeight: "bold" }}>{success}</p>
          )}
          {error && (
            <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
          )}

          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              className="auth-input"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              className="auth-input"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="auth-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {isCurrentUserAdmin && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={handleAdminToggle}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isAdmin"
                  className="text-sm font-medium text-gray-700 select-none"
                >
                  Register as Administrator?
                </label>
              </div>
            )}

            <button
              className="auth-button primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <button
            className="auth-button tertiary-button"
            onClick={switchToLogin}
            disabled={loading}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
