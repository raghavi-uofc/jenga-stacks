import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import { useAuth } from "./auth/AuthContext";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Textarea from "./components/ui/Textarea";
import Card from "./components/ui/Card";
import Pill from "./components/ui/Pill";
import { IconDashboard, IconProjects, IconPlusSquare, IconHistory, IconSettings } from "./components/icons";

/* --- tiny components --- */
const NavButton: React.FC<{ to: string; label: string; icon?: React.ReactNode }> = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block w-full text-left px-4 py-2 rounded-xl transition hover:bg-gray-100 dark:hover:bg-zinc-800 ${
        isActive ? "bg-gray-100 dark:bg-zinc-800 font-semibold" : ""
      }`
    }
  >
    <span className="inline-flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </span>
  </NavLink>
);

// Card and Pill provided by components/ui

/* --- pages --- */
function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Drafts">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between"><span>Website Revamp</span><Pill variant="secondary">Draft</Pill></li>
            <li className="flex items-center justify-between"><span>Data Pipeline POC</span><Pill>Draft</Pill></li>
            <li className="flex items-center justify-between"><span>Mobile MVP</span><Pill>Draft</Pill></li>
          </ul>
        </Card>
        <Card title="Submitted">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between"><span>Growth Analytics</span><Pill variant="success">Submitted</Pill></li>
            <li className="flex items-center justify-between"><span>CRM Migration</span><Pill variant="success">Submitted</Pill></li>
          </ul>
        </Card>
        <Card title="Quick Actions">
          <div className="flex gap-2">
            <Button>New Project</Button>
            <Button variant="outline">Import Team</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
function Projects() {
  return (
    <Card title="Projects">
      <ul className="text-sm space-y-2">
        <li className="flex justify-between"><span>Website Revamp</span><Pill>Draft</Pill></li>
        <li className="flex justify-between"><span>Data Pipeline POC</span><Pill>Submitted</Pill></li>
        <li className="flex justify-between"><span>Mobile MVP</span><Pill>Draft</Pill></li>
      </ul>
    </Card>
  );
}
function NewProject() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<string>("");
  const [source, setSource] = useState<string>("");

  const generate = async () => {
    try {
      setStatus("loading");
      setResult("");
      setSource("");
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal, description }),
      });
      const data = await resp.json();
      setResult(data?.text || "");
      setSource(data?.source || "");
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Project Basics">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="label">Project Name
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Website Revamp"
            />
          </label>
          <label className="label">Goal
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Increase conversions"
            />
          </label>
          <label className="label md:col-span-2">Requirement Description
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key requirements, constraints, integrations..."
            />
          </label>
        </div>
      </Card>
      <Card
        title="Submit"
        right={<div className="text-sm opacity-70">LLM status: <Pill>{status === "idle" ? "Idle" : status === "loading" ? "Loading" : status === "done" ? (source || "Done") : "Error"}</Pill></div>}
      >
        <div className="flex items-center gap-3">
          <Button variant="outline">Save Draft</Button>
          <Button onClick={generate} disabled={status === "loading"} leftIcon={<IconPlusSquare />}>
            {status === "loading" ? "Generating..." : "Generate Recommendations"}
          </Button>
        </div>
      </Card>
      {result && (
        <Card title="LLM Recommendations" right={source ? <Pill>{source}</Pill> : undefined}>
          <pre className="whitespace-pre-wrap text-sm opacity-90">{result}</pre>
        </Card>
      )}
    </div>
  );
}
function History() {
  return (
    <Card title="Prompt / Response History">
      <ul className="space-y-3 text-sm">
        <li className="p-3 rounded-xl border dark:border-zinc-800"><div className="font-medium">Oct 20, 2025 – Project: Growth Analytics</div><div className="opacity-80">Prompt v3 · Response length: 1,242 chars · Rating: ★★★★☆</div></li>
        <li className="p-3 rounded-xl border dark:border-zinc-800"><div className="font-medium">Oct 12, 2025 – Project: CRM Migration</div><div className="opacity-80">Prompt v2 · Response length: 980 chars · Rating: ★★★☆☆</div></li>
      </ul>
    </Card>
  );
}
function Settings() {
  const [brand, setBrand] = useState<string>(() => localStorage.getItem('brandPrimary') || '#3b82f6');
  const applyBrand = () => {
    localStorage.setItem('brandPrimary', brand);
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(brand.trim());
    if (m) {
      const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
      document.documentElement.style.setProperty('--primary', `${r} ${g} ${b}`);
    }
  };
  return (
    <div className="space-y-4">
      <Card title="Account">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <label>First Name<Input className="mt-1" /></label>
          <label>Last Name<Input className="mt-1" /></label>
          <label className="md:col-span-2">Email<Input className="mt-1" type="email" /></label>
        </div>
      </Card>
      <Card title="Theme">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">Primary color
            <input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-9 w-12 p-0 border rounded" />
          </label>
          <Button onClick={applyBrand}>Save</Button>
        </div>
      </Card>
    </div>
  );
}

/* --- dark mode toggle (see section C) --- */
function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() =>
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);
  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="px-3 py-1.5 rounded-xl border text-sm"
      title="Toggle theme"
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}

/* --- app shell with routes --- */
export default function App() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  if (!isAuthenticated) {
    if (location.pathname === "/") return <Landing />;
    if (location.pathname === "/login") return <Login />;
    return <Navigate to="/login" replace />;
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      {/* Topbar */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-zinc-950/70 border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button aria-label="Open menu" className="md:hidden px-3 py-1.5 rounded-xl border text-sm" onClick={() => setSidebarOpen(true)}>
              Menu
            </button>
            <img src="/logo.svg" alt="Jenga Stacks" className="h-7 w-7" />
            <span className="font-semibold">Jenga Stacks</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <div className="text-sm opacity-80 hidden sm:block">{user?.email}</div>
                <Button variant="outline" onClick={logout}>Logout</Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px,1fr] gap-6">
        <aside className="space-y-2 hidden md:block">
          <NavButton to="/" label="Dashboard" icon={<IconDashboard />} />
          <NavButton to="/projects" label="Projects" icon={<IconProjects />} />
          <NavButton to="/new" label="New Project" icon={<IconPlusSquare />} />
          <NavButton to="/history" label="History" icon={<IconHistory />} />
          <NavButton to="/settings" label="Settings" icon={<IconSettings />} />
        </aside>

        <main className="pb-20">
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/new" element={<NewProject />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 card p-4 space-y-2 bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Jenga Stacks" className="h-6 w-6" />
                <span className="font-semibold">Menu</span>
              </div>
              <button className="px-2 py-1 text-sm border rounded-lg" onClick={() => setSidebarOpen(false)}>Close</button>
            </div>
            <div className="space-y-1" onClick={() => setSidebarOpen(false)}>
              <NavButton to="/" label="Dashboard" icon={<IconDashboard />} />
              <NavButton to="/projects" label="Projects" icon={<IconProjects />} />
              <NavButton to="/new" label="New Project" icon={<IconPlusSquare />} />
              <NavButton to="/history" label="History" icon={<IconHistory />} />
              <NavButton to="/settings" label="Settings" icon={<IconSettings />} />
            </div>
          </div>
        </div>
      )}
      <footer className="py-6 text-center opacity-70 text-xs">
        (c) {new Date().getFullYear()} Jenga Stacks - Frontend Shell
      </footer>
    </div>
  );
}

