import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
 MessageCircle,
 Lightbulb,
 BarChart3,
 Users,
 Zap,
 Trophy,
 ChevronRight,
 ArrowRight,
 CheckCircle,
 Star,
 Send,
 Paperclip,
 Menu,
 X,
 Github,
 Twitter,
 Linkedin,
 Play,
 Brain,
 Target,
 RefreshCw,
 Award,
 TrendingUp,
 Clock,
 DollarSign,
 FileText,
} from "lucide-react";

// Typing animation hook 
function useTypingEffect(text: string, speed = 40, delay = 0) {
 const [displayed, setDisplayed] = useState( "");
 const [done, setDone] = useState(false);
 useEffect(() => {
 setDisplayed( "");
 setDone(false);
 const t = setTimeout(() => {
 let i = 0;
 const iv = setInterval(() => {
 i++;
 setDisplayed(text.slice(0, i));
 if (i >= text.length) {
 clearInterval(iv);
 setDone(true);
 }
 }, speed);
 return () => clearInterval(iv);
 }, delay);
 return () => clearTimeout(t);
 }, [text, speed, delay]);
 return { displayed, done };
}

// Chat preview component 
function ChatPreview() {
 const msg1 = useTypingEffect(
"Hi! Can you help me build a website for my food business? Budget ₱5,000.",
 28,
 400
 );
 const msg2 = useTypingEffect( "What challenge are you currently facing?", 32, 2600);
 const msg3 = useTypingEffect(
"Customers keep missing our menu. I keep losing orders!",
 28,
 4800
 );

 return (
 <div className= "relative">
 {/* Phone frame */}
 <div
 className= "relative mx-auto w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl"
 style={{ background: "linear-gradient(135deg, #FFF9F1 0%, #F8F2E7 100%)", border: "1.5px solid rgba(245,197,66,0.25)" }}
 >
 {/* Chat header */}
 <div className= "flex items-center gap-3 px-5 py-4 border-b border-black/5" style={{ background: "#FFFFFF" }}>
 <div className= "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
 AI
 </div>
 <div>
 <p className= "text-sm font-semibold leading-none" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Maria Santos</p>
 <p className= "text-xs mt-0.5" style={{ color: "#77B255" }}> Active client</p>
 </div>
 <div className= "ml-auto flex items-center gap-1.5">
 <span className= "text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FFF9F1", color: "#6F6A62", fontFamily: "Inter, sans-serif" }}>Discovery</span>
 </div>
 </div>

 {/* Messages */}
 <div className= "px-4 py-4 space-y-3 min-h-[260px]">
 {/* AI bubble */}
 {msg1.displayed && (
 <div className= "flex gap-2 items-end">
 <div className= "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#F5C542", color: "#2D2D2D" }}>AI</div>
 <div className= "rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[78%] text-sm leading-snug shadow-sm" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}>
 {msg1.displayed}
 {!msg1.done && <span className= "inline-block w-0.5 h-3.5 ml-0.5 animate-pulse" style={{ background: "#2D2D2D", verticalAlign: "middle" }} />}
 </div>
 </div>
 )}

 {/* Hint bubble */}
 {msg1.done && (
 <div className= "flex items-center gap-2 px-3 py-2 rounded-xl mx-1" style={{ background: "rgba(119,178,85,0.12)", border: "1px dashed #77B255" }}>
 <Lightbulb className= "w-3.5 h-3.5 flex-shrink-0" style={{ color: "#77B255" }} />
 <p className= "text-xs" style={{ color: "#4a8a35", fontFamily: "Inter, sans-serif" }}>
 Ask about the client's current problem first.
 </p>
 </div>
 )}

 {/* Student bubble */}
 {msg2.displayed && (
 <div className= "flex justify-end">
 <div className= "rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[78%] text-sm leading-snug shadow-sm" style={{ background: "#F8F2E7", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}>
 {msg2.displayed}
 {!msg2.done && <span className= "inline-block w-0.5 h-3.5 ml-0.5 animate-pulse" style={{ background: "#2D2D2D", verticalAlign: "middle" }} />}
 </div>
 </div>
 )}

 {/* AI response */}
 {msg3.displayed && (
 <div className= "flex gap-2 items-end">
 <div className= "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#F5C542", color: "#2D2D2D" }}>AI</div>
 <div className= "rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[78%] text-sm leading-snug shadow-sm" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Inter, sans-serif" }}>
 {msg3.displayed}
 {!msg3.done && <span className= "inline-block w-0.5 h-3.5 ml-0.5 animate-pulse" style={{ background: "#2D2D2D", verticalAlign: "middle" }} />}
 </div>
 </div>
 )}
 </div>

 {/* Input bar */}
 <div className= "flex items-center gap-2 px-4 py-3 border-t border-black/5" style={{ background: "#FFFFFF" }}>
 <Paperclip className= "w-4 h-4 flex-shrink-0" style={{ color: "#6F6A62" }} />
 <div className= "flex-1 rounded-full px-3 py-1.5 text-xs" style={{ background: "#F8F2E7", color: "#6F6A62", fontFamily: "Inter, sans-serif" }}>
 Type your reply…
 </div>
 <div className= "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F5C542" }}>
 <Send className= "w-3.5 h-3.5" style={{ color: "#2D2D2D" }} />
 </div>
 </div>
 </div>

 {/* Floating badges */}
 <div className= "absolute -left-6 top-16 px-3 py-2 rounded-2xl shadow-lg flex items-center gap-2" style={{ background: "#FFFFFF", border: "1px solid rgba(245,197,66,0.3)" }}>
 <Star className= "w-4 h-4" style={{ color: "#F5C542" }} />
 <div>
 <p className= "text-xs font-semibold leading-none" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Score</p>
 <p className= "text-xs" style={{ color: "#77B255", fontFamily: "Inter, sans-serif" }}>88/100</p>
 </div>
 </div>

 <div className= "absolute -right-4 top-1/2 px-3 py-2 rounded-2xl shadow-lg flex items-center gap-2" style={{ background: "#FFFFFF", border: "1px solid rgba(245,197,66,0.3)" }}>
 <DollarSign className= "w-4 h-4" style={{ color: "#77B255" }} />
 <div>
 <p className= "text-xs font-semibold leading-none" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Payment</p>
 <p className= "text-xs" style={{ color: "#77B255", fontFamily: "Inter, sans-serif" }}>₱5,500 sent</p>
 </div>
 </div>

 <div className= "absolute -right-2 bottom-20 px-3 py-2 rounded-2xl shadow-lg flex items-center gap-2" style={{ background: "#FFFFFF", border: "1px solid rgba(245,197,66,0.3)" }}>
 <RefreshCw className= "w-4 h-4" style={{ color: "#F59E0B" }} />
 <div>
 <p className= "text-xs font-semibold leading-none" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Revision</p>
 <p className= "text-xs" style={{ color: "#F59E0B", fontFamily: "Inter, sans-serif" }}>Round 2</p>
 </div>
 </div>
 </div>
 );
}

// Nav 
function Nav() {
 const [open, setOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);

 useEffect(() => {
 const handler = () => setScrolled(window.scrollY > 20);
 window.addEventListener( "scroll", handler);
 return () => window.removeEventListener( "scroll", handler);
 }, []);

 return (
 <nav
 className= "fixed top-0 left-0 right-0 z-50 transition-all duration-300"
 style={{
 background: scrolled ?"rgba(255,249,241,0.92)" : "transparent",
 backdropFilter: scrolled ?"blur(16px)" : "none",
 borderBottom: scrolled ?"1px solid rgba(45,45,45,0.08)" : "none",
 }}
 >
 <div className= "max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
 {/* Logo */}
 <div className= "flex items-center gap-2">
 <img src="/logo.png" alt="MyClient" className="w-8 h-8 object-contain" />
 <span className= "text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
 MyClient
 </span>
 </div>

 {/* Desktop links */}
 <div className= "hidden md:flex items-center gap-8">
 {["Features", "How It Works", "Demo", "About"].map((l) => (
 <a
 key={l}
 href= "#"
 className= "text-sm transition-colors hover:opacity-70"
 style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}
 >
 {l}
 </a>
 ))}
 </div>

 {/* CTA */}
 <div className= "hidden md:flex items-center gap-3">
 <Link
 to= "/login"
 className= "text-sm px-4 py-2 rounded-xl transition-opacity hover:opacity-70"
 style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}
 >
 Log in
 </Link>
 <Link
 to= "/signup"
 className= "text-sm px-5 py-2 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95"
 style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}
 >
 Start Free
 </Link>
 </div>

 {/* Mobile menu toggle */}
 <button className= "md:hidden" onClick={() => setOpen(!open)}>
 {open ? <X className= "w-5 h-5" style={{ color: "#2D2D2D" }} /> : <Menu className= "w-5 h-5" style={{ color: "#2D2D2D" }} />}
 </button>
 </div>

 {/* Mobile menu */}
 {open && (
 <div className= "md:hidden px-6 pb-6 pt-2 space-y-3" style={{ background: "rgba(255,249,241,0.97)", borderBottom: "1px solid rgba(45,45,45,0.08)" }}>
 {["Features", "How It Works", "Demo", "About"].map((l) => (
 <a key={l} href= "#" className= "block text-sm py-2" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{l}</a>
 ))}
 <Link
 to= "/signup"
 className= "w-full block text-center text-sm px-5 py-3 rounded-xl font-semibold"
 style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}
 >
 Start Free
 </Link>
 </div>
 )}
 </nav>
 );
}

// Hero 
function Hero() {
 return (
 <section
 className= "relative min-h-screen flex items-center overflow-hidden pt-16"
 style={{ background: "linear-gradient(160deg, #FFF9F1 0%, #FFF3DC 60%, #FFF9F1 100%)" }}
 >
 {/* Background decorations */}
 <div className= "absolute inset-0 pointer-events-none overflow-hidden">
 <div className= "absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #F5C542 0%, transparent 70%)" }} />
 <div className= "absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #F5C542 0%, transparent 70%)" }} />
 </div>

 <div className= "relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
 {/* Left */}
 <div className= "reveal space-y-8">
 <div className= "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: "rgba(245,197,66,0.15)", color: "#B8941E", fontFamily: "Inter, sans-serif", border: "1px solid rgba(245,197,66,0.3)" }}>
 <Zap className= "w-3.5 h-3.5" />
 SparkFest 2026 — AI-Powered Learning
 </div>

 <h1
 className= "text-5xl lg:text-6xl font-bold leading-tight"
 style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
 >
 Learn to Work With Clients{ ""}
 <span style={{ color: "#F5C542", position: "relative" }}>
 Before Getting
 <span
 className= "absolute bottom-0 left-0 right-0 h-3 -z-10 translate-y-1 rounded"
 style={{ background: "rgba(245,197,66,0.25)" }}
 />
 </span>{ ""}
 Real Ones
 </h1>

 <p
 className= "text-lg leading-relaxed"
 style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62", maxWidth: "480px" }}
 >
 Practice discovery, proposals, revisions, and delivery through realistic AI client conversations. The AI messages you first — just like a real client would.
 </p>

 <div className= "flex flex-wrap gap-4">
 <Link
 to= "/projects"
 className= "flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all hover:scale-105 active:scale-95 shadow-lg"
 style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", boxShadow: "0 8px 24px rgba(245,197,66,0.35)" }}
 >
 Start Simulation
 <ArrowRight className= "w-4 h-4" />
 </Link>
 <Link
 to= "/login"
 className= "flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all hover:bg-white"
 style={{ background: "transparent", color: "#2D2D2D", fontFamily: "Poppins, sans-serif", border: "1.5px solid rgba(45,45,45,0.15)" }}
 >
 <Play className= "w-4 h-4" />
 Log In
 </Link>
 </div>

 <div className= "flex items-center gap-6 pt-2">
 {[
 { n: "500+", label: "Students trained" },
 { n: "4.8", label: "Avg. rating" },
 { n: "Free", label: "For students" },
 ].map((s) => (
 <div key={s.label}>
 <p className= "text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.n}</p>
 <p className= "text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.label}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Right — chat preview */}
 <div className= "reveal flex justify-center lg:justify-end" style={{ transitionDelay: '150ms' } as React.CSSProperties}>
 <div className= "w-full max-w-sm lg:max-w-[360px]">
 <ChatPreview />
 </div>
 </div>
 </div>
 </section>
 );
}

// Problem section 
function ProblemSection() {
 const problems = [
 {
 icon: <MessageCircle className= "w-6 h-6" />,
 title: "Client Communication",
 desc: "Most students have never had to clarify requirements, manage expectations, or push back on scope changes professionally.",
 },
 {
 icon: <FileText className= "w-6 h-6" />,
 title: "Requirement Gathering",
 desc: "Real clients are vague, change their minds, and forget to mention things. Tutorials don't teach you how to handle that.",
 },
 {
 icon: <Target className= "w-6 h-6" />,
 title: "Scope Management",
 desc: "\"Can you add just one more thing?\" Scope creep kills projects. Students need safe practice saying no — or negotiating.",
 },
 ];

 return (
 <section className= "py-28" style={{ background: "#FFF9F1" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div className= "reveal text-center mb-16 space-y-4">
 <p className= "text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif", color: "#F5C542" }}>The Gap</p>
 <h2
 className= "text-4xl lg:text-5xl font-bold"
 style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
 >
 Students Learn Code —{ ""}
 <span style={{ color: "#F5C542" }}>But Not Clients</span>
 </h2>
 <p className= "text-lg max-w-xl mx-auto" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
 CS and IT programs teach you how to build things. They don't teach you how to survive a real client relationship.
 </p>
 </div>

 <div className= "grid grid-cols-1 md:grid-cols-3 gap-6">
 {problems.map((p, i) => (
 <div
 key={p.title}
 className= "reveal p-8 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl group"
 style={{ transitionDelay: `${i * 120}ms` } as React.CSSProperties}
 style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
 >
 <div className= "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors group-hover:scale-110" style={{ background: "rgba(245,197,66,0.15)", color: "#B8941E" }}>
 {p.icon}
 </div>
 <h3 className= "text-lg font-bold mb-3" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{p.title}</h3>
 <p className= "text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{p.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

// How it works 
function HowItWorks() {
 const steps = [
 {
 n: "01",
 title: "Discovery",
 sub: "Chat with AI client",
 desc: "The AI messages you first with a project brief. Ask the right questions to uncover real requirements.",
 icon: <MessageCircle className= "w-5 h-5" />,
 color: "#F5C542",
 },
 {
 n: "02",
 title: "Proposal",
 sub: "Write and revise scope",
 desc: "Draft a project proposal. The AI gives realistic feedback until the scope is locked in.",
 icon: <FileText className= "w-5 h-5" />,
 color: "#77B255",
 },
 {
 n: "03",
 title: "Build & QA",
 sub: "Receive realistic revisions",
 desc: "Submit your deliverable. The AI switches to QA Analyst mode with specific UI/UX and bug feedback.",
 icon: <RefreshCw className= "w-5 h-5" />,
 color: "#F59E0B",
 },
 {
 n: "04",
 title: "Delivery",
 sub: "Negotiate and finalize",
 desc: "Close the project professionally. Accept, negotiate, or push back. Simulated payment is released.",
 icon: <Award className= "w-5 h-5" />,
 color: "#2D2D2D",
 },
 ];

 return (
 <section className= "py-28" style={{ background: "#F8F2E7" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div className= "reveal text-center mb-16 space-y-4">
 <p className= "text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif", color: "#F5C542" }}>The Journey</p>
 <h2 className= "text-4xl lg:text-5xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
 The Full Freelance Lifecycle
 </h2>
 <p className= "text-lg max-w-lg mx-auto" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
 Four phases. Real skills. Zero risk. The complete client experience in a safe simulation.
 </p>
 </div>

 <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
 {steps.map((s, i) => (
 <div
 key={s.n}
 className= "reveal relative p-7 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl"
 style={{ transitionDelay: `${i * 100}ms` } as React.CSSProperties}
 style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
 >
 {/* Step number */}
 <p className= "text-5xl font-black mb-4 opacity-10 leading-none select-none" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.n}</p>
 {/* Icon */}
 <div className= "w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: s.color, color: s.n === "04" ?"#F5C542" : "#2D2D2D" }}>
 {s.icon}
 </div>
 <h3 className= "font-bold text-lg mb-1" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.title}</h3>
 <p className= "text-xs font-semibold mb-3" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.sub}</p>
 <p className= "text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.desc}</p>
 {/* Arrow connector */}
 {i < steps.length - 1 && (
 <div className= "hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
 <ChevronRight className= "w-5 h-5" style={{ color: "#D9CFC0" }} />
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

// Features grid 
function Features() {
 const features = [
 {
 icon: <Brain className= "w-5 h-5" />,
 title: "AI Client Messenger",
 desc: "Gemini-powered chat that feels exactly like a real messaging conversation with a client.",
 color: "#F5C542",
 big: true,
 },
 {
 icon: <Users className= "w-5 h-5" />,
 title: "Client Personas",
 desc: "Multiple personalities — demanding, friendly, vague, technical, indecisive.",
 color: "#77B255",
 },
 {
 icon: <Target className= "w-5 h-5" />,
 title: "QA Analyst Mode",
 desc: "After submission, AI switches to reviewer giving hyper-specific UI/UX feedback.",
 color: "#F59E0B",
 },
 {
 icon: <RefreshCw className= "w-5 h-5" />,
 title: "Scope Creep Engine",
 desc: "AI randomly introduces new feature requests mid-project — just like real life.",
 color: "#E85D5D",
 },
 {
 icon: <Lightbulb className= "w-5 h-5" />,
 title: "Hint System",
 desc: "Subtle nudges that guide students without giving away answers.",
 color: "#F5C542",
 },
 {
 icon: <BarChart3 className= "w-5 h-5" />,
 title: "Scoring Dashboard",
 desc: "Post-session scores: Communication, Scope Management, Professionalism.",
 color: "#77B255",
 big: true,
 },
 {
 icon: <TrendingUp className= "w-5 h-5" />,
 title: "Progress Tracker",
 desc: "Dashboard showing completed projects, skill earned, and growth over time.",
 color: "#F59E0B",
 },
 {
 icon: <Trophy className= "w-5 h-5" />,
 title: "Leaderboard",
 desc: "Top students ranked by score — healthy competition drives improvement.",
 color: "#2D2D2D",
 },
 ];

 return (
 <section className= "py-28" style={{ background: "#FFF9F1" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div className= "reveal text-center mb-16 space-y-4">
 <p className= "text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif", color: "#F5C542" }}>Features</p>
 <h2 className= "text-4xl lg:text-5xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
 Everything You Need to Practice
 </h2>
 </div>

 <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
 {features.map((f, i) => (
 <div
 key={f.title}
 className={`reveal p-7 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl group cursor-default ${f.big ?"md:col-span-2" : ""}`}
 style={{ transitionDelay: `${i * 80}ms` } as React.CSSProperties}
 style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
 >
 <div className= "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: f.color, color: f.color === "#2D2D2D" ?"#F5C542" : "#2D2D2D" }}>
 {f.icon}
 </div>
 <h3 className= "font-bold text-base mb-2" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{f.title}</h3>
 <p className= "text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{f.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

// Demo / Score section 
function DemoSection() {
 const scores = [
 { label: "Communication", value: 88, color: "#F5C542" },
 { label: "Scope Mgmt.", value: 75, color: "#77B255" },
 { label: "Professionalism", value: 92, color: "#F59E0B" },
 ];

 return (
 <section className= "py-28" style={{ background: "#F8F2E7" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div className= "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
 {/* Left — simulation preview */}
 <div className= "reveal space-y-5">
 <p className= "text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif", color: "#F5C542" }}>Live Demo</p>
 <h2 className= "text-4xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
 See the Simulation in Action
 </h2>
 <p className= "text-lg leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
 Watch as the AI plays a real client — messaging first, giving feedback, asking for revisions, and finally releasing payment.
 </p>

 {/* Mini chat log */}
 <div className= "rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
 <div className= "px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(45,45,45,0.07)" }}>
 <div className= "w-3 h-3 rounded-full" style={{ background: "#E85D5D" }} />
 <div className= "w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} />
 <div className= "w-3 h-3 rounded-full" style={{ background: "#77B255" }} />
 <span className= "ml-2 text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>myclient.app — QA Analyst Mode</span>
 </div>
 <div className= "p-5 space-y-3">
 {[
 { who: "AI", text: "I checked it! The button sa homepage — can you make it green instead of blue?", qa: true },
 { who: "AI", text: "Also yung card sa right side, parang malayo sa left side.", qa: true },
 { who: "You", text: "Sure! For the button and card alignment, I'll fix that right away.", qa: false },
 { who: "AI", text: "Oh, and can you add a login page? I forgot to mention that kanina.", qa: true },
 { who: "You", text: "That would affect our timeline and budget. Would adding ₱500 and 1 day work?", qa: false },
 { who: "AI", text: "Ah true. Deal! ₱500 extra and 1 day. Go lang.", qa: true },
 ].map((m, i) => (
 <div key={i} className={`flex ${m.who === "You" ?"justify-end" : "justify-start"}`}>
 <div
 className= "px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-snug"
 style={{
 background: m.who === "You" ?"#F8F2E7" : "#F5C542",
 color: "#2D2D2D",
 fontFamily: "Inter, sans-serif",
 borderBottomLeftRadius: m.who === "AI" ?"4px" : undefined,
 borderBottomRightRadius: m.who === "You" ?"4px" : undefined,
 }}
 >
 {m.text}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Right — score cards */}
 <div className= "reveal space-y-6" style={{ transitionDelay: '150ms' } as React.CSSProperties}>
 <div className= "p-8 rounded-3xl" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
 <div className= "flex items-center justify-between mb-6">
 <h3 className= "font-bold text-lg" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>Session Score</h3>
 <span className= "px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "rgba(119,178,85,0.15)", color: "#4a8a35", fontFamily: "Inter, sans-serif" }}>
 Completed 
 </span>
 </div>

 <div className= "space-y-5">
 {scores.map((s) => (
 <div key={s.label}>
 <div className= "flex items-center justify-between mb-2">
 <span className= "text-sm font-medium" style={{ fontFamily: "Inter, sans-serif", color: "#2D2D2D" }}>{s.label}</span>
 <span className= "text-sm font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.value}/100</span>
 </div>
 <div className= "h-2.5 rounded-full overflow-hidden" style={{ background: "#F8F2E7" }}>
 <div
 className= "h-full rounded-full transition-all duration-1000"
 style={{ width: `${s.value}%`, background: s.color }}
 />
 </div>
 </div>
 ))}
 </div>

 <div className= "mt-8 pt-6 border-t" style={{ borderColor: "rgba(45,45,45,0.07)" }}>
 <div className= "flex items-center justify-between">
 <div>
 <p className= "text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>Payment Received</p>
 <p className= "text-2xl font-bold mt-1" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>₱5,500</p>
 </div>
 <div className= "flex gap-2">
 {["", "", ""].map((e, i) => (
 <div key={i} className= "w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{ background: "#F8F2E7" }}>{e}</div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className= "grid grid-cols-2 gap-4">
 {[
 { label: "Revisions Handled", value: "3", icon: <RefreshCw className= "w-4 h-4" /> },
 { label: "Scope Changes", value: "+1", icon: <Target className= "w-4 h-4" /> },
 { label: "Negotiation Win", value: "Yes", icon: <CheckCircle className= "w-4 h-4" /> },
 { label: "Time Spent", value: "42 min", icon: <Clock className= "w-4 h-4" /> },
 ].map((s) => (
 <div key={s.label} className= "p-5 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)" }}>
 <div className= "w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(245,197,66,0.15)", color: "#B8941E" }}>
 {s.icon}
 </div>
 <p className= "text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{s.value}</p>
 <p className= "text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{s.label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}

// Impact section 
function Impact() {
 const impacts = [
 {
 emoji: "",
 title: "Learn by Doing",
 desc: "No more passive tutorials. Every session is a real simulated project from brief to delivery.",
 },
 {
 emoji: "",
 title: "Build Confidence",
 desc: "Fail safely. Experiment with different communication styles before it matters in real life.",
 },
 {
 emoji: "",
 title: "Prepare for Freelancing",
 desc: "Graduate knowing how to write proposals, scope projects, and handle difficult clients.",
 },
 {
 emoji: "",
 title: "Simulate Industry Experience",
 desc: "Gemini AI plays your client with a real persona — vague, indecisive, realistic.",
 },
 ];

 return (
 <section className= "py-28" style={{ background: "#FFF9F1" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div className= "reveal text-center mb-16 space-y-4">
 <p className= "text-sm font-semibold uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif", color: "#F5C542" }}>Why MyClient</p>
 <h2 className= "text-4xl lg:text-5xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>
 Built for Students Who Want to Go Further
 </h2>
 </div>

 <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
 {impacts.map((item, i) => (
 <div
 key={item.title}
 className= "reveal flex gap-5 p-7 rounded-3xl transition-all hover:shadow-lg hover:-translate-y-0.5"
 style={{ transitionDelay: `${i * 100}ms`, background: "#FFFFFF", border: "1px solid rgba(45,45,45,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" } as React.CSSProperties}
 >
 <div className= "text-3xl flex-shrink-0">{item.emoji}</div>
 <div>
 <h3 className= "font-bold text-base mb-2" style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}>{item.title}</h3>
 <p className= "text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{item.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

// CTA 
function CTA() {
 return (
 <section className= "py-28" style={{ background: "#F8F2E7" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div
 className= "reveal relative text-center px-8 py-20 rounded-[32px] overflow-hidden"
 style={{
 background: "linear-gradient(135deg, #F5C542 0%, #F8D96B 50%, #F5C542 100%)",
 boxShadow: "0 24px 64px rgba(245,197,66,0.35)",
 }}
 >
 {/* bg circles */}
 <div className= "absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20" style={{ background: "#2D2D2D" }} />
 <div className= "absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15" style={{ background: "#2D2D2D" }} />

 <p className= "relative text-sm font-semibold uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif", color: "rgba(45,45,45,0.6)" }}>
 Free for students
 </p>
 <h2
 className= "relative text-4xl lg:text-5xl font-bold mb-6"
 style={{ fontFamily: "Poppins, sans-serif", color: "#2D2D2D" }}
 >
 Ready for your first client?
 </h2>
 <p
 className= "relative text-lg mb-10 max-w-md mx-auto"
 style={{ fontFamily: "Inter, sans-serif", color: "rgba(45,45,45,0.7)" }}
 >
 Start a simulation in seconds. No credit card. No setup. Just you and your first AI client.
 </p>
 <Link
 to= "/projects"
 className= "relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-xl"
 style={{ background: "#2D2D2D", color: "#F5C542", fontFamily: "Poppins, sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
 >
 Start Simulation
 <ArrowRight className= "w-4 h-4" />
 </Link>
 </div>
 </div>
 </section>
 );
}

// Footer 
function Footer() {
 return (
 <footer className= "py-16" style={{ background: "#2D2D2D" }}>
 <div className= "max-w-6xl mx-auto px-6">
 <div className= "reveal grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
 {/* Brand */}
 <div className= "md:col-span-2 space-y-4">
 <div className= "flex items-center gap-2">
 <div className= "w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
 <MessageCircle className= "w-4 h-4" style={{ color: "#2D2D2D" }} />
 </div>
 <span className= "text-lg font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>MyClient</span>
 </div>
 <p className= "text-sm leading-relaxed max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
 AI-powered client simulation for the next generation of student freelancers. A SparkFest 2026 project.
 </p>
 <div className= "flex items-center gap-3">
 {[
 { icon: <Github className= "w-4 h-4" />, label: "GitHub" },
 { icon: <Twitter className= "w-4 h-4" />, label: "Twitter" },
 { icon: <Linkedin className= "w-4 h-4" />, label: "LinkedIn" },
 ].map((s) => (
 <a
 key={s.label}
 href= "#"
 className= "w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
 style={{ background: "rgba(255,255,255,0.07)", color: "#6F6A62" }}
 aria-label={s.label}
 >
 {s.icon}
 </a>
 ))}
 </div>
 </div>

 {/* Links */}
 <div>
 <h4 className= "font-semibold mb-4 text-white text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Product</h4>
 <ul className= "space-y-2">
 {["Features", "How It Works", "Demo", "Leaderboard", "Pricing"].map((l) => (
 <li key={l}>
 <a href= "#" className= "text-sm transition-colors hover:text-white" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{l}</a>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className= "font-semibold mb-4 text-white text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Project</h4>
 <ul className= "space-y-2">
 {["SparkFest 2026", "GitHub Repo", "About Us", "Contact", "SDG 9 & 11"].map((l) => (
 <li key={l}>
 <a href= "#" className= "text-sm transition-colors hover:text-white" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{l}</a>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className= "pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
 <p className= "text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>
 © 2026 MyClient — SparkFest Hackathon Entry · Built with Gemini API + Firebase
 </p>
 <div className= "flex items-center gap-4">
 {["Privacy", "Terms", "Cookie Policy"].map((l) => (
 <a key={l} href= "#" className= "text-xs transition-colors hover:text-white" style={{ fontFamily: "Inter, sans-serif", color: "#6F6A62" }}>{l}</a>
 ))}
 </div>
 </div>
 </div>
 </footer>
 );
}

// Root
export default function App() {
 useEffect(() => {
  const obs = new IntersectionObserver(
   entries => entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting)),
   { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
  return () => obs.disconnect()
 }, [])

 return (
 <div className= "min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
 <Nav />
 <Hero />
 <ProblemSection />
 <HowItWorks />
 <Features />
 <DemoSection />
 <Impact />
 <CTA />
 <Footer />
 </div>
 );
}
