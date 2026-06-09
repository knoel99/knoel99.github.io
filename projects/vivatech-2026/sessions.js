/* ============================================================================
   VivaTech 2026 — données du programme
   ----------------------------------------------------------------------------
   Réorganisation visuelle du programme public de VivaTech 2026
   (Paris Expo Porte de Versailles, 17–20 juin 2026).

   Source officielle (paginée, peu lisible) :
   https://vivatech.com/sessions

   ⚠️  Le détail horaire ci-dessous est ILLUSTRATIF : il reconstitue le format
   réel de l'événement (4 scènes, ~450 intervenants, thèmes annoncés) à partir
   des annonces publiques. Les horaires exacts sont à confirmer sur le site
   officiel. Structure pensée pour être facilement mise à jour : il suffit
   d'éditer le tableau SESSIONS.
   ========================================================================== */

// Jours de l'événement
const DAYS = [
  { id: "2026-06-17", label: "Mer. 17", full: "Mercredi 17 juin", hours: "08:30 – 18:00", note: "Ouverture" },
  { id: "2026-06-18", label: "Jeu. 18", full: "Jeudi 18 juin",    hours: "08:30 – 19:00", note: "Journée business" },
  { id: "2026-06-19", label: "Ven. 19", full: "Vendredi 19 juin", hours: "08:30 – 18:00", note: "Startup Prizes" },
  { id: "2026-06-20", label: "Sam. 20", full: "Samedi 20 juin",   hours: "08:30 – 18:00", note: "Grand public" },
];

// Scènes (colonnes du calendrier)
const STAGES = ["Stage One", "Stage Two", "Stage Three", "Innovation Lab"];

// Thèmes (code couleur)
const THEMES = {
  ai:        { label: "IA & Machine Learning", color: "#7c3aed" },
  work:      { label: "Futur du travail",      color: "#0066cc" },
  green:     { label: "GreenTech & Durabilité", color: "#16a34a" },
  policy:    { label: "Gouvernance & Politique", color: "#ea580c" },
  startup:   { label: "Startups & Investissement", color: "#db2777" },
  health:    { label: "HealthTech",            color: "#0d9488" },
  deeptech:  { label: "Deep Tech & Web3",      color: "#4f46e5" },
};

// Programme. theme = clé de THEMES. start/end au format "HH:MM".
const SESSIONS = [
  /* ---------------------------- Mercredi 17 ---------------------------- */
  { day:"2026-06-17", start:"09:00", end:"09:45", stage:"Stage One", theme:"ai",
    title:"Opening Keynote — The Decade of AI", speakers:["Jensen Huang (NVIDIA)"] },
  { day:"2026-06-17", start:"10:00", end:"10:40", stage:"Stage One", theme:"ai",
    title:"Sovereign AI for Europe", speakers:["Arthur Mensch (Mistral AI)"] },
  { day:"2026-06-17", start:"11:00", end:"11:40", stage:"Stage One", theme:"deeptech",
    title:"The Future of Open Research", speakers:["Yann LeCun (Meta)"] },
  { day:"2026-06-17", start:"12:00", end:"12:40", stage:"Stage One", theme:"startup",
    title:"Global Tech & the New Trade Map", speakers:["Joe Tsai (Alibaba)"] },
  { day:"2026-06-17", start:"14:00", end:"15:00", stage:"Stage One", theme:"startup",
    title:"Startup Prize — Pitch des 5 finalistes", speakers:["Jury VivaTech"] },

  { day:"2026-06-17", start:"09:30", end:"10:10", stage:"Stage Two", theme:"work",
    title:"AI Agents at Work : productivité réelle", speakers:["Panel entreprises"] },
  { day:"2026-06-17", start:"10:30", end:"11:10", stage:"Stage Two", theme:"policy",
    title:"AI Act : un an après", speakers:["Commission européenne"] },
  { day:"2026-06-17", start:"11:30", end:"12:10", stage:"Stage Two", theme:"green",
    title:"Datacenters & énergie : tenir la charge", speakers:["Opérateurs cloud"] },
  { day:"2026-06-17", start:"14:30", end:"15:10", stage:"Stage Two", theme:"health",
    title:"IA et diagnostic médical", speakers:["Panel HealthTech"] },

  { day:"2026-06-17", start:"10:00", end:"11:30", stage:"Stage Three", theme:"startup",
    title:"AfricaTech Award — Pitch Session", speakers:["6 finalistes"] },
  { day:"2026-06-17", start:"12:00", end:"12:40", stage:"Stage Three", theme:"deeptech",
    title:"Quantum computing : où en est-on ?", speakers:["Panel deep tech"] },
  { day:"2026-06-17", start:"14:00", end:"14:45", stage:"Stage Three", theme:"work",
    title:"Reskilling à l'ère de l'IA", speakers:["RH & EdTech"] },

  { day:"2026-06-17", start:"11:00", end:"12:00", stage:"Innovation Lab", theme:"ai",
    title:"Workshop : déployer un LLM en production", speakers:["Hands-on"] },
  { day:"2026-06-17", start:"14:00", end:"15:00", stage:"Innovation Lab", theme:"green",
    title:"Workshop : mesurer l'empreinte carbone du code", speakers:["Hands-on"] },

  /* ---------------------------- Jeudi 18 ------------------------------- */
  { day:"2026-06-18", start:"09:00", end:"09:45", stage:"Stage One", theme:"ai",
    title:"Foundation Models : la prochaine frontière", speakers:["Keynote IA"] },
  { day:"2026-06-18", start:"10:00", end:"10:40", stage:"Stage One", theme:"policy",
    title:"Geopolitics of Compute", speakers:["Panel international"] },
  { day:"2026-06-18", start:"11:00", end:"11:40", stage:"Stage One", theme:"startup",
    title:"From Unicorn to Decacorn", speakers:["Fondateurs scale-ups"] },
  { day:"2026-06-18", start:"12:00", end:"12:40", stage:"Stage One", theme:"deeptech",
    title:"Robotics & Physical AI", speakers:["Keynote robotique"] },
  { day:"2026-06-18", start:"14:00", end:"14:45", stage:"Stage One", theme:"green",
    title:"Net Zero by Design", speakers:["Panel climat"] },
  { day:"2026-06-18", start:"15:30", end:"16:10", stage:"Stage One", theme:"work",
    title:"The 4-day week, powered by AI", speakers:["Futur du travail"] },

  { day:"2026-06-18", start:"09:30", end:"10:10", stage:"Stage Two", theme:"health",
    title:"Longevity & biotech", speakers:["Panel HealthTech"] },
  { day:"2026-06-18", start:"10:30", end:"11:10", stage:"Stage Two", theme:"ai",
    title:"Multimodal AI : voir, entendre, agir", speakers:["Chercheurs IA"] },
  { day:"2026-06-18", start:"11:30", end:"12:10", stage:"Stage Two", theme:"startup",
    title:"Lever des fonds en 2026", speakers:["VCs européens"] },
  { day:"2026-06-18", start:"14:00", end:"14:40", stage:"Stage Two", theme:"policy",
    title:"Souveraineté numérique européenne", speakers:["Décideurs publics"] },
  { day:"2026-06-18", start:"15:00", end:"15:40", stage:"Stage Two", theme:"deeptech",
    title:"Space tech : la nouvelle ruée", speakers:["NewSpace"] },

  { day:"2026-06-18", start:"10:00", end:"10:40", stage:"Stage Three", theme:"work",
    title:"Designing AI-native organizations", speakers:["Panel management"] },
  { day:"2026-06-18", start:"11:00", end:"11:40", stage:"Stage Three", theme:"green",
    title:"Circular economy & hardware", speakers:["GreenTech"] },
  { day:"2026-06-18", start:"14:00", end:"15:00", stage:"Stage Three", theme:"startup",
    title:"Pitch arena — Seed startups", speakers:["10 startups"] },

  { day:"2026-06-18", start:"10:00", end:"11:00", stage:"Innovation Lab", theme:"ai",
    title:"Workshop : fine-tuning sans GPU dédié", speakers:["Hands-on"] },
  { day:"2026-06-18", start:"14:30", end:"15:30", stage:"Innovation Lab", theme:"deeptech",
    title:"Workshop : prototyper en réalité mixte", speakers:["Hands-on"] },

  /* ---------------------------- Vendredi 19 ---------------------------- */
  { day:"2026-06-19", start:"09:00", end:"09:45", stage:"Stage One", theme:"ai",
    title:"Responsible AI at scale", speakers:["Keynote éthique"] },
  { day:"2026-06-19", start:"10:00", end:"10:40", stage:"Stage One", theme:"startup",
    title:"Building European Champions", speakers:["Fondateurs"] },
  { day:"2026-06-19", start:"11:00", end:"11:40", stage:"Stage One", theme:"work",
    title:"AI & creativity : qui crée ?", speakers:["Industries culturelles"] },
  { day:"2026-06-19", start:"14:00", end:"15:30", stage:"Stage One", theme:"startup",
    title:"VivaTech Startup Prizes — Cérémonie", speakers:["Isabelle Johannessen (TechCrunch)"] },

  { day:"2026-06-19", start:"09:30", end:"10:10", stage:"Stage Two", theme:"green",
    title:"Climate tech : passer à l'échelle", speakers:["Panel climat"] },
  { day:"2026-06-19", start:"10:30", end:"11:10", stage:"Stage Two", theme:"health",
    title:"Mental health & technologie", speakers:["HealthTech"] },
  { day:"2026-06-19", start:"11:30", end:"12:10", stage:"Stage Two", theme:"policy",
    title:"Réguler les plateformes : DSA & au-delà", speakers:["Régulateurs"] },
  { day:"2026-06-19", start:"14:00", end:"14:40", stage:"Stage Two", theme:"ai",
    title:"Small models, big impact", speakers:["Edge AI"] },

  { day:"2026-06-19", start:"10:00", end:"10:40", stage:"Stage Three", theme:"deeptech",
    title:"Cybersécurité à l'ère de l'IA", speakers:["Panel cyber"] },
  { day:"2026-06-19", start:"11:00", end:"11:40", stage:"Stage Three", theme:"work",
    title:"Talents tech : la guerre continue", speakers:["RH tech"] },
  { day:"2026-06-19", start:"14:00", end:"15:00", stage:"Stage Three", theme:"startup",
    title:"Pitch arena — Series A", speakers:["10 startups"] },

  { day:"2026-06-19", start:"10:00", end:"11:00", stage:"Innovation Lab", theme:"green",
    title:"Workshop : éco-conception logicielle", speakers:["Hands-on"] },
  { day:"2026-06-19", start:"14:00", end:"15:00", stage:"Innovation Lab", theme:"health",
    title:"Workshop : data santé & confidentialité", speakers:["Hands-on"] },

  /* ---------------------------- Samedi 20 — grand public --------------- */
  { day:"2026-06-20", start:"09:30", end:"10:10", stage:"Stage One", theme:"ai",
    title:"L'IA expliquée à tous", speakers:["Vulgarisation"] },
  { day:"2026-06-20", start:"10:30", end:"11:10", stage:"Stage One", theme:"work",
    title:"Quels métiers en 2035 ?", speakers:["Prospective"] },
  { day:"2026-06-20", start:"11:30", end:"12:10", stage:"Stage One", theme:"deeptech",
    title:"Robots à la maison : fiction ou réalité ?", speakers:["Démos"] },
  { day:"2026-06-20", start:"14:00", end:"14:40", stage:"Stage One", theme:"green",
    title:"Technos pour la planète", speakers:["GreenTech grand public"] },

  { day:"2026-06-20", start:"10:00", end:"10:40", stage:"Stage Two", theme:"health",
    title:"Mieux vivre grâce à la tech", speakers:["HealthTech"] },
  { day:"2026-06-20", start:"11:00", end:"11:40", stage:"Stage Two", theme:"startup",
    title:"Créer sa startup à 20 ans", speakers:["Jeunes fondateurs"] },
  { day:"2026-06-20", start:"14:00", end:"14:40", stage:"Stage Two", theme:"deeptech",
    title:"Gaming & immersion", speakers:["Studios"] },

  { day:"2026-06-20", start:"10:00", end:"11:00", stage:"Stage Three", theme:"work",
    title:"Atelier orientation : les métiers de la tech", speakers:["Étudiants"] },
  { day:"2026-06-20", start:"14:00", end:"15:00", stage:"Stage Three", theme:"ai",
    title:"Démo : générer une image, un son, une vidéo", speakers:["Démos IA"] },

  { day:"2026-06-20", start:"10:00", end:"11:00", stage:"Innovation Lab", theme:"deeptech",
    title:"Atelier famille : coder son premier jeu", speakers:["Hands-on"] },
  { day:"2026-06-20", start:"14:00", end:"15:00", stage:"Innovation Lab", theme:"green",
    title:"Atelier : recycler son électronique", speakers:["Hands-on"] },
];
