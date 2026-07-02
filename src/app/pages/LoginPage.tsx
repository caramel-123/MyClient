import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageCircle, Mail, ArrowRight, Github } from "lucide-react";
import { signInWithGoogle, auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (e: any) {
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FFF9F1" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ background: "linear-gradient(160deg, #F5C542 0%, #F8D96B 100%)" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(45,45,45,0.15)" }}>
            <MessageCircle className="w-5 h-5" style={{ color: "#2D2D2D" }} />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>MyClient</span>
        </Link>

        <div className="space-y-6">
          {/* Mock chat preview */}
          <div className="rounded-3xl p-6 space-y-4 max-w-sm" style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(12px)" }}>
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#2D2D2D", color: "#F5C542" }}>AI</div>
              <div className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm" style={{ background: "rgba(255,255,255,0.7)", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}>
                Hi! Pwede mo ba akong tulungan? Gusto ko magpagawa ng website. Budget ₱5,000 
              </div>
            </div>
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-sm px-4 py-3 text-sm max-w-[80%]" style={{ background: "#2D2D2D", color: "#F5C542", fontFamily: "Inter, sans-serif" }}>
                Sure! What problem are you currently facing with your business?
              </div>
            </div>
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#2D2D2D", color: "#F5C542" }}>AI</div>
              <div className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm" style={{ background: "rgba(255,255,255,0.7)", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}>
                Customers keep missing our menu. Lagi silang nagtatanong! 
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
              Your next client is waiting.
            </h2>
            <p className="text-base" style={{ fontFamily: "Inter, sans-serif", color: "rgba(45,45,45,0.7)" }}>
              Practice real client conversations and build confidence before the real thing.
            </p>
          </div>
        </div>

        <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "rgba(45,45,45,0.5)" }}>
          SparkFest 2026 · GDG PUP · DOST PUP PYLON
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
              <MessageCircle className="w-5 h-5" style={{ color: "#2D2D2D" }} />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>MyClient</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Welcome back</h1>
            <p className="text-base" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>Sign in to continue your simulations</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center" style={{ fontFamily: "Inter, sans-serif" }}>{error}</p>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-60"
            style={{ background: "#FFFFFF", color: "#2D2D2D", border: "1.5px solid rgba(45,45,45,0.12)", fontFamily: "Inter, sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: "rgba(45,45,45,0.1)" }} />
            <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(45,45,45,0.1)" }} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6F6A62" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Inter, sans-serif", border: "1.5px solid transparent" }}
                  onFocus={(e) => (e.target.style.border = "1.5px solid #F5C542")}
                  onBlur={(e) => (e.target.style.border = "1.5px solid transparent")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>Password</label>
                <a href="#" className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#F5C542" }}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Inter, sans-serif", border: "1.5px solid transparent" }}
                onFocus={(e) => (e.target.style.border = "1.5px solid #F5C542")}
                onBlur={(e) => (e.target.style.border = "1.5px solid transparent")}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", boxShadow: "0 6px 20px rgba(245,197,66,0.35)" }}
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold" style={{ color: "#2D2D2D" }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
