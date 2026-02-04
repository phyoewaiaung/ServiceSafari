import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

export default function App() {
  const [message, setMessage] = useState("Initializing User Dashboard...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [services, setServices] = useState({
    frontend: {
      status: "running",
      port: 3000,
      name: "User Dashboard",
      tech: "React",
      icon: "⚛️",
      category: "frontend",
    },
    gateway: {
      status: "pending",
      port: 3001,
      name: "API Gateway",
      tech: "Node.js",
      icon: "🚪",
      category: "backend",
    },
    auth: {
      status: "pending",
      port: 3002,
      name: "Auth Service",
      tech: "Laravel",
      icon: "🔐",
      category: "backend",
    },
    analytics: {
      status: "pending",
      port: 3003,
      name: "Analytics",
      tech: "Python",
      icon: "📊",
      category: "backend",
    },
  });

  const fetchServiceStatus = async (isManualRetry = false) => {
    try {
      setLoading(true);
      if (isManualRetry) {
        setIsRetrying(true);

        // Update only services that are actually checked via API to show retrying status
        setServices((prev) => ({
          ...prev,
          gateway: { ...prev.gateway, status: "retrying", error: null },
          auth: { ...prev.auth, status: "retrying", error: null },
          analytics: { ...prev.analytics, status: "retrying", error: null },
        }));

        setMessage("Retrying connection to Docker containers...");
      }
      setError(null);

      // Use localhost when accessing from browser, gateway when running inside container
      const apiUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:3001"
          : "http://gateway:3001";

      const response = await axios.get(`${apiUrl}/api/status`, {
        timeout: 5000,
      });
      const gatewayData = response.data;

      setIsRetrying(false);

      // Update services based on actual API response
      const authService = gatewayData.services.find((s) => s.key === "auth");
      const analyticsService = gatewayData.services.find(
        (s) => s.key === "analytics",
      );

      setServices((prev) => ({
        ...prev,
        gateway: {
          ...prev.gateway,
          status: "running",
          error: null,
        },
        auth: {
          ...prev.auth,
          status: authService?.status || "error",
          error: authService?.error,
        },
        analytics: {
          ...prev.analytics,
          status: analyticsService?.status || "error",
          error: analyticsService?.error,
        },
      }));

      // Calculate running count from updated services
      const updatedServices = {
        gateway: { status: "running" },
        auth: { status: authService?.status || "error" },
        analytics: { status: analyticsService?.status || "error" },
        frontend: { status: "running" },
      };

      const runningCount = Object.values(updatedServices).filter(
        (s) => s.status === "running",
      ).length;
      const totalCount = Object.values(updatedServices).length;

      if (runningCount === totalCount) {
        setMessage("All Docker containers running successfully");
      } else {
        setMessage(`${runningCount}/${totalCount} containers running`);
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to connect to gateway:", err);
      setIsRetrying(false);

      // Reset backend services to error state with specific Docker error messages
      setServices((prev) => ({
        ...prev,
        gateway: {
          ...prev.gateway,
          status: "error",
          error: "Gateway container not responding",
        },
        auth: {
          ...prev.auth,
          status: "error",
          error: "Auth service container may not be running",
        },
        analytics: {
          ...prev.analytics,
          status: "error",
          error: "Analytics service container may not be running",
        },
      }));

      setError("Docker services unavailable");
      setMessage("Some Docker containers are not running");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceStatus();
  }, []);

  const handleRefresh = () => {
    if (loading) return;
    fetchServiceStatus(true);
  };

  const handleContainerControl = async (service, action) => {
    try {
      setLoading(true);
      setMessage(
        `${action === "start" ? "Starting" : "Stopping"} ${service}...`,
      );

      const response = await axios.post(
        `${window.location.hostname === "localhost" ? "http://localhost:3001" : "http://gateway:3001"}/api/containers/${service}/${action}`,
      );

      setMessage(response.data.message);

      // Refresh status after a short delay to allow container to start/stop
      setTimeout(() => {
        fetchServiceStatus();
      }, 2000);
    } catch (error) {
      console.error(`Failed to ${action} ${service}:`, error);
      setError(
        `Failed to ${action} ${service}: ${error.response?.data?.error || error.message}`,
      );
      setMessage(`Failed to ${action} ${service}`);
    } finally {
      setLoading(false);
    }
  };

  const allServices = Object.values(services);
  const runningCount = allServices.filter((s) => s.status === "running").length;
  const totalCount = allServices.length;
  const health = Math.round((runningCount / totalCount) * 100);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="h-full max-w-[1800px] mx-auto p-4 flex flex-col gap-4">
        {/* HEADER */}
        <header className="flex items-center justify-between backdrop-blur-xl bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl">
              🐳
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ServiceSafari</h1>
              <p className="text-sm text-slate-400">{message}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase">Health</div>
              <div className="text-xl font-bold text-emerald-400">
                {health}%
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              title="Refresh services"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg
                className={`w-5 h-5 relative z-10 transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 xl:overflow-hidden">
          {/* LEFT COLUMN */}
          <section className="xl:col-span-8 flex flex-col gap-4">
            {/* SERVICES OVERVIEW */}
            <div className="flex-1 backdrop-blur-xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-300 mb-4">
                Services Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allServices.map((s) => (
                  <div
                    key={s.name}
                    className="relative bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/40 transition"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                        s.status === "running"
                          ? "bg-emerald-500"
                          : s.status === "error"
                            ? "bg-red-500"
                            : s.status === "retrying"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-amber-500"
                      }`}
                    />
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{s.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-sm text-slate-400">{s.tech}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          :{s.port}
                        </div>
                        {s.error && (
                          <div className="text-xs text-red-400 mt-1 font-medium">
                            ⚠️ {s.error}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            s.status === "running"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : s.status === "error"
                                ? "bg-red-500/20 text-red-400"
                                : s.status === "retrying"
                                  ? "bg-blue-500/20 text-blue-400 animate-pulse"
                                  : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {s.status}
                        </span>

                        {/* Container Control Buttons */}
                        {s.category === "backend" && (
                          <div className="flex gap-1 mt-1">
                            {s.status === "running" ? (
                              <button
                                onClick={() =>
                                  handleContainerControl(
                                    s.name
                                      .toLowerCase()
                                      .replace(" ", "-")
                                      .replace("service", "-service"),
                                    "stop",
                                  )
                                }
                                disabled={loading}
                                className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Stop container"
                              >
                                ⏹️ Stop
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleContainerControl(
                                    s.name
                                      .toLowerCase()
                                      .replace(" ", "-")
                                      .replace("service", "-service"),
                                    "start",
                                  )
                                }
                                disabled={loading}
                                className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Start container"
                              >
                                ▶️ Start
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SYSTEM INFO */}
            <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-300 mb-3">
                Docker Environment
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Info label="Environment" value="Development" icon="🌐" />
                <Info label="Version" value="v1.0.0" icon="📦" />
                <Info
                  label="Last Check"
                  value={lastUpdate.toLocaleTimeString()}
                  icon="⏱️"
                />
              </div>

              <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                <div className="text-xs text-slate-400 mb-2">
                  💡 Docker Learning Tip
                </div>
                <div className="text-sm text-slate-300">
                  Each service runs in its own container. Use{" "}
                  <code className="bg-slate-800 px-1 rounded">
                    docker-compose ps
                  </code>{" "}
                  to check container status.
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <aside className="xl:col-span-4 backdrop-blur-xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-center">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-300 mb-6">
              Docker Container Stack
            </h2>

            <div className="flex flex-col items-center gap-4 text-center">
              <Flow icon="⚛️" label="React Container" />
              <Arrow />
              <Flow icon="🚪" label="Gateway Container" />
              <Arrow />
              <div className="grid grid-cols-2 gap-3">
                <Flow icon="🔐" label="Auth Container" />
                <Flow icon="📊" label="Analytics Container" />
              </div>
              <Arrow />
              <div className="grid grid-cols-2 gap-3">
                <Flow icon="🗄️" label="PostgreSQL Container" />
                <Flow icon="⚡" label="Redis Container" />
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl">
              <div className="text-xs text-slate-400 mb-2">
                🐳 Container Commands
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  <code className="bg-slate-800 px-1 rounded">
                    docker-compose up -d
                  </code>{" "}
                  - Start all
                </div>
                <div>
                  <code className="bg-slate-800 px-1 rounded">
                    docker-compose logs
                  </code>{" "}
                  - View logs
                </div>
                <div>
                  <code className="bg-slate-800 px-1 rounded">
                    docker-compose down
                  </code>{" "}
                  - Stop all
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ---------- small components ---------- */

function Info({ icon, label, value }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-xs uppercase text-slate-400">{label}</div>
        <div className="font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function Flow({ icon, label }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3">
      <div className="text-3xl">{icon}</div>
      <div className="text-sm font-semibold text-white mt-1">{label}</div>
    </div>
  );
}

function Arrow() {
  return <div className="text-slate-500 text-xl">↓</div>;
}
