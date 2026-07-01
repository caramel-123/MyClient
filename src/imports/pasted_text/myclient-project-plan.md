Here's the full revised project plan:

MyClient — SparkFest 2026 Project Plan
Context
MyClient is a SparkFest 2026 hackathon entry targeting students and youth who lack real-world experience building projects for clients. Most CS/IT students graduate knowing how to code but not how to communicate with clients, gather requirements, scope a project, or manage deliverables. MyClient bridges that gap through an AI-powered client simulation platform where an AI acts as a real client — messaging the student just like a real person would — and guides them through the full freelance project lifecycle.
SparkFest Alignment:
Theme: Building Smarter, Safer, and More Inclusive Communities
Community sector: Students / Youth
SDG 9 — Industry, Innovation & Infrastructure
SDG 11 — Sustainable Cities & Communities
Google Technology requirement: Gemini API (AI client brain)

Core Concept
The AI messages YOU first — just like a real client would.
AI Client: "Hey! Can you help me build a website for my food business? I'll pay ₱5,000 for that."
[Hint]: Ask about their current problem before jumping to solutions.
Student:   "Sure! What problem are you currently facing with your business?"
AI Client: "My customers don't know what's on my menu and I keep missing orders na."

Students learn by DOING — not watching videos. Every conversation teaches a real skill.

Full Learning Journey (4 Phases)
Phase 1 — Discovery (Chat Simulation)
AI client sends an opening brief (random or category-based)
Student must ask the right discovery questions
AI client is vague at first, gradually reveals requirements, occasionally changes mind
System coaches the student with subtle hints
AI scores the quality of the student's discovery questions
Example:
AI Client: "Hi! I need someone to build me a website for my food business. Budget ₱5,000."
[Hint]: Ask about their current problem before jumping to solutions.
Student:   "Sure! What problem are you currently facing with your business?"
AI Client: "My customers don't know what's on my menu and I keep missing orders na."
Student:   "Got it. Do you want online ordering or just a menu display for now?"
AI Client: "Just display muna, but maybe later ordering din."


Phase 2 — Scoping & Proposal
Student writes a project brief / proposal based on the conversation
AI client reviews it and gives realistic feedback ("missing a timeline", "what pages are included?")
Student iterates until the proposal is accepted
Example:
Student:   [submits proposal]
AI Client: "Hmm, looks okay pero I don't see a deadline here? And what pages are included?"
Student:   [revises and resubmits]
AI Client: "Okay sige! Let's go with this."


Phase 3 — Build & Submit Deliverable
Student submits a link (Figma prototype, GitHub repo, live site, etc.)
AI switches to QA Analyst mode — reviews the work like a real client tapping through their phone
Gives specific UI/UX feedback, reports bugs, requests new features mid-review
Student must respond professionally: implement changes or negotiate scope/budget
Example:
Student:   [submits Figma link]
AI Client: "Okay I checked it! Yung button sa homepage, can you make it green instead of blue?
            Also yung card sa right side, parang malayo sa left — pwede mo ilipat nang konti?
            And saka, can you add a login page? I forgot to mention that kanina."
Student:   "Sure for the button and card! For the login page, would that affect our timeline
            and budget? Just want to make sure we're aligned."
AI Client: "Ah true. Okay add ₱500 na lang and extend by 1 day."


Phase 4 — Delivery, Revision & Payment Simulation
Final delivery conversation
AI client either accepts, requests one last revision, or negotiates
Simulated payment released upon successful delivery
Student receives a score + breakdown
Example:
AI Client: "Okay na to! Maganda. Sending payment na. ₱5,500 na kasama yung login page."
[Score screen]: Communication: 88/100 | Scope Management: 75/100 | Professionalism: 92/100


AI Client Behavior — QA Analyst Layer
The AI is NOT just a project requester. After any deliverable is submitted, it switches into QA Analyst mode and gives hyper-realistic, specific feedback — just like a real client texting you after checking the work on their phone.
UI/UX nitpicks:
"Can you make that button green instead of blue?"
"Can you move that card a little bit to the left?"
"The font looks too small on mobile, can you fix that?"
"I don't like how the header looks, can we try white background?"
Scope creep / feature requests:
"Oh wait, can you also add a login page? I forgot to mention that."
"Can you add a navigation bar for the menu?"
"Actually, can we add a search bar at the top?"
"I want users to be able to filter by category."
QA bug reports:
"When I click the button it doesn't do anything?"
"The form doesn't show an error when I leave it blank."
"It looks broken on my phone."
"The images aren't loading on the about page."
Realistic approval behavior:
Sometimes accepts right away ("This looks great!")
Sometimes asks for 1–2 revisions ("Almost! Just fix the color.")
Sometimes changes direction ("Actually let's go with a different layout.")
Occasionally goes quiet then comes back with a new request
Sometimes adds scope mid-review and negotiates budget
Internal QA Checklist (Gemini system prompt): The AI picks 1–3 of these to comment on per review cycle:
Button colors, sizes, placement
Card/section alignment and spacing
Navigation bar presence and structure
Login / authentication pages
Mobile responsiveness feel
Image loading and visual quality
Form validation and error states
Clickable elements that appear broken
Missing pages from the discovery phase
Font size and readability
Color contrast and branding consistency
Footer, header, hero section completeness
What this teaches students: Revision cycles · Scope management · Saying no professionally · Negotiating timeline/budget · Asking clarifying questions before implementing

Key Features
Feature
Description
AI Client Messenger
Gemini-powered chat that feels like a real messaging app
Client Personas
Multiple personalities — demanding, friendly, vague, technical, indecisive
QA Analyst Mode
After submission, AI switches to reviewer giving specific UI/UX + bug feedback
Scope Creep Engine
AI randomly introduces new feature requests mid-project
Project Categories
Web dev, mobile app, graphic design, data entry, etc.
Hint System
Subtle nudges that guide students without giving away answers
Scoring & Feedback
Post-session: Communication, Scope Management, Professionalism
Progress Tracker
Dashboard showing completed projects and skills earned
Leaderboard
Optional — top students ranked by score


Tech Stack
Layer
Technology
Frontend
Next.js + Tailwind CSS
AI Brain
Gemini API (gemini-2.0-flash)
Auth
Firebase Authentication / Google Auth
Database
Firebase Firestore
Hosting
Firebase Hosting / Vercel
Storage
Firebase Storage (submitted links + deliverables)

Google tech requirement covered: Gemini API + Firebase Auth + Firestore + Hosting

MVP Scope (June 28 – July 2, ~4 days)
Focus: Phase 1 + Phase 3 QA feedback working end-to-end.
Landing page explaining MyClient
Student signup/login (Firebase Auth)
Project selection screen (choose a client brief category)
Messenger UI — AI client messages student first
Gemini API integration — AI responds in character as the client
Submit deliverable flow — student pastes a link, AI reviews with QA feedback
Basic hint system
End-of-session score screen (Communication, Scope Management, Professionalism)
Public GitHub repo with README and active commit history
Gemini System Prompt Strategy: The AI persona is defined via system prompt instructing it to:
Play a specific client (name, business type, personality)
Message the student first with a project brief
Phase 1: be vague and realistic, gradually reveal requirements
Phase 3: switch to QA analyst mode, pick 1–3 checklist items to comment on
Introduce 1 scope creep request per session
Eventually approve and simulate payment release

SparkFest Elimination Round Deliverables (Due July 2)
[ ] 3-minute video — showing the full AI messenger simulation in action
[ ] One-page project document (PDF) — problem, solution, tech stack, impact
[ ] Public GitHub repo — README, setup instructions, active commits across build days
[ ] Working prototype — Phase 1 + Phase 3 QA chat flow live

Judging Alignment
Criteria
How MyClient addresses it
Submission Quality
Clean video, professional one-pager
Creativity & Innovation
No other tool simulates a client + QA analyst via AI chat
Uniqueness & Originality
Novel approach — learn by doing real freelance simulations
Feasibility
MVP scoped to 4 days; Gemini + Firebase = fast to build
Relevance to Theme
Empowers youth for smarter, more inclusive economic participation
Technology Implementation
Gemini API + full Firebase stack, tightly integrated


Verification Plan
Full Phase 1 flow: AI sends opening message → student replies → AI responds in character
Phase 3 flow: student submits a link → AI gives specific QA-style UI/UX feedback
Scoring screen appears correctly after session ends
Gemini responds correctly in both client mode and QA analyst mode
GitHub shows commit history spread across build days (no single large upload)
Video captures the "wow moment" — AI messaging the student first

