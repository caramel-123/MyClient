import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const STEPS = ["Your Info", "Your Role", "Experience"];

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "", experience: "" });

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) setStep(step + 1);
    else navigate("/dashboard");
  }

  const roles = ["CS / IT Student", "Design Student", "Business Student", "Self-taught Developer", "Other"];
  const levels = [
    { label: "Beginner", desc: "Never worked with clients" },
    { label: "Some experience", desc: "Had 1-2 small projects" },
    { label: "Intermediate", desc: "Done a few freelance gigs" },
    { label: "Advanced", desc: "Experienced but want to practice" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "#FFF9F1" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
            <MessageCircle className="w-5 h-5" style={{ color: "#2D2D2D" }} />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>MyClient</span>
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                  style={{
                    background: i < step ? "#77B255" : i === step ? "#F5C542" : "#F8F2E7",
                    color: i < step ? "#fff" : "#2D2D2D",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ fontFamily: "Inter, sans-serif", color: i === step ? "#2D2D2D" : "#6F6A62" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{ background: i < step ? "#77B255" : "rgba(45,45,45,0.1)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 space-y-6" style={{ background: "#FFFFFF", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(45,45,45,0.07)" }}>
          <form onSubmit={next} className="space-y-6">
            {step === 0 && (
              <>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Create your account</h1>
                  <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>Start practicing with AI clients today</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-medium transition-all hover:shadow-md"
                  style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Inter, sans-serif", border: "1.5px solid rgba(45,45,45,0.1)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(45,45,45,0.1)" }} />
                  <span className="text-xs" style={{ color: "#6F6A62", fontFamily: "Inter, sans-serif" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(45,45,45,0.1)" }} />
                </div>
                {[{ label: "Full Name", key: "name", type: "text", placeholder: "Juan dela Cruz" }, { label: "Email", key: "email", type: "email", placeholder: "juan@email.com" }, { label: "Password", key: "password", type: "password", placeholder: "••••••••" }].map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      required
                      className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                      style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Inter, sans-serif", border: "1.5px solid transparent" }}
                      onFocus={(e) => (e.target.style.border = "1.5px solid #F5C542")}
                      onBlur={(e) => (e.target.style.border = "1.5px solid transparent")}
                    />
                  </div>
                ))}
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>What's your role?</h1>
                  <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>This helps us tailor your simulations</p>
                </div>
                <div className="space-y-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className="w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all"
                      style={{
                        background: form.role === r ? "rgba(245,197,66,0.15)" : "#F8F2E7",
                        color: "#2D2D2D",
                        border: form.role === r ? "1.5px solid #F5C542" : "1.5px solid transparent",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Your experience level</h1>
                  <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>We'll match you with the right simulation difficulty</p>
                </div>
                <div className="space-y-3">
                  {levels.map((l) => (
                    <button
                      key={l.label}
                      type="button"
                      onClick={() => setForm({ ...form, experience: l.label })}
                      className="w-full text-left px-4 py-4 rounded-2xl transition-all"
                      style={{
                        background: form.experience === l.label ? "rgba(245,197,66,0.15)" : "#F8F2E7",
                        border: form.experience === l.label ? "1.5px solid #F5C542" : "1.5px solid transparent",
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{l.label}</p>
                      <p className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{l.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium"
                  style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", boxShadow: "0 6px 20px rgba(245,197,66,0.3)" }}
              >
                {step < STEPS.length - 1 ? "Continue" : "Start Simulating"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#2D2D2D" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
