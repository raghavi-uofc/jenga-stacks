import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { AuthContext } from "../../Router";

const LoginForm = ({ switchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      login(response.token, response.user);
      navigate("/projects");
    } catch (err) {
      setError(err.message || "An unknown error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form login-form">
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a href="#" className="forgot-password">
          Forgot Password
        </a>
        <button
          className="auth-button primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <button
        className="auth-button secondary-button"
        onClick={switchToRegister}
      >
        Register
      </button>
    </div>
  );
};

export default LoginForm;
