"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6">
      {/* Page Title */}
      <h1 className="text-5xl font-extrabold text-red-800">JengaStacks</h1>

      {/* Form Card */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        {isRegister ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-red-800 text-center">Register</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <button
                type="submit"
                className="bg-red-600 text-white p-2 rounded w-full hover:bg-red-700 transition"
              >
                Create Account
              </button>
            </form>

            <p className="text-center mt-4">
              Already have an account?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-red-600 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-red-800 text-center">Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <button
                type="submit"
                className="bg-red-600 text-white p-2 rounded w-full hover:bg-red-700 transition"
              >
                Login
              </button>
            </form>

            <p className="text-center mt-4">
              Don’t have an account?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-red-600 font-semibold hover:underline"
              >
                Register
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
