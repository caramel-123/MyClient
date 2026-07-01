import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageCircle, ArrowLeft, Clock, DollarSign, Zap, Star } from "lucide-react";
import { CLIENT_PERSONAS } from "../lib/gemini";

const CATEGORIES = ["All", "Web Dev", "Mobile App", "Graphic Design", "Data Entry"];

const PROJECTS = [
  {
    id: 0,
    persona: CLIENT_PERSONAS[0],
    category: "Web Dev",
    difficulty: "Beginner",
    diffColor: "#77B255",
    time: "30-45 min",
    tags: ["HTML/CSS", "Menu Display", "Small Budget"],
    desc: "Build a menu display website for a local food business. Client is friendly but forgetful — expect scope changes.",
  },
  {
    id: 1,
    persona: CLIENT_PERSONAS[1],
    category: "Web Dev",
    difficulty: "Intermediate",
    diffColor: "#F59E0B",
    time: "45-60 min",
    tags: ["E-commerce", "Payments", "Impatient Client"],
    desc: "Online store for a sari-sari store owner expanding online. Client is impatient and vague — communication skills tested.",
  },
  {
    id: 2,
    persona: CLIENT_PERSONAS[2],
    category: "Graphic Design",
    difficulty: "Intermediate",
    diffColor: "#F59E0B",
    time: "40-55 min",
    tags: ["Portfolio", "Aesthetic", "Indecisive Client"],
    desc: "Fashion portfolio website for a boutique owner. Client keeps changing their mind — scope management is key.",
  },
  {
    id: 3,
    persona: CLIENT_PERSONAS[3],
    category: "Web Dev",
    difficulty: "Advanced",
    diffColor: "#E85D5D",
    time: "60-90 min",
    tags: ["Booking System", "Tech-savvy Client", "Complex"],
    desc: "Tutoring booking platform with scheduling. Client is technical and detail-oriented — your proposals must be airtight.",
  },
];

export default function ProjectSelectPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = PROJECTS.filter((p) => activeCategory === "All" || p.category === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F1" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4"
        style={{ background: "rgba(255,249,241,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(45,45,45,0.07)" }}
      >
        <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#6F6A62", fontFamily: "Inter, sans-serif" }}>
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex-1" />
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
            <MessageCircle className="w-4 h-4" style={{ color: "#2D2D2D" }} />
          </div>
          <span className="font-bold text-base hidden sm:block" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>MyClient</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Choose Your Client</h1>
          <p className="text-base" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
            Each simulation is a real project scenario. The AI client will message you first.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeCategory === c ? "#F5C542" : "#F8F2E7",
                color: "#2D2D2D",
                fontFamily: "Inter, sans-serif",
                border: "1.5px solid transparent",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group"
              style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
              onClick={() => navigate(`/simulation/${p.id}`)}
            >
              {/* Top accent */}
              <div className="h-1.5 w-full" style={{ background: p.diffColor }} />

              <div className="p-6 space-y-4">
                {/* Client info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
                    {p.persona.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-base" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{p.persona.name}</p>
                    <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{p.persona.business}</p>
                  </div>
                  <span
                    className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: `${p.diffColor}20`, color: p.diffColor, fontFamily: "Inter, sans-serif" }}
                  >
                    {p.difficulty}
                  </span>
                </div>

                {/* Project name */}
                <div>
                  <h3 className="font-bold text-lg capitalize" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
                    {p.persona.project}
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{p.desc}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-xl" style={{ background: "#F8F2E7", color: "#6F6A62", fontFamily: "Inter, sans-serif" }}>{t}</span>
                  ))}
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(45,45,45,0.07)" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6F6A62", fontFamily: "Inter, sans-serif" }}>
                      <Clock className="w-3.5 h-3.5" /> {p.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}>
                      <DollarSign className="w-3.5 h-3.5" style={{ color: "#77B255" }} /> {p.persona.budget}
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all group-hover:scale-105"
                    style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}
                  >
                    <Zap className="w-3 h-3" /> Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-8 p-5 rounded-2xl flex items-start gap-3" style={{ background: "rgba(245,197,66,0.1)", border: "1px dashed rgba(245,197,66,0.4)" }}>
          <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#B8941E" }} />
          <div>
            <p className="text-sm font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>How it works</p>
            <p className="text-sm mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
              The AI client messages you first. Ask the right questions, write a proposal, submit your work, handle QA feedback, and close the project. Each session is scored.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
