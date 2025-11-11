"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Loading...");

  interface User {
    name: string;
    role: "admin" | "user";
  }

  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // redirect to login
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // redirect if no token
      return;
    }

    fetch("http://127.0.0.1:5000/dashboard-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        const data = await res.json();
        setMessage(data.message);
        setUser({ name: data.name, role: data.role });
        setCurrentPage(data.role === "admin" ? "Manage Accounts" : "Projects");
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/");
      });
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-700">
        Loading...
      </div>
    );
  }

  const sidebarLinks =
    user.role === "admin" ? ["Manage Accounts"] : ["Projects", "Team Members"];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-red-700 text-white flex flex-col">
        <div className="p-6 font-bold text-xl border-b border-red-900">
          JengaStacks
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link}
              onClick={() => setCurrentPage(link)}
              className={`block w-full text-left px-4 py-2 rounded transition-colors font-semibold ${
                currentPage === link
                  ? "bg-red-900"
                  : "hover:bg-red-800"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-red-700">
          <h1 className="text-lg font-semibold text-red-700">{currentPage}</h1>
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="px-4 py-2 rounded hover:bg-red-100 text-red-700 font-semibold transition-colors"
            >
              {user.name}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-red-700 rounded shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-red-100 text-red-700 font-semibold transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 bg-white text-red-700">
          {currentPage === "Projects" && (
            <div>
              <p>{message}</p>
            </div>
          )}
          {currentPage === "Team Members" && (
            <div>
              <p>Team member data goes here.</p>
            </div>
          )}
          {currentPage === "Manage Accounts" && (
            <div>
              <p>Admin account management tools go here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
