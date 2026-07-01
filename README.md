# MyClient — SparkFest 2026

> AI-powered freelance client simulation platform for Filipino students and youth.

MyClient is a SparkFest 2026 hackathon entry that lets students practice real-world client communication by chatting with an AI that behaves exactly like a real Filipino client — vague at first, adds scope creep, requests revisions, and eventually pays out or walks away.

**Theme:** Building Smarter, Safer, and More Inclusive Communities
**SDGs:** SDG 9 (Industry, Innovation & Infrastructure) · SDG 11 (Sustainable Cities & Communities)
**Google Technology:** Gemini 2.0 Flash API

---

## The Problem

Most CS/IT students graduate knowing how to code but not how to communicate with clients — how to ask the right questions, scope a project, write a proposal, handle revisions, and deliver professionally. MyClient bridges that gap through simulation.

## How It Works

The AI messages **you** first — just like a real client would.

```
AI Client: "Hi! Pwede mo ba akong tulungan? Gusto ko magpagawa ng website
            para sa aking food business. Budget ko ₱5,000. 😊"

Tip: Ask what problem they're currently facing before jumping to solutions.

You: "Sure po! Bago tayo magsimula, pwede po bang ikwento sa akin yung
      inyong business at ang project na gusto ninyong gawin?"

AI Client: "Sige po, ikukwento ko! So nagtatakbo kami ng maliit na
            karinderya dito sa aming barangay — 'Santos Karinderya'..."
```

---

## Phases

| Phase | What Happens |
|-------|-------------|
| **Discovery** | AI client messages you first with a project brief. Ask the right questions to uncover requirements. |
| **Proposal** | Fill out an 11-section project proposal with AI-generated drafts and a proposal coach. |
| **QA Review** | Submit a deliverable link. AI switches to reviewer mode — gives specific UI/UX feedback and introduces scope creep. |
| **Delivery** | Final negotiation. AI accepts, requests revisions, or walks away. Simulated payment released on success. |

---

## Key Features

- **4 AI Client Personas** — Maria Santos (karinderya), Kuya Jun (online shop), Ate Bea (fashion reseller), Sir Ramon (tutoring)
- **Gemini 2.0 Flash** — powers all client responses in Taglish with realistic personality
- **Multi-bubble typing** — client replies arrive in 2–3 separate bubbles with natural delays, like a real person
- **TipBar** — coaching tips with 3 clickable response options (Standard, Short, Casual)
- **11-section Proposal Builder** — AI-generated professional paragraphs per section, lightbulb recall from discovery
- **AI Proposal Coach** — separate Gemini-powered chatbot for writing and refining the proposal
- **Deal Walkaway** — client escalates anger on rude messages and terminates the deal after 3 strikes
- **Scope Creep Engine** — client randomly adds features mid-project like a real client would
- **Invalid Link Detection** — submitting a non-URL in QA triggers client rejection with per-persona reactions
- **Score Screen** — Communication, Scope Management, and Professionalism scores after each session

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| AI | Gemini 2.0 Flash (REST API, browser-safe) |
| Routing | React Router v7 |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Getting Started

```bash
npm install
npm run dev
```

To use the Gemini API (live AI responses), add your key to `.env`:

```
VITE_GEMINI_API_KEY=your_key_here
```

Without an API key, the app runs in **demo mode** with pre-written persona responses — fully functional for demos.

---

## SparkFest 2026 Deliverables

- [x] Working prototype (Phase 1 Discovery + Phase 3 QA fully functional)
- [x] Gemini API integrated as the AI client brain
- [x] 4 client personas with distinct personalities and Taglish dialogue
- [x] Public GitHub repository with commit history
- [ ] 3-minute video demo
- [ ] One-page project document (PDF)

---

## Team

**Melfred Bernabe** — Solo developer, UI/UX, Gemini integration, client communication simulation design

*Built with Claude Code · SparkFest 2026*
