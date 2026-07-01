import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
 Search, Phone, Video, Info, Send, Lightbulb,
 CheckCircle, ChevronRight, Loader2, ExternalLink,
 Image, Smile, ThumbsUp, Paperclip, MessageCircle,
 MoreHorizontal, Wallet, Copy, Check, X, Sparkles, FileText, GripVertical,
} from "lucide-react";
import {
 CLIENT_PERSONAS, sendToGemini, generateHint,
 generateContextualTip, generateContextualResponse, generateProjectPrompt,
 addToWallet, getWalletBalance,
 PROPOSAL_PARTS, getProposalRecall, generateProposalSection, sendToProposalAssistant,
 DEAL_LOST_MARKER,
 type Message, type ClientPersona,
} from "../lib/gemini";

type Phase = "discovery" |"proposal" |"qa" |"delivery";

const PHASE_LABELS: Record<Phase, string> = {
 discovery: "Discovery",
 proposal: "Proposal",
 qa: "QA Review",
 delivery: "Delivery",
};
const PHASE_ORDER: Phase[] = ["discovery", "proposal", "qa", "delivery"];
const PHASE_COLORS: Record<Phase, string> = {
 discovery: "#3B82F6",
 proposal: "#F59E0B",
 qa: "#8B5CF6",
 delivery: "#10B981",
};

const SIDEBAR_CHATS = CLIENT_PERSONAS.map((p, i) => ({
 id: i,
 name: p.name,
 business: p.business,
 preview: p.initialMessage.slice(0, 40) +"…",
 time: ["Just now", "2m ago", "15m ago", "1h ago"][i],
 unread: i === 0 ? 1 : 0,
}));

function TypingIndicator() {
 return (
 <div className= "flex items-center gap-1 px-3 py-2">
 {[0, 1, 2].map((i) => (
 <span
 key={i}
 className= "w-2 h-2 rounded-full"
 style={{
 background: "#9CA3AF",
 animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
 }}
 />
 ))}
 <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
 </div>
 );
}

// Prompt Modal 
function PromptModal({ prompt, onClose }: { prompt: string; onClose: () => void }) {
 const [copied, setCopied] = useState(false);

 function copy() {
 navigator.clipboard.writeText(prompt);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }

 return (
 <div className= "fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
 <div className= "w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#FFFFFF" }}>
 {/* Header */}
 <div className= "flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
 <div className= "flex items-center gap-2">
 <div className= "w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
 <Sparkles className= "w-4 h-4" style={{ color: "#2D2D2D" }} />
 </div>
 <div>
 <p className= "text-sm font-bold" style={{ color: "#050505", fontFamily: "Poppins, sans-serif" }}>Your AI Build Prompt is Ready!</p>
 <p className= "text-xs" style={{ color: "#65676B" }}>Copy and paste this into ChatGPT, Claude, or v0.dev</p>
 </div>
 </div>
 <button onClick={onClose} className= "w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
 <X className= "w-4 h-4" style={{ color: "#65676B" }} />
 </button>
 </div>

 {/* Prompt content */}
 <div className= "p-5">
 <div
 className= "rounded-xl p-4 text-xs overflow-y-auto font-mono leading-relaxed"
 style={{ background: "#F7F8FA", color: "#374151", maxHeight: "340px", whiteSpace: "pre-wrap", border: "1px solid rgba(0,0,0,0.08)" }}
 >
 {prompt}
 </div>
 </div>

 {/* Actions */}
 <div className= "flex gap-3 px-5 pb-5">
 <button
 onClick={copy}
 className= "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
 style={{ background: copied ?"#10B981" : "#F5C542", color: copied ?"#fff" : "#050505", fontFamily: "Poppins, sans-serif" }}
 >
 {copied ? <><Check className= "w-4 h-4" /> Copied!</> : <><Copy className= "w-4 h-4" /> Copy Prompt</>}
 </button>
 <button
 onClick={onClose}
 className= "px-5 py-3 rounded-xl text-sm font-medium"
 style={{ background: "#F0F2F5", color: "#65676B" }}
 >
 Close
 </button>
 </div>
 </div>
 </div>
 );
}

// Wallet badge 
function WalletBadge({ balance }: { balance: number }) {
 return (
 <div className= "flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
 <Wallet className= "w-3.5 h-3.5" style={{ color: "#16A34A" }} />
 <span className= "text-xs font-bold" style={{ color: "#16A34A", fontFamily: "Poppins, sans-serif" }}>
 ₱{balance.toLocaleString()}
 </span>
 </div>
 );
}

// Gemini logo SVG
function GeminiLogo({ size = 16 }: { size?: number }) {
 return (
 <svg width={size} height={size} viewBox= "0 0 28 28" fill= "none" xmlns= "http://www.w3.org/2000/svg">
 <path d= "M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill= "url(#gemini_grad)"/>
 <defs>
 <linearGradient id= "gemini_grad" x1= "0" y1= "0" x2= "28" y2= "28" gradientUnits= "userSpaceOnUse">
 <stop offset= "0%" stopColor= "#4285F4"/>
 <stop offset= "50%" stopColor= "#9B72CB"/>
 <stop offset= "100%" stopColor= "#D96570"/>
 </linearGradient>
 </defs>
 </svg>
 );
}

// Response option derivation 
function deriveResponseOptions(response: string): { label: string; text: string; icon: string }[] {
 const opts: { label: string; text: string; icon: string }[] = [
 { label: "Standard", text: response, icon: "" },
 ];

 // Short variant: extract just the core question
 const questions = response.match(/[^.!?—\-]*\?/g) ?? [];
 const shortQ = questions[questions.length - 1]?.trim();
 if (shortQ && shortQ.length > 10 && shortQ.length < response.length * 0.82) {
 opts.push({ label: "Short", text: shortQ, icon: "" });
 }

 // Casual variant: brief opener + lowercase first char
 const casual = `Hm, tanong ko lang — ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
 if (casual !== response && opts.length < 3) {
 opts.push({ label: "Casual", text: casual, icon: "" });
 }

 return opts;
}

// Contextual tip bar 
function TipBar({ text, response, onUseResponse }: { text: string; response: string | null; onUseResponse: (r: string) => void }) {
 const [expanded, setExpanded] = useState(false);
 const options = response ? deriveResponseOptions(response) : [];

 return (
 <div className= "mx-4 mb-2 rounded-xl overflow-hidden" style={{ background: "#F8F2E7", border: "1px solid #E8DCC8" }}>
 {/* Tip row */}
 <div className= "flex items-center gap-2 px-3 py-2">
 <Lightbulb className= "w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B8941E" }} />
 <p className= "text-xs flex-1" style={{ color: "#6F6A62" }}>
 <span className= "font-semibold" style={{ color: "#2D2D2D" }}>Tip:</span> {text}
 </p>
 {response && (
 <button
 onClick={() => setExpanded((v) => !v)}
 title= "See response options"
 className= "flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 transition-all hover:scale-105 active:scale-95"
 style={{ background: expanded ?"#F5C542" : "#FFFFFF", border: "1px solid #E8DCC8" }}
 >
 <GeminiLogo size={13} />
 <span className= "text-xs font-semibold" style={{ color: expanded ?"#2D2D2D" : "#65676B" }}>
 {expanded ?"Close" : "Reply"}
 </span>
 </button>
 )}
 </div>

 {/* Expanded response options */}
 {expanded && options.length > 0 && (
 <div className= "px-3 pb-3 space-y-1.5 border-t" style={{ borderColor: "#E8DCC8" }}>
 <p className= "text-xs pt-2 font-semibold" style={{ color: "#B8941E" }}>Choose how to respond:</p>
 {options.map((opt, i) => (
 <button
 key={i}
 onClick={() => { onUseResponse(opt.text); setExpanded(false); }}
 className= "w-full text-left px-3 py-2 rounded-lg text-xs leading-relaxed transition-all hover:scale-[1.01] active:scale-[0.99]"
 style={{ background: "#FFFFFF", border: "1px solid #E8DCC8", color: "#2D2D2D" }}
 >
 <span className= "font-bold mr-1.5" style={{ color: "#B8941E" }}>{opt.icon} {opt.label}:</span>
 <span style={{ color: "#4B4540" }}>{opt.text.length > 100 ? opt.text.slice(0, 100) +"…" : opt.text}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 );
}

// Earn notification 
function EarnToast({ amount, onDone }: { amount: string; onDone: () => void }) {
 useEffect(() => {
 const t = setTimeout(onDone, 3500);
 return () => clearTimeout(t);
 }, [onDone]);

 return (
 <div
 className= "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
 style={{ background: "#FFFFFF", border: "2px solid #86EFAC", animation: "slideUp 0.3s ease" }}
 >
 <style>{`@keyframes slideUp{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}`}</style>
 <div className= "w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#DCFCE7" }}>
 <Wallet className= "w-4.5 h-4.5" style={{ color: "#16A34A", width: 18, height: 18 }} />
 </div>
 <div>
 <p className= "text-sm font-bold" style={{ color: "#15803D", fontFamily: "Poppins, sans-serif" }}>+{amount} earned!</p>
 <p className= "text-xs" style={{ color: "#16A34A" }}>Added to your wallet</p>
 </div>
 </div>
 );
}

// Resize Handle 
function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void }) {
 const [hovered, setHovered] = useState(false);
 return (
 <div
 onMouseDown={onMouseDown}
 onMouseEnter={() => setHovered(true)}
 onMouseLeave={() => setHovered(false)}
 className= "flex-shrink-0 flex items-center justify-center select-none z-10"
 style={{ width: "6px", cursor: "col-resize", background: hovered ?"#3B82F6" : "rgba(0,0,0,0.07)", transition: "background 0.15s" }}
 >
 <GripVertical className= "w-2.5 h-2.5 opacity-40" style={{ color: hovered ?"#fff" : "#6B7280" }} />
 </div>
 );
}

// Deal Lost Modal 
function DealLostModal({ clientName, onRetry }: { clientName: string; onRetry: () => void }) {
 return (
 <div
 className= "fixed inset-0 z-50 flex items-center justify-center p-4"
 style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", animation: "fadeIn 0.4s ease" }}
 >
 <style>{`
 @keyframes fadeIn{from{opacity:0}to{opacity:1}}
 @keyframes shakeX{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
 @keyframes slideUp2{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
 `}</style>
 <div
 className= "w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
 style={{ background: "#FFFFFF", animation: "slideUp2 0.5s ease 0.1s both" }}
 >
 {/* Red header */}
 <div className= "px-6 pt-8 pb-6 text-center" style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" }}>
 <div
 className= "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
 style={{ background: "rgba(255,255,255,0.2)", animation: "shakeX 0.6s ease 0.4s both" }}
 >
 <span style={{ fontSize: 40 }}></span>
 </div>
 <p className= "text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>Deal Lost!</p>
 <p className= "text-sm text-white mt-1" style={{ opacity: 0.85 }}>{clientName} walked away</p>
 </div>

 {/* Body */}
 <div className= "px-6 py-5 space-y-4">
 <div className= "rounded-2xl p-4 text-sm leading-relaxed" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}>
 <p className= "font-bold mb-1" style={{ color: "#7F1D1D" }}>What went wrong:</p>
 <ul className= "space-y-1 text-xs" style={{ color: "#991B1B" }}>
 <li>• You were rude or unprofessional to the client</li>
 <li>• Clients expect respectful, professional communication</li>
 <li>• Your reputation as a freelancer took a hit</li>
 </ul>
 </div>

 <div className= "rounded-2xl p-4 text-xs leading-relaxed" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534" }}>
 <p className= "font-bold mb-1">Pro tip:</p>
 <p>Even when frustrated, stay calm and professional. Real clients notice attitude — and they talk to other clients.</p>
 </div>

 <button
 onClick={onRetry}
 className= "w-full py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
 style={{ background: "#EF4444", color: "#FFFFFF", fontFamily: "Poppins, sans-serif" }}
 >
 Try Again with {clientName}
 </button>
 </div>
 </div>
 </div>
 );
}

// Proposal Form Panel 
function ProposalFormPanel({
 persona,
 messages,
 fields,
 onFieldChange,
}: {
 persona: ClientPersona;
 messages: Message[];
 fields: string[];
 onFieldChange: (i: number, v: string) => void;
}) {
 const [recallOpen, setRecallOpen] = useState<number | null>(null);
 const [generating, setGenerating] = useState<Set<number>>(new Set());
 const [showProposalModal, setShowProposalModal] = useState(false);
 const [proposalCopied, setProposalCopied] = useState(false);

 function assembleProposal(): string {
 const today = new Date().toLocaleDateString( "en-PH", { year: "numeric", month: "long", day: "numeric" });
 const lines: string[] = [];

 // Title block
 lines.push(`PROJECT PROPOSAL`);
 lines.push(`\nPrepared for: ${persona.name}`);
 lines.push(`${persona.business}`);
 lines.push(`${today}`);
 lines.push(`\n\n`);

 // Body — section heading + paragraph, no numbers
 PROPOSAL_PARTS.forEach((part, i) => {
 const content = fields[i]?.trim() ||"";
 lines.push(part);
 lines.push(`\n${content}\n`);
 });

 lines.push(``);
 lines.push(`Generated with MyClient — SparkFest 2026`);
 return lines.join( "\n");
 }

 function copyProposal() {
 navigator.clipboard.writeText(assembleProposal());
 setProposalCopied(true);
 setTimeout(() => setProposalCopied(false), 2000);
 }

 async function handleGenerate(i: number) {
 setGenerating((prev) => new Set(prev).add(i));
 setRecallOpen(null); // close any open recall panel before filling
 try {
 const text = await generateProposalSection(persona, i, PROPOSAL_PARTS[i], messages);
 onFieldChange(i, text);
 } catch {
 // silently fail — user can retry
 } finally {
 setGenerating((prev) => {
 const next = new Set(prev);
 next.delete(i);
 return next;
 });
 }
 }

 const allFilled = fields.every((f) => f.trim().length > 0);
 const filledCount = fields.filter((f) => f.trim().length > 0).length;

 return (
 <div className= "flex flex-col h-full border-r overflow-hidden" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
 {/* Panel header */}
 <div className= "flex-shrink-0 px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#FAFAFA" }}>
 <div className= "flex-1 min-w-0">
 <p className= "text-sm font-bold" style={{ color: "#050505", fontFamily: "Poppins, sans-serif" }}> Project Proposal Draft</p>
 <p className= "text-xs mt-0.5" style={{ color: "#65676B" }}>
 <span style={{ color: "#B8941E" }}></span> = recall &nbsp;·&nbsp; <span style={{ color: "#4285F4" }}></span> = AI draft
 {!allFilled && <span style={{ color: "#EF4444" }}> &nbsp;·&nbsp; {filledCount}/11 filled</span>}
 </p>
 </div>
 <button
 onClick={() => allFilled && setShowProposalModal(true)}
 disabled={!allFilled}
 title={allFilled ?"Generate full proposal" : `Fill all 11 sections first (${filledCount}/11 done)`}
 className= "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
 style={{ background: allFilled ?"#F5C542" : "#E5E7EB", color: allFilled ?"#2D2D2D" : "#9CA3AF", fontFamily: "Poppins, sans-serif" }}
 >
 <FileText className= "w-3.5 h-3.5" /> Generate
 </button>
 </div>

 {/* 11 cards */}
 <div className= "flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
 {PROPOSAL_PARTS.map((part, i) => (
 <div
 key={i}
 className= "rounded-xl border overflow-hidden"
 style={{ borderColor: "rgba(0,0,0,0.1)", background: "#FFFFFF" }}
 >
 {/* Card header */}
 <div
 className= "flex items-center gap-2 px-3 py-2 border-b"
 style={{ borderColor: "rgba(0,0,0,0.06)", background: "#F8F9FA" }}
 >
 <span
 className= "text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
 style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}
 >
 {i + 1}
 </span>
 <p className= "text-xs font-semibold flex-1 leading-tight" style={{ color: "#050505" }}>{part}</p>

 {/* Lightbulb — recall */}
 <button
 onClick={() => setRecallOpen(recallOpen === i ? null : i)}
 className= "w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
 style={{ background: recallOpen === i ?"#FEF3C7" : "#F0F2F5" }}
 title= "Recall client needs"
 >
 <Lightbulb className= "w-3.5 h-3.5" style={{ color: recallOpen === i ?"#B8941E" : "#65676B" }} />
 </button>

 {/* Gemini — generate draft */}
 <button
 onClick={() => handleGenerate(i)}
 disabled={generating.has(i)}
 className= "w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 flex-shrink-0"
 style={{ background: "#F0F2F5" }}
 title= "Generate with Gemini"
 >
 {generating.has(i) ? (
 <Loader2 className= "w-3.5 h-3.5 animate-spin" style={{ color: "#65676B" }} />
 ) : (
 <GeminiLogo size={14} />
 )}
 </button>
 </div>

 {/* Recall panel */}
 {recallOpen === i && (() => {
 const hasConversation = messages.filter((m) => m.role === "user").length > 0;
 return (
 <div
 className= "px-3 py-2 text-xs leading-relaxed border-b whitespace-pre-line"
 style={{ background: hasConversation ?"#FFFBEB" : "#F9FAFB", color: hasConversation ?"#78350F" : "#9CA3AF", borderColor: "rgba(0,0,0,0.06)" }}
 >
 {hasConversation
 ? getProposalRecall(persona, i)
 : " No info yet — go back to Discovery and chat with your client first. The more you ask, the more context you'll have here."}
 </div>
 );
 })()}

 {/* Textarea */}
 <textarea
 value={fields[i]}
 onChange={(e) => onFieldChange(i, e.target.value)}
 placeholder={`Write your ${part.toLowerCase()}…`}
 className= "w-full resize-none text-xs p-3 bg-transparent outline-none leading-relaxed"
 style={{ color: "#050505", minHeight: "68px" }}
 />
 </div>
 ))}
 <div className= "h-4" />
 </div>

 {/* Generate Proposal Modal */}
 {showProposalModal && (
 <div className= "fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
 <div className= "w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background: "#FFFFFF", maxHeight: "85vh" }}>
 {/* Header */}
 <div className= "flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
 <div className= "flex items-center gap-2">
 <div className= "w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5C542" }}>
 <FileText className= "w-4 h-4" style={{ color: "#2D2D2D" }} />
 </div>
 <div>
 <p className= "text-sm font-bold" style={{ color: "#050505", fontFamily: "Poppins, sans-serif" }}>Full Project Proposal</p>
 <p className= "text-xs" style={{ color: "#65676B" }}>Copy and send to {persona.name}</p>
 </div>
 </div>
 <button onClick={() => setShowProposalModal(false)} className= "w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
 <X className= "w-4 h-4" style={{ color: "#65676B" }} />
 </button>
 </div>
 {/* Content */}
 <div className= "flex-1 overflow-y-auto p-5">
 <div
 className= "rounded-xl p-4 text-xs font-mono leading-relaxed"
 style={{ background: "#F7F8FA", color: "#374151", whiteSpace: "pre-wrap", border: "1px solid rgba(0,0,0,0.08)" }}
 >
 {assembleProposal()}
 </div>
 </div>
 {/* Actions */}
 <div className= "flex gap-3 px-5 pb-5 pt-2 flex-shrink-0 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
 <button
 onClick={copyProposal}
 className= "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
 style={{ background: proposalCopied ?"#10B981" : "#F5C542", color: proposalCopied ?"#fff" : "#050505", fontFamily: "Poppins, sans-serif" }}
 >
 {proposalCopied ? <><Check className= "w-4 h-4" /> Copied!</> : <><Copy className= "w-4 h-4" /> Copy Proposal</>}
 </button>
 <button
 onClick={() => setShowProposalModal(false)}
 className= "px-5 py-3 rounded-xl text-sm font-medium"
 style={{ background: "#F0F2F5", color: "#65676B" }}
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// Main Page 
export default function SimulationPage() {
 const { projectId } = useParams();
 const navigate = useNavigate();
 const activeId = Number(projectId) ?? 0;
 const persona = CLIENT_PERSONAS[activeId] ?? CLIENT_PERSONAS[0];

 const [phase, setPhase] = useState<Phase>( "discovery");
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState( "");
 const [loading, setLoading] = useState(false);
 const [hint, setHint] = useState<string | null>(null);
 const [contextualTip, setContextualTip] = useState<string | null>(null);
 const [contextualResponse, setContextualResponse] = useState<string | null>(null);
 const [showSubmit, setShowSubmit] = useState(false);
 const [deliverableUrl, setDeliverableUrl] = useState( "");
 const [showDeliverableInput, setShowDeliverableInput] = useState(false);
 const [showInfo, setShowInfo] = useState(false);
 const [scores, setScores] = useState({ comm: 0, scope: 0, prof: 0 });
 const [walletBalance, setWalletBalance] = useState(getWalletBalance);
 const [showEarnToast, setShowEarnToast] = useState(false);
 const [earnAmount, setEarnAmount] = useState( "");
 const [projectPrompt, setProjectPrompt] = useState<string | null>(null);
 const [showPromptModal, setShowPromptModal] = useState(false);
 const [dealLost, setDealLost] = useState(false);
 const [dealLostMessage, setDealLostMessage] = useState( "");
 const [sidebarWidth, setSidebarWidth] = useState(288);
 const [proposalSplit, setProposalSplit] = useState(55); // percentage of main area
 const [proposalChatPanelWidth, setProposalChatPanelWidth] = useState(260);
 const mainAreaRef = useRef<HTMLDivElement>(null);
 const sidebarResizeRef = useRef({ startX: 0, startW: 0 });
 const proposalResizeRef = useRef({ startX: 0, startPct: 0, containerW: 0 });
 const proposalChatPanelResizeRef = useRef({ startX: 0, startW: 0 });
 const invalidLinkCountRef = useRef(0);
 const [proposalFields, setProposalFields] = useState<string[]>(() => Array(11).fill( ""));
 const [proposalChat, setProposalChat] = useState<Message[]>([
 { role: "model", text: "Hi! I'm your AI proposal coach. Ask me anything about what to write in each section — or paste a draft and I'll help you improve it." },
 ]);
 const [proposalChatInput, setProposalChatInput] = useState( "");
 const [proposalChatLoading, setProposalChatLoading] = useState(false);
 const proposalChatEndRef = useRef<HTMLDivElement>(null);
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLTextAreaElement>(null);
 const sendingRef = useRef(false);

 useEffect(() => {
 const init: Message = { role: "model", text: persona.initialMessage };
 setMessages([init]);
 setPhase( "discovery");
 const initMsgs: Message[] = [{ role: "model", text: persona.initialMessage }];
 setHint(generateHint( "discovery", 0));
 setContextualTip(generateContextualTip(initMsgs, "discovery", persona));
 setContextualResponse(generateContextualResponse(initMsgs, "discovery", persona));
 setShowSubmit(false);
 setShowDeliverableInput(false);
 setInput( "");
 setProjectPrompt(null);
 setDealLost(false);
 setDealLostMessage( "");
 setProposalFields(Array(11).fill( ""));
 setProposalChat([{ role: "model", text: "Hi! I'm your AI proposal coach. Ask me anything about what to write in each section — or paste a draft and I'll help you improve it." }]);
 setProposalChatInput( "");
 if (inputRef.current) inputRef.current.style.height = "auto";
 }, [persona]);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, loading]);

 useEffect(() => {
 const count = messages.filter((m) => m.role === "user").length;
 setScores({
 comm: Math.min(95, 40 + count * 8),
 scope: Math.min(90, 30 + count * 7),
 prof: Math.min(98, 50 + count * 6),
 });
 }, [messages]);

 // Split a client reply into 2–3 natural chat bubbles
 function splitClientMessage(text: string): string[] {
 if (text.length < 70) return [text];
 // Split on sentence endings
 const sentRe = /[^.!?]*[.!?]+["']?\s*/g;
 const sentences = (text.match(sentRe) ?? []).map((s) => s.trim()).filter(Boolean);
 if (sentences.length <= 1) return [text];
 // Group into at most 3 bubbles
 if (sentences.length === 2) return sentences;
 const mid = Math.ceil(sentences.length / 2);
 return [
 sentences.slice(0, mid).join( "").trim(),
 sentences.slice(mid).join( "").trim(),
 ].filter(Boolean);
 }

 async function sendMessage(overrideText?: string) {
 const text = (overrideText ?? input).trim();
 if (!text || loading || sendingRef.current) return;
 sendingRef.current = true;
 const userMsg: Message = { role: "user", text };
 const newMessages = [...messages, userMsg];
 setMessages(newMessages);
 setInput( "");
 setContextualTip(null);
 setContextualResponse(null);
 setLoading(true);
 if (inputRef.current) inputRef.current.style.height = "auto";

 try {
 const reply = await sendToGemini(newMessages, persona, phase);

 // Client walked away — handle before splitting
 if (reply.includes(DEAL_LOST_MARKER)) {
 const finalMsg = reply.replace(DEAL_LOST_MARKER, "").trim();
 const walkDelay = Math.max(1800, Math.min(4500, finalMsg.length * 30));
 await new Promise((r) => setTimeout(r, walkDelay));
 setMessages([...newMessages, { role: "model" as const, text: finalMsg }]);
 setDealLostMessage(finalMsg);
 setTimeout(() => setDealLost(true), 1800);
 return;
 }

 // Split into 2–3 bubbles and reveal each with its own typing delay
 const chunks = splitClientMessage(reply);
 let accMessages: Message[] = [...newMessages];

 for (let i = 0; i < chunks.length; i++) {
 const chunk = chunks[i];
 // Longer delay: ~35ms per char, 1.8s min, 5s max
 const delay = Math.max(1800, Math.min(5000, chunk.length * 35));
 await new Promise((r) => setTimeout(r, delay));

 accMessages = [...accMessages, { role: "model" as const, text: chunk }];
 setMessages([...accMessages]);

 // Between bubbles: brief pause then re-show typing indicator
 if (i < chunks.length - 1) {
 await new Promise((r) => setTimeout(r, 500));
 setLoading(true);
 }
 }

 const updated = accMessages;
 const userCount = updated.filter((m) => m.role === "user").length;
 const modelCount = updated.filter((m) => m.role === "model").length;
 setHint(generateHint(phase, modelCount - 1));
 setContextualTip(generateContextualTip(updated, phase, persona));
 setContextualResponse(generateContextualResponse(updated, phase, persona));

 const minExchanges = phase === "discovery" ? 7 : 2;
 if (userCount >= minExchanges) setShowSubmit(true);
 } catch {
 setMessages((prev) => [...prev, { role: "model", text: "Sorry, may technical issue. Try again ulit!" }]);
 } finally {
 setLoading(false);
 sendingRef.current = false;
 }
 }

 function advancePhase() {
 const nextIndex = PHASE_ORDER.indexOf(phase) + 1;

 if (nextIndex >= PHASE_ORDER.length) {
 // Project complete — pay out wallet
 const earned = addToWallet(persona.budget);
 setWalletBalance(earned);
 setEarnAmount(persona.budget);
 setShowEarnToast(true);
 setTimeout(() => {
 navigate(`/score?comm=${scores.comm}&scope=${scores.scope}&prof=${scores.prof}&project=${activeId}&client=${encodeURIComponent(persona.name)}&budget=${encodeURIComponent(persona.budget)}`);
 }, 2000);
 return;
 }

 const next = PHASE_ORDER[nextIndex];
 setPhase(next);
 setShowSubmit(false);
 setContextualTip(null);
 setContextualResponse(null);
 setHint(null);
 setShowDeliverableInput(false);

 const systemMsgs: Record<string, string> = {
 proposal: "Okay! Please send me your project proposal — yung timeline, deliverables, at pricing.",
 qa: "Nice! I'm ready to review your work. Please send me the link to your prototype or deliverable.",
 delivery: "Okay, final check na! Send me the final version para ma-review ko.",
 };
 if (systemMsgs[next]) {
 setMessages((prev) => [...prev, { role: "model", text: systemMsgs[next] }]);
 }

 if (next === "qa") {
 setShowDeliverableInput(true);
 // Generate the build prompt when moving to QA (deal is closed, build phase begins)
 const prompt = generateProjectPrompt(persona, messages);
 setProjectPrompt(prompt);
 setShowPromptModal(true);
 }

 if (next === "proposal") {
 setContextualTip( "Send your proposal — include timeline, deliverables, and a pricing breakdown.");
 setContextualResponse( "Hi po! Here's my project proposal:\n\n Deliverables: Home, Menu, About, Contact pages\n⏱ Timeline: 5 working days\n Pricing: ₱5,000 (2 rounds of revisions included)\n\nLet me know if you'd like any adjustments!");
 }
 }

 const invalidLinkReplies: Record<string, string[]> = {
"Maria Santos": [
"Hmm, yun ba yung link? Di ko ma-open eh Pwede mo ulit i-send yung actual URL ng work mo?",
"Uy, hindi pa rin ito link Kailangan ko ng URL — yung nagsisimula sa https://...",
"Hala, sige na. Wala kang maibigay na link? Di na tayo magkakaintindihan. Isipin mo muna bago mo ako hanapan. Bye.",
 ],
"Kuya Jun": [
"Pre, yun ba yung link? Hindi naman yun link ah. I-send mo nga yung URL — figma, github, kahit ano.",
"Uy, ganon pa rin? Wala akong makitang link dito. Magpadala ka ng https://... para ma-check ko.",
"Sige na, wala na tayo pupuntahan nito. Marami akong ibang freelancer na pwedeng kausapin. Tara na.",
 ],
"Ate Bea": [
"Hmm, is this the link? Hindi siya nagbubukas sa akin Pwede ulitin? Yung actual URL ha.",
"Ay, hindi pa rin? Kailangan ko ng real link babe — yung nagsisimula sa https://",
"Okay ha, parang hindi mo pa talaga tapos yung work mo. Iba na lang muna. Sorry ha.",
 ],
"Sir Ramon": [
"I'm sorry, but that doesn't appear to be a valid link. Please send the actual URL starting with https://.",
"This still isn't a valid URL. I need a working link to review your deliverable properly.",
"This is the third time. I'm afraid I can't continue if you can't provide a working link. Let's stop here.",
 ],
 };

 async function submitDeliverable() {
 if (!deliverableUrl.trim()) return;

 const raw = deliverableUrl.trim();
 const isValidUrl = /^https?:\/\/.{3,}/.test(raw);

 if (!isValidUrl) {
 invalidLinkCountRef.current += 1;
 const replies = invalidLinkReplies[persona.name] ?? invalidLinkReplies["Sir Ramon"];
 const replyIdx = Math.min(invalidLinkCountRef.current - 1, replies.length - 1);
 const replyText = replies[replyIdx];

 const userMsg: Message = { role: "user", text: raw };
 const newMessages = [...messages, userMsg];
 setMessages([...newMessages, { role: "model", text: replyText }]);
 setDeliverableUrl( "");

 if (invalidLinkCountRef.current >= 3) {
 setDealLostMessage(replyText);
 setTimeout(() => setDealLost(true), 1800);
 }
 return;
 }

 invalidLinkCountRef.current = 0;
 const userMsg: Message = { role: "user", text: `Here's the link to my work: ${raw}` };
 const newMessages = [...messages, userMsg];
 setMessages(newMessages);
 setDeliverableUrl( "");
 setShowDeliverableInput(false);
 setLoading(true);
 try {
 const reply = await sendToGemini(newMessages, persona, phase);
 const updated = [...newMessages, { role: "model" as const, text: reply }];
 setMessages(updated);
 setShowSubmit(true);
 setContextualTip(generateContextualTip(updated, "qa", persona));
 setContextualResponse(generateContextualResponse(updated, "qa", persona));
 setHint( "Before implementing changes, confirm scope and budget impact first.");
 } catch {
 setMessages((prev) => [...prev, { role: "model", text: "Hmm, di ko ma-open yung link. Pwede mo ulit i-send?" }]);
 } finally {
 setLoading(false);
 }
 }

 const phaseIndex = PHASE_ORDER.indexOf(phase);
 const phaseColor = PHASE_COLORS[phase];

 function updateProposalField(i: number, v: string) {
 setProposalFields((prev) => prev.map((f, idx) => (idx === i ? v : f)));
 }

 function jumpToPhase(p: Phase) {
 setPhase(p);
 setContextualTip(null);
 setContextualResponse(null);
 setHint(null);
 setShowSubmit(false);
 setShowDeliverableInput(p === "qa");
 if (p === "proposal") {
 setContextualTip( "Send your proposal — include timeline, deliverables, and a pricing breakdown.");
 setContextualResponse( "Hi po! Here's my project proposal:\n\n Deliverables: Home, Menu, About, Contact pages\n⏱ Timeline: 5 working days\n Pricing: ₱5,000 (2 rounds of revisions included)\n\nLet me know if you'd like any adjustments!");
 }
 }

 function startSidebarResize(e: React.MouseEvent<HTMLDivElement>) {
 e.preventDefault();
 sidebarResizeRef.current = { startX: e.clientX, startW: sidebarWidth };
 const onMove = (ev: MouseEvent) => {
 const delta = ev.clientX - sidebarResizeRef.current.startX;
 setSidebarWidth(Math.max(180, Math.min(480, sidebarResizeRef.current.startW + delta)));
 };
 const onUp = () => { window.removeEventListener( "mousemove", onMove); window.removeEventListener( "mouseup", onUp); };
 window.addEventListener( "mousemove", onMove);
 window.addEventListener( "mouseup", onUp);
 }

 function startProposalChatPanelResize(e: React.MouseEvent<HTMLDivElement>) {
 e.preventDefault();
 proposalChatPanelResizeRef.current = { startX: e.clientX, startW: proposalChatPanelWidth };
 const onMove = (ev: MouseEvent) => {
 const delta = ev.clientX - proposalChatPanelResizeRef.current.startX;
 setProposalChatPanelWidth(Math.max(160, Math.min(420, proposalChatPanelResizeRef.current.startW + delta)));
 };
 const onUp = () => { window.removeEventListener( "mousemove", onMove); window.removeEventListener( "mouseup", onUp); };
 window.addEventListener( "mousemove", onMove);
 window.addEventListener( "mouseup", onUp);
 }

 function startProposalResize(e: React.MouseEvent<HTMLDivElement>) {
 e.preventDefault();
 const containerW = mainAreaRef.current?.clientWidth ?? 900;
 proposalResizeRef.current = { startX: e.clientX, startPct: proposalSplit, containerW };
 const onMove = (ev: MouseEvent) => {
 const delta = ev.clientX - proposalResizeRef.current.startX;
 const newPct = proposalResizeRef.current.startPct + (delta / proposalResizeRef.current.containerW) * 100;
 setProposalSplit(Math.max(28, Math.min(75, newPct)));
 };
 const onUp = () => { window.removeEventListener( "mousemove", onMove); window.removeEventListener( "mouseup", onUp); };
 window.addEventListener( "mousemove", onMove);
 window.addEventListener( "mouseup", onUp);
 }

 async function sendProposalChat(overrideText?: string) {
 const text = (overrideText ?? proposalChatInput).trim();
 if (!text || proposalChatLoading) return;
 const userMsg: Message = { role: "user", text };
 const next = [...proposalChat, userMsg];
 setProposalChat(next);
 setProposalChatInput( "");
 setProposalChatLoading(true);
 try {
 const reply = await sendToProposalAssistant(next, persona, proposalFields);
 setProposalChat([...next, { role: "model", text: reply }]);
 } catch {
 setProposalChat([...next, { role: "model", text: "Sorry, something went wrong. Try again!" }]);
 } finally {
 setProposalChatLoading(false);
 }
 }

 useEffect(() => {
 proposalChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [proposalChat, proposalChatLoading]);

 // Shared chat body (used in both split proposal layout and normal layout)
 function renderChatBody() {
 return (
 <>
 {/* Messages */}
 <div className= "flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ background: "#FFFFFF" }}>
 {phase !== "proposal" && (
 <div className= "flex flex-col items-center gap-2 pb-6 pt-2">
 <div className= "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
 {persona.name[0]}
 </div>
 <p className= "text-base font-bold" style={{ color: "#050505" }}>{persona.name}</p>
 <p className= "text-xs" style={{ color: "#65676B" }}>{persona.business}</p>
 <p className= "text-xs px-3 py-1 rounded-full" style={{ background: "#F0F2F5", color: "#65676B" }}>Budget: {persona.budget}</p>
 <p className= "text-xs text-center max-w-xs" style={{ color: "#65676B" }}>
 You're connected on MyClient. Practice your client communication skills here.
 </p>
 </div>
 )}

 {messages.map((msg, i) => {
 const isUser = msg.role === "user";
 const prevSameRole = i > 0 && messages[i - 1].role === msg.role;
 const nextSameRole = i < messages.length - 1 && messages[i + 1].role === msg.role;
 return (
 <div key={i} className={`flex items-end gap-2 ${isUser ?"justify-end" : "justify-start"} ${prevSameRole ?"mt-0.5" : "mt-3"}`}>
 {!isUser && (
 <div className= "w-7 h-7 flex-shrink-0 mb-0.5" style={{ visibility: nextSameRole ?"hidden" : "visible" }}>
 <div className= "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#F5C542", color: "#2D2D2D" }}>{persona.name[0]}</div>
 </div>
 )}
 <div className= "max-w-[65%] sm:max-w-[55%]">
 <div
 className= "px-3 py-2 text-sm leading-relaxed"
 style={{
 background: isUser ?"#0084FF" : "#F0F2F5",
 color: isUser ?"#FFFFFF" : "#050505",
 borderRadius: isUser
 ? prevSameRole ?"18px 4px 4px 18px" : "18px 4px 18px 18px"
 : prevSameRole ?"4px 18px 18px 4px" : "4px 18px 18px 18px",
 }}
 >
 {msg.text}
 </div>
 </div>
 {isUser && (
 <div className= "w-7 h-7 flex-shrink-0 mb-0.5" style={{ visibility: nextSameRole ?"hidden" : "visible" }}>
 <div className= "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#E0E7FF", color: "#3730A3" }}>U</div>
 </div>
 )}
 </div>
 );
 })}

 {loading && (
 <div className= "flex items-end gap-2 mt-3">
 <div className= "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#F5C542", color: "#2D2D2D" }}>{persona.name[0]}</div>
 <div className= "px-3 py-1.5 rounded-[18px] rounded-bl-sm" style={{ background: "#F0F2F5" }}>
 <TypingIndicator />
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Contextual tip */}
 {contextualTip && !loading && (
 <TipBar
 text={contextualTip}
 response={contextualResponse}
 onUseResponse={(r) => {
 setInput(r);
 setContextualTip(null);
 setContextualResponse(null);
 inputRef.current?.focus();
 }}
 />
 )}

 {/* Deliverable input */}
 {showDeliverableInput && (
 <div className= "flex-shrink-0 px-4 pb-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#F0F7FF" }}>
 <p className= "text-xs font-semibold mb-1.5" style={{ color: "#1D4ED8" }}> Submit your deliverable link</p>
 <div className= "flex gap-2">
 <input
 type= "url"
 value={deliverableUrl}
 onChange={(e) => setDeliverableUrl(e.target.value)}
 placeholder= "https://figma.com/… or https://github.com/…"
 className= "flex-1 px-3 py-2 rounded-full text-sm outline-none"
 style={{ background: "#FFFFFF", border: "1.5px solid #93C5FD", color: "#050505" }}
 onKeyDown={(e) => e.key === "Enter" && submitDeliverable()}
 />
 <button
 onClick={submitDeliverable}
 disabled={!deliverableUrl.trim() || loading}
 className= "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
 style={{ background: "#0084FF", color: "#FFFFFF" }}
 >
 <ExternalLink className= "w-3.5 h-3.5" /> Send
 </button>
 </div>
 </div>
 )}

 {/* Advance phase */}
 {showSubmit && (
 <div className= "flex-shrink-0 px-4 pb-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
 <button
 onClick={advancePhase}
 className= "w-full py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
 style={{
 background: phase === "delivery" ?"#10B981" : "#F5C542",
 color: phase === "delivery" ?"#FFFFFF" : "#050505",
 }}
 >
 {phase === "delivery" ? (
 <><CheckCircle className= "w-4 h-4" /> Close Project & Collect ₱{Number(persona.budget.replace(/[^\d]/g, "")).toLocaleString()}</>
 ) : (
 <>Move to {PHASE_LABELS[PHASE_ORDER[phaseIndex + 1]]} <ChevronRight className= "w-4 h-4" /></>
 )}
 </button>
 </div>
 )}

 {/* Input bar */}
 <div className= "flex-shrink-0 flex items-end gap-2 px-3 py-3 border-t" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#FFFFFF" }}>
 <div className= "flex items-center gap-1 flex-shrink-0 pb-1">
 <button className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
 <Paperclip className= "w-5 h-5" style={{ color: "#0084FF" }} />
 </button>
 <button className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
 <Image className= "w-5 h-5" style={{ color: "#0084FF" }} />
 </button>
 </div>
 <div className= "flex-1 flex items-end rounded-full px-4 py-2 gap-2" style={{ background: "#F0F2F5", minHeight: "40px" }}>
 <textarea
 ref={inputRef}
 rows={1}
 value={input}
 onChange={(e) => {
 setInput(e.target.value);
 e.target.style.height = "auto";
 e.target.style.height = Math.min(e.target.scrollHeight, 100) +"px";
 }}
 onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
 placeholder= "Aa"
 className= "flex-1 resize-none bg-transparent outline-none text-sm"
 style={{ color: "#050505", minHeight: "22px", maxHeight: "100px", lineHeight: "1.4" }}
 />
 <button className= "flex-shrink-0 self-end pb-0.5">
 <Smile className= "w-5 h-5" style={{ color: "#65676B" }} />
 </button>
 </div>
 {input.trim() ? (
 <button
 onClick={() => sendMessage()}
 disabled={loading}
 className= "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
 style={{ background: "#0084FF", color: "#FFFFFF" }}
 >
 <Send className= "w-4 h-4" />
 </button>
 ) : (
 <button className= "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110">
 <ThumbsUp className= "w-5 h-5" style={{ color: "#0084FF" }} />
 </button>
 )}
 </div>
 </>
 );
 }

 return (
 <div className= "flex h-screen overflow-hidden" style={{ background: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>

 {/* Prompt Modal */}
 {showPromptModal && projectPrompt && (
 <PromptModal prompt={projectPrompt} onClose={() => setShowPromptModal(false)} />
 )}

 {/* Earn Toast */}
 {showEarnToast && (
 <EarnToast amount={earnAmount} onDone={() => setShowEarnToast(false)} />
 )}

 {/* Deal Lost Modal */}
 {dealLost && (
 <DealLostModal
 clientName={persona.name}
 onRetry={() => {
 setDealLost(false);
 setDealLostMessage( "");
 const init: Message = { role: "model", text: persona.initialMessage };
 setMessages([init]);
 setPhase( "discovery");
 setShowSubmit(false);
 setContextualTip(generateContextualTip([init], "discovery", persona));
 setContextualResponse(generateContextualResponse([init], "discovery", persona));
 }}
 />
 )}

 {/* LEFT SIDEBAR */}
 <aside className= "hidden md:flex flex-col flex-shrink-0" style={{ width: `${sidebarWidth}px`, background: "#FFFFFF" }}>
 <div className= "px-4 pt-5 pb-3">
 <div className= "flex items-center justify-between mb-3">
 <h2 className= "text-xl font-bold" style={{ color: "#050505", fontFamily: "Poppins, sans-serif" }}>Chats</h2>
 <div className= "flex items-center gap-1">
 <Link to= "/" className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
 <MessageCircle className= "w-5 h-5" style={{ color: "#050505" }} />
 </Link>
 <button className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
 <MoreHorizontal className= "w-5 h-5" style={{ color: "#050505" }} />
 </button>
 </div>
 </div>

 {/* Wallet balance in sidebar */}
 <div className= "flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
 <Wallet className= "w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} />
 <div className= "flex-1">
 <p className= "text-xs font-semibold" style={{ color: "#15803D" }}>My Wallet</p>
 <p className= "text-base font-bold leading-tight" style={{ color: "#15803D", fontFamily: "Poppins, sans-serif" }}>
 ₱{walletBalance.toLocaleString()}
 </p>
 </div>
 <p className= "text-xs" style={{ color: "#16A34A" }}>earned</p>
 </div>

 <div className= "flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: "#F0F2F5" }}>
 <Search className= "w-4 h-4 flex-shrink-0" style={{ color: "#65676B" }} />
 <input type= "text" placeholder= "Search Messenger" className= "flex-1 text-sm bg-transparent outline-none" style={{ color: "#050505" }} />
 </div>
 </div>

 <div className= "flex-1 overflow-y-auto px-2">
 {SIDEBAR_CHATS.map((chat) => {
 const isActive = chat.id === activeId;
 return (
 <div
 key={chat.id}
 onClick={() => navigate(`/simulation/${chat.id}`)}
 className= "flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-colors"
 style={{ background: isActive ?"#F0F2F5" : "transparent" }}
 onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#F7F7F7"; }}
 onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
 >
 <div className= "relative flex-shrink-0">
 <div className= "w-12 h-12 rounded-full flex items-center justify-center text-base font-bold" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
 {chat.name[0]}
 </div>
 <div className= "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: "#31A24C" }} />
 </div>
 <div className= "flex-1 min-w-0">
 <div className= "flex items-center justify-between">
 <p className={`text-sm truncate ${isActive || chat.unread ?"font-semibold" : "font-normal"}`} style={{ color: "#050505" }}>{chat.name}</p>
 <p className= "text-xs flex-shrink-0 ml-2" style={{ color: chat.unread ?"#0084FF" : "#65676B" }}>{chat.time}</p>
 </div>
 <div className= "flex items-center gap-1">
 <p className= "text-xs truncate" style={{ color: chat.unread ?"#050505" : "#65676B", fontWeight: chat.unread ? 600 : 400 }}>{chat.preview}</p>
 {chat.unread > 0 && (
 <div className= "w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold" style={{ background: "#0084FF", fontSize: "10px" }}>{chat.unread}</div>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 <div className= "px-4 py-3 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
 <div className= "flex items-center gap-2">
 <div className= "w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F5C542" }}>
 <MessageCircle className= "w-3.5 h-3.5" style={{ color: "#2D2D2D" }} />
 </div>
 <span className= "text-xs font-bold" style={{ color: "#65676B", fontFamily: "Poppins, sans-serif" }}>MyClient — SparkFest 2026</span>
 </div>
 </div>
 </aside>

 {/* Sidebar resize handle */}
 <ResizeHandle onMouseDown={startSidebarResize} />

 {/* MAIN CHAT */}
 <div ref={mainAreaRef} className= "flex-1 flex flex-col min-w-0">

 {/* Chat header */}
 <div className= "flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.1)", background: "#FFFFFF" }}>
 <div className= "relative flex-shrink-0">
 <div className= "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
 {persona.name[0]}
 </div>
 <div className= "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#31A24C" }} />
 </div>
 <div className= "flex-1 min-w-0">
 <p className= "text-sm font-bold truncate" style={{ color: "#050505" }}>{persona.name}</p>
 <p className= "text-xs" style={{ color: "#31A24C" }}>Active now</p>
 </div>

 {/* Wallet pill in header (mobile) */}
 <div className= "md:hidden">
 <WalletBadge balance={walletBalance} />
 </div>

 <div className= "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${phaseColor}15`, color: phaseColor }}>
 <div className= "w-1.5 h-1.5 rounded-full" style={{ background: phaseColor }} />
 {PHASE_LABELS[phase]}
 </div>

 {/* Prompt re-open button */}
 {projectPrompt && (
 <button
 onClick={() => setShowPromptModal(true)}
 className= "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
 style={{ background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A" }}
 >
 <Sparkles className= "w-3 h-3" /> Build Prompt
 </button>
 )}

 <div className= "flex items-center gap-1">
 <button className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
 <Phone style={{ color: "#0084FF", width: 18, height: 18 }} />
 </button>
 <button className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
 <Video style={{ color: "#0084FF", width: 18, height: 18 }} />
 </button>
 <button
 onClick={() => setShowInfo(!showInfo)}
 className= "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
 style={{ background: showInfo ?"#F0F2F5" : "transparent" }}
 >
 <Info style={{ color: "#0084FF", width: 18, height: 18 }} />
 </button>
 </div>
 </div>

 {/* Phase stepper — clickable */}
 <div className= "flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b overflow-x-auto" style={{ borderColor: "rgba(0,0,0,0.06)", background: "#FAFAFA" }}>
 {PHASE_ORDER.map((p, i) => (
 <div key={p} className= "flex items-center gap-1 flex-shrink-0">
 <button
 onClick={() => jumpToPhase(p)}
 className= "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
 style={{
 background: i === phaseIndex ? phaseColor : i < phaseIndex ?"#E8F5E9" : "#F0F2F5",
 color: i === phaseIndex ?"#fff" : i < phaseIndex ?"#2E7D32" : "#65676B",
 cursor: "pointer",
 }}
 >
 {i < phaseIndex && <CheckCircle className= "w-3 h-3" />}
 {PHASE_LABELS[p]}
 </button>
 {i < PHASE_ORDER.length - 1 && <ChevronRight className= "w-3 h-3 flex-shrink-0" style={{ color: "#C4C4C4" }} />}
 </div>
 ))}
 </div>

 {/* CONTENT AREA: split in proposal phase, single chat otherwise */}
 {phase === "proposal" ? (
 <div className= "flex-1 flex overflow-hidden">
 {/* Far left: client chat panel (resizable) */}
 <div className= "flex flex-col min-w-0 flex-shrink-0 border-r overflow-hidden" style={{ width: `${proposalChatPanelWidth}px`, borderColor: "rgba(0,0,0,0.1)" }}>
 {renderChatBody()}
 </div>

 {/* Chat ↔ proposal resize handle */}
 <ResizeHandle onMouseDown={startProposalChatPanelResize} />

 {/* Middle: proposal form (resizable) */}
 <div className= "flex flex-col min-w-0" style={{ width: `${proposalSplit}%` }}>
 <ProposalFormPanel
 persona={persona}
 messages={messages}
 fields={proposalFields}
 onFieldChange={updateProposalField}
 />
 </div>

 {/* Proposal resize handle */}
 <ResizeHandle onMouseDown={startProposalResize} />

 {/* Right: AI proposal coach chatbot (remaining) */}
 <div className= "flex flex-col min-w-0 flex-1">
 {/* Coach header */}
 <div className= "flex-shrink-0 px-3 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#F8F9FA" }}>
 <div className= "flex items-center gap-2">
 <div className= "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDE9FE" }}>
 <GeminiLogo size={14} />
 </div>
 <div>
 <p className= "text-xs font-bold" style={{ color: "#050505", fontFamily: "Poppins, sans-serif" }}>AI Proposal Coach</p>
 <p className= "text-xs" style={{ color: "#65676B" }}>Ask how to write any section, or paste a draft to refine</p>
 </div>
 </div>
 </div>

 {/* Coach messages */}
 <div className= "flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ background: "#FFFFFF" }}>
 {proposalChat.map((msg, i) => {
 const isUser = msg.role === "user";
 return (
 <div key={i} className={`flex items-end gap-2 ${isUser ?"justify-end" : "justify-start"}`}>
 {!isUser && (
 <div className= "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5" style={{ background: "#EDE9FE" }}>
 <GeminiLogo size={12} />
 </div>
 )}
 <div
 className= "px-3 py-2 text-xs leading-relaxed"
 style={{
 maxWidth: "78%",
 background: isUser ?"#7C3AED" : "#F3F0FF",
 color: isUser ?"#FFFFFF" : "#1F1147",
 borderRadius: isUser ?"14px 4px 14px 14px" : "4px 14px 14px 14px",
 whiteSpace: "pre-wrap",
 }}
 >
 {msg.text}
 </div>
 {isUser && (
 <div className= "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-xs font-bold" style={{ background: "#E0E7FF", color: "#3730A3" }}>U</div>
 )}
 </div>
 );
 })}
 {proposalChatLoading && (
 <div className= "flex items-end gap-2">
 <div className= "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDE9FE" }}>
 <GeminiLogo size={12} />
 </div>
 <div className= "px-3 py-2 rounded-[14px] rounded-tl-sm" style={{ background: "#F3F0FF" }}>
 <TypingIndicator />
 </div>
 </div>
 )}
 <div ref={proposalChatEndRef} />
 </div>

 {/* Coach input */}
 <div className= "flex-shrink-0 flex items-end gap-2 px-3 py-3 border-t" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#FFFFFF" }}>
 <div className= "flex-1 flex items-end rounded-2xl px-3 py-2 gap-2" style={{ background: "#F3F0FF", minHeight: "38px" }}>
 <textarea
 rows={1}
 value={proposalChatInput}
 onChange={(e) => {
 setProposalChatInput(e.target.value);
 e.target.style.height = "auto";
 e.target.style.height = Math.min(e.target.scrollHeight, 90) +"px";
 }}
 onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendProposalChat(); } }}
 placeholder= "Ask how to write a section…"
 className= "flex-1 resize-none bg-transparent outline-none text-xs"
 style={{ color: "#1F1147", minHeight: "20px", maxHeight: "90px", lineHeight: "1.4" }}
 />
 </div>
 <button
 onClick={() => sendProposalChat()}
 disabled={!proposalChatInput.trim() || proposalChatLoading}
 className= "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
 style={{ background: "#7C3AED", color: "#FFFFFF" }}
 >
 <Send className= "w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 ) : (
 renderChatBody()
 )}
 </div>

 {/* INFO PANEL */}
 {showInfo && (
 <aside className= "hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l overflow-y-auto" style={{ borderColor: "rgba(0,0,0,0.1)", background: "#FFFFFF" }}>
 <div className= "p-5 space-y-6">
 <div className= "flex flex-col items-center gap-2 text-center">
 <div className= "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "#F5C542", color: "#2D2D2D", fontFamily: "Poppins, sans-serif" }}>
 {persona.name[0]}
 </div>
 <p className= "text-base font-bold" style={{ color: "#050505" }}>{persona.name}</p>
 <p className= "text-xs" style={{ color: "#65676B" }}>{persona.business}</p>
 <div className= "flex items-center gap-1">
 <div className= "w-2 h-2 rounded-full" style={{ background: "#31A24C" }} />
 <span className= "text-xs" style={{ color: "#31A24C" }}>Active now</span>
 </div>
 </div>

 <div className= "h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

 {/* Wallet in info panel */}
 <div className= "flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
 <Wallet className= "w-5 h-5" style={{ color: "#16A34A" }} />
 <div>
 <p className= "text-xs" style={{ color: "#15803D" }}>Total Earned</p>
 <p className= "text-lg font-bold" style={{ color: "#15803D", fontFamily: "Poppins, sans-serif" }}>₱{walletBalance.toLocaleString()}</p>
 </div>
 </div>

 <div className= "h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

 {/* Phase tracker */}
 <div>
 <p className= "text-xs font-bold mb-3" style={{ color: "#65676B" }}>SIMULATION PHASE</p>
 <div className= "space-y-2">
 {PHASE_ORDER.map((p, i) => (
 <div key={p} className= "flex items-center gap-3">
 <div
 className= "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
 style={{
 background: i < phaseIndex ?"#E8F5E9" : i === phaseIndex ? phaseColor : "#F0F2F5",
 color: i < phaseIndex ?"#2E7D32" : i === phaseIndex ?"#FFFFFF" : "#9CA3AF",
 }}
 >
 {i < phaseIndex ?"" : i + 1}
 </div>
 <p className= "text-sm" style={{ color: i === phaseIndex ?"#050505" : "#65676B", fontWeight: i === phaseIndex ? 600 : 400 }}>
 {PHASE_LABELS[p]}
 </p>
 {i === phaseIndex && (
 <div className= "ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: `${phaseColor}15`, color: phaseColor }}>Active</div>
 )}
 </div>
 ))}
 </div>
 </div>

 <div className= "h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

 {/* Live scores */}
 <div>
 <p className= "text-xs font-bold mb-3" style={{ color: "#65676B" }}>LIVE SCORE</p>
 <div className= "space-y-3">
 {[
 { label: "Communication", value: scores.comm, color: "#0084FF" },
 { label: "Scope Mgmt.", value: scores.scope, color: "#10B981" },
 { label: "Professionalism", value: scores.prof, color: "#F59E0B" },
 ].map((s) => (
 <div key={s.label}>
 <div className= "flex justify-between mb-1">
 <span className= "text-xs" style={{ color: "#65676B" }}>{s.label}</span>
 <span className= "text-xs font-bold" style={{ color: "#050505" }}>{s.value}</span>
 </div>
 <div className= "h-1.5 rounded-full" style={{ background: "#F0F2F5" }}>
 <div className= "h-full rounded-full transition-all duration-500" style={{ width: `${s.value}%`, background: s.color }} />
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className= "h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

 {/* Build prompt button */}
 {projectPrompt && (
 <button
 onClick={() => setShowPromptModal(true)}
 className= "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
 style={{ background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A" }}
 >
 <Sparkles className= "w-4 h-4" /> View Build Prompt
 </button>
 )}

 {/* Project brief */}
 <div className= "p-3 rounded-xl space-y-2" style={{ background: "#F0F2F5" }}>
 <p className= "text-xs font-bold" style={{ color: "#050505" }}>Project Brief</p>
 <p className= "text-xs capitalize" style={{ color: "#65676B" }}> {persona.project}</p>
 <p className= "text-xs" style={{ color: "#65676B" }}> Budget: <span className= "font-semibold" style={{ color: "#10B981" }}>{persona.budget}</span></p>
 <p className= "text-xs" style={{ color: "#65676B" }}> {persona.personality}</p>
 </div>
 </div>
 </aside>
 )}
 </div>
 );
}
