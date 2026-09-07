'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume } from "@/lib/types";

interface DashboardData {
  profile: Profile | null;
  baseResumes: Resume[];
  tailoredResumes: Resume[];
}

const mockProfile: Profile = {
  id: "demo-profile-1",
  user_id: "demo-user-1",
  first_name: "Alexandre",
  last_name: "Martin",
  email: "alexandre.martin@example.com",
  phone_number: "+33 6 12 34 56 78",
  location: "Paris, France",
  website: "https://alexandre-martin.dev",
  linkedin_url: "https://linkedin.com/in/alexandremartin",
  github_url: "https://github.com/alexandremartin",
  work_experience: [
    {
      company: "TechScale SAS",
      position: "Lead Développeur Full-Stack",
      location: "Paris, France",
      date: "Jan 2022 - Présent",
      description: [
        "Architecture et développement d'une plateforme SaaS B2B en Next.js 15, React 19 et Supabase desservant 50k utilisateurs actifs.",
        "Optimisation des temps de réponse d'API de 40% grâce à l'implémentation de caches Redis Upstash.",
        "Mise en place de tests d'intégration et CI/CD automatisés réduisant le taux de régression de 35%."
      ],
      technologies: ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"]
    },
    {
      company: "InnovApps Studio",
      position: "Développeur Full-Stack",
      location: "Lyon, France",
      date: "Sept 2019 - Déc 2021",
      description: [
        "Développement d'interfaces utilisateur modernes et responsives avec React et Node.js.",
        "Intégration de tunnels de paiement sécurisés avec Flutterwave et gestion des webhooks d'abonnement.",
        "Collaboration au sein d'une équipe agile de 8 développeurs avec revues de code rigoureuses."
      ],
      technologies: ["JavaScript", "React", "Node.js", "Docker", "Flutterwave"]
    }
  ],
  education: [
    {
      school: "École Polytechnique / Télécom",
      degree: "Master en Ingénierie Logicielle",
      field: "Systèmes Distribués & Cloud",
      date: "2017 - 2019",
      location: "Paris, France",
      achievements: ["Major de promotion", "Spécialisation Architectures Cloud & IA"]
    }
  ],
  skills: [
    {
      category: "Frontend & UI",
      items: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS", "Tiptap", "Framer Motion"]
    },
    {
      category: "Backend & Cloud",
      items: ["Node.js", "Python", "PostgreSQL", "Supabase", "Upstash Redis", "Docker", "Flutterwave"]
    }
  ],
  projects: [
    {
      name: "SaaS Resume Copilot",
      description: [
        "Constructeur de CV intelligent avec génération assistée par IA et audit ATS en temps réel.",
        "Plus de 1 000 utilisateurs actifs et 99.9% de disponibilité."
      ],
      date: "2024",
      technologies: ["Next.js", "Supabase", "Vercel AI SDK", "Flutterwave"],
      url: "https://resume-copilot.demo",
      github_url: "https://github.com/demo/resume-copilot"
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockBaseResume: Resume = {
  id: "demo-base-resume-1",
  user_id: "demo-user-1",
  name: "CV Principal Développeur Full-Stack",
  target_role: "Lead Full-Stack Engineer",
  is_base_resume: true,
  first_name: "Alexandre",
  last_name: "Martin",
  email: "alexandre.martin@example.com",
  phone_number: "+33 6 12 34 56 78",
  location: "Paris, France",
  website: "https://alexandre-martin.dev",
  linkedin_url: "https://linkedin.com/in/alexandremartin",
  github_url: "https://github.com/alexandremartin",
  work_experience: mockProfile.work_experience,
  education: mockProfile.education,
  skills: mockProfile.skills,
  projects: mockProfile.projects,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  has_cover_letter: true,
  document_settings: {
    document_font_size: 10,
    document_line_height: 1.4,
    document_margin_vertical: 30,
    document_margin_horizontal: 30,
    header_name_size: 22,
    header_name_bottom_spacing: 10,
    skills_margin_top: 10,
    skills_margin_bottom: 10,
    skills_margin_horizontal: 0,
    skills_item_spacing: 4,
    experience_margin_top: 10,
    experience_margin_bottom: 10,
    experience_margin_horizontal: 0,
    experience_item_spacing: 8,
    projects_margin_top: 10,
    projects_margin_bottom: 10,
    projects_margin_horizontal: 0,
    projects_item_spacing: 8,
    education_margin_top: 10,
    education_margin_bottom: 10,
    education_margin_horizontal: 0,
    education_item_spacing: 6
  }
};

const mockTailoredResume: Resume = {
  ...mockBaseResume,
  id: "demo-tailored-resume-1",
  job_id: "demo-job-1",
  name: "Candidature Lead Tech @ ScaleUp IA",
  target_role: "Senior Staff Engineer",
  is_base_resume: false,
  application_status: "interviewing",
  match_analysis: {
    jobId: "demo-job-1",
    items: [
      {
        requirement: "Architecture Next.js 15 & React 19 pour applications SaaS",
        status: "demonstrated",
        evidence: "Expérience chez TechScale SAS : architecture et développement d'une plateforme SaaS B2B en Next.js 15 et React 19 pour 50k utilisateurs.",
      },
      {
        requirement: "Optimisation de performance d'API & Caching distribué (Redis)",
        status: "demonstrated",
        evidence: "Gain de 40% sur les temps de réponse d'API via Upstash Redis chez TechScale SAS.",
      },
      {
        requirement: "Déploiement et orchestration de conteneurs (Kubernetes)",
        status: "weakly_demonstrated",
        evidence: "Docker est mentionné chez InnovApps Studio, mais aucune mention explicite de clusters Kubernetes en production.",
        suggestion: "Préciser si vous avez manipulé des manifests K8s, Helm charts ou des déploiements cloud managés (EKS/GKE).",
      },
      {
        requirement: "Intégration d'architectures d'IA Générative et LLMOps",
        status: "to_confirm",
        evidence: "Projet 'SaaS Resume Copilot' avec Vercel AI SDK mentionné, mais sans détails sur les modèles utilisés ou l'orchestration de prompts.",
        suggestion: "Confirmer les modèles manipulés (OpenAI, Anthropic, DeepSeek) et les stratégies d'optimisation.",
      },
      {
        requirement: "Certification Cloud AWS ou GCP Solutions Architect",
        status: "absent",
        suggestion: "Aucune certification cloud formelle trouvée. Si vous en possédez une, ajoutez-la à votre profil.",
      }
    ],
    missingKeywords: ["Kubernetes", "LLMOps", "AWS Certified", "Grafana", "Terraform"]
  },
  pending_questions: [
    {
      id: "q-demo-1",
      requirement: "Kubernetes & Orchestration Cloud",
      context: "L'offre ScaleUp IA exige la gestion de conteneurs à grande échelle. Votre CV mentionne Docker mais pas Kubernetes.",
      question: "Avez-vous déjà déployé ou géré des services sur Kubernetes (ou clusters managés EKS/GKE) lors de vos précédentes missions ?",
      answer: "Oui, j'ai configuré des pods et des ingress sur un cluster EKS chez TechScale SAS pour les microservices de streaming.",
      answered_at: new Date().toISOString(),
    },
    {
      id: "q-demo-2",
      requirement: "Intégration LLMOps & Monitoring d'IA",
      context: "Le poste demande une expérience d'inférence en production avec évaluation des coûts et de la latence.",
      question: "Sur votre projet Resume Copilot, quel système de cache de prompts ou de métriques de tokens avez-vous déployé ?",
    }
  ],
  created_at: new Date(Date.now() - 86400000).toISOString(),
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
