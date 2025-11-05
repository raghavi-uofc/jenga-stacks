import React, { useEffect, useState, useRef } from "react";
import { NavLink, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
            <Button onClick={() => navigate('/app/new')}>New Project</Button>
            <Button variant="outline" onClick={() => navigate('/app/import')}>Import Team</Button>
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

function ImportTeam() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [error, setError] = useState<string>("");
  const [importing, setImporting] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [serverMsg, setServerMsg] = useState<string>("");
  const [imported, setImported] = useState<Array<{name:string;email:string;role:string}>>([]);
  const [loadingImported, setLoadingImported] = useState<boolean>(false);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
    if (lines.length === 0) return [] as Array<Record<string, string>>;
    const headers = lines[0].split(",").map((h) => h.trim());
    const headersLC = headers.map((h) => h.toLowerCase());
    return lines.slice(1).map((line) => {
      const cols = line.split(",");
      const obj: Record<string, string> = {};
      headersLC.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
      return obj;
    });
  };

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setRows([]);
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        if (file.name.toLowerCase().endsWith(".json")) {
          const data = JSON.parse(text);
          const arr = Array.isArray(data) ? data : [];
          const normalized = arr.map((it: any) => ({
            name: String(it.name ?? ""),
            email: String(it.email ?? ""),
            role: String(it.role ?? "")
          }));
          setRows(normalized);
        } else {
          const parsed = parseCSV(text);
          setRows(parsed);
        }
      } catch (err) {
        setError("Failed to parse file. Use CSV or JSON.");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  };

  const toMember = (r: Record<string, string>) => ({
    name: (r as any).name ?? r["name"] ?? r["Name"] ?? "",
    email: (r as any).email ?? r["email"] ?? r["Email"] ?? "",
    role: (r as any).role ?? r["role"] ?? r["Role"] ?? "",
  });

  const importRows = async () => {
    try {
      setImporting("loading");
      setServerMsg("");
      const items = rows.map(toMember).filter((m) => String(m.email).trim().length);
      if (!items.length) {
        setImporting("error");
        setServerMsg('No valid rows found. Ensure headers include name,email,role and emails are present.');
        return;
      }
      const resp = await fetch('/api/teams/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try {
          const errJson = await resp.json();
          if (errJson?.error) msg = errJson.error;
        } catch {}
        throw new Error(msg);
      }
      const data = await resp.json();
      setServerMsg(`Imported: ${data.inserted} new, ${data.updated} updated. Total: ${data.total}.`);
      setImporting("done");
      await loadImported();
    } catch (e) {
      setImporting("error");
      setServerMsg(e instanceof Error ? `Import failed: ${e.message}` : 'Import failed');
    }
  };

  const loadImported = async () => {
    try {
      setLoadingImported(true);
      const resp = await fetch('/api/teams');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setImported(Array.isArray(data?.items) ? data.items : []);
    } catch (_) {
      // ignore for now
    } finally {
      setLoadingImported(false);
    }
  };

  useEffect(() => {
    loadImported();
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Import Team" right={<span className="text-sm opacity-70">CSV or JSON</span>}>
        <div className="space-y-3">
          <p className="text-sm opacity-80">Select a CSV (headers: name,email,role) or a JSON array of objects with those fields. Data is processed locally in your browser.</p>
          <div className="flex items-center gap-3">
            <Button onClick={onPickFile}>Choose file</Button>
            <input ref={fileInputRef} type="file" accept=".csv,.json" className="hidden" onChange={onFileChange} />
            <span className="text-sm opacity-70 truncate max-w-[50ch]">{fileName || "No file selected"}</span>
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        </div>
      </Card>

      {rows.length > 0 && (
        <Card title={`Preview (${rows.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-1 pr-4">Name</th>
                  <th className="py-1 pr-4">Email</th>
                  <th className="py-1 pr-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-zinc-800">
                    <td className="py-1 pr-4">{r.name || r["name"] || ""}</td>
                    <td className="py-1 pr-4">{r.email || r["email"] || ""}</td>
                    <td className="py-1 pr-4">{r.role || r["role"] || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && (
              <div className="text-xs opacity-70 mt-2">Showing first 50 rows</div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={importRows} disabled={importing === 'loading'}>
              {importing === 'loading' ? 'Importing…' : 'Import'}
            </Button>
            <span className="text-sm opacity-70">Sends to backend and upserts by email.</span>
            {serverMsg && <span className="text-sm opacity-80">{serverMsg}</span>}
          </div>
        </Card>
      )}

      <Card title="Imported Members" right={<div className="text-sm opacity-70">{loadingImported ? 'Loading…' : `${imported.length} total`} <Button variant="outline" onClick={loadImported}>Refresh</Button></div>}>
        {imported.length === 0 ? (
          <div className="text-sm opacity-70">No members imported yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-1 pr-4">Name</th>
                  <th className="py-1 pr-4">Email</th>
                  <th className="py-1 pr-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {imported.slice(0, 100).map((m, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-zinc-800">
                    <td className="py-1 pr-4">{m.name}</td>
                    <td className="py-1 pr-4">{m.email}</td>
                    <td className="py-1 pr-4">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {imported.length > 100 && (
              <div className="text-xs opacity-70 mt-2">Showing first 100 rows</div>
            )}
          </div>
        )}
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
  // Always show public landing on "/" regardless of auth
  if (location.pathname === "/") {
    return <Landing />;
  }
  // Public login page (support force view even if signed in)
  if (location.pathname === "/login") {
    const params = new URLSearchParams(location.search);
    const force = params.get("force") === "1";
    if (isAuthenticated && !force) return <Navigate to="/app" replace />;
    return <Login />;
  }
  // For any /app routes, require auth
  if (!isAuthenticated && location.pathname.startsWith("/app")) {
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
          <NavButton to="/app" label="Dashboard" icon={<IconDashboard />} />
          <NavButton to="/app/projects" label="Projects" icon={<IconProjects />} />
          <NavButton to="/app/new" label="New Project" icon={<IconPlusSquare />} />
          <NavButton to="/app/history" label="History" icon={<IconHistory />} />
          <NavButton to="/app/settings" label="Settings" icon={<IconSettings />} />
        </aside>

        <main className="pb-20">
          <Routes location={location}>
            {/* public routes are handled before the app shell renders */}
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/projects" element={<Projects />} />
            <Route path="/app/new" element={<NewProject />} />
            <Route path="/app/import" element={<ImportTeam />} />
            <Route path="/app/history" element={<History />} />
            <Route path="/app/settings" element={<Settings />} />
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
              <NavButton to="/app" label="Dashboard" icon={<IconDashboard />} />
              <NavButton to="/app/projects" label="Projects" icon={<IconProjects />} />
              <NavButton to="/app/new" label="New Project" icon={<IconPlusSquare />} />
              <NavButton to="/app/history" label="History" icon={<IconHistory />} />
              <NavButton to="/app/settings" label="Settings" icon={<IconSettings />} />
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

