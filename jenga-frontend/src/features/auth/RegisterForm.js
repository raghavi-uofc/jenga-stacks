import React, { useState } from "react";
import { registerUser } from "../../api/authApi";

const RegisterForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { confirmPassword, ...apiData } = formData;

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
    <div className="auth-form register-form">
      <h2>Register</h2>
      {success && (
        <p style={{ color: "green", fontWeight: "bold" }}>{success}</p>
      )}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

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
  );
};

export default RegisterForm;
