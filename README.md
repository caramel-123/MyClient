# MyClient 🐦
Pulsar - Melfred Bernabe

**AI-Powered Client Simulation Platform for Student Freelancers**

> *"Practice the client. Not just the code."*

MyClient is a web-based simulation platform built for **SparkFest 2026**. It helps IT and CS students practice the full freelance lifecycle — discovery, proposals, revisions, and delivery — through realistic AI client conversations powered by Google Gemini.

🌐 **Live Demo:** https://myclient-sparkfest.web.app

---

## What is MyClient?

Most CS/IT students graduate knowing how to build software but not how to handle real clients. MyClient fills that gap by putting students through a complete, consequence-free freelance simulation where:

- The **AI messages you first** — just like a real client would
- You discover requirements, write proposals, handle scope creep, and deliver a project
- You get scored on **Communication**, **Scope Management**, and **Professionalism**
- Simulated payment (₱5,000–₱12,000) is only released when the AI client is satisfied

---

## Features

- **AI Client Personas** — 4 realistic Filipino freelance clients (friendly, impatient, indecisive, technical) powered by Gemini 2.0 Flash
- **4-Phase Simulation** — Discovery → Proposal → Build & QA → Delivery
- **Taglish Dialogue** — AI clients respond naturally in Filipino-English mix, just like real local clients
- **Multi-bubble Typing** — Client replies arrive in 2–3 separate bubbles with natural delays
- **Hint System** — Subtle coaching tips with clickable response suggestions
- **11-Section Proposal Builder** — AI-generated professional paragraphs with a built-in proposal coach
- **QA Analyst Mode** — AI switches to hyper-specific UI/UX reviewer after submission
- **Scope Creep Engine** — AI introduces unexpected feature requests mid-project
- **Deal Walkaway** — Client escalates and terminates the deal after repeated rude messages
- **Scoring Dashboard** — Communication, Scope Management, and Professionalism scores per session
- **Google Authentication** — Sign in with Google via Firebase Auth
- **Leaderboard** — Top students ranked by simulation score

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| AI Engine | Google Gemini 2.0 Flash API |
| Authentication | Firebase Authentication (Google sign-in) |
| Routing | React Router v7 |
| Deployment | Firebase Hosting |
| UI Components | shadcn/ui + Lucide Icons |

---

## AI Client Personas

| Client | Business | Personality | Budget |
|---|---|---|---|
| Maria Santos | Food Business (Karinderya) | Friendly but forgetful | ₱5,000 |
| Kuya Jun | Sari-sari Store / Online Selling | Impatient and vague | ₱8,000 |
| Ate Bea | Boutique / Fashion Reseller | Indecisive and creative | ₱6,500 |
| Sir Ramon | Tutoring / Education Services | Technical and detailed | ₱12,000 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- A [Firebase project](https://console.firebase.google.com) with Authentication enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/caramel-123/MyClient.git
cd MyClient

# Install dependencies
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Demo Mode:** Without a Gemini API key, the app runs with pre-written persona responses — fully functional for demos.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── lib/
│   │   ├── gemini.ts            # Gemini API client + AI personas + prompts
│   │   ├── firebase.ts          # Firebase initialization + auth helpers
│   │   └── AuthContext.tsx      # Auth state provider
│   ├── pages/
│   │   ├── LoginPage.tsx        # Sign in with Google or email
│   │   ├── SignupPage.tsx       # Multi-step onboarding
│   │   ├── DashboardPage.tsx    # User dashboard + session history
│   │   ├── ProjectSelectPage.tsx # Choose your AI client
│   │   ├── SimulationPage.tsx   # Main chat simulation
│   │   └── ScorePage.tsx        # Post-session scores
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   └── App.tsx                  # Landing page
├── styles/
│   └── index.css
└── main.tsx
```

---

## Simulation Flow

```
Landing Page
    ↓
Sign Up / Log In (Firebase Auth)
    ↓
Dashboard
    ↓
Choose Your Client (4 personas)
    ↓
Phase 1: Discovery
  AI messages you first.
  Uncover real requirements.
    ↓
Phase 2: Proposal
  Write scope + budget.
  AI negotiates or pushes back.
    ↓
Phase 3: Build & QA
  Submit your work (URL).
  AI gives specific UI/UX feedback.
  Scope creep may be triggered.
    ↓
Phase 4: Delivery
  Close the project professionally.
  Simulated payment released on approval.
    ↓
Score Page (Communication / Scope / Professionalism)
```

---

## Scoring System

After each completed simulation, students are evaluated on:

| Dimension | What it measures |
|---|---|
| **Communication** | Clarity, tone, and response quality throughout the project |
| **Scope Management** | How well the student handled revisions and change requests |
| **Professionalism** | Negotiation approach, deadlines, and overall conduct |

Scores are stored per session and tracked over time on the personal dashboard.

---

## Deployment

This project is deployed on **Firebase Hosting**:

```bash
# Build
npm run build

# Deploy
npx firebase deploy --only hosting
```

**Live URL:** https://myclient-sparkfest.web.app

---

## Community Impact

MyClient targets **Students & Youth** — specifically college-level IT, CS, and ICT students who are exploring freelancing but lack real-world client exposure. By simulating the full freelance lifecycle in a consequence-free environment, it builds the confidence and professional habits formal education cannot provide.

Aligned with:
- **SDG 4** — Quality Education
- **SDG 8** — Decent Work and Economic Growth

---

## SparkFest 2026

This project was built for **SparkFest 2026**, a flagship hackathon by **GDG PUP × DOST PUP Pylon** that challenges students to create innovative technology-driven solutions for real-world societal and community problems.

**Google Technologies Used:**
- Google Gemini 2.0 Flash API — AI client engine
- Firebase Authentication — Google sign-in
- Firebase Hosting — production deployment

**Submission Checklist:**
- [x] Working prototype (all 4 phases functional)
- [x] Gemini API integrated as the AI client brain
- [x] 4 client personas with distinct personalities and Taglish dialogue
- [x] Firebase Authentication with Google sign-in
- [x] Firebase Hosting deployment
- [x] Public GitHub repository with active commit history
- [ ] 3-minute video demo
- [ ] One-page project document (PDF)

---

## Team

**Melfred Bernabe** — Solo developer, UI/UX, AI integration, simulation design

SparkFest 2026 · GDG PUP × DOST PUP Pylon*
