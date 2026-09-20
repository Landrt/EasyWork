'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume } from "@/lib/types";

interface DashboardData {
  profile: Profile | null;
  baseResumes: Resume[];
  tailoredResumes: Resume[];
}

const mockProfile: Profile = {
  id: "landry-mouko-profile",
  user_id: "demo-user-1",
  first_name: "Landry",
  last_name: "Mouko",
  email: "moukolandry03@gmail.com",
  phone_number: "+237 6 90 00 00 00",
  location: "Yaoundé, Cameroun (Disponible mobilité internationale & Remote)",
  website: "https://github.com/Landrt",
  linkedin_url: "https://linkedin.com/in/landry-mouko",
  github_url: "https://github.com/Landrt",
  work_experience: [
    {
      company: "EasyWork & GhostAI (Plateforme d'Innovation Numérique)",
      position: "Ingénieur Logiciel & IA Full-Stack (Solutions Numériques & DPG)",
      location: "Remote / Yaoundé",
      date: "Jan 2025 - Présent",
      description: [
        "Architecture et développement d'une plateforme cloud moderne (Next.js 15, React 19, TypeScript, Supabase PostgreSQL RLS) ayant traité plus de 1 200 analyses avec un temps de réponse moyen < 1.5s.",
        "Implémentation d'algorithmes d'analyse sémantique et d'audit ATS réduisant les points de rejet de 40% grâce à l'intégration des modèles DeepSeek V3 et OpenAI pour l'extraction de compétences.",
        "Conception d'une infrastructure résiliente à haute disponibilité avec limiteur de débit distribué Leaky-Bucket (Upstash Redis) et sécurisation cryptographique des transactions (99.9% uptime)."
      ],
      technologies: ["Next.js 15", "TypeScript", "DeepSeek API", "Supabase", "PostgreSQL", "Upstash Redis", "Tailwind CSS", "CI/CD"]
    },
    {
      company: "Projets Open-Source & Innovation d'Impact (GitHub Landrt)",
      position: "Ingénieur Logiciel & Chercheur en Données / IA",
      location: "Yaoundé, Cameroun",
      date: "Jan 2024 - Déc 2024",
      description: [
        "VeriScope & Veracity-Analyzer : Conception d'un système intelligent NLP de détection de fausses informations ayant analysé plus de 5 000 assertions avec 92% de précision (aligné ODD 16 - Paix, Justice et Institutions efficaces).",
        "PowerVision & PowerVision-Box : Développement d'une application Flutter et d'une passerelle IoT Kotlin réduisant l'empreinte énergétique de monitoring de 28% sur matériel edge (aligné ODD 7 & 9).",
        "FingID : Déploiement d'un module d'authentification biométrique et gestion d'identités numériques sécurisées conforme aux standards SDG 16.9 et principes des Biens Publics Numériques."
      ],
      technologies: ["Python", "NLP", "Machine Learning", "Flutter / Dart", "Kotlin", "C/C++", "Docker", "Git / GitHub Actions"]
    }
  ],
  education: [
    {
      school: "Faculté des Sciences / École d'Ingénierie Informatique",
      degree: "Master / Diplôme d'Ingénieur en Génie Logiciel & Systèmes d'Information",
      field: "Informatique, Algorithmique Avancée & Systèmes Intelligents",
      date: "2021 - 2025 (En cours de finalisation - Recherche de stage)",
      location: "Yaoundé, Cameroun",
      achievements: [
        "Excellence académique en algorithmique avancée, structures de données et traitement d'images bas-niveau (C/C++)",
        "Spécialisation en architectures logicielles distribuées, intelligence artificielle éthique et solutions numériques pour le développement (DPG)"
      ]
    }
  ],
  skills: [
    {
      category: "Langages & Programmation",
      items: ["TypeScript", "JavaScript", "Python", "Dart", "Kotlin", "C/C++", "SQL (PostgreSQL)"]
    },
    {
      category: "Technologies Web & Cloud",
      items: ["Next.js 15", "React 19", "Node.js", "Express", "Supabase", "Upstash Redis", "Tailwind CSS", "REST APIs", "Docker", "CI/CD (GitHub Actions)"]
    },
    {
      category: "Intelligence Artificielle & Données",
      items: ["DeepSeek API", "OpenAI API", "Vercel AI SDK", "Prompt Engineering", "NLP & Fact-Checking", "Computer Vision", "Machine Learning", "Data Pipelines"]
    },
    {
      category: "Compétences Internationales & PNUD",
      items: ["Objectifs de Développement Durable (ODD)", "Digital Public Goods (Biens Publics Numériques)", "Éthique de l'IA & Données Ouvertes", "Gestion de Projet Agile / Scrum", "Français (Langue maternelle)", "Anglais (Professionnel)"]
    }
  ],
  projects: [
    {
      name: "EasyWork - SaaS d'Accompagnement de Carrière par l'IA",
      description: [
        "Plateforme complète d'optimisation de CVs et d'adéquation candidat-emploi propulsée par DeepSeek et OpenAI.",
        "Architecture SaaS multi-tenante sécurisée avec Row Level Security, système de parrainage et conformité RGPD intégrale."
      ],
      date: "2025",
      technologies: ["Next.js", "TypeScript", "DeepSeek", "Supabase", "Tailwind CSS"],
      url: "https://github.com/Landrt/EasyWork",
      github_url: "https://github.com/Landrt/EasyWork"
    },
    {
      name: "VeriScope / Veracity-Analyzer - Lutte contre la Désinformation",
      description: [
        "Moteur automatisé d'analyse de véracité des informations publiques et vérification de faits par modèles de langage.",
        "Développement d'heuristiques d'intégrité de données pour la gouvernance numérique transparente (ODD 16)."
      ],
      date: "2024 - 2025",
      technologies: ["Python", "NLP", "TypeScript", "AI Verification"],
      url: "https://github.com/Landrt/VeriScope",
      github_url: "https://github.com/Landrt/VeriScope"
    },
    {
      name: "PowerVision - Vision par Ordinateur & IoT Énergétique",
      description: [
        "Application mobile Flutter couplée à une boîte de traitement Kotlin pour l'analyse visuelle et le contrôle d'équipements.",
        "Optimisation de la consommation énergétique et traitement edge pour environnements à ressources limitées (ODD 7 & 9)."
      ],
      date: "2024 - 2025",
      technologies: ["Flutter", "Dart", "Kotlin", "Computer Vision"],
      url: "https://github.com/Landrt/PowerVision",
      github_url: "https://github.com/Landrt/PowerVision"
    },
    {
      name: "FingID - Système d'Authentification Biométrique",
      description: [
        "Architecture d'identification biométrique sécurisée facilitant l'accès aux services numériques sans dépendance aux identifiants papier.",
        "Conforme aux principes d'inclusion numérique et de protection des données personnelles (ODD 16.9)."
      ],
      date: "2024 - 2025",
      technologies: ["TypeScript", "Biometrics", "Security", "REST API"],
      url: "https://github.com/Landrt/FingID",
      github_url: "https://github.com/Landrt/FingID"
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockBaseResume: Resume = {
  id: "landry-mouko-base-resume",
  user_id: "demo-user-1",
  name: "CV Principal - Landry Mouko (Ingénieur Logiciel & IA)",
  target_role: "Stagiaire Solutions Numériques & Ingénierie Logicielle / Digital Innovation Intern",
  is_base_resume: true,
  first_name: "Landry",
  last_name: "Mouko",
  email: "moukolandry03@gmail.com",
  phone_number: "+237 6 90 00 00 00",
  location: "Yaoundé, Cameroun (Mobilité Internationale & Remote)",
  website: "https://github.com/Landrt",
  linkedin_url: "https://linkedin.com/in/landry-mouko",
  github_url: "https://github.com/Landrt",
  work_experience: mockProfile.work_experience,
  education: mockProfile.education,
  skills: mockProfile.skills,
  projects: mockProfile.projects,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  has_cover_letter: true,
  document_settings: {
    document_font_size: 10,
    document_line_height: 1.35,
    document_margin_vertical: 28,
    document_margin_horizontal: 28,
    header_name_size: 22,
    header_name_bottom_spacing: 8,
    skills_margin_top: 8,
    skills_margin_bottom: 8,
    skills_margin_horizontal: 0,
    skills_item_spacing: 4,
    experience_margin_top: 8,
    experience_margin_bottom: 8,
    experience_margin_horizontal: 0,
    experience_item_spacing: 6,
    projects_margin_top: 8,
    projects_margin_bottom: 8,
    projects_margin_horizontal: 0,
    projects_item_spacing: 6,
    education_margin_top: 8,
    education_margin_bottom: 8,
    education_margin_horizontal: 0,
    education_item_spacing: 6
  }
};

const mockTailoredResume: Resume = {
  ...mockBaseResume,
  id: "undp-tailored-resume-landry",
  job_id: "undp-internship-digital-innovation",
  name: "Candidature Stage Solutions Numériques & IA @ PNUD (UNDP)",
  target_role: "Stagiaire en Innovation Numérique, Données & Ingénierie Logicielle",
  is_base_resume: false,
  application_status: "applied",
  match_analysis: {
    jobId: "undp-internship-digital-innovation",
    items: [
      {
        requirement: "Développement d'applications logicielles et plateformes numériques d'impact (Next.js, Python, TypeScript)",
        status: "demonstrated",
        evidence: "Développement d'EasyWork (plateforme cloud Next.js 15 / Supabase / IA) et projets open-source VeriScope et PowerVision sur GitHub (Landrt).",
      },
      {
        requirement: "Application de l'Intelligence Artificielle & LLM pour le développement durable (IA éthique, NLP)",
        status: "demonstrated",
        evidence: "Intégration d'APIs de pointe (DeepSeek, OpenAI) avec validation sémantique, et projet Veracity-Analyzer pour l'intégrité de l'information (ODD 16).",
      },
      {
        requirement: "Sensibilité aux Objectifs de Développement Durable (ODD) et aux Biens Publics Numériques (DPG)",
        status: "demonstrated",
        evidence: "Projets axés sur la transparence de l'information (ODD 16), l'efficacité énergétique/IoT (ODD 7/9) et l'inclusion numérique (ODD 16.9 FingID).",
      },
      {
        requirement: "Collaboration technique en équipe multiculturelle et maîtrise des outils Git/GitHub",
        status: "demonstrated",
        evidence: "Plus de 19 dépôts publics gérés sur GitHub (Landrt) avec CI/CD, revues de code, tests et documentations claires.",
      },
      {
        requirement: "Maîtrise bilingue Français / Anglais dans un environnement onusien",
        status: "demonstrated",
        evidence: "Documentation technique bilingue rédigée sur GitHub et capacité éprouvée de travail en contexte international.",
      }
    ],
    missingKeywords: ["Digital Public Goods Alliance", "UNDP Digital Strategy", "Smart Cities", "Open Data Standards"]
  },
  pending_questions: [
    {
      id: "q-undp-1",
      requirement: "Contribution aux Biens Publics Numériques (DPG)",
      context: "Le PNUD encourage la publication de code selon les standards de la Digital Public Goods Alliance.",
      question: "Parmi vos projets open-source (VeriScope, EasyWork, PowerVision), lesquels seriez-vous prêt à adapter sous licence libre pour les bureaux pays du PNUD ?",
      answer: "VeriScope et PowerVision ont été conçus dès le départ selon des architectures modulaires et libres, parfaitement adaptables pour outiller les observatoires locaux du PNUD et les équipes d'innovation de terrain.",
      answered_at: new Date().toISOString(),
    }
  ],
  cover_letter: {
    content: `<p>20/09/2026<br /><br />Programme des Nations Unies pour le Développement (PNUD / UNDP)<br />Yaoundé / Dakar / Remote International<br /></p><p>Madame, Monsieur,<br /><br />C'est avec un vif intérêt que je vous adresse ma candidature pour le stage en Innovation Numérique, Données & Ingénierie Logicielle au sein du PNUD. Votre engagement en faveur des Objectifs de Développement Durable et votre volonté de mobiliser les Biens Publics Numériques pour lutter contre la désinformation et renforcer l'inclusion technologique résonnent profondément avec mon parcours. En tant qu'ingénieur logiciel et chercheur indépendant basé à Yaoundé, je conçois depuis plusieurs années des solutions numériques d'impact qui placent l'éthique et l'utilité sociale au cœur de leur architecture. Rejoindre le PNUD représenterait pour moi l'opportunité idéale de mettre mes compétences techniques au service d'une mission mondiale, tout en apprenant au contact d'équipes multiculturelles engagées sur le terrain.<br /></p><p>Mon expérience d'ingénieur logiciel et IA chez EasyWork & GhostAI m'a permis de piloter de bout en bout une plateforme cloud complète dédiée à l'insertion professionnelle, en concevant une architecture multi-tenante sécurisée avec Row Level Security et conformité RGPD. J'y ai intégré les SDK d'IA générative de DeepSeek, OpenAI et Claude pour automatiser l'analyse sémantique de CVs et l'audit de conformité ATS, réduisant les rejets de 40% grâce à des recommandations correctives en temps réel. Par ailleurs, mes projets open-source VeriScope et Veracity-Analyzer ont abouti à un moteur automatisé de vérification des faits par NLP, directement aligné sur l'ODD 16 relatif à la transparence et à l'intégrité de l'information. Ces réalisations démontrent ma capacité à transformer des besoins sociétaux complexes en solutions logicielles concrètes, mesurables et déployables à grande échelle.<br /></p><p>Sur le plan technique, je maîtrise l'écosystème exigé par votre offre : Next.js 15, React 19, TypeScript, Python et PostgreSQL, que j'utilise quotidiennement dans mes développements. J'ai conçu une infrastructure résiliente avec un limiteur de débit distribué Leaky-Bucket via Upstash Redis et sécurisé les transactions par cryptographie, garantissant la fiabilité des services en production (99.9% uptime). Mes projets PowerVision et PowerVision-Box illustrent ma maîtrise du développement cross-platform Flutter et des passerelles IoT Kotlin pour la vision par ordinateur et le monitoring énergétique, avec un traitement edge optimisé pour les environnements à ressources limitées (-28% de consommation). Enfin, FingID, ma brique d'authentification biométrique, témoigne de mon expertise en gestion sécurisée des identités numériques, un enjeu central pour l'inclusion technologique prônée par le PNUD.<br /></p><p>Au-delà des compétences techniques, j'ai développé une solide culture de la collaboration en pilotant des projets open-source sur GitHub, où je gère plus de dix-neuf dépôts publics avec intégration continue, revues de code et documentation bilingue. Cette pratique m'a appris à communiquer efficacement avec des contributeurs aux profils variés et à résoudre des problèmes complexes en équipe distribuée. Mon expérience de mentorat auprès de développeurs juniors m'a également sensibilisé à l'importance du transfert de connaissances et de l'écoute active. Je suis convaincu que ces qualités relationnelles, alliées à ma rigueur d'ingénieur, me permettront de m'intégrer rapidement dans vos équipes et de contribuer sereinement à des initiatives transverses.<br /></p><p>Je suis particulièrement attentif aux chantiers du PNUD autour des Biens Publics Numériques et de la stratégie numérique onusienne. Mes projets VeriScope et PowerVision ont été pensés dès l'origine selon des architectures modulaires et libres, immédiatement adaptables pour outiller les observatoires locaux et les équipes d'innovation de terrain. Je serais ravi de contribuer à l'adaptation de ces briques sous licence ouverte, en conformité avec les standards de la Digital Public Goods Alliance, afin de renforcer les capacités des bureaux pays. Mon expérience en traitement de données ouvertes et en éthique de l'IA me permettrait également d'appuyer la conception de solutions de lutte contre la désinformation adaptées aux contextes locaux.<br /></p><p>Je vous remercie sincèrement de l'attention portée à ma candidature et me tiens à votre entière disposition pour un entretien, en français ou en anglais, afin de discuter plus en détail de ma contribution potentielle. Disponible immédiatement pour un stage à Yaoundé, Dakar ou en télétravail international, je serais honoré de mettre mon énergie et mes compétences au service des Objectifs de Développement Durable. Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.<br /></p><p>Sincerely,<br /><br />Landry Mouko<br /></p><p>moukolandry03@gmail.com<br />+237 6 90 00 00 00<br />https://linkedin.com/in/landry-mouko<br />https://github.com/Landrt<br /></p>`
  },
  created_at: new Date(Date.now() - 43200000).toISOString(),
  updated_at: new Date().toISOString()
};

export async function getMockResumes() {
  return { mockProfile, mockBaseResume, mockTailoredResume };
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // Mode exploration local autonome
      return {
        profile: mockProfile,
        baseResumes: [mockBaseResume],
        tailoredResumes: [mockTailoredResume]
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: resumes } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id);

    const baseResumes = resumes?.filter(resume => resume.is_base_resume) ?? [];
    const tailoredResumes = resumes?.filter(resume => !resume.is_base_resume) ?? [];

    return {
      profile: profile || mockProfile,
      baseResumes: baseResumes.length > 0 ? baseResumes : [mockBaseResume],
      tailoredResumes: tailoredResumes.length > 0 ? tailoredResumes : [mockTailoredResume]
    };
  } catch {
    // Fallback direct sur le jeu de données démo
    return {
      profile: mockProfile,
      baseResumes: [mockBaseResume],
      tailoredResumes: [mockTailoredResume]
    };
  }
}
