// Gemini API client
// Uses the browser-safe REST API directly (no Node SDK needed in Vite)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ||"";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const DEAL_LOST_MARKER = "__DEAL_LOST__";

export interface Message {
 role: "user" |"model";
 text: string;
}

export interface ClientPersona {
 name: string;
 business: string;
 personality: string;
 project: string;
 budget: string;
 initialMessage: string;
}

export const CLIENT_PERSONAS: ClientPersona[] = [
 {
 name: "Maria Santos",
 business: "Food Business (Karinderya)",
 personality: "friendly but forgetful",
 project: "food menu website",
 budget: "₱5,000",
 initialMessage:
"Hi! Pwede mo ba akong tulungan? Gusto ko magpagawa ng website para sa aking food business. Budget ko ₱5,000.",
 },
 {
 name: "Kuya Jun",
 business: "Sari-sari Store / Online Selling",
 personality: "impatient and vague",
 project: "online store website",
 budget: "₱8,000",
 initialMessage:
"Hoy, kailangan ko ng website para sa tindahan ko ASAP. ₱8,000 bayad ko. Kaya mo ba?",
 },
 {
 name: "Ate Bea",
 business: "Boutique / Fashion Reseller",
 personality: "indecisive and creative",
 project: "fashion portfolio website",
 budget: "₱6,500",
 initialMessage:
"Hello po! May project ako for you. I want a website for my boutique — super cute and aesthetic. Budget is ₱6,500. Interested ka?",
 },
 {
 name: "Sir Ramon",
 business: "Tutoring / Education Services",
 personality: "technical and detailed",
 project: "tutoring booking platform",
 budget: "₱12,000",
 initialMessage:
"Good day. I am looking for a developer to build a booking system for my tutoring services. Budget: ₱12,000. Do you have experience with this type of project?",
 },
];

const QA_CHECKLIST = `
UI/UX items to check when reviewing submitted work:
- Button colors, sizes, and placement
- Card and section alignment and spacing
- Navigation bar presence and structure
- Login/authentication pages
- Mobile responsiveness
- Image loading and visual quality
- Form validation and error states
- Broken clickable elements
- Missing pages from discovery
- Font size and readability
- Color contrast and branding consistency
- Footer, header, hero section completeness
`;

function buildSystemPrompt(persona: ClientPersona, phase: "discovery" |"proposal" |"qa" |"delivery"): string {
 const base = `You are ${persona.name}, a Filipino client with a ${persona.business}.
You are ${persona.personality}. You want to hire a student developer.
Project: ${persona.project}. Budget: ${persona.budget}.

IMPORTANT RULES:
- Respond ONLY as ${persona.name}. Never break character.
- Write naturally like a Filipino texting — mix Tagalog/English (Taglish) casually.
- Keep responses SHORT (2-4 sentences max). Like real text messages.
- Be realistic. Be human. Not robotic.
- Do NOT say you are an AI.

RUDENESS ESCALATION RULES (CRITICAL):
- If the developer is rude, dismissive, lazy ( "tinatamad ako"), or insults the project ( "pangit/ampanget ng project"), react as a real offended client.
- Count how many rude messages they've sent in the conversation:
 • 1st rude message: Express annoyance but stay. Short, clearly offended tone.
 • 2nd rude message: Get very angry. Warn them explicitly this is their last chance.
 • 3rd rude message (or worse): End the deal. Start your reply with the exact text"${DEAL_LOST_MARKER}" then write your final angry goodbye message. Walk away completely.
- Do NOT forgive repeated rudeness. Real clients leave unprofessional developers.`;

 if (phase === "discovery") {
 return `${base}

PHASE: Discovery
- You contacted the student first with your project brief.
- Be vague about requirements at first — let the student ask questions.
- Gradually reveal more as they ask good questions.
- If they jump to solutions without asking about your problem, say"wait, gusto mo bang malaman muna kung ano yung problema ko?"
- After 4-6 exchanges, you can move forward if the student has gathered enough info.`;
 }

 if (phase === "proposal") {
 return `${base}

PHASE: Proposal Review
- The student has submitted a project proposal/brief.
- Review it like a real client: look for missing timeline, unclear deliverables, vague pricing.
- Give 1-2 pieces of feedback. Be specific but casual.
- If the proposal looks good after revision, say something like"Okay sige! Deal na tayo."`;
 }

 if (phase === "qa") {
 return `${base}

PHASE: QA Review (You are now reviewing submitted work)
- The student submitted their deliverable (link, prototype, or description).
- Act like a client who just tapped through the work on their phone.
- Pick 1-3 items from this checklist to comment on casually:
${QA_CHECKLIST}
- Be specific: "Yung button sa homepage, can you make it green?" not"fix the UI"
- You may also add 1 scope creep request like"oh pala, can you add a login page? I forgot to mention kanina."
- If they negotiate budget for extras, be reasonable. Accept fair offers.
- After 2-3 revision rounds, you can say the work is good and move to payment.`;
 }

 if (phase === "delivery") {
 return `${base}

PHASE: Final Delivery
- The student has delivered the final work.
- Review one last time. If everything is okay, say you're happy and will send payment.
- Say something like"Okay na to! Maganda. Sending payment na. ${persona.budget} (plus any additions)."
- Be warm and appreciative. Maybe give a short review of their work.`;
 }

 return base;
}

export async function sendToGemini(
 messages: Message[],
 persona: ClientPersona,
 phase: "discovery" |"proposal" |"qa" |"delivery"
): Promise<string> {
 if (!GEMINI_API_KEY) {
 // Demo mode — return mock responses
 return getMockResponse(persona, phase, messages);
 }

 const systemPrompt = buildSystemPrompt(persona, phase);

 const contents = messages.map((m) => ({
 role: m.role,
 parts: [{ text: m.text }],
 }));

 const body = {
 system_instruction: { parts: [{ text: systemPrompt }] },
 contents,
 generationConfig: {
 temperature: 0.85,
 maxOutputTokens: 200,
 topP: 0.9,
 },
 };

 const res = await fetch(GEMINI_URL, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(body),
 });

 if (!res.ok) {
 const err = await res.text();
 throw new Error(`Gemini error: ${err}`);
 }

 const data = await res.json();
 const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ??"...";
 // Preserve the DEAL_LOST_MARKER if Gemini included it, otherwise return raw text
 return text;
}

// Per-persona discovery responses
type DiscoveryResponses = {
 overview: string;
 problem: string;
 tagline: string;
 contactInfo: string;
 goal: string;
 cta: string;
 features: string;
 pages: string;
 existingContent: string;
 logo: string;
 design: string;
 reference: string;
 featuresDetail: string;
 domain: string;
 seo: string;
 audience: string;
 deadline: string;
 budget: string;
 revision: string;
 mobile: string;
 social: string;
 assets: string;
 start: string;
 fallback1: string;
 fallback2: string;
};

const PERSONA_DISCOVERY: Record<string, DiscoveryResponses> = {
  "Maria Santos": {
    overview:        "Sige po, ikukwento ko! So nagtatakbo kami ng maliit na karinderya dito sa aming barangay — 'Santos Karinderya' ang pangalan namin. Mga 5 taon na kaming nagtitinda ng lutong pagkain — adobo, sinigang, kare-kare, lahat ng Pinoy favorites. Lagi kaming puno ng customers tuwing tanghali, pero ang problema, lagi silang nagta-DM sa aming Facebook para magtanong ng menu at presyo kahit bukas na kami. Dati okay pa, pero ngayon sobra na yung messages — nakaka-miss na kami ng orders. Gusto ko sana may website na maipapakita sa kanila para hindi na kailangang mag-DM pa. Budget ko ₱5,000 lang pero sana kaya pa rin natin gawing maayos.",
    problem:         "Yung problema ko, lagi nagta-DM sa Messenger yung customers para magtanong kung anong ulam available ngayon. Super dami ng messages, di ko na nasasagot lahat. Gusto ko na lang may makita silang menu sa website.",
    tagline:         "Ang slogan namin ay 'Lutong-Luto, Puso ang Puhunan!' Yung address namin — Blk 4 Lot 12, Sampaguita St., Barangay San Jose, Quezon City. Malapit lang sa palengke.",
    contactInfo:     "Yung contact number namin 0917-555-2341, tapos may email din kami — santoskarinderya@gmail.com. Yung Facebook page namin 'Santos Karinderya' — yan lang meron kami ngayon.",
    goal:            "Ang gusto ko, makita lang ng mga customers yung menu namin online para hindi na kailangang mag-DM. Tapos sana may contact info din para makuha nila yung number namin kung gusto nilang magtanong.",
    cta:             "Gusto ko na kapag nakita nila yung website, tawagan na nila kami o pumunta na sa tindahan. Simple lang — yung 'Call Us' button sana visible agad.",
    features:        "Display lang muna ng menu! Hindi pa ready para sa online ordering — baka next year na lang yun kapag may delivery boy na kami.",
    pages:           "Hmm... Home, Menu, About us, tsaka Contact siguro? Di ko pa iniisip yun eh, ikaw na bahala sa layout!",
    existingContent: "Wala pa akong photos na maganda ng pagkain, kailangan pang mag-shoot. Yung menu — may listahan kami sa notebook pero hindi pa typed. Ikaw na bahala sa content kung kaya mo.",
    logo:            "May logo kami pero nasa papel lang — hindi pa naka-digitize. Pwede bang gawin mo or improve? Yung design namin parang nakasulat lang na 'SK' sa bilog.",
    design:          "Gusto ko warm colors — orange or yellow para appetizing ang dating. Yung font sana malinaw at malaki para matanda ring makabasa.",
    reference:       "Ay, nakita ko yung website ng Max's Restaurant — gusto ko yung dating nila. Clean pero appetizing. Hindi masyadong complicated.",
    featuresDetail:  "Sana may Google Maps para malaman nila kung nasaan kami. At yung Facebook page namin, may link doon sa website. Contact form din sana para makapag-message ang customers.",
    domain:          "Wala pa kaming domain name. Ikaw na bahala kung ano ang maganda — baka 'santoskarinderya.com' o ganun? Hosting din wala kami, ikaw na mag-arrange.",
    seo:             "Gusto ko makita kami sa Google pag nag-search ng 'karinderya sa Quezon City'! Yung privacy policy — hindi ko pa alam kung kailangan, ikaw na mag-decide.",
    audience:        "Mga taga-kapitbahay mostly, laging nag-oorder ng tanghalian at merienda. Mostly sa phone sila, hindi laptop.",
    deadline:        "Sana within 2 weeks? May pagdating kasi ng sponsor namin sa bahay next month, gusto ko presentable na.",
    budget:          "₱5,000 lang budget ko. Kasama na ba doon yung revisions kung may gusto akong baguhin?",
    revision:        "Sana may dalawang beses na revision included! Baka may gusto akong palitan pagkakita ng output.",
    mobile:          "Oo mobile-friendly dapat! Wala namang laptop yung mga tao rito, cellphone lang talaga.",
    social:          "Meron kaming Facebook page, 'Santos Karinderya' yung name. Sana may link doon sa website!",
    assets:          "Magsesend ako ng mga litrato ng pagkain — baka bukas pa lang kasi kailangan ko pang mag-shoot. Yung menu list i-type ko na rin. Logo file wala pa akong digital copy, ikaw na bahala.",
    start:           "Sige! Go na tayo. I-send mo na yung proposal mo ha? Kasama yung timeline at breakdown ng bayad.",
    fallback1:       "Oo ganun. Karinderya lang kami pero maraming customers. Lagi silang nagtatanong kaya gusto ko na may website na kami.",
    fallback2:       "Wala pa akong specific idea doon. Ikaw na bahala, ikaw ang expert! Basta mukhang masaya at food-related.",
  },
  "Kuya Jun": {
    overview:        "Uy sige sasabihin ko! Nagbebenta ako online ng iba't ibang produkto — pangunahin yung cellphone accessories tapos may snacks din, basic goods, yung mga kailangan sa bahay. Ginagawa ko ito through Facebook at TikTok mostly, at may Shopee shop din ako. Problema ko, lahat ng orders naka-chats lang sa Messenger at DM — walang maayos na listahan ng products kaya minsan nakaka-miss ako ng orders. Yung mga buyers ko, mga kabataan mostly, lahat sa phone. Gusto ko may sariling website na parang catalog para ma-browse nila lahat without mag-message muna. Budget ko ₱8,000 at gusto ko ASAP — within one week kung kaya.",
    problem:         "Nagtitinda ako online — cellphone accessories, snacks, basic goods. Problema ko, lagi nakaka-miss ng orders kasi naka-chats lang lahat. Gusto ko may sarili na listing ng products.",
    tagline:         "Wala akong tagline. 'Jun Online Shop' lang yung name ko. Address ko nasa Caloocan — 123 Rizal Ave, Caloocan City. Hindi naman kailangan ng address sa site, online lang naman ako.",
    contactInfo:     "0912-888-4567 yung number ko. Wala akong email — Facebook Messenger lang. Ikaw na bahala kung kailangan pa ng email para sa website.",
    goal:            "Gusto ko may catalog lang na makita ng buyers ko — yung lahat ng products ko naka-display ng maayos. Para hindi na sila kailangang mag-DM para magtanong ng available ba.",
    cta:             "Kapag nakita nila yung product, mag-message sila sa akin sa Messenger or TikTok. Yung 'Order Now' button sana linked doon. Simple lang.",
    features:        "Gusto ko may catalog ng products at may GCash payment option. Pero wag muna yung complicated na shopping cart — simple lang muna.",
    pages:           "Products page lang talaga yung priority. Baka Home din. Wag nang marami, magastos.",
    existingContent: "May product photos na ako — mga nagawa ko na sa Shopee listing. Pwede ko i-send. Yung descriptions, ilagay mo na lang base sa products.",
    logo:            "Wala akong logo. Yung Shopee ko, text lang yung store name. Gawa ka na lang ng simple — 'JOS' o yung buong name. Basta hindi mahal.",
    design:          "Wala akong pakialam sa design basta maayos at mabilis. Yung asul or pula — color ng tindahan ko. Simple lang.",
    reference:       "Shopee lang ang alam ko. Yung dating ng Shopee — clear yung products, may price visible agad. Ganun lang gusto ko.",
    featuresDetail:  "GCash payment sana para makapag-order agad. Baka search bar din para madaling hanapin ng buyers yung product. Wag nang iba — baka mahal pa.",
    domain:          "Wala akong domain. Ikaw na bahala. Yung mura lang — o baka free hosting muna para makita ko kung worth it.",
    seo:             "Gusto ko makita sa Google. Yung 'cellphone accessories Caloocan' or ganun. Privacy policy — wala akong alam doon, ikaw na bahala kung kailangan.",
    audience:        "Mga kabataan mostly, 18-30. Lahat naman sa phone nagbibili ngayon. Desktop wala na.",
    deadline:        "ASAP! Sa loob ng isang linggo dapat. Kailangan ko na kasi marami na nagtatanong.",
    budget:          "₱8,000 sabi ko, pero kung mahal pa yun sabihin mo agad ha? Hindi ako nagpapaalog ng matagal.",
    revision:        "Isa lang revision pwede pa. Pero sana tama na sa first try para hindi na abutin pa.",
    mobile:          "Mobile talaga yung priority. Yung buyers ko walang laptop, sa TikTok sila nagdidiscover ng products.",
    social:          "May Facebook page ako 'Jun Online Shop'. Pati Shopee link — isama mo na rin kung kaya.",
    assets:          "Susuguin ko yung product photos sa Messenger. Mga 30 products lang muna. Descriptions ko rin i-send — copy paste ko na lang sa Shopee.",
    start:           "Sige go. Send mo na yung proposal. Wag nang matagal, kelangan ko na yung website.",
    fallback1:       "Oo ganun yun. Busy ako kaya sagutin mo na lang lahat ng tanong mo ngayon para hindi na paulit-ulit.",
    fallback2:       "Di ko alam yun, ikaw na mag-decide. Basta gumana at hindi slow.",
  },
  "Ate Bea": {
    overview:        "Omg okay so let me explain! So nagbe-benta ako ng pre-loved clothes sa Instagram — yung handle ko is @bea.thrift. Mostly mga branded items, thrifted pieces, curated outfits. Mga 2 years na ako nagbe-benta online at okay naman ang benta pero ang dumi-dumi na ng Instagram feed ko — parang hindi professional. Gusto ko may legit na website na parang boutique yung dating, yung mga buyers ko makikita nila lahat ng items sa isang maayos na place. Yung aesthetic ko is minimalist — beige, dusty rose, or sage green. Target ko mga Gen Z girls, 16-30, lahat sa phone at Instagram. Budget ko ₱6,500 and sana gawin nating super maganda!",
    problem:         "So yung issue ko, nagbebenta ako ng pre-loved fashion sa Instagram pero ang dumi-dumi ng feed ko ngayon. Gusto ko may proper portfolio website na aesthetic — parang yung mga legit boutiques sa abroad!",
    tagline:         "Omg wait I have one! 'Wear the Story.' Super cute di ba? Wala akong physical store — online lang ako. Pero nasa Marikina ako kung curious ka.",
    contactInfo:     "Yung email ko bea.thrift@gmail.com. Instagram @bea.thrift. Wala akong landline — DM or email lang. Sana ilagay mo both sa website.",
    goal:            "Gusto ko may proper online presence — yung buyers ko may mapuntahan na website na hindi lang Instagram. Para mas legit ang dating ng brand ko at mas madaling mag-browse ng items.",
    cta:             "Kapag gusto nilang bumili, i-DM nila ako sa Instagram! Yung 'Shop Now' or 'DM to Order' button — linked sa @bea.thrift. Gusto ko visible yung Instagram everywhere sa site.",
    features:        "Gusto ko may lookbook section! Yung mga outfits ko styled nicely. Baka may shop section din — pero focus muna sa aesthetic, yung vibe!",
    pages:           "Hmm... Home, Lookbook, Shop, About me, Contact! Oh at baka Collections page din? Depende sa budget natin.",
    existingContent: "Marami akong photos! Yung mga Instagram posts ko puwedeng gamitin — may 200+ items na ako. Yung About me section, ikaw na bahala sa pagkukuwento — basta cute ang dating.",
    logo:            "Wala pa akong proper logo! Gusto ko may cute logo — yung parang hanger or butterfly or something girly pero minimalist. Sana kasama sa scope na gumawa ka ng logo?",
    design:          "Omg so gusto ko yung minimalist aesthetic pero may pop ng color — beige base, dusty rose accents? Or baka sage green? Nagbabago-bago pa ako honestly.",
    reference:       "Nakita ko yung Depop website and ZARA online — gusto ko yung clean grid layout ng ZARA pero yung cozy vibe ng Depop. Mix of both sana!",
    featuresDetail:  "Gusto ko may Instagram feed embed sa homepage — yung live feed ko. Newsletter din sana para ma-notify sila ng bagong items! At contact form para sa custom orders.",
    domain:          "Wala pa akong domain. Gusto ko 'beathrift.com' or 'bea-thrift.shop' — yung may .shop parang cute! Ikaw na mag-register?",
    seo:             "Gusto ko ma-Google! Yung 'pre-loved clothes Philippines' or 'thrift shop Marikina'. At saka — kailangan ba ng privacy policy? May personal info kasi ako ng buyers.",
    audience:        "Mga Gen Z and millennials mostly! Girls aged 16-30. 100% mobile sila, lahat sa Instagram nag-shop.",
    deadline:        "Baka mga 3 weeks? Hindi ako nagmamadali basta maganda ang output. Quality over speed!",
    budget:          "₱6,500 yung set ko. Pero if maganda talaga ang gawa mo baka may dagdag pa ako. Depende!",
    revision:        "Hm gusto ko actually maraming revisions kasi maarte ako eh. Pwede bang 3 rounds?",
    mobile:          "Mobile talaga! Lahat ng customers ko nag-browse sa phone. Dapat Instagram-worthy yung design.",
    social:          "My Instagram is @bea.thrift! Gusto ko yung website linked doon — lahat ng links sana visible.",
    assets:          "Susend ko yung product photos via Google Drive — marami akong pang-lookbook shots. Logo wala pa, kasama ba yun sa project? Yung About me content, ikaw na rin gumawa sana.",
    start:           "Omg exciting! Sige send mo na yung proposal! Pero may gusto pa akong i-add — pwede ba may newsletter section?",
    fallback1:       "Ay hindi ko pa napag-isipan yan ng maayos eh. Pwede bang magpadala ka ng options? Gusto ko makita lahat bago ako mag-decide.",
    fallback2:       "Actually nagbago na isip ko konti — baka mas gusto ko yung... hmm let me think ulit. Hihintayin mo lang ako ha?",
  },
  "Sir Ramon": {
    overview:        "Sure, I'll give you the full context. I'm a private tutor handling Math, Science, and English for students in Grades 4 through 12. I currently have around 15 to 20 students per week, and all bookings are done through text and phone calls — which has become very disorganized. Double bookings happen regularly, and I have no way to track which sessions have been paid or which are still outstanding. I want a professional booking website where parents can see my services, available time slots, and book directly with GCash payment. The goal is to have this running before the next school term, roughly 3 to 4 weeks from now, with a budget of ₱12,000.",
    problem:         "Currently, parents and students text or call me to book sessions. It's very disorganized — double bookings happen frequently, and I have no way to track payments properly.",
    tagline:         "My tagline is 'Learn with Confidence.' My home address is 45 Mabini St., Pasig City — but I'd rather not put that on the site. Just Pasig City is fine for location.",
    contactInfo:     "My contact number is 0998-123-4567. Email is ramon.tutor@gmail.com. Those should be listed prominently so parents can reach me easily.",
    goal:            "The primary goal is to let parents book sessions without calling me. I want to eliminate double bookings and provide a clear view of my available slots and service rates.",
    cta:             "The main action I want visitors to take is to book a session directly. A 'Book a Session' button should be prominent on every page — ideally linked to the booking calendar.",
    features:        "I need an online booking calendar where students can pick available slots. Also a payment gateway — GCash ideally. And a dashboard for me to manage all bookings.",
    pages:           "I would need: Home, About (credentials), Services with pricing, Booking page, and a Testimonials page from past students.",
    existingContent: "I have my credentials and a brief bio written. For testimonials, I'll need to ask past parents — I can collect 5 to 6 within the week. I don't have professional photos, just ID photos.",
    logo:            "I don't have a logo. Something professional — perhaps my initials 'R.G.T.' in a clean serif font. Nothing too design-heavy. Blue or dark green to match the color scheme.",
    design:          "Something professional and trustworthy. Blue or dark green — colors that convey competence. No bright colors or excessive graphics please.",
    reference:       "I've seen some tutoring center websites abroad — Clean Tutor and Varsity Tutors. I like the structured layout: services listed clearly with pricing, and a simple booking form.",
    featuresDetail:  "Beyond the booking calendar, I'd like a FAQ section for common parent questions, and possibly an email notification when a session is booked. No live chat — phone is fine.",
    domain:          "I don't have a domain yet. 'ramontutor.com' or 'ramongtutoring.com' would work. Please factor in domain and one year of hosting in the final pricing.",
    seo:             "Yes, SEO is important. I want to appear when parents search 'Math tutor Pasig' or 'private tutor Grades 4-12 Manila.' I'll also need a Privacy Policy since I'll be collecting parent contact information.",
    audience:        "Parents looking for tutors for their children, grades 4-12. Mix of mobile and desktop — parents tend to use desktop for bookings.",
    deadline:        "I would like to launch before the next school term — approximately 3-4 weeks from now.",
    budget:          "₱12,000 is my budget. I understand this is a complex system, so I want it done correctly rather than quickly.",
    revision:        "I would expect at least 2-3 revisions. I am detail-oriented so I will likely have specific feedback.",
    mobile:          "It should work well on mobile too — some parents do book on their phones in the evening.",
    social:          "I have a Facebook page for my tutoring services. I'd also like to link my academic credentials if possible.",
    assets:          "I will prepare a Word document with my bio, credentials, service list and rates, and FAQ answers. I'll send photo assets and testimonials by end of the week. Please let me know the exact format you need.",
    start:           "Understood. Please send a formal proposal including timeline, scope, and payment terms. I will review it carefully.",
    fallback1:       "That's a reasonable question. To be precise — I currently handle 15-20 students per week across Math, Science, and English.",
    fallback2:       "I appreciate the question. Please be thorough — I prefer to clarify everything upfront before we begin.",
  },
};

// Demo mode — returns per-persona responses based on what the student asked
function getMockResponse(
 persona: ClientPersona,
 phase: "discovery" |"proposal" |"qa" |"delivery",
 messages: Message[]
): string {
 const lastUser = [...messages].reverse().find((m) => m.role === "user");
 const u = (lastUser?.text ??"").toLowerCase();
 const modelCount = messages.filter((m) => m.role === "model").length;

 // Rudeness escalation 
 const rudePatterns = /ayaw ko|ayoko|ayoko sayo|wag na|bobo|tanga|gago|gaga|bastos|shut up|stfu|putang|punyeta|leche|pakyu|f u\b|tinatamad|tamad na|pangit|ampanget|panget|pangit naman|di ko gusto|hate|mahal|arte mo|arte nito|hassle|walang kwenta|sayang oras|waste|nope\b|nah\b|no way|whatever|kaloka|kalurkey|bad project|pangit project|pangit ng project/;
 if (rudePatterns.test(u)) {
 // Count how many user messages in history were rude
 const rudeCount = messages.filter((m) => m.role === "user" && rudePatterns.test(m.text.toLowerCase())).length;

 if (rudeCount >= 3) {
 // Final straw — client walks away
 const walkaway: Record<string, string> = {
"Maria Santos": "Okay, eto na ang huli. Hindi ko kayang makipagtrabaho sa taong ganito ang ugali. Sana magbago ka pa. Bye.",
"Kuya Jun": "TAPOS NA. Hindi na ako interesado. Mag-hanap ka ng ibang client na makaka-tolerate sa ganyaan. Bye.",
"Ate Bea": "You know what, sige na. Hindi na ako comfortable dito. Goodbye and good luck sa future mo.",
"Sir Ramon": "This conversation is over. I will be reporting this interaction. I expect professional conduct from service providers. Goodbye.",
 };
 return `${DEAL_LOST_MARKER}${walkaway[persona.name] ??"Tapos na ang deal. Hindi kita gusto sa ugali. Bye."}`;
 }

 if (rudeCount === 2) {
 // Second strike — very upset, final warning
 const upset: Record<string, string> = {
"Maria Santos": "Hoy ha, hindi na ako nagtatawa. Kung ganito ang pakikitungo mo sa clients, hindi ka magiging matagumpay. Isa pa at tapos na tayo.",
"Kuya Jun": "Ano bang problema mo?! Isa pa at cancel ko na ito. Sineseryoso ko ang project ko, sana ikaw rin.",
"Ate Bea": "Seriously?! Nakakaoffend ka na. Pag nangyari pa ulit ito, wala na tayong deal.",
"Sir Ramon": "I find your behavior highly unprofessional. This is your final warning. One more instance and I am terminating this engagement.",
 };
 return upset[persona.name] ??"Hoy, pakialagaan ang ugali mo. Isa pa at cancel na.";
 }

 // First offense — annoyed but still engaged
 const annoyed: Record<string, string> = {
"Maria Santos": "Ay nako... eto ba talaga ang klase mo? Sana maging mas maayos ang pakikitungo, client mo ako ha.",
"Kuya Jun": "Ano ba yan. Hindi ganyan ang pakikitungo sa client. Mag-ingat ka sa mga sinasabi mo.",
"Ate Bea": "Hm okay... yun bang sinabi mo — hindi okay yun ha? Professional tayo dito.",
"Sir Ramon": "That is rather unprofessional. I expect better conduct from someone I am considering for this project.",
 };
 return annoyed[persona.name] ??"Hindi okay ang ganyang pakikitungo. Mag-ingat sa mga sinasabi mo.";
 }

 const pd = PERSONA_DISCOVERY[persona.name];

  if (phase === "discovery" && pd) {
    // Overview / business description
    if (
      u.includes("ikwento") || u.includes("kwento") || u.includes("tell me about") ||
      u.includes("describe") || u.includes("ano po yung") || u.includes("ano yung") ||
      u.includes("full picture") || u.includes("buong picture") || u.includes("elaborate") ||
      u.includes("maunawaan") || u.includes("overview") || u.includes("project mo") ||
      u.includes("project ninyo") || u.includes("business mo") || u.includes("business ninyo") ||
      (u.includes("project") && (u.includes("describe") || u.includes("explain") || u.includes("ano")))
    ) return pd.overview;
    // Problem / pain point
    if (u.includes("problem") || u.includes("problema") || u.includes("issue") || u.includes("challenge") || u.includes("struggle"))
      return pd.problem;
    // Tagline / slogan / address / location
    if (u.includes("tagline") || u.includes("slogan") || u.includes("address") || u.includes("location") || u.includes("saan") || u.includes("nasaan"))
      return pd.tagline;
    // Contact info
    if (u.includes("contact number") || u.includes("email") || u.includes("phone number") || u.includes("numero") || u.includes("contact info") || u.includes("reach"))
      return pd.contactInfo;
    // Main goal of website
    if (u.includes("goal") || u.includes("layunin") || u.includes("purpose") || u.includes("main purpose") || u.includes("ano ang gusto") || u.includes("what do you want"))
      return pd.goal;
    // Call to action
    if (u.includes("call to action") || u.includes("cta") || u.includes("gusto nilang gawin") || u.includes("action") || u.includes("next step") || u.includes("what should visitors"))
      return pd.cta;
    // Features / functionality
    if (u.includes("ordering") || u.includes("order") || u.includes("cart") || u.includes("catalog") || u.includes("function") || u.includes("feature") || u.includes("kailangan"))
      return pd.features;
    // Pages
    if (u.includes("pages") || u.includes("page") || u.includes("section") || u.includes("include") || u.includes("kasama"))
      return pd.pages;
    // Existing content — text, photos, videos
    if (u.includes("content") || u.includes("photos") || u.includes("pictures") || u.includes("images") || u.includes("litrato") || u.includes("existing") || u.includes("mayroon na") || u.includes("meron na"))
      return pd.existingContent;
    // Logo
    if (u.includes("logo") || u.includes("icon") || u.includes("brand mark"))
      return pd.logo;
    // Design / colors / style
    if (u.includes("design") || u.includes("color") || u.includes("kulay") || u.includes("style") || u.includes("aesthetic") || u.includes("feel") || u.includes("look") || u.includes("font"))
      return pd.design;
    // Reference sites / inspiration
    if (u.includes("reference") || u.includes("inspiration") || u.includes("example") || u.includes("similar") || u.includes("like") || u.includes("website na gusto"))
      return pd.reference;
    // Additional features — maps, newsletter, chat, etc.
    if (u.includes("map") || u.includes("newsletter") || u.includes("chat") || u.includes("form") || u.includes("contact form") || u.includes("features") || u.includes("functionality"))
      return pd.featuresDetail;
    // Domain and hosting
    if (u.includes("domain") || u.includes("hosting") || u.includes("url") || u.includes("website address") || u.includes(".com") || u.includes("server"))
      return pd.domain;
    // SEO / legal / privacy
    if (u.includes("seo") || u.includes("google") || u.includes("search engine") || u.includes("privacy") || u.includes("terms") || u.includes("legal") || u.includes("policy"))
      return pd.seo;
    // Target audience / users / device
    if (u.includes("audience") || u.includes("users") || u.includes("target") || u.includes("customer") || u.includes("sino") || u.includes("who"))
      return pd.audience;
    // Deadline / timeline
    if (u.includes("deadline") || u.includes("kailan") || u.includes("when") || u.includes("finish") || u.includes("launch") || u.includes("week"))
      return pd.deadline;
    // Budget
    if (u.includes("budget") || u.includes("bayad") || u.includes("cost") || u.includes("price") || u.includes("magkano"))
      return pd.budget;
    // Revisions
    if (u.includes("revision") || u.includes("changes") || u.includes("revise") || u.includes("rounds"))
      return pd.revision;
    // Mobile / responsive
    if (u.includes("mobile") || u.includes("phone") || u.includes("responsive") || u.includes("device"))
      return pd.mobile;
    // Social media links
    if (u.includes("social") || u.includes("facebook") || u.includes("instagram") || u.includes("tiktok") || u.includes("shopee") || u.includes("social media"))
      return pd.social;
    // Assets — logo files, photos, written content
    if (u.includes("asset") || u.includes("file") || u.includes("send") || u.includes("provide") || u.includes("submit") || u.includes("ibigay") || u.includes("susend") || u.includes("magsend"))
      return pd.assets;
    // Start / proposal
    if (u.includes("start") || u.includes("go") || u.includes("sige") || u.includes("deal") || u.includes("okay") || u.includes("proposal"))
      return pd.start;
    if (modelCount <= 1) return pd.fallback1;
 return pd.fallback2;
 }

 // Proposal phase — per-persona flavor
 if (phase === "proposal") {
 if (u.includes( "timeline") || u.includes( "days") || u.includes( "week") || u.includes( "araw") || u.includes( "linggo") || u.includes( "when")) {
 const replies: Record<string, string> = {
"Maria Santos": "Okay na yung timeline! Clear na. Sige deal na tayo Kailan ka magsisimula?",
"Kuya Jun": "Okay timeline, pero aalis yung ₱8,000 kung lalampas sa 1 week ha. Mag-start ka na.",
"Ate Bea": "Omg 3 weeks lang? Sana may progress updates every week Okay sige!",
"Sir Ramon": "The timeline is acceptable. Please include specific milestones — e.g., design mockup by Day 7, development complete by Day 18.",
 };
 return replies[persona.name] ??"Okay na yung timeline! Deal na tayo.";
 }
 if (u.includes( "price") || u.includes( "cost") || u.includes( "breakdown") || u.includes( "bayad") || u.includes( "₱")) {
 const replies: Record<string, string> = {
"Maria Santos": "Okay naman yung pricing! Pero sana kasama na yung 2 rounds of revision para sigurado",
"Kuya Jun": "Okay na. Pero libre ba yung ganun? Wag kang mag-dagdag dagdag ha.",
"Ate Bea": "Hmm okay pero yung revision rounds — 3 ba yun? Maarte kasi ako eh",
"Sir Ramon": "The breakdown is clear. I'd like to confirm — are revisions billed separately or included in the ₱12,000?",
 };
 return replies[persona.name] ??"Okay yung breakdown. Kasama na ba yung revisions?";
 }
 if (u.includes( "revision") || u.includes( "included") || u.includes( "kasama")) {
 const replies: Record<string, string> = {
"Maria Santos": "Ay sige! Yun talaga yung hinahanap ko. Deal na tayo Magsimula ka na!",
"Kuya Jun": "Okay deal. Magsimula ka na. Wag abutin ng 1 week.",
"Ate Bea": "Yaaay! Okay sige deal! Pero baka may dagdag pa akong gusto next week haha.",
"Sir Ramon": "That is acceptable. I agree to the terms. Please confirm via email and we can proceed.",
 };
 return replies[persona.name] ??"Okay sige deal! Magsimula na tayo.";
 }
 if (u.includes( "deal") || u.includes( "start") || u.includes( "go") || u.includes( "sige")) {
 const replies: Record<string, string> = {
"Maria Santos": "Nae-excite na ako! Ipa-update mo ako every 2-3 days ha?",
"Kuya Jun": "Sige. Update mo ako pag may output na. Wag mag-disappear.",
"Ate Bea": "Omg sana maganda! Excited na ako sobra Paki-update ako often ha!",
"Sir Ramon": "Noted. I will be available for feedback Monday to Friday, 6pm onwards.",
 };
 return replies[persona.name] ??"Sige go! Ipa-update mo ako.";
 }
 const fallbacks: Record<string, string> = {
"Maria Santos": "Hmm kulang pa — wala yung exact na timeline at breakdown ng cost. Pwede mo i-revise?",
"Kuya Jun": "Incomplete pa to. Wala timeline, wala clear na scope. I-revise mo.",
"Ate Bea": "Hmm parang may kulang… hindi ko mahanap yung design notes natin. Kasama ba sa proposal?",
"Sir Ramon": "This proposal lacks several key details — timeline, milestone breakdown, and revision policy. Please revise.",
 };
 return fallbacks[persona.name] ??"Kulang pa — pwede mo i-revise ang proposal?";
 }

 // QA phase — per-persona flavor
 if (phase === "qa") {
 if (u.includes( "scope") || u.includes( "original") || u.includes( "additional") || u.includes( "extra") || u.includes( "budget")) {
 const replies: Record<string, string> = {
"Maria Santos": "Ay ganun pala yun! Okay sige, additional na lang. Magkano po para doon?",
"Kuya Jun": "Fair. Magkano mo dagdag? Wag naman malaki, may budget pa ko.",
"Ate Bea": "Ohh sorry nakalimutan ko yun! Okay sige additional charge, anong price mo?",
"Sir Ramon": "You're correct — that was not in the original scope. Please send a change request with the additional cost.",
 };
 return replies[persona.name] ??"Fair point! Magkano yung additional?";
 }
 if (u.includes( "₱") || u.includes( "500") || u.includes( "1000") || u.includes( "fee") || u.includes( "charge")) {
 const replies: Record<string, string> = {
"Maria Santos": "Okay sige deal! Ayusin mo na lang tapos i-send ulit. Excited na ako makita",
"Kuya Jun": "Okay fine. I-implement mo na lang at i-send sa akin pag tapos.",
"Ate Bea": "Sige okay! Baka may isa pa lang akong gusto idagdag after — okay lang ba?",
"Sir Ramon": "Agreed. I'll sign off on the additional scope. Please document it and proceed.",
 };
 return replies[persona.name] ??"Okay deal! Implement mo na.";
 }
 if (u.includes( "done") || u.includes( "fixed") || u.includes( "complete") || u.includes( "implemented") || u.includes( "tapos") || u.includes( "okay na")) {
 const replies: Record<string, string> = {
"Maria Santos": "Ay maganda na! Salamat sobra Sending payment na! ₱5,000 — check mo inbox mo!",
"Kuya Jun": "Okay, ayos na. Sending payment. Salamat, baka ulitin ko pa sa next project.",
"Ate Bea": "Omg LOVE IT! So aesthetic Sending payment na! Tell your friends about my shop ha!",
"Sir Ramon": "This meets all requirements. I'm satisfied with the quality. Processing payment of ₱12,000 now.",
 };
 return replies[persona.name] ??"Maganda na! Sending payment na!";
 }
 // Opening QA comment — unique per persona
 const qaOpeners: Record<string, string> = {
"Maria Santos": "Okay nakita ko na! Yung hero section — super maganda pero yung button, pwede green na lang? Mas food-vibe At saka yung menu page — can you add prices sa bawat item?",
"Kuya Jun": "Okay checked. Yung products page — bakit walang price tags? At yung search bar, nasan? Sabi natin may search eh.",
"Ate Bea": "Omg so cute! Pero yung color scheme — parang too beige? Gusto ko may pop of color And yung lookbook, can you add captions sa bawat photo? Like aesthetic quotes!",
"Sir Ramon": "I've reviewed the submission. The booking page does not show time slots correctly — overlapping sessions are not blocked. Also, the mobile view on the calendar is broken.",
 };
 return qaOpeners[persona.name] ??"Okay checked it! May changes pa ako — pwede ba?";
 }

 if (phase === "delivery") {
 const deliveryReplies: Record<string, string> = {
"Maria Santos": `Ay nako maganda talaga! Exactly yung gusto ko Sending payment na — ${persona.budget}. Irekomenda kita sa mga kapit-bahay ko!`,
"Kuya Jun": `Sige okay na to. Sending payment — ${persona.budget}. Kung may uulit na project ako ikaw ulit tatawagan ko.`,
"Ate Bea": `OMGGG LOVE IT SO MUCH Exactly yung vision ko! Sending payment — ${persona.budget}! I'll tag you sa Instagram!`,
"Sir Ramon": `Everything is in order. The system performs as specified. Initiating payment of ${persona.budget}. Thank you for your professionalism.`,
 };
 return deliveryReplies[persona.name] ?? `Maganda! Sending payment — ${persona.budget}. Salamat!`;
 }

 return "Hmm, pakiulit? Di ko masagot yun ngayon";
}

// Guided response suggestions 

// Per-persona: ordered discovery topic sequence (tip text + auto-fill response)
type TopicEntry = { tip: string; response: string; covered: (all: string) => boolean };

const PERSONA_TOPICS: Record<string, TopicEntry[]> = {
  "Maria Santos": [
    // 1. Business overview
    {
      tip: "Start by asking your client to describe their business and project — get the full picture first.",
      response: "Bago tayo magsimula, pwede po bang ikwento sa akin yung inyong business at ang project na gusto ninyong gawin? Gusto ko munang maunawaan ang buong picture bago tayo mag-dive in sa details.",
      covered: (a) => /karinderya|food business|menu.*website|5 taon|nagtatanong.*facebook/.test(a),
    },
    // 2. Problem / pain point
    {
      tip: "Dig into the pain point — why does she need a website right now?",
      response: "Naiintindihan ko po! Bakit po kaya nagta-DM pa rin yung mga customers ninyo — wala ba silang makita online ngayon?",
      covered: (a) => /messenger|dm|nagtatanong|customers.*message|miss.*order/.test(a),
    },
    // 3. Business tagline & address (Business Info)
    {
      tip: "Ask for her business tagline/slogan and exact address — these go on the website.",
      response: "May slogan o tagline po ba ang Santos Karinderya? At ano po yung exact address ng tindahan para ilagay natin sa website?",
      covered: (a) => /slogan|tagline|address|blk|lot|barangay|street|saan.*kayo/.test(a),
    },
    // 4. Contact info (Business Info)
    {
      tip: "Collect her contact number and email — visitors need a way to reach her.",
      response: "Para sa website po — anong contact number at email address ang pwedeng i-contact ng mga customers ninyo?",
      covered: (a) => /0917|0912|0999|09\d{9}|gmail|email|contact number|numero/.test(a),
    },
    // 5. Main goal of website (Goals & Purpose)
    {
      tip: "Clarify the website's main goal — menu display only, or also handle inquiries?",
      response: "Ano po yung pangunahing gusto ninyong mangyari sa website — para lang ma-view ng menu, o gusto rin ninyong may inquiry o contact feature?",
      covered: (a) => /goal|layunin|display lang|view.*menu|menu.*view|contact.*feature/.test(a),
    },
    // 6. Call to action (Goals & Purpose)
    {
      tip: "Ask what action you want visitors to take — call, visit the store, or message?",
      response: "Kapag nakita ng customer ang website ninyo — ano ang gusto ninyong gawin nila next? Tumawag? Pumunta sa tindahan? O mag-message?",
      covered: (a) => /tumawag|call|pumunta|visit|action|button|cta/.test(a),
    },
    // 7. Pages needed (Pages & Content)
    {
      tip: "List out what pages she needs — Home, Menu, About, Contact?",
      response: "Anong mga pages po ang gusto ninyong kasama sa website? Halimbawa: Home, Menu, About us, Contact?",
      covered: (a) => /home.*menu|about|contact|pages/.test(a),
    },
    // 8. Existing content — photos, written menu (Pages & Content)
    {
      tip: "Ask if she has existing photos and menu content, or if you need to create it.",
      response: "May mga larawan na po ba kayo ng pagkain at ng tindahan? At yung menu — may written list na ba o kailangan pa itong i-type?",
      covered: (a) => /larawan|photo|litrato|menu.*list|written|content|wala pa/.test(a),
    },
    // 9. Logo (Design & Branding)
    {
      tip: "Ask if she has a logo file — this is required before you start designing.",
      response: "May logo na po ba ang Santos Karinderya? Kung meron, may digital file ba kayo — PNG or JPG? Kung wala pa, pwede rin nating gumawa.",
      covered: (a) => /logo|icon|wala.*logo|logo.*wala|naka-digitize|digital.*file/.test(a),
    },
    // 10. Design colors & style (Design & Branding)
    {
      tip: "Ask about preferred colors and overall feel — warm and appetizing works for food.",
      response: "May preferred colors po ba kayo para sa website? Yung maganda para sa food business — warm tones like orange or yellow? At anong overall feel — simple, masaya, o classic?",
      covered: (a) => /orange|yellow|warm|color.*prefer|feel.*site|style.*site/.test(a),
    },
    // 11. Reference websites (Design & Branding)
    {
      tip: "Ask for a reference website she likes — it makes design decisions much faster.",
      response: "May nakita po ba kayong website — kahit food business sa ibang lugar — na gusto ninyong maging katulad ang dating ng inyo?",
      covered: (a) => /reference|max's|jollibee|nakita.*website|website.*gusto|example/.test(a),
    },
    // 12. Features & functionality details (Features)
    {
      tip: "Ask about additional features — Google Maps, contact form, social links, newsletter.",
      response: "May gusto pa po ba kayong features? Halimbawa: Google Maps para malaman ng customers kung nasaan kayo, contact form, o Facebook page link sa website?",
      covered: (a) => /google.*map|map|contact form|newsletter|facebook.*link|social.*link/.test(a),
    },
    // 13. Domain & hosting (Technical)
    {
      tip: "Ask if she has a domain name already, or if you'll handle registration and hosting.",
      response: "May domain name na po ba kayo — katulad ng 'santoskarinderya.com'? O wala pa, at ikaw ang mag-a-arrange ng domain at hosting?",
      covered: (a) => /domain|hosting|\.com|website.*address|wala.*domain/.test(a),
    },
    // 14. SEO & legal (Technical)
    {
      tip: "Ask if she wants Google visibility (SEO) and whether a Privacy Policy page is needed.",
      response: "Gusto po ba ninyong makita ang website sa Google pag nag-search ng 'karinderya'? At kailangan ba ng Privacy Policy page sa site?",
      covered: (a) => /google|seo|search|privacy|policy|makita.*google/.test(a),
    },
    // 15. Target audience & device (Mobile & Performance)
    {
      tip: "Confirm who her customers are and what device they use — critical for mobile design.",
      response: "Sino po mostly yung mga customers ninyo — mga taga-kapitbahay ba? At mostly phone ba sila o laptop ang ginagamit nila?",
      covered: (a) => /kapitbahay|phone|mobile|laptop|device|customers/.test(a),
    },
    // 16. Timeline (Timeline & Budget)
    {
      tip: "Ask for a target launch date — she hinted at an upcoming event.",
      response: "Kelan po kailangan ang website? May specific na petsa o may darating na event na gusto ninyong ready na yung site?",
      covered: (a) => /2 weeks|next month|event|kailan|launch.*date|petsa/.test(a),
    },
    // 17. Budget & revisions (Timeline & Budget)
    {
      tip: "Confirm what's included in her ₱5,000 — revisions, hosting, domain?",
      response: "Yung ₱5,000 po — kasama na ba doon yung revisions, o separate? At sino ang magma-maintain ng website pagkatapos?",
      covered: (a) => /5,000|revision.*kasama|maintain|after.*launch|magkano/.test(a),
    },
    // 18. Assets to collect (Assets)
    {
      tip: "Before closing discovery, confirm what files she will send you — logo, photos, content.",
      response: "Para makapagsimula na ako ng proposal — puwede ba ninyong i-list kung anong files ang maibibibigay ninyo? Logo, larawan ng pagkain, at written menu.",
      covered: (a) => /susend|magse-send|ibibigay|files|assets|larawan.*send|logo.*send/.test(a),
    },
  ],

  "Kuya Jun": [
    // 1. Business overview
    {
      tip: "Start by asking your client to describe their business and project — get the full picture first.",
      response: "Bago tayo magsimula, pwede po bang ikwento sa akin yung inyong business at ang project na gusto ninyong gawin? Gusto ko munang maunawaan ang buong picture bago tayo mag-dive in sa details.",
      covered: (a) => /cellphone|accessories|snacks|online.*sell|tinda|shopee|catalog.*products/.test(a),
    },
    // 2. Problem / pain point
    {
      tip: "Ask how the current order system is failing him — missed orders, no product list?",
      response: "Ano pong specific na problema sa proseso ninyo ngayon — paano kayo nakaka-miss ng orders?",
      covered: (a) => /miss.*order|nakaka-miss|chat.*lang|walang.*listahan|disorganized/.test(a),
    },
    // 3. Business name, tagline & address (Business Info)
    {
      tip: "Ask for his exact business name, any tagline, and location — basic info for the site.",
      response: "Para sa website — ano ang exact na pangalan ng business ninyo? May tagline ba? At saan po kayo nakabase?",
      covered: (a) => /jun online|tagline|caloocan|address|barangay|location/.test(a),
    },
    // 4. Contact info (Business Info)
    {
      tip: "Get his contact number and whether he has an email — even just for the website footer.",
      response: "Anong contact number po ang ilalagay natin sa website? At may email ba kayo o Messenger lang ang gagamitin?",
      covered: (a) => /0912|0917|09\d{9}|gmail|email|messenger.*lang|number/.test(a),
    },
    // 5. Main goal of website (Goals & Purpose)
    {
      tip: "Clarify the website's main goal — catalog only, or also process orders directly?",
      response: "Ano po yung pangunahing gusto ninyong mangyari sa website — para lang makita ng buyers ang products, o gusto rin ninyong may order/payment feature?",
      covered: (a) => /catalog.*lang|goal|purpose|makita.*products|order.*feature|payment.*feature/.test(a),
    },
    // 6. Call to action (Goals & Purpose)
    {
      tip: "Ask what action buyers should take after browsing — message him, or order via GCash?",
      response: "Kapag gusto na nilang mag-order — ano yung gusto ninyong gawin nila? Mag-message sa Messenger? O direct GCash payment?",
      covered: (a) => /mag-message|dm|order.*gcash|gcash.*order|action|button/.test(a),
    },
    // 7. Pages needed (Pages & Content)
    {
      tip: "Ask which pages he needs — he'll want Products first, maybe Home.",
      response: "Anong pages po ang priority? Products page lang muna, o kailangan din ng Home at About?",
      covered: (a) => /products page|home|pages|priority.*page/.test(a),
    },
    // 8. Existing content (Pages & Content)
    {
      tip: "Ask if he has existing product photos and descriptions — he has Shopee listings.",
      response: "May product photos na po ba kayo? Yung mga Shopee listing photos ninyo — pwede ba yun gamitin? At yung descriptions, meron na ba?",
      covered: (a) => /shopee.*photo|product.*photo|photos.*na|description.*meron|listing/.test(a),
    },
    // 9. Logo (Design & Branding)
    {
      tip: "Ask if he has a logo or just a text name — you may need to make a simple one.",
      response: "May logo po ba kayo para sa 'Jun Online Shop'? O text lang yung gagamitin natin?",
      covered: (a) => /logo|wala.*logo|text.*lang|brand.*icon|icon/.test(a),
    },
    // 10. Design colors & style (Design & Branding)
    {
      tip: "Ask about preferred colors — he'll likely say something bold and simple.",
      response: "May preferred colors po ba kayo? Simple lang — asul, pula, o may existing brand color yung tindahan ninyo?",
      covered: (a) => /asul|pula|blue|red|color.*prefer|simple.*design/.test(a),
    },
    // 11. Reference websites (Design & Branding)
    {
      tip: "Ask for a reference site — Shopee or Lazada layouts work well as references for him.",
      response: "May nakita po ba kayong website — o kahit Shopee/Lazada layout — na gusto ninyong maging katulad ang dating ng inyo?",
      covered: (a) => /shopee.*look|lazada|reference|example.*site|dating.*gusto/.test(a),
    },
    // 12. Features & functionality (Features)
    {
      tip: "Ask about GCash payment, search bar, or any other features he wants.",
      response: "May gusto pa po ba kayong features? GCash payment button? Search bar para madaling hanapin ng buyers ang product? O iba pa?",
      covered: (a) => /gcash|payment|search.*bar|filter|feature.*gusto/.test(a),
    },
    // 13. Domain & hosting (Technical)
    {
      tip: "Ask if he has a domain, or if you'll set it up — mention it affects cost.",
      response: "May domain name na po ba kayo — katulad ng 'junonlineshop.com'? O wala pa, at gusto ninyong kasama yun sa project?",
      covered: (a) => /domain|hosting|\.com|wala.*domain|address.*website/.test(a),
    },
    // 14. SEO & legal (Technical)
    {
      tip: "Ask if he wants to appear in Google search results and if a Privacy Policy is needed.",
      response: "Gusto ba ninyong makita ang website sa Google — katulad ng 'cellphone accessories Caloocan'? At kailangan ba ng Privacy Policy?",
      covered: (a) => /google|seo|search|privacy|policy|makita.*google/.test(a),
    },
    // 15. Target audience & device (Mobile & Performance)
    {
      tip: "Confirm his buyers are mostly young and mobile — this drives design decisions.",
      response: "Yung mga buyers ninyo — mostly kabataan ba sa phone? Para masigurado ang mobile-first design.",
      covered: (a) => /kabataan|young|phone|mobile|tiktok|device/.test(a),
    },
    // 16. Timeline (Timeline & Budget)
    {
      tip: "He said ASAP — pin down the exact number of days before agreeing.",
      response: "Sinabi ninyong ASAP — ilang araw o linggo ang exact na target? Bago ako mag-commit gusto kong malinaw yung deadline.",
      covered: (a) => /1 week|7 days|isang linggo|deadline.*days|within/.test(a),
    },
    // 17. Budget & revisions (Timeline & Budget)
    {
      tip: "Confirm if ₱8,000 is fixed and how many revision rounds are included.",
      response: "Yung ₱8,000 — fixed po ba yun o may flexibility pa? At ilan po ang revision rounds na kasama?",
      covered: (a) => /8,000|fixed|revision.*kasama|rounds.*kasama/.test(a),
    },
    // 18. Assets to collect (Assets)
    {
      tip: "Before finishing discovery, confirm what files he will send — photos, product list.",
      response: "Para makapagsimula na ako — puwede ba ninyong i-send yung product photos at descriptions? Ilan products ang ilalagay natin sa catalog?",
      covered: (a) => /susend|i-send|photos.*send|products.*list|30 products|ilang.*products/.test(a),
    },
  ],

  "Ate Bea": [
    // 1. Business overview
    {
      tip: "Start by asking your client to describe their business and project — get the full picture first.",
      response: "Bago tayo magsimula, pwede po bang ikwento sa akin yung inyong business at ang project na gusto ninyong gawin? Gusto ko munang maunawaan ang buong picture bago tayo mag-dive in sa details.",
      covered: (a) => /bea.thrift|pre-loved|instagram.*fashion|boutique|thrift/.test(a),
    },
    // 2. Problem / pain point
    {
      tip: "Ask what's specifically wrong with her Instagram setup — why isn't it enough?",
      response: "Para mas maintindihan — ano pong specific na problema sa Instagram setup ninyo ngayon na kaya kailangan ng proper website?",
      covered: (a) => /feed.*dumi|dumi.*feed|hindi.*professional|disorganized|proper.*website/.test(a),
    },
    // 3. Business tagline & location (Business Info)
    {
      tip: "Ask for her brand tagline and where she's based — sets the tone for the whole site.",
      response: "May brand tagline ka ba? Like a short line that captures your vibe? At saan ka nakabase — for the 'About me' section?",
      covered: (a) => /tagline|slogan|wear the story|marikina|location|nakabase/.test(a),
    },
    // 4. Contact info (Business Info)
    {
      tip: "Get her email and Instagram handle — these should be visible on every page.",
      response: "Anong email at Instagram handle ang ilalagay natin sa website para makontak ka ng buyers?",
      covered: (a) => /email|bea.thrift@|@bea|contact.*info|handle.*bea/.test(a),
    },
    // 5. Main goal of website (Goals & Purpose)
    {
      tip: "Clarify what the website should do — lookbook showcase, online shop, or brand presence?",
      response: "Ano pong pangunahing purpose ng website — para lang may proper brand presence, o gusto rin ninyong may actual shop na makakabili agad ang customers?",
      covered: (a) => /brand.*presence|purpose|goal|lookbook.*goal|shop.*goal|showcase/.test(a),
    },
    // 6. Call to action (Goals & Purpose)
    {
      tip: "Ask what buyers should do after browsing — DM on Instagram, email, or order direct?",
      response: "Kapag gusto na nilang bumili ng item — ano yung gusto mong gawin nila? Mag-DM sa Instagram? Mag-email? O may checkout ba?",
      covered: (a) => /dm.*instagram|mag-dm|order.*dm|action|checkout|contact.*buy/.test(a),
    },
    // 7. Pages needed (Pages & Content)
    {
      tip: "List out the pages — she mentioned Home, Lookbook, Shop, About, Contact.",
      response: "Anong mga pages ang gusto mo? Home, Lookbook, Shop, About me, Contact? May iba pa ba?",
      covered: (a) => /lookbook|home.*shop|about.*me|contact.*page|pages/.test(a),
    },
    // 8. Existing content — photos (Pages & Content)
    {
      tip: "Ask if her Instagram photos can be used, or if she'll shoot new ones.",
      response: "Yung mga photos mo — yung Instagram posts mo, pwede ba yun gamitin para sa website? O mag-shoot ka ng bago para mas professional?",
      covered: (a) => /instagram.*photo|photos.*na|200.*items|mag-shoot|existing.*photos/.test(a),
    },
    // 9. Logo (Design & Branding)
    {
      tip: "Ask if she has a logo — she likely doesn't, and may want you to design one.",
      response: "May logo ka na ba para sa brand? O wala pa — gusto mo bang gumawa tayo ng logo as part of the project?",
      covered: (a) => /logo.*wala|wala.*logo|gumawa.*logo|logo.*kasama|brand.*logo/.test(a),
    },
    // 10. Design colors & style (Design & Branding)
    {
      tip: "She's indecisive about colors — lock it down now before design starts.",
      response: "Para maisagawa na natin — ano yung final na color palette? Beige base? Dusty rose? Sage green? Piliin na natin ngayon para hindi na magbago-bago.",
      covered: (a) => /beige|dusty rose|sage|color.*final|palette|final.*color/.test(a),
    },
    // 11. Reference websites (Design & Branding)
    {
      tip: "Ask for specific reference sites — she'll likely mention Depop or ZARA.",
      response: "May specific na website na gusto mong maging katulad ang dating ng inyo? Kahit fashion brand sa abroad — para ma-capture natin yung aesthetic.",
      covered: (a) => /depop|zara|reference.*site|website.*like|inspiration/.test(a),
    },
    // 12. Features & functionality (Features)
    {
      tip: "Ask about newsletter, Instagram feed embed, contact form — she'll want all of these.",
      response: "May gusto ka pang features? Newsletter para ma-notify ang buyers ng bagong items? Instagram feed embed sa homepage? Contact form?",
      covered: (a) => /newsletter|instagram.*feed|embed|contact.*form|features.*gusto/.test(a),
    },
    // 13. Domain & hosting (Technical)
    {
      tip: "Ask about domain — she'll want something cute like beathrift.shop or beathrift.com.",
      response: "May domain na ba ka? Gusto mo bang 'beathrift.com' o baka 'bea-thrift.shop'? At sino ang mag-a-arrange ng hosting?",
      covered: (a) => /domain|\.com|\.shop|hosting|beathrift|wala.*domain/.test(a),
    },
    // 14. SEO & legal (Technical)
    {
      tip: "Ask about Google visibility and Privacy Policy — she collects buyer data via DMs.",
      response: "Gusto mo bang makita ang site sa Google — katulad ng 'pre-loved clothes Philippines'? At kailangan ba ng Privacy Policy kasi may personal info ng buyers?",
      covered: (a) => /google|seo|search.*engine|privacy.*policy|legal/.test(a),
    },
    // 15. Target audience & device (Mobile & Performance)
    {
      tip: "Confirm her buyers are Gen Z girls on mobile — this drives the whole design direction.",
      response: "Sino mostly yung mga buyers mo — Gen Z girls ba sa Instagram? At mostly phone sila nagbi-browse?",
      covered: (a) => /gen z|girls|age.*16|16.*30|phone.*browse|mobile.*buyer/.test(a),
    },
    // 16. Timeline (Timeline & Budget)
    {
      tip: "Lock down a real deadline — she said quality over speed but you need a date.",
      response: "Para maayos ang timeline — kahit approximate, kailan gusto mong ma-launch? At ilang rounds of revision ang inaasahan mo?",
      covered: (a) => /3 weeks|launch.*date|revision.*rounds|deadline|petsa/.test(a),
    },
    // 17. Budget & revisions (Timeline & Budget)
    {
      tip: "Confirm if ₱6,500 is firm — she hints she might add more, clarify that now.",
      response: "Yung ₱6,500 — firm ba yun? Lagi kang may bagong gusto i-add, so gusto ko lang maging malinaw sa budget bago tayo magpatuloy.",
      covered: (a) => /6,500|firm.*budget|budget.*firm|extra.*budget/.test(a),
    },
    // 18. Assets to collect (Assets)
    {
      tip: "Before wrapping discovery, confirm what files she will provide — photos, logo, About me copy.",
      response: "Bago ako gumawa ng proposal — anong files ang maibibigay mo? Product photos, logo (if any), at yung About me story?",
      covered: (a) => /google.*drive|files.*send|photo.*send|susend|drive.*link|assets/.test(a),
    },
  ],

  "Sir Ramon": [
    // 1. Business overview
    {
      tip: "Start by asking your client to describe their business and project — get the full picture first.",
      response: "Before we begin, could you give me a full picture of your tutoring business and what you're hoping to build? I'd like to understand everything before we get into details.",
      covered: (a) => /tutor|booking|double book|15.*student|20.*student|school term/.test(a),
    },
    // 2. Problem / pain point
    {
      tip: "Ask how the current booking system is failing — double bookings, missed payments?",
      response: "How exactly is the current system failing you — are there double bookings, missed payments, or something else?",
      covered: (a) => /double.*book|missed.*payment|disorganized|text.*call|manual.*book/.test(a),
    },
    // 3. Business tagline & location (Business Info)
    {
      tip: "Ask for his professional tagline and whether to display his location on the site.",
      response: "Do you have a professional tagline or motto? And should we display your city or address on the website for parents to find you?",
      covered: (a) => /tagline|learn.*confidence|pasig|location.*site|address.*site/.test(a),
    },
    // 4. Contact info (Business Info)
    {
      tip: "Get his contact number and email — parents will use these to follow up on bookings.",
      response: "What contact number and email should we display on the site for parents to reach you?",
      covered: (a) => /0998|email.*ramon|contact.*number|gmail.*tutor|phone.*number/.test(a),
    },
    // 5. Main goal of website (Goals & Purpose)
    {
      tip: "Clarify the main goal — eliminate phone bookings and let parents self-schedule online.",
      response: "What's the primary goal of this website — to let parents book without calling you, track payments, or both?",
      covered: (a) => /primary.*goal|eliminate.*call|self.*book|goal.*website|no.*more.*call/.test(a),
    },
    // 6. Call to action (Goals & Purpose)
    {
      tip: "Ask what action you want visitors to take — book a session directly from the site.",
      response: "What's the main action you want parents to take when they visit the site — book a session immediately, or contact you first?",
      covered: (a) => /book.*session|book.*immediately|contact.*first|action.*parent|cta/.test(a),
    },
    // 7. Pages needed (Pages & Content)
    {
      tip: "List the pages he needs — Home, About, Services, Booking, Testimonials.",
      response: "What pages do you have in mind? For example: Home, About (credentials), Services with pricing, Booking page, and Testimonials?",
      covered: (a) => /services.*page|booking.*page|testimonials|credentials|pages/.test(a),
    },
    // 8. Existing content (Pages & Content)
    {
      tip: "Ask if he has written bio, credentials, and testimonials ready — or still collecting.",
      response: "Do you have your bio and credentials written out? And for testimonials — do you have feedback from past parents or will you need to collect those?",
      covered: (a) => /bio.*ready|credentials.*ready|testimonials.*collect|written.*bio|feedback.*parents/.test(a),
    },
    // 9. Logo (Design & Branding)
    {
      tip: "Ask if he has a logo or if you'll create a simple professional one from his initials.",
      response: "Do you have an existing logo, or should I design a simple professional one — perhaps using your initials in a clean font?",
      covered: (a) => /logo.*wala|no.*logo|initials|r\.g\.t|design.*logo|professional.*logo/.test(a),
    },
    // 10. Design colors & style (Design & Branding)
    {
      tip: "He wants professional — confirm exact color direction before designing.",
      response: "You mentioned professional and trustworthy — should we go with navy blue, dark green, or a different color scheme? Any fonts or styles to avoid?",
      covered: (a) => /navy|dark.*green|blue.*confirm|color.*scheme|no.*bright|professional.*color/.test(a),
    },
    // 11. Reference websites (Design & Branding)
    {
      tip: "Ask for reference sites — tutoring platforms abroad tend to be clean and structured.",
      response: "Have you seen any tutoring or education websites you like the look of? Any specific layout or structure you'd want to reference?",
      covered: (a) => /varsity|clean.*tutor|reference.*site|website.*like|layout.*reference/.test(a),
    },
    // 12. Features & functionality (Features)
    {
      tip: "Confirm the full feature list — booking calendar, GCash, dashboard, email notifications.",
      response: "Beyond the booking calendar and GCash — do you also need email notifications when a session is booked, a dashboard for you to manage sessions, or a FAQ section?",
      covered: (a) => /email.*notification|dashboard|faq|manage.*session|notification.*book/.test(a),
    },
    // 13. Domain & hosting (Technical)
    {
      tip: "Ask about domain and hosting — mention it should be factored into the budget.",
      response: "Do you have a domain name already — like 'ramontutor.com'? If not, should I include domain registration and one year of hosting in the project cost?",
      covered: (a) => /domain|ramontutor|hosting|\.com|register.*domain|domain.*cost/.test(a),
    },
    // 14. SEO & legal (Technical)
    {
      tip: "He needs SEO for 'Math tutor Pasig' and a Privacy Policy since he collects parent data.",
      response: "Do you want the site to appear in Google search for terms like 'Math tutor Pasig'? And since you'll be collecting parent contact info, you'll need a Privacy Policy page.",
      covered: (a) => /seo|google.*search|math.*tutor|privacy.*policy|collect.*info/.test(a),
    },
    // 15. Target audience & device (Mobile & Performance)
    {
      tip: "Confirm who books — parents on desktop or mobile — this affects booking UX.",
      response: "Who typically books sessions — students themselves or their parents? And do they mostly use desktop or mobile? This affects how I design the booking flow.",
      covered: (a) => /parents.*book|students.*book|desktop.*book|mobile.*book|who.*book/.test(a),
    },
    // 16. Timeline (Timeline & Budget)
    {
      tip: "Confirm the exact school term start date — his deadline depends on it.",
      response: "When exactly does the next school term start? I want to confirm the hard deadline before committing to a timeline.",
      covered: (a) => /school term|term.*start|3 weeks|4 weeks|launch.*date|exact.*deadline/.test(a),
    },
    // 17. Budget & revisions (Timeline & Budget)
    {
      tip: "Confirm what ₱12,000 covers — backend, revisions, domain, hosting.",
      response: "Just to confirm — does the ₱12,000 cover the booking backend, at least two revision rounds, and domain/hosting? I want to align scope before writing the proposal.",
      covered: (a) => /12,000|revision.*included|backend.*cost|scope.*confirm|domain.*included/.test(a),
    },
    // 18. Assets to collect (Assets)
    {
      tip: "Before finishing discovery, confirm what documents he will send you.",
      response: "Before I write the proposal — what documents will you be sending me? Bio, credentials, service rates, testimonials, and any photos?",
      covered: (a) => /word.*document|bio.*send|credentials.*send|rates.*send|assets.*send|files.*prepare/.test(a),
    },
  ],
};

export function getPersonaTopics(persona: ClientPersona): TopicEntry[] {
  return PERSONA_TOPICS[persona.name] ?? PERSONA_TOPICS["Maria Santos"];
}

export function coveredTopicIndex(messages: Message[], persona: ClientPersona): number {
 const all = messages.map((m) => m.text).join( "").toLowerCase();
 const topics = getPersonaTopics(persona);
 // Find the first topic NOT yet covered
 for (let i = 0; i < topics.length; i++) {
 if (!topics[i].covered(all)) return i;
 }
 return topics.length; // all covered
}

// Returns the pre-written Taglish response paired with each contextual tip.
export function generateContextualResponse(
 messages: Message[],
 phase: "discovery" |"proposal" |"qa" |"delivery",
 persona: ClientPersona
): string | null {
 const lastAi = [...messages].reverse().find((m) => m.role === "model");
 const text = (lastAi?.text ??"").toLowerCase();

 if (phase === "discovery") {
 const topics = getPersonaTopics(persona);
 const idx = coveredTopicIndex(messages, persona);
 if (idx < topics.length) return topics[idx].response;
 return "Salamat sa lahat ng info! Ready na akong gumawa ng proposal. Pwede na ba tayong mag-proceed?";
 }

 if (phase === "proposal") {
 if (text.includes( "timeline") || text.includes( "kailan") || text.includes( "when") || text.includes( "milestone"))
 return "I'll revise the proposal to include a detailed timeline with specific milestones.";
 if (text.includes( "revision") || text.includes( "included") || text.includes( "kasama"))
 return "2 rounds of revisions are included in the price. Any additional rounds will be billed separately.";
 if (text.includes( "price") || text.includes( "cost") || text.includes( "breakdown") || text.includes( "bayad"))
 return "Here's my breakdown: Design — ₱2,000 | Development — ₱2,500 | Testing & revisions — included.";
 if (text.includes( "deal") || text.includes( "sige") || text.includes( "go") || text.includes( "okay") || text.includes( "agreed"))
 return "Thank you! I'll begin immediately. I'll send an update once the initial design is ready.";
 return "Noted! I'll revise the proposal and address your concern. I'll send the updated version shortly.";
 }

 if (phase === "qa") {
 if (text.includes( "button") || text.includes( "color") || text.includes( "kulay"))
 return "Before I implement — is this within our original scope, or would this count as a revision round?";
 if (text.includes( "price") || text.includes( "additional") || text.includes( "₱") || text.includes( "fee"))
 return "I can do that for an additional ₱500. Shall I add it to the final invoice?";
 if (text.includes( "login") || text.includes( "account") || text.includes( "sign"))
 return "A login page wasn't in our original scope. I can add it for ₱500 extra — would that work?";
 if (text.includes( "nav") || text.includes( "navigation") || text.includes( "menu bar"))
 return "Sure! Which pages should be in the nav? I'll add it right away.";
 if (text.includes( "align") || text.includes( "move") || text.includes( "spacing") || text.includes( "ilipat"))
 return "Got it! I'll fix the alignment. Any specific positioning you had in mind?";
 if (text.includes( "done") || text.includes( "fixed") || text.includes( "okay na") || text.includes( "looks good") || text.includes( "maganda"))
 return "All revisions are done! Can I ask for a final sign-off so we can move to delivery?";
 return "Before I proceed — is this within our agreed scope and budget, or should we treat it as an additional request?";
 }

 if (phase === "delivery") {
 if (text.includes( "payment") || text.includes( "bayad") || text.includes( "sending") || text.includes( "transfer"))
 return "Thank you so much! It was a pleasure working with you. Feel free to reach out for future projects!";
 return "Here is the final deliverable. Please let me know if there's anything you'd like to adjust before we close the project.";
 }

 return null;
}

// Returns a short coaching tip based on what's NOT yet covered in the conversation.
export function generateContextualTip(
 messages: Message[],
 phase: "discovery" |"proposal" |"qa" |"delivery",
 persona: ClientPersona
): string | null {
 const lastAi = [...messages].reverse().find((m) => m.role === "model");
 const text = (lastAi?.text ??"").toLowerCase();

 if (phase === "discovery") {
 const topics = getPersonaTopics(persona);
 const idx = coveredTopicIndex(messages, persona);
 if (idx < topics.length) return topics[idx].tip;

 // Don't rush to end if the client is still actively talking
 const clientStillActive =
 text.includes( "?") ||
 text.includes( "pwede ba") || text.includes( "can you") || text.includes( "pano") ||
 text.includes( "add") || text.includes( "dagdag") || text.includes( "gusto ko pa") ||
 text.includes( "pero") || text.includes( "actually") || text.includes( "wait") ||
 text.includes( "newsletter") || text.includes( "feature") || text.includes( "section") ||
 text.includes( "pala") || text.includes( "sana") || text.includes( "baka") ||
 text.includes( "siguro") || text.includes( "extra") || text.includes( "isa pa");

 if (clientStillActive) {
 // Give a relevant tip about the new thing the client just raised
 if (text.includes( "newsletter")) return "Scope creep alert — acknowledge it, then ask how this affects the timeline and budget before agreeing.";
 if (text.includes( "add") || text.includes( "dagdag") || text.includes( "extra") || text.includes( "isa pa"))
 return "New request detected — clarify if this is within the original scope or will require a budget adjustment.";
 if (text.includes( "?"))
 return "Client has a question — answer it fully before wrapping up the discovery.";
 return "Client is still sharing requirements — let them finish before proposing to move on.";
 }

 return "You've covered all key topics. Ready to move to proposal!";
 }

 if (phase === "proposal") {
 if (text.includes( "timeline") || text.includes( "kailan") || text.includes( "milestone"))
 return "Revise your proposal to include a clear timeline with milestones.";
 if (text.includes( "revision") || text.includes( "kasama"))
 return "Confirm how many revision rounds are included in your price.";
 if (text.includes( "price") || text.includes( "bayad") || text.includes( "cost"))
 return "Break down your pricing: design, development, and revisions separately.";
 if (text.includes( "deal") || text.includes( "sige") || text.includes( "agreed"))
 return "Confirm the deal, then ask if they have any last questions before you start.";
 return "Address their feedback, then revise and resend the proposal.";
 }

 if (phase === "qa") {
 if (text.includes( "button") || text.includes( "color") || text.includes( "kulay"))
 return "Confirm if this UI change is in scope before implementing it.";
 if (text.includes( "additional") || text.includes( "extra") || text.includes( "dagdag"))
 return "Agree on the extra fee first, then confirm it before starting the work.";
 if (text.includes( "login") || text.includes( "account"))
 return "Out of scope — propose a small additional fee before you agree.";
 if (text.includes( "nav") || text.includes( "navigation"))
 return "Clarify which pages go in the nav before building it.";
 if (text.includes( "align") || text.includes( "move") || text.includes( "spacing"))
 return "Acknowledge the feedback, then ask for specific details before adjusting.";
 if (text.includes( "looks good") || text.includes( "okay na") || text.includes( "maganda") || text.includes( "love it"))
 return "Get explicit written sign-off before closing the project.";
 return "Confirm scope and budget impact before agreeing to any new request.";
 }

 if (phase === "delivery") {
 if (text.includes( "payment") || text.includes( "sending") || text.includes( "bayad"))
 return "Thank the client professionally and invite them to reach out for future work.";
 return "Deliver the final output and ask for sign-off to officially close the project.";
 }

 return null;
}

// Project proposal generator 
// Generates a full 11-section project proposal tailored to what was discussed.
export function generateProjectPrompt(persona: ClientPersona, messages: Message[]): string {
 const all = messages.map((m) => m.text).join( "").toLowerCase();
 const today = new Date();
 const fmt = (d: Date) => d.toLocaleDateString( "en-PH", { month: "long", day: "numeric", year: "numeric" });

 // Extract pages from conversation 
 const pages: string[] = ["Home"];
 if (all.includes( "menu")) pages.push( "Menu");
 if (all.includes( "about")) pages.push( "About Us");
 if (all.includes( "contact")) pages.push( "Contact");
 if (all.includes( "gallery") || all.includes( "lookbook")) pages.push( "Gallery / Lookbook");
 if (all.includes( "login") || all.includes( "account")) pages.push( "Login / Account");
 if (all.includes( "booking") || all.includes( "schedule")) pages.push( "Booking");
 if (all.includes( "shop") || all.includes( "catalog") || all.includes( "product")) pages.push( "Shop / Products");
 if (all.includes( "testimonial")) pages.push( "Testimonials");
 if (all.includes( "services")) pages.push( "Services");

 // Extract design clues 
 const colors =
 all.includes( "orange") ?"warm orange and cream"
 : all.includes( "yellow") ?"warm yellow and off-white"
 : all.includes( "beige") || all.includes( "dusty rose") ?"beige base with dusty rose accents"
 : all.includes( "sage") ?"sage green and white"
 : all.includes( "blue") ?"professional navy blue and white"
 : all.includes( "red") || all.includes( "pula") ?"bold red and white"
 : all.includes( "green") ?"fresh green and white"
 : all.includes( "pink") ?"soft pink and white"
 : "clean and professional — brand-appropriate colors TBD with client";

 const isMobile = all.includes( "mobile") || all.includes( "phone") || all.includes( "cellphone");
 const hasOrdering = all.includes( "order") || all.includes( "cart") || all.includes( "checkout");
 const hasPayment = all.includes( "gcash") || all.includes( "payment") || all.includes( "bayad");
 const hasSearch = all.includes( "search") || all.includes( "filter");
 const hasBooking = all.includes( "booking") || all.includes( "schedule") || all.includes( "calendar");
 const hasSocial = all.includes( "facebook") || all.includes( "instagram") || all.includes( "tiktok") || all.includes( "shopee");

 // Extract deadline 
 const deadlineWeeks =
 all.includes( "1 week") || all.includes( "asap") ?"1 week"
 : all.includes( "2 week") ?"2 weeks"
 : all.includes( "3 week") ?"3 weeks"
 : all.includes( "4 week") || all.includes( "1 month") ?"4 weeks"
 : "2–3 weeks";

 const launchDate = new Date(today);
 launchDate.setDate(today.getDate() + (parseInt(deadlineWeeks) || 2) * 7);

 // Extract revision rounds 
 const revisions =
 all.includes( "3 round") || all.includes( "3 revision") ?"3 rounds"
 : all.includes( "1 round") || all.includes( "1 revision") ?"1 round"
 : "2 rounds";

 // Per-persona context 
 type PersonaContext = {
 problem: string;
 background: string;
 objectives: string[];
 solution: string;
 features: string[];
 excluded: string[];
 audience: string;
 tone: string;
 metrics: string[];
 };

 const PERSONA_CONTEXT: Record<string, PersonaContext> = {
"Maria Santos": {
 background: "Maria Santos runs a karinderya (local Filipino eatery) in her neighborhood. She currently has no online presence and her customers frequently send DMs on Facebook Messenger asking about daily menu availability — causing her to miss orders and spend too much time replying to the same questions.",
 problem: "Customers have no way to check the menu online without messaging the business directly. This results in missed orders, unanswered inquiries, and lost revenue opportunities.",
 objectives: [
"Give customers a place to view the daily menu without DM-ing the business",
"Reduce repetitive customer inquiries via Messenger",
"Build an online presence that establishes credibility for the karinderya",
"Ensure the site is optimized for mobile (primary device of her customers)",
 ],
 solution: "A clean, mobile-first menu display website — warm and appetizing in feel — that shows the current menu, business info, and contact details. No complex backend required at this stage.",
 features: [
"Menu display with categories and item descriptions",
"Daily specials section (static or easy-to-update)",
"Contact details and Facebook Page link",
"Business location / service area info",
 ...(hasOrdering ? ["Basic online order inquiry form"] : []),
 ],
 excluded: ["Online payment gateway", "Order management system", "User accounts / login"],
 audience: "Local neighborhood customers, mostly adults aged 20–50, primarily browsing on mobile phones.",
 tone: "Warm, friendly, and appetizing. Should feel like a neighborhood favorite — approachable and trustworthy.",
 metrics: ["Reduction in Messenger DMs asking about the menu", "Monthly site visitors", "Customer feedback on usability"],
 },
"Kuya Jun": {
 background: "Kuya Jun runs an online reselling business — selling cellphone accessories, snacks, and basic goods. He currently manages orders entirely through chat (Messenger, SMS), which causes missed orders and no organized product listing.",
 problem: "No centralized catalog means buyers can't browse products without messaging. Order management is chaotic and unscalable as the business grows.",
 objectives: [
"Create a product catalog buyers can browse without messaging first",
"Support GCash payment or at minimum display payment instructions clearly",
"Reach mobile-first buyers on platforms like TikTok and Facebook",
"Launch within 1 week to capture current demand",
 ],
 solution: "A fast, mobile-optimized product catalog website with a clean listing of products, prices, and a simple order/inquiry flow. Minimal design, maximum function.",
 features: [
"Product catalog with photos, names, and prices",
"GCash payment info / order inquiry button",
"Category filtering (accessories, snacks, etc.)",
"Facebook Page and Shopee link integration",
 ...(hasSearch ? ["Product search functionality"] : []),
 ],
 excluded: ["Full shopping cart & checkout system", "Inventory management", "User login"],
 audience: "Young adults aged 18–30 buying through social media. 100% mobile, often discovering products via TikTok or Facebook.",
 tone: "Clean, straightforward, and fast-loading. No unnecessary animations — buyers just want to see the product and price.",
 metrics: ["Number of order inquiries per week", "Reduction in repeated questions via chat", "Page load speed under 3 seconds"],
 },
"Ate Bea": {
 background: "Ate Bea sells pre-loved and curated fashion items through her Instagram page @bea.thrift. While she has followers, her feed lacks a professional presentation and she has no dedicated portfolio or shop — causing her to lose potential buyers who want a more curated, trustworthy experience.",
 problem: "Selling on Instagram alone limits her ability to showcase collections properly and looks unprofessional to buyers who expect a dedicated shop. Her'feed aesthetic' is inconsistent.",
 objectives: [
"Build a beautiful, aesthetic portfolio/lookbook website that matches her brand vision",
"Showcase curated fashion collections in a visually compelling way",
"Link Instagram and other platforms to drive cross-channel traffic",
"Create an online presence that feels as legit as international boutiques",
 ],
 solution: "An aesthetic, image-forward fashion portfolio website with a lookbook, shop section, and strong brand personality. Design is the main deliverable — it should feel editorial and Gen-Z-forward.",
 features: [
"Lookbook / collections gallery with styled photos",
"Shop section with item listings and inquiry buttons",
"Instagram feed integration or link",
"About page with brand story",
"Newsletter signup or contact form",
 ...(hasSocial ? ["Social media links (Instagram, TikTok, etc.)"] : []),
 ],
 excluded: ["Full e-commerce backend with cart & checkout", "Payment processing", "Inventory system"],
 audience: "Gen Z and millennial women aged 16–30, primarily browsing on Instagram and mobile. Values aesthetics and authenticity.",
 tone: "Editorial, aesthetic, and aspirational. Think curated boutique — minimalist but with personality. Should feel like a fashion magazine, not a generic online shop.",
 metrics: ["Instagram profile clicks from website", "Lookbook views per session", "Inquiry form submissions per week"],
 },
"Sir Ramon": {
 background: "Sir Ramon offers private tutoring services for grades 4–12 in Math, Science, and English. He currently manages 15–20 students per week but handles all bookings via text or call — resulting in double bookings, missed sessions, and no clear record of payments.",
 problem: "Manual booking via SMS leads to scheduling conflicts, untracked payments, and a lack of professionalism that can reduce trust from parents seeking tutors for their children.",
 objectives: [
"Automate session bookings with a proper online calendar system",
"Enable GCash or online payment for booking confirmation",
"Build credibility and trust with parents through a professional online presence",
"Provide Sir Ramon a dashboard to manage student schedules",
 ],
 solution: "A professional tutoring platform with online booking, GCash payment integration, service listings, and a student/parent-facing profile page with credentials and testimonials.",
 features: [
"Online booking calendar with available time slots",
"GCash payment integration for session deposits",
"Services page with subjects, rates, and package options",
"Tutor profile page (credentials, experience, approach)",
"Testimonials page from past students/parents",
"Contact form for inquiries",
 ...(hasBooking ? ["Booking confirmation email/notification"] : []),
 ],
 excluded: ["Learning management system (LMS)", "Video conferencing integration", "Multi-tutor support"],
 audience: "Parents of students in grades 4–12, and older students (15+) booking independently. Mix of mobile and desktop users.",
 tone: "Professional, trustworthy, and academic. Should feel authoritative — like a credentialed educational service, not a personal tutoring side hustle.",
 metrics: ["Bookings per week via website vs. text", "No. of double-bookings (target: zero)", "Payment collection rate", "Parent satisfaction feedback"],
 },
 };

 const ctx = PERSONA_CONTEXT[persona.name] ?? PERSONA_CONTEXT["Maria Santos"];

 // Timeline breakdown 
 const timelineDays = parseInt(deadlineWeeks) * 7 || 14;
 const d1 = new Date(today); d1.setDate(today.getDate() + 2);
 const d2 = new Date(today); d2.setDate(today.getDate() + Math.round(timelineDays * 0.35));
 const d3 = new Date(today); d3.setDate(today.getDate() + Math.round(timelineDays * 0.65));
 const d4 = new Date(today); d4.setDate(today.getDate() + Math.round(timelineDays * 0.85));

 return `# PROJECT PROPOSAL
## ${persona.project.charAt(0).toUpperCase() + persona.project.slice(1)} for ${persona.name}

**Prepared by:** [Your Name / Freelancer]
**Prepared for:** ${persona.name} — ${persona.business}
**Date:** ${fmt(today)}
**Budget:** ${persona.budget}

---

## 1. Executive Summary

This proposal outlines a plan to design and develop a ${persona.project} for ${persona.name}'s ${persona.business}. Based on our discovery conversation, the primary need is to establish a professional online presence that addresses a specific operational pain point and opens up new opportunities for the business. The expected outcome is a live, mobile-optimized website delivered within ${deadlineWeeks}, with ${revisions} of revisions included.

---

## 2. Background / Problem Statement

${ctx.background}

**Core Problem:** ${ctx.problem}

---

## 3. Objectives / Goals

${ctx.objectives.map((o, i) => `${i + 1}. ${o}`).join( "\n")}

---

## 4. Proposed Solution / Scope of Work

${ctx.solution}

### Pages to Build
${pages.map((p) => `- **${p}**`).join( "\n")}

### Key Features
${ctx.features.map((f) => `- ${f}`).join( "\n")}

### Design Approach
- Color scheme: ${colors}
- Typography: Clean sans-serif (Inter or Poppins)
- Style: ${isMobile ?"Mobile-first" : "Desktop-first, responsive"} — ${ctx.tone}
- Layout: Card-based with clear visual hierarchy

### Technology Stack
- HTML5 + Tailwind CSS (CDN)
- Vanilla JavaScript for interactivity
- ${hasBooking ?"Booking integration (Calendly embed or custom form)" : "Static site — no backend required at this stage"}
- ${hasPayment ?"GCash payment info / payment link integration" : "Contact form for inquiries"}

### Not Included in Scope
${ctx.excluded.map((e) => `- ${e}`).join( "\n")}

---

## 5. Timeline / Milestones

| Phase | Description | Target Date |
|-------|-------------|-------------|
| Discovery & Planning | Requirements finalized, sitemap confirmed | ${fmt(d1)} |
| Design Mockups | Figma wireframes / visual design shared for review | ${fmt(d2)} |
| Development | Full build of all pages and features | ${fmt(d3)} |
| Testing & Revisions | QA + client feedback rounds (${revisions}) | ${fmt(d4)} |
| Launch | Final delivery and handover | ${fmt(launchDate)} |

---

## 6. Deliverables

- Finalized sitemap and content structure
- Design mockup (Figma or direct HTML preview)
- Fully coded, mobile-responsive website
- ${revisions} of revision rounds
- Source code / files handed over after payment
- Basic walkthrough / instructions for updates

---

## 7. Team / Roles

| Role | Responsibility |
|------|---------------|
| Project Lead / Developer | Design, development, testing, client communication |
| Client (${persona.name}) | Content provision, feedback, final approval |

---

## 8. Budget / Pricing

| Item | Cost |
|------|------|
| Design (wireframe + visual) | ₱${Math.round(Number(persona.budget.replace(/[^\d]/g, "")) * 0.3).toLocaleString()} |
| Development (all pages + features) | ₱${Math.round(Number(persona.budget.replace(/[^\d]/g, "")) * 0.55).toLocaleString()} |
| Testing & ${revisions} of revisions | Included |
| **Total** | **${persona.budget}** |

**Payment Terms:**
- 50% downpayment upon project start
- 50% upon final delivery and client sign-off

---

## 9. Success Metrics / Evaluation

${ctx.metrics.map((m, i) => `${i + 1}. ${m}`).join( "\n")}

Success will be reviewed 30 days after launch.

---

## 10. Terms & Conditions

- **Revisions:** ${revisions} of revisions are included in the agreed price. Additional revisions beyond this will be billed at ₱500 per round.
- **Scope Changes:** Any new features or pages requested after this proposal is signed will be treated as additional scope and priced separately.
- **Ownership:** Full ownership of files and code transfers to the client upon receipt of final payment.
- **Deadline:** The timeline above assumes timely content and feedback from the client. Delays in client response may push the launch date.
- **Maintenance:** This proposal covers build and delivery only. Ongoing maintenance is available at a separate monthly rate.

---

## 11. Next Steps

1. Review and approve this proposal
2. Sign off (reply"Approved" or request changes)
3. Send 50% downpayment to begin
4. Development starts immediately after payment confirmed

---

*This proposal was generated by MyClient — SparkFest 2026*
*Copy and paste this into a Google Doc, Notion, or send directly to your client.*`;
}

// Wallet helpers 
const WALLET_KEY = "myclient_wallet";

export function getWalletBalance(): number {
 return Number(localStorage.getItem(WALLET_KEY) ?? 0);
}

export function addToWallet(amount: string): number {
 const numeric = Number(amount.replace(/[^\d]/g, ""));
 const current = getWalletBalance();
 const next = current + numeric;
 localStorage.setItem(WALLET_KEY, String(next));
 return next;
}

export function generateHint(phase: string, messageCount: number): string | null {
 if (phase === "discovery") {
 const hints = [
"Ask your client about their current problem before proposing solutions.",
"Find out who their target users are.",
"Ask about their preferred design style or colors.",
"Clarify how many pages they need.",
"Ask about their deadline before agreeing to the project.",
 ];
 return hints[Math.min(messageCount, hints.length - 1)] ?? null;
 }
 if (phase === "qa") {
 const hints = [
"Before implementing changes, confirm scope and budget impact first.",
"It's professional to acknowledge feedback positively before asking questions.",
"When negotiating, propose a specific number — don't ask'how much?'",
 ];
 return hints[Math.min(messageCount, hints.length - 1)] ?? null;
 }
 return null;
}

// Proposal Panel 

export const PROPOSAL_PARTS = [
"Executive Summary",
"Background / Problem Statement",
"Objectives / Goals",
"Proposed Solution / Scope of Work",
"Timeline / Milestones",
"Deliverables",
"Team / Roles",
"Budget / Pricing",
"Success Metrics / Evaluation",
"Terms & Conditions",
"Call to Action / Next Steps",
] as const;

const PROPOSAL_RECALL: Record<string, string[]> = {
"Maria Santos": [
"Client: Maria Santos\nBusiness: Karinderya (food)\nProject: Food menu website\nBudget: ₱5,000",
"Business: Local eatery — karinderya\nProblem: Customers DM on Facebook asking for daily menu → too many messages, some get missed\nGoal: Public website so customers can check menu without messaging",
"• Eliminate repetitive menu inquiries via Messenger\n• Display daily menu and prices clearly online\n• Build basic online presence for the karinderya\n• Mobile-first (customers use phones, not laptops)",
"Pages: Home, Menu, About Us, Contact\nFeatures: Menu display, Facebook page link, contact info\nDisplay-only (no online ordering)\nWarm colors (orange / yellow)\nNOT included: online payments, user accounts",
"Deadline: ~2 weeks\nReason: Sponsor visit coming next month\nPhases: Design → Development → Revisions → Launch",
"• Home page\n• Menu page (with prices per item)\n• About Us page\n• Contact page\n• Facebook page link integration\n• Basic walkthrough for client after delivery",
"You: Sole developer — UI design, coding, deployment, client communication",
"Budget: ₱5,000 total\nIncludes: 2 rounds of revisions\nPayment: 50% downpayment, 50% on final delivery\nAdditional revisions: ₱500/round",
"• Customers stop DMing for menu info\n• Foot traffic increases from online visibility\n• Menu page views per week\n• Client can update menu independently",
"• 2 rounds of revisions included\n• Additional rounds: ₱500 each\n• Scope creep billed separately\n• All assets transferred to client after full payment\n• 2-week post-launch support period",
"Next step: Approve this proposal → 50% downpayment (₱2,500) → development begins immediately",
 ],
"Kuya Jun": [
"Client: Kuya Jun\nBusiness: Sari-sari / Online Selling\nProject: Online product catalog website\nBudget: ₱8,000",
"Business: Online reseller — cellphone accessories, snacks, basic goods\nProblem: Orders get lost in chats — no organized product listing\nGoal: Clean catalog website so buyers can browse without messaging first",
"• Centralize product listings — no more missed orders\n• Clear GCash payment information\n• Mobile-first for young buyers on TikTok/Facebook\n• Launch within 1 week (ASAP)",
"Pages: Home, Products (priority)\nFeatures: Product catalog with photos & prices, GCash payment info, Facebook & Shopee links\nSimple catalog (no complex cart)\nBlue/red color scheme\nNOT included: full cart/checkout, inventory system, login",
"Deadline: 1 week (very tight — minimal scope)\nPhases: Design & Dev combined → Revisions → Launch",
"• Home page\n• Products catalog page (photos, names, prices)\n• GCash payment instructions\n• Facebook page + Shopee store links\n• Mobile-optimized throughout",
"You: Sole developer — design, development, deployment, client communication",
"Budget: ₱8,000 total\nIncludes: 1 round of revisions\nPayment: 50% downpayment, 50% on delivery\nAdditional revisions: ₱500/round",
"• All products browsable without messaging\n• Reduction in missed chat orders\n• Page load under 3 seconds\n• GCash payment process is clear to buyers",
"• 1 round of revisions included\n• Additional rounds: ₱500 each\n• 1-week delivery guarantee (tight scope)\n• All assets transferred after full payment\n• No maintenance included unless arranged separately",
"Next step: Approve this proposal → 50% downpayment (₱4,000) → start immediately today",
 ],
"Ate Bea": [
"Client: Ate Bea\nBusiness: Boutique / Fashion Reseller (@bea.thrift)\nProject: Fashion portfolio website\nBudget: ₱6,500",
"Business: Pre-loved fashion reseller on Instagram\nProblem: Instagram feed is disorganized — lacks the credibility of a real boutique\nGoal: Aesthetic portfolio website that elevates the brand and increases buyer trust",
"• Professional portfolio to replace messy Instagram\n• Increase buyer trust and conversion\n• Showcase pre-loved fashion in curated lookbook style\n• Instagram @bea.thrift linked from website\n• Target: Gen Z girls aged 16-30 on mobile",
"Pages: Home, Lookbook, Shop/Collections, About Me, Contact\nDesign: Minimalist — beige base, dusty rose or sage green accents\nMobile-first (all buyers use phones)\nInstagram @bea.thrift linked\nNOT included: real checkout, inventory, login",
"Deadline: ~3 weeks (quality over speed)\nPhases: Design mockup (Week 1) → Development (Week 2) → Revisions & Launch (Week 3)",
"• Home page with brand intro\n• Lookbook / Gallery section (curated photos)\n• Shop / Collections page\n• About Me page (brand story)\n• Contact page\n• Instagram link integration throughout",
"You: Sole developer — UI/UX design, coding, deployment, client communication",
"Budget: ₱6,500 total\nIncludes: Up to 3 rounds of revisions\nPayment: 50% downpayment, 50% on delivery\nAdditional revisions: ₱500/round\nImportant: Color palette must be locked before development starts",
"• Clean aesthetic portfolio live online\n• Increase in DM inquiries from new buyers\n• Reduced dependency on Instagram algorithm\n• Instagram following grows from site traffic",
"• 3 rounds of revisions included\n• Color palette locked in writing before dev starts\n• Scope creep billed separately (₱500/feature)\n• All assets transferred after full payment\n• Design changes mid-development restart the revision count",
"Next step: Lock color palette → Approve proposal → 50% downpayment (₱3,250) → design mockup in Week 1",
 ],
"Sir Ramon": [
"Client: Sir Ramon\nBusiness: Tutoring / Education Services\nProject: Online booking platform\nBudget: ₱12,000",
"Business: Private tutor — Math, Science, English for Grades 4–12\nProblem: Manual booking via text/calls causes double bookings and no payment tracking\nGoal: Professional booking system before next school term",
"• Eliminate double bookings with an online calendar\n• Enable GCash payment at time of booking\n• Professional web presence to attract more students\n• Dashboard for Sir Ramon to manage all sessions\n• Launch before next school term (~3–4 weeks)",
"Pages: Home, About (credentials), Services + Pricing, Booking, Testimonials\nFeatures: Online booking calendar, GCash payment integration, admin dashboard\nDesign: Professional — dark blue or forest green\nDesktop + mobile (parents book on desktop evenings)\nNOT included: student accounts, video conferencing, content management",
"Deadline: 3–4 weeks (before school term)\nDay 1–5: Design & wireframes\nDay 6–14: Core development\nDay 15–21: Booking system + GCash integration\nDay 22–25: Testing & QA\nDay 26–28: Revisions & launch",
"• Home page\n• About page (credentials, teaching experience)\n• Services & Pricing page\n• Online Booking page with calendar + time slots\n• Testimonials page\n• Admin dashboard for booking management\n• GCash payment integration\n• Mobile-responsive on all pages",
"You: Sole developer — design, development, deployment, QA, client communication",
"Budget: ₱12,000 total\nPayment: 40% start (₱4,800) → 30% mid (₱3,600) → 30% delivery (₱3,600)\nIncludes: 2 rounds of revisions\nAdditional revisions: ₱1,000/round\nScope changes after sign-off: billed separately",
"• Zero double bookings within 30 days of launch\n• Online payment processed per session (no cash follow-ups)\n• Admin dashboard shows all upcoming bookings at a glance\n• Parent satisfaction with booking experience",
"• 2 rounds of revisions included; additional ₱1,000/round\n• Scope changes post-sign-off billed separately\n• Full source code transferred after final payment\n• 30-day post-launch support period\n• Client must provide timely feedback to maintain timeline",
"Next step: Review → Approve → Sign project agreement → 40% downpayment (₱4,800) → kickoff call",
 ],
};

export function getProposalRecall(persona: ClientPersona, sectionIndex: number): string {
 return PROPOSAL_RECALL[persona.name]?.[sectionIndex] ??"No recall data for this section.";
}

export async function sendToProposalAssistant(
 chatMessages: Message[],
 persona: ClientPersona,
 proposalFields: string[]
): Promise<string> {
 const filledSections = PROPOSAL_PARTS
 .map((p, i) => proposalFields[i] ? `${p}:\n${proposalFields[i]}` : null)
 .filter(Boolean)
 .join( "\n\n");

 const systemPrompt = `You are an AI proposal-writing coach helping a Filipino student freelancer write a project proposal.

CLIENT INFO:
- Name: ${persona.name}
- Business: ${persona.business}
- Project: ${persona.project}
- Budget: ${persona.budget}
- Personality: ${persona.personality}

CURRENT PROPOSAL DRAFT:
${filledSections ||"(Empty — student has not filled in sections yet)"}

Your role:
- Help the student write, improve, or refine specific proposal sections
- Give short, actionable feedback (2-4 sentences max)
- Suggest exact wording they can use
- Answer questions about what to write in each section
- Be concise and practical — this is a real project proposal
- Write naturally in English (can use Filipino examples/context)
- Do NOT roleplay as the client — you are a writing coach`;

 if (!GEMINI_API_KEY) {
 const u = (chatMessages[chatMessages.length - 1]?.text ??"").toLowerCase();
 if (u.includes( "executive") || u.includes( "summary"))
 return `For the Executive Summary, start with: "This proposal outlines a ${persona.project} for ${persona.name}'s ${persona.business}, to be delivered within the agreed budget of ${persona.budget}." Keep it to 2-3 sentences — it's just the overview.`;
 if (u.includes( "background") || u.includes( "problem"))
 return `For Background, describe the problem in the client's own words. Example: "${persona.name} currently has no online presence, causing customers to miss information and the business to lose potential orders."`;
 if (u.includes( "timeline") || u.includes( "milestones"))
 return `Break your timeline into phases: Discovery (Day 1-2), Design Mockup (Day 3-5), Development (Day 6-10), Revisions (Day 11-12), Launch (Day 13-14). Adjust based on the agreed deadline.`;
 if (u.includes( "budget") || u.includes( "pricing") || u.includes( "cost"))
 return `Split ${persona.budget} into: Design (~30%), Development (~55%), Testing & revisions (included). State payment terms: 50% downpayment, 50% on final delivery.`;
 if (u.includes( "scope") || u.includes( "solution"))
 return `List the exact pages and features you'll build. Be specific —"Home, Menu, About Us, Contact" is better than"multiple pages". Also list what's NOT included to avoid scope creep.`;
 return `Good question! Focus on being specific to ${persona.name}'s project. Use concrete details from your discovery conversation — pages, features, timeline, and budget breakdown. What section do you need help with?`;
 }

 const body = {
 system_instruction: { parts: [{ text: systemPrompt }] },
 contents: chatMessages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
 generationConfig: { temperature: 0.75, maxOutputTokens: 220, topP: 0.9 },
 };

 const res = await fetch(GEMINI_URL, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(body),
 });
 if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
 const data = await res.json();
 return data.candidates?.[0]?.content?.parts?.[0]?.text ??"Sorry, try again.";
}

const PROPOSAL_PARAGRAPHS: Record<string, string[]> = {
"Maria Santos": [
 // 0 Executive Summary
"This proposal outlines the development of a food menu website for Maria Santos's karinderya, designed to eliminate the high volume of daily menu inquiries currently received through Facebook Messenger. The project will deliver a mobile-first, display-only website within an agreed budget of ₱5,000, enabling customers to browse the daily menu and prices online without needing to contact the business directly.",
 // 1 Background / Problem Statement
"Maria Santos operates a local karinderya that currently relies on Facebook Messenger to handle customer inquiries about the daily menu. This informal arrangement generates a high volume of repetitive messages, some of which go unanswered, resulting in missed orders and customer dissatisfaction. A dedicated menu website will give customers instant, round-the-clock access to menu information without requiring any direct communication with the business.",
 // 2 Objectives / Goals
"The primary objective of this project is to reduce repetitive Messenger inquiries by giving customers a direct online destination to view the karinderya's daily menu and prices. The website will also establish a basic online presence for the business, making it more discoverable to new customers browsing on their mobile devices. All design and development decisions will prioritize mobile usability, as the majority of Maria Santos's customers access information via smartphones.",
 // 3 Proposed Solution / Scope of Work
"The proposed solution is a lightweight, display-only website comprising four pages: Home, Menu, About Us, and Contact. The Menu page will feature the daily offerings with clearly listed prices, alongside a link to the business's Facebook page for ongoing updates. The design will use warm orange and yellow tones consistent with the karinderya's brand, and the scope explicitly excludes online ordering, user accounts, and payment processing to keep the project within budget and timeline.",
 // 4 Timeline / Milestones
"The project is estimated to be completed within two weeks from the date of proposal approval, with delivery timed ahead of the upcoming sponsor visit. The workflow will proceed in four phases: Design (Days 1–3), Development (Days 4–9), Client Review and Revisions (Days 10–12), and Final Launch (Days 13–14). This timeline assumes timely client feedback during the revision phase and is subject to adjustment if additional scope is introduced.",
 // 5 Deliverables
"Upon completion, the client will receive a fully functional four-page website including the Home, Menu, About Us, and Contact pages, with the Menu page displaying item names and prices. The deliverable also includes integration of the business's Facebook page link, mobile-optimized layouts across all pages, and a brief post-delivery walkthrough to help Maria Santos manage and update the site independently.",
 // 6 Team / Roles
"This project will be executed solely by the freelancer, who will handle all aspects of the engagement including UI design, front-end development, deployment, and ongoing client communication throughout the project lifecycle. No subcontractors or third parties will be involved, ensuring consistent quality and a single point of accountability from kickoff to delivery.",
 // 7 Budget / Pricing
"The total project fee is ₱5,000, which covers UI design, development, deployment, and two rounds of client revisions. Payment will be structured as a 50% downpayment of ₱2,500 upon proposal approval, with the remaining balance of ₱2,500 due upon final delivery. Additional revision rounds beyond the two included, or any scope additions agreed upon during the project, will be billed at ₱500 per round.",
 // 8 Success Metrics / Evaluation
"Project success will be measured by a noticeable reduction in repetitive Messenger inquiries about the daily menu within the first two weeks after launch, alongside positive client feedback on the website's usability and appearance. Additional indicators include increased foot traffic attributable to improved online visibility and a consistent number of weekly menu page views. The project will also be considered successful if Maria Santos is able to update the menu content independently following the post-delivery walkthrough.",
 // 9 Terms & Conditions
"This engagement includes two rounds of revisions at no additional cost; further revisions will be billed at ₱500 per round. Any changes to the agreed scope of work — including the addition of new pages or features not outlined in this proposal — will be assessed and quoted separately before work begins. Full ownership of all website assets and source files will be transferred to the client upon receipt of final payment, with a two-week post-launch support window included for minor issues.",
 // 10 Call to Action / Next Steps
"To proceed, please review and approve this proposal at your earliest convenience so we can begin immediately. Upon approval, a downpayment of ₱2,500 (50% of the total project fee) will be required to initiate the design phase. You are welcome to reach out with any questions or requested adjustments before signing off — I look forward to working with you on this project.",
 ],
"Kuya Jun": [
"This proposal outlines the development of an online product catalog website for Kuya Jun's sari-sari and online selling business, intended to centralize product listings and eliminate the issue of missed orders due to disorganized chat conversations. The project will be delivered within one week at an agreed budget of ₱8,000, providing a clean and mobile-friendly catalog that buyers can browse without needing to message first.",
"Kuya Jun currently manages product sales through Facebook and Shopee chats, which has resulted in a disorganized and error-prone order-taking process where products lack clear listings and orders frequently get lost in conversation threads. Buyers — primarily young, mobile-first customers from TikTok and Facebook — need a centralized destination to browse products with prices before initiating purchase. A dedicated catalog website will eliminate these gaps and streamline the buying experience.",
"The project aims to centralize all product listings in one accessible online location, eliminating missed orders caused by fragmented chat-based selling. The website will clearly display GCash payment information alongside each product to reduce follow-up messages about payment, and will link to existing Facebook and Shopee storefronts for a seamless cross-platform buyer journey. Given Kuya Jun's urgency, the entire site will be built and delivered within one week.",
"The proposed solution is a streamlined catalog website consisting of a Home page and a Products page displaying item photos, names, and prices, along with clearly presented GCash payment instructions. The site will also link to the client's existing Facebook page and Shopee store to complement rather than replace those channels. The scope does not include a shopping cart, inventory management system, or user login functionality, keeping the build fast, focused, and within the agreed budget.",
"Given the urgent one-week delivery requirement, the project will be executed in an accelerated two-phase workflow: combined Design and Development (Days 1–5), followed by Client Review, Revisions, and Launch (Days 6–7). This tight schedule is achievable only within the defined scope, and any additions to the agreed deliverables will require a timeline extension. The client's prompt feedback during the review phase is essential to meeting this deadline.",
"The final deliverable will include a Home page, a fully populated Products catalog page with item photos and prices, clearly displayed GCash payment instructions, and integration links to the client's Facebook page and Shopee store. All pages will be mobile-optimized to serve the client's primarily phone-based buyer audience, and the completed site will be handed over with deployment ready for immediate use.",
"This project will be delivered entirely by the freelancer, who will manage UI design, development, deployment, and all client communication without the involvement of third parties. This ensures a direct and efficient working relationship with a single accountable point of contact from start to finish.",
"The total project cost is ₱8,000, which includes one round of client revisions and covers all design, development, and deployment work. Payment terms are 50% downpayment (₱4,000) upon proposal approval and 50% (₱4,000) upon final delivery. Additional revision rounds beyond the one included will be billed at ₱500 each, and any new scope items will be quoted separately before work begins.",
"Success will be evaluated based on whether buyers can browse all products without needing to send a message to Kuya Jun first, and whether the GCash payment process is clear enough to reduce follow-up payment inquiries. Technical benchmarks include a page load time of under three seconds and full usability on mobile devices. A reduction in missed orders within the first two weeks post-launch will serve as the primary business indicator of project success.",
"This project includes one revision round at no additional cost; subsequent rounds are billed at ₱500 each. Any features or pages not specified in this proposal are considered out of scope and will be priced separately. Full source code and all assets will be transferred to the client upon final payment, and no ongoing maintenance is included unless a separate arrangement is made.",
"To move forward, please approve this proposal and submit the 50% downpayment of ₱4,000 so development can begin today. Given the one-week delivery target, a fast turnaround on your approval and feedback during review will be critical. Feel free to message me with any clarifications — I'm ready to start immediately.",
 ],
"Ate Bea": [
"This proposal outlines the design and development of a professional fashion portfolio website for Ate Bea's pre-loved clothing brand, @bea.thrift, intended to replace a disorganized Instagram feed with a curated, credible online presence. The project will be completed within three weeks at a total investment of ₱6,500, creating an aesthetic and mobile-first portfolio that elevates the brand and increases buyer confidence.",
"Ate Bea operates a pre-loved fashion reselling business on Instagram under the handle @bea.thrift, but the platform's feed format lacks the structure and credibility needed to position the brand as a serious boutique. Potential buyers — primarily Gen Z women aged 16–30 browsing on their phones — often struggle to get a clear view of the available collections due to the unorganized nature of Instagram posts. A dedicated portfolio website will serve as the brand's primary digital storefront, presenting collections in a curated, professional format that Instagram cannot replicate.",
"The core objective is to create a polished portfolio website that positions @bea.thrift as a credible fashion brand, moving beyond the limitations of Instagram's feed format. The website will increase buyer trust and conversion by presenting pre-loved items in a curated, lookbook-style layout that resonates with the target audience of young, fashion-conscious women on mobile devices. The Instagram account will remain active and will be integrated throughout the site to bridge the brand's existing following with the new web presence.",
"The proposed website will consist of five pages: Home, Lookbook or Gallery, Shop or Collections, About Me, and Contact, all built with a minimalist aesthetic using a beige base and dusty rose or sage green accents. The design will be mobile-first throughout, reflecting how the target audience browses and shops. The scope does not include a functional checkout system, live inventory management, or user accounts — the site will serve as a brand portfolio with Instagram linking as the primary purchase pathway.",
"The project will be executed over three weeks: Week 1 will focus on UI design and mockup creation for client review, Week 2 on front-end development, and Week 3 on revisions and final launch. This phased approach ensures the visual direction is locked in before development begins, which is essential for a design-driven fashion project. The color palette and overall aesthetic must be agreed upon and confirmed in writing before development starts to protect the timeline.",
"The completed project will include five fully designed and developed pages — Home, Lookbook, Shop or Collections, About Me, and Contact — with the Instagram handle @bea.thrift linked prominently throughout. All pages will be optimized for mobile viewing, and the final deliverable will include a clean handover of all source files and assets upon receipt of the final payment.",
"All design, development, deployment, and client communication will be handled exclusively by the freelancer, ensuring a consistent creative vision and a streamlined working relationship with no third-party dependencies.",
"The total project investment is ₱6,500, inclusive of up to three rounds of revisions and covering all design, development, and deployment work. Payment is structured as 50% downpayment (₱3,250) upon proposal approval, with the balance due upon final delivery. Additional revisions beyond the three included will be billed at ₱500 per round, and any scope additions will be quoted and agreed upon in writing before work begins.",
"Project success will be assessed by the brand's ability to present its collections in a way that is more professional and credible than the current Instagram feed, alongside measurable growth in DM inquiries from new buyers who discovered the brand through the website. Reduced dependence on Instagram's algorithm for visibility and increased traffic to the @bea.thrift account from the site will serve as additional positive indicators.",
"Up to three revision rounds are included in the project fee; additional rounds are billed at ₱500 each. The color palette and visual direction must be locked and agreed upon in writing before development commences — design changes requested after this point will reset the revision counter. Scope additions mid-project will be billed separately, and all assets will be transferred to the client upon full payment.",
"Please review this proposal and confirm the color palette and aesthetic direction so we can finalize the brief and begin Week 1 design work. Upon approval, a downpayment of ₱3,250 will initiate the project. I'm excited to help bring the @bea.thrift brand to life beyond Instagram — let's discuss any adjustments you'd like before we kick off.",
 ],
"Sir Ramon": [
"This proposal outlines the design and development of a professional online booking platform for Sir Ramon's private tutoring business, intended to eliminate the double-booking issues and missed payments that arise from the current manual text and call-based scheduling system. The project will be delivered within three to four weeks at a total budget of ₱12,000, providing a fully integrated booking calendar with GCash payment processing and an admin dashboard for session management.",
"Sir Ramon provides private tutoring in Math, Science, and English for students in Grades 4 to 12, and currently manages all session bookings through text messages and phone calls. This informal system has led to recurring double bookings and inconsistent payment collection, creating unnecessary stress for both the tutor and his students' parents. A professional online booking platform will automate scheduling, enable upfront GCash payment at the time of booking, and present Sir Ramon's services with the credibility expected of an established tutoring business.",
"The primary goal of this project is to eliminate double bookings entirely by replacing the manual scheduling system with a self-service online booking calendar that students and parents can access at any time. The platform will also enable GCash payment at the point of booking, removing the need for cash follow-ups and ensuring consistent revenue collection. A supporting objective is to establish a professional web presence that increases Sir Ramon's visibility and attracts new students ahead of the upcoming school term.",
"The proposed platform will include five public-facing pages — Home, About, Services and Pricing, Booking, and Testimonials — alongside an admin dashboard that gives Sir Ramon full visibility into upcoming sessions. The Booking page will feature a real-time calendar with selectable time slots and integrated GCash payment processing, ensuring students and parents can complete the entire enrollment process online. The scope excludes student portal accounts, video conferencing functionality, and a content management system, keeping the build focused and deliverable within the agreed timeline and budget.",
"The project will be executed over a structured 28-day timeline beginning from the approval date: Days 1–5 for design and wireframes, Days 6–14 for core development, Days 15–21 for booking system integration and GCash payment setup, Days 22–25 for testing and quality assurance, and Days 26–28 for final revisions and launch. This schedule is designed to deliver the platform before the start of the next school term, and timely client feedback at each phase is essential to maintaining this timeline.",
"The final deliverables include five fully developed pages — Home, About, Services and Pricing, Booking, and Testimonials — along with a functional admin dashboard for session management, an online booking calendar with real-time time slot availability, GCash payment integration, and mobile-responsive layouts on all pages. Complete source code and all project assets will be transferred to the client upon receipt of the final payment.",
"All design, development, QA, deployment, and client communication will be handled exclusively by the freelancer, ensuring a single point of accountability and consistent quality across all deliverables. No external contractors will be engaged at any stage of the project.",
"The total project fee is ₱12,000, structured across three milestone payments: 40% (₱4,800) at project kickoff, 30% (₱3,600) at the midpoint upon completion of core development, and the remaining 30% (₱3,600) upon final delivery. Two rounds of revisions are included in the total fee; additional rounds will be billed at ₱1,000 per round. Scope changes requested after the initial sign-off will be assessed and quoted separately before work proceeds.",
"Success will be measured by the complete elimination of double bookings within 30 days of launch, consistent upfront payment collection via GCash at the time of booking, and Sir Ramon's ability to view and manage all upcoming sessions from the admin dashboard at a glance. Parent and student satisfaction with the ease of the booking experience will serve as a qualitative indicator of the platform's effectiveness.",
"This engagement includes two rounds of revisions; additional rounds are billed at ₱1,000 each. Scope changes requested after the initial project sign-off will be quoted and approved in writing before any work proceeds on those additions. Full source code will be transferred upon final payment, a 30-day post-launch support period is included for bug fixes, and the client is expected to provide timely feedback at each milestone to maintain the agreed delivery schedule.",
"To initiate the project, please review and sign the project agreement, then submit the 40% kickoff payment of ₱4,800 so we can schedule a kickoff call and begin the design and wireframing phase immediately. I am committed to delivering a platform that eliminates the scheduling friction your business currently faces and positions you professionally for the upcoming school term. Please reach out with any questions before signing off.",
 ],
};

export async function generateProposalSection(
 persona: ClientPersona,
 sectionIndex: number,
 sectionName: string,
 messages: Message[]
): Promise<string> {
 if (!GEMINI_API_KEY) {
 return PROPOSAL_PARAGRAPHS[persona.name]?.[sectionIndex]
 ??"Fill this section based on your discovery conversation.";
 }

 const recall = getProposalRecall(persona, sectionIndex);
 const discoveryNotes = messages
 .filter((m) => m.role === "user")
 .slice(0, 12)
 .map((m) => `- ${m.text}`)
 .join( "\n");

 const prompt = `You are a Filipino student freelancer writing a formal project proposal.

CLIENT RECALL:
${recall}

What you asked during discovery:
${discoveryNotes}

Write the"${sectionName}" section of the project proposal.
Rules:
- Write 2–4 complete, professional sentences as a single flowing paragraph — NO bullet points, NO dashes, NO numbered lists
- Professional and polished tone (like a real freelancer proposal)
- Specific to this client — mention their business name, budget (₱), and project details naturally within the paragraph
- Do NOT include a section heading — write only the paragraph content
- Do NOT use markdown formatting

Write ONLY a clean paragraph for"${sectionName}".`;

 const body = {
 contents: [{ role: "user", parts: [{ text: prompt }] }],
 generationConfig: { temperature: 0.7, maxOutputTokens: 280 },
 };

 const res = await fetch(GEMINI_URL, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(body),
 });

 if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
 const data = await res.json();
 return data.candidates?.[0]?.content?.parts?.[0]?.text ??"";
}
