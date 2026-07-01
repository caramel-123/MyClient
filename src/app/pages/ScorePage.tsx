import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { MessageCircle, Trophy, Star, ArrowRight, RotateCcw, TrendingUp, CheckCircle, Wallet } from "lucide-react";
import { getWalletBalance } from "../lib/gemini";

function ScoreRing({ value, color, label }: { value: number; color: string; label: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const step = setInterval(() => {
        current += 2;
        if (current >= value) { setDisplayed(value); clearInterval(step); }
        else setDisplayed(current);
      }, 16);
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" stroke="rgba(45,45,45,0.08)" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none" strokeWidth="8"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{displayed}</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-center" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>{label}</p>
    </div>
  );
}

function Badge({ label, icon, unlocked }: { label: string; icon: string; unlocked: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
      style={{
        background: unlocked ? "rgba(245,197,66,0.12)" : "#F8F2E7",
        border: `1.5px solid ${unlocked ? "#F5C542" : "transparent"}`,
        opacity: unlocked ? 1 : 0.4,
      }}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-semibold text-center" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>{label}</p>
      {unlocked && <CheckCircle className="w-3.5 h-3.5" style={{ color: "#77B255" }} />}
    </div>
  );
}

export default function ScorePage() {
  const [params] = useSearchParams();
  const comm = Number(params.get("comm")) || 72;
  const scope = Number(params.get("scope")) || 65;
  const prof = Number(params.get("prof")) || 80;
  const clientName = params.get("client") || "Maria Santos";
  const projectId = params.get("project") || "0";
  const avg = Math.round((comm + scope + prof) / 3);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowPayment(true), 1200);
    const t2 = setTimeout(() => setPaymentDone(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const getGrade = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "#77B255" };
    if (score >= 75) return { label: "Good", color: "#F5C542" };
    if (score >= 60) return { label: "Average", color: "#F59E0B" };
    return { label: "Needs Work", color: "#E85D5D" };
  };

  const grade = getGrade(avg);
  const walletBalance = getWalletBalance();

  const FEEDBACK: Record<string, { strength: string; improve: string }> = {
    comm: {
      strength: comm >= 75 ? "You asked clear, targeted questions and kept the conversation professional." : "You communicated, but could ask more specific questions.",
      improve: comm >= 75 ? "Try pausing more before sending each message." : "Ask about the client's problem before jumping to solutions.",
    },
    scope: {
      strength: scope >= 75 ? "You handled scope changes confidently and negotiated well." : "You engaged with scope changes.",
      improve: scope >= 75 ? "Always confirm scope impact in writing before starting." : "Always confirm budget/timeline before implementing new requests.",
    },
    prof: {
      strength: prof >= 75 ? "Your tone was consistently professional and client-friendly." : "You stayed generally professional.",
      improve: prof >= 75 ? "Add a brief confirmation message before each phase." : "Avoid one-word replies — always acknowledge before responding.",
    },
  };

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#FFF9F1" }}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
            <MessageCircle className="w-4 h-4" style={{ color: "#2D2D2D" }} />
          </div>
          <span className="font-bold text-base" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>MyClient</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ background: grade.color }}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mt-4" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
            Session Complete!
          </h1>
          <p className="text-base" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
            You worked with <span className="font-semibold" style={{ color: "#2D2D2D" }}>{clientName}</span> — here's your performance breakdown.
          </p>
        </div>

        {/* Payment animation */}
        <div
          className="p-5 rounded-2xl text-center transition-all duration-700"
          style={{
            background: paymentDone ? "rgba(119,178,85,0.12)" : showPayment ? "rgba(245,197,66,0.1)" : "#F8F2E7",
            border: `1.5px solid ${paymentDone ? "#77B255" : showPayment ? "#F5C542" : "transparent"}`,
            transform: showPayment ? "scale(1)" : "scale(0.95)",
            opacity: showPayment ? 1 : 0,
          }}
        >
          {!paymentDone ? (
            <p className="text-sm font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#B8941E" }}>
              💸 Sending payment...
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#77B255" }}>
                ✅ Payment received!
              </p>
              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
                {clientName} says: "Salamat! Highly recommend kita sa mga kakilala ko! 🙏"
              </p>
            </div>
          )}
        </div>

        {/* Wallet balance card */}
        {paymentDone && (
          <div className="flex items-center justify-between p-5 rounded-2xl" style={{ background: "#F0FDF4", border: "2px solid #86EFAC" }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#DCFCE7" }}>
                <Wallet className="w-5 h-5" style={{ color: "#16A34A" }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ fontFamily: "Inter, sans-serif", color: "#15803D" }}>Total Wallet Balance</p>
                <p className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#15803D" }}>
                  ₱{walletBalance.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "#16A34A", fontFamily: "Inter, sans-serif" }}>This project</p>
              <p className="text-sm font-bold" style={{ color: "#16A34A", fontFamily: "Poppins, sans-serif" }}>+{params.get("budget") ?? "₱5,000"}</p>
            </div>
          </div>
        )}

        {/* Score rings */}
        <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5" style={{ color: "#F5C542" }} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Your Score</h2>
            <span className="ml-auto text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: grade.color }}>{avg}/100</span>
            <span className="text-sm font-semibold px-2.5 py-1 rounded-full" style={{ background: `${grade.color}20`, color: grade.color, fontFamily: "Inter, sans-serif" }}>{grade.label}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ScoreRing value={comm} color="#F5C542" label="Communication" />
            <ScoreRing value={scope} color="#77B255" label="Scope Mgmt." />
            <ScoreRing value={prof} color="#F59E0B" label="Professionalism" />
          </div>
        </div>

        {/* Detailed feedback */}
        <div className="rounded-3xl p-6 space-y-5" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: "#77B255" }} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Detailed Feedback</h2>
          </div>
          {[
            { key: "comm", label: "Communication", score: comm, color: "#F5C542" },
            { key: "scope", label: "Scope Management", score: scope, color: "#77B255" },
            { key: "prof", label: "Professionalism", score: prof, color: "#F59E0B" },
          ].map((item) => {
            const fb = FEEDBACK[item.key];
            return (
              <div key={item.key} className="p-4 rounded-2xl space-y-2" style={{ background: "#F8F2E7" }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{item.label}</p>
                  <span className="text-sm font-bold" style={{ color: item.color, fontFamily: "Poppins, sans-serif" }}>{item.score}/100</span>
                </div>
                <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>
                  <span style={{ color: "#77B255" }}>✓</span> {fb.strength}
                </p>
                <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
                  <span style={{ color: "#F5C542" }}>→</span> {fb.improve}
                </p>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <div className="rounded-3xl p-6 space-y-4" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Achievements</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <Badge label="First Project" icon="🎯" unlocked={true} />
            <Badge label="Good Listener" icon="👂" unlocked={comm >= 70} />
            <Badge label="Scope Guard" icon="🛡️" unlocked={scope >= 75} />
            <Badge label="Pro Vibes" icon="💼" unlocked={prof >= 80} />
            <Badge label="High Scorer" icon="⭐" unlocked={avg >= 80} />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <Link
            to={`/simulation/${projectId}`}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", border: "1.5px solid rgba(45,45,45,0.1)" }}
          >
            <RotateCcw className="w-4 h-4" /> Replay This Client
          </Link>
          <Link
            to="/projects"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", boxShadow: "0 6px 20px rgba(245,197,66,0.3)" }}
          >
            New Client <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
