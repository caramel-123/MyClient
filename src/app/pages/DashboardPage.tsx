import { Link, useNavigate } from "react-router";
import {
  MessageCircle, BarChart3, Trophy, User, Settings,
  Play, CheckCircle, Star, TrendingUp, ArrowRight, Zap, LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard", to: "/dashboard", active: true },
  { icon: <Play className="w-5 h-5" />, label: "Projects", to: "/projects" },
  { icon: <Trophy className="w-5 h-5" />, label: "Leaderboard", to: "#" },
  { icon: <User className="w-5 h-5" />, label: "Profile", to: "#" },
  { icon: <Settings className="w-5 h-5" />, label: "Settings", to: "#" },
];

const RECENT_SESSIONS = [
  { client: "Maria Santos", project: "Food Menu Website", score: 88, status: "Completed", date: "Today" },
  { client: "Kuya Jun", project: "Online Store", score: 74, status: "Completed", date: "Yesterday" },
  { client: "Ate Bea", project: "Fashion Portfolio", score: null, status: "In Progress", date: "Today" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex" style={{ background: "#FFF9F1" }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 p-6 fixed top-0 left-0 h-full"
        style={{ background: "#F8F2E7", borderRight: "1px solid rgba(45,45,45,0.07)" }}
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
            <MessageCircle className="w-5 h-5" style={{ color: "#2D2D2D" }} />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>MyClient</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all"
              style={{
                background: item.active ? "#F5C542" : "transparent",
                color: item.active ? "#2D2D2D" : "#6F6A62",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all hover:bg-white/50"
          style={{ color: "#6F6A62", fontFamily: "Inter, sans-serif" }}
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-sm mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>Good day 👋</p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Welcome back, Juan!</h1>
          </div>
          <Link
            to="/projects"
            className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", boxShadow: "0 6px 20px rgba(245,197,66,0.3)" }}
          >
            <Zap className="w-4 h-4" /> New Simulation
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Simulations", value: "12", icon: <Play className="w-5 h-5" />, color: "#F5C542" },
            { label: "Completed", value: "9", icon: <CheckCircle className="w-5 h-5" />, color: "#77B255" },
            { label: "Avg. Score", value: "81", icon: <Star className="w-5 h-5" />, color: "#F59E0B" },
            { label: "Rank", value: "#4", icon: <Trophy className="w-5 h-5" />, color: "#E85D5D" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-3xl"
              style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.color, color: "#2D2D2D" }}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent sessions */}
          <div className="lg:col-span-2 rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Recent Sessions</h2>
              <Link to="/projects" className="text-sm font-medium flex items-center gap-1" style={{ color: "#F5C542", fontFamily: "Inter, sans-serif" }}>
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {RECENT_SESSIONS.map((s) => (
                <div
                  key={s.client}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
                  style={{ background: "#F8F2E7" }}
                  onClick={() => s.status === "In Progress" && navigate("/simulation/0")}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
                    {s.client[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.client}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.project}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {s.score !== null ? (
                      <p className="text-sm font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.score}/100</p>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(245,197,66,0.2)", color: "#B8941E", fontFamily: "Inter, sans-serif" }}>
                        In Progress
                      </span>
                    )}
                    <p className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill breakdown */}
          <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Skill Progress</h2>
            <div className="space-y-5">
              {[
                { label: "Communication", value: 83, color: "#F5C542" },
                { label: "Scope Mgmt.", value: 71, color: "#77B255" },
                { label: "Professionalism", value: 89, color: "#F59E0B" },
                { label: "Negotiation", value: 65, color: "#E85D5D" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>{s.label}</span>
                    <span className="text-xs font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.value}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "#F8F2E7" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl" style={{ background: "rgba(245,197,66,0.1)", border: "1px dashed rgba(245,197,66,0.4)" }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" style={{ color: "#B8941E" }} />
                <p className="text-xs font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Next milestone</p>
              </div>
              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
                Complete 3 more simulations to unlock the "Negotiator" badge.
              </p>
            </div>
          </div>
        </div>

        {/* Start new CTA */}
        <div
          className="mt-6 p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg, #F5C542 0%, #F8D96B 100%)", boxShadow: "0 8px 32px rgba(245,197,66,0.25)" }}
        >
          <div>
            <h3 className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Ready for a new client?</h3>
            <p className="text-sm mt-1" style={{ fontFamily: "Inter, sans-serif", color: "rgba(45,45,45,0.65)" }}>
              Pick a project brief and start your next simulation now.
            </p>
          </div>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-105 flex-shrink-0"
            style={{ background: "#2D2D2D", color: "#F5C542", fontFamily: "Poppins, sans-serif" }}
          >
            Start Simulation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
