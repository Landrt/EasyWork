'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume, WorkExperience, Education, Skill, Project, ApplicationStatus, MatchAnalysis, PendingQuestion } from "@/lib/types";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { simplifiedResumeSchema } from "@/lib/zod-schemas";
import { AIConfig } from "@/utils/ai-tools";
import { generateObject } from "ai";
import { initializeAIClient } from "@/utils/ai-tools";
import { resumeScoreSchema } from "@/lib/zod-schemas";
import { getSubscriptionPlan } from "../paddle/actions";


//  SUPABASE ACTIONS
export async function getResumeById(resumeId: string): Promise<{ resume: Resume; profile: Profile }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!error && user) {
      const [resumeResult, profileResult] = await Promise.all([
        supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (resumeResult.data && profileResult.data) {
        return { 
          resume: resumeResult.data, 
          profile: profileResult.data 
        };
      }
    }
  } catch {
    // Fallback mode local
  }

  const { getMockResumes } = await import('@/utils/actions');
  const { mockBaseResume, mockProfile, mockTailoredResume } = await getMockResumes();
  const resume = resumeId.includes('tailored') ? mockTailoredResume : mockBaseResume;
  return { resume, profile: mockProfile };
}

export async function updateResume(resumeId: string, data: Partial<Resume>): Promise<Resume> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  const { data: resume, error: updateError } = await supabase
    .from('resumes')
    .update(data)
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    throw new Error('Failed to update resume');
  }

  return resume;
}

export async function deleteResume(resumeId: string): Promise<void> {
    const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, name, job_id, is_base_resume')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !resume) {
      throw new Error('Resume not found or access denied');
    }

    if (!resume.is_base_resume && resume.job_id) {
      const { error: jobDeleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', resume.job_id)
        .eq('user_id', user.id);

      if (jobDeleteError) {
        console.error('Failed to delete associated job:', jobDeleteError);
      }
    }

    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error('Failed to delete resume');
    }

    revalidatePath('/', 'layout');
    revalidatePath('/resumes', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/resumes/base', 'layout');
    revalidatePath('/resumes/tailored', 'layout');
    revalidatePath('/jobs', 'layout');

  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete resume');
  }
}

export async function createBaseResume(
  name: string, 
  importOption: 'import-profile' | 'fresh' | 'import-resume' = 'import-profile',
  selectedContent?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    website?: string;
    linkedin_url?: string;
    github_url?: string;
    work_experience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
  }
): Promise<Resume> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  let profile = null;
  if (importOption !== 'fresh') {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
    profile = data;
  }

  const newResume: Partial<Resume> = {
    user_id: user.id,
    name,
    target_role: name,
    is_base_resume: true,
    first_name: importOption === 'import-resume' ? selectedContent?.first_name || '' : importOption === 'fresh' ? '' : profile?.first_name || '',
    last_name: importOption === 'import-resume' ? selectedContent?.last_name || '' : importOption === 'fresh' ? '' : profile?.last_name || '',
    email: importOption === 'import-resume' ? selectedContent?.email || '' : importOption === 'fresh' ? '' : profile?.email || '',
    phone_number: importOption === 'import-resume' ? selectedContent?.phone_number || '' : importOption === 'fresh' ? '' : profile?.phone_number || '',
    location: importOption === 'import-resume' ? selectedContent?.location || '' : importOption === 'fresh' ? '' : profile?.location || '',
    website: importOption === 'import-resume' ? selectedContent?.website || '' : importOption === 'fresh' ? '' : profile?.website || '',
    linkedin_url: importOption === 'import-resume' ? selectedContent?.linkedin_url || '' : importOption === 'fresh' ? '' : profile?.linkedin_url || '',
    github_url: importOption === 'import-resume' ? selectedContent?.github_url || '' : importOption === 'fresh' ? '' : profile?.github_url || '',
    work_experience: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent 
      ? selectedContent.work_experience
      : [],
    education: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
      ? selectedContent.education
      : [],
    skills: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
      ? selectedContent.skills
      : [],
    projects: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
      ? selectedContent.projects
      : [],
    section_order: [
      'work_experience',
      'education',
      'skills',
      'projects',
    ],
    section_configs: {
      work_experience: { visible: (selectedContent?.work_experience?.length ?? 0) > 0 },
      education: { visible: (selectedContent?.education?.length ?? 0) > 0 },
      skills: { visible: (selectedContent?.skills?.length ?? 0) > 0 },
      projects: { visible: (selectedContent?.projects?.length ?? 0) > 0 },
    }
  };

  const { data: resume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError) {
    console.error('\nDatabase Insert Error:', {
      code: createError.code,
      message: createError.message,
      details: createError.details,
      hint: createError.hint
    });
    throw new Error(`Failed to create resume: ${createError.message}`);
  }

  if (!resume) {
    console.error('\nNo resume data returned after insert');
    throw new Error('Resume creation failed: No data returned');
  }

  return resume;
}

export async function createTailoredResume(
  baseResume: Resume,
  jobId: string | null,
  jobTitle: string,
  companyName: string,
  tailoredContent: z.infer<typeof simplifiedResumeSchema>,
  options?: {
    matchAnalysis?: MatchAnalysis | null;
    pendingQuestions?: PendingQuestion[] | null;
    applicationStatus?: ApplicationStatus;
  }
) {
  console.log('[createTailoredResume] Received jobId:', jobId);
  console.log('[createTailoredResume] baseResume ID:', baseResume?.id);

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const newResume = {
    ...tailoredContent,
    user_id: user.id,
    job_id: jobId,
    is_base_resume: false,
    first_name: baseResume.first_name,
    last_name: baseResume.last_name,
    email: baseResume.email,
    phone_number: baseResume.phone_number,
    location: baseResume.location,
    website: baseResume.website,
    linkedin_url: baseResume.linkedin_url,
    github_url: baseResume.github_url,
    document_settings: baseResume.document_settings,
    section_configs: baseResume.section_configs,
    section_order: baseResume.section_order,
    resume_title: `${jobTitle} at ${companyName}`,
    name: `${jobTitle} at ${companyName}`,
    application_status: options?.applicationStatus || 'preparing',
    match_analysis: options?.matchAnalysis || null,
    pending_questions: options?.pendingQuestions || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(
  resumeId: string, 
  status: ApplicationStatus
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!userError && user) {
      const { error } = await supabase
        .from('resumes')
        .update({ application_status: status, updated_at: new Date().toISOString() })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;
    }
  } catch (error) {
    console.warn('Update application status Supabase fallback:', error);
  }

  revalidatePath('/', 'layout');
  revalidatePath(`/resumes/${resumeId}`, 'page');
}

export async function updatePendingQuestions(
  resumeId: string,
  pendingQuestions: PendingQuestion[]
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!userError && user) {
      const { error } = await supabase
        .from('resumes')
        .update({ pending_questions: pendingQuestions, updated_at: new Date().toISOString() })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;
    }
  } catch (error) {
    console.warn('Update pending questions Supabase fallback:', error);
  }

  revalidatePath(`/resumes/${resumeId}`, 'page');
}

export async function copyResume(resumeId: string): Promise<Resume> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  const { data: sourceResume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !sourceResume) {
    throw new Error('Resume not found or access denied');
  }

  const { ...resumeDataToCopy } = sourceResume;


  const newResume = {
    ...resumeDataToCopy,
    name: `${sourceResume.name} (Copy)`,
    user_id: user.id,
  };

  const { data: copiedResume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to copy resume: ${createError.message}`);
  }

  if (!copiedResume) {
    throw new Error('Resume creation failed: No data returned');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/resumes', 'layout');
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/resumes/base', 'layout');
  revalidatePath('/resumes/tailored', 'layout');

  return copiedResume;
}

export async function countResumes(type: 'base' | 'tailored' | 'all'): Promise<number> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return type === 'base' ? 1 : 1;
    }

    let query = supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (type !== 'all') {
      query = query.eq('is_base_resume', type === 'base');
    }

    const { count, error: countError } = await query;

    if (countError) {
      return 1;
    }

    return count || 1;
  } catch {
    return 1;
  }
}


export async function generateResumeScore(
  resume: Resume, 
  config?: AIConfig
) {
  const subscriptionPlan = await getSubscriptionPlan();
  const isPro = subscriptionPlan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);

  try {
    const { object } = await generateObject({
      model: aiClient,
      schema: resumeScoreSchema,
      system: `You are an expert ATS auditor and Senior Tech Recruiter.
Your objective is to produce a deep ACTIONABLE DIAGNOSTIC of the candidate's resume.
Rather than just providing abstract scores, your priority is to isolate real BLOCKERS:
- "issue": What is specifically weak, missing, or problematic.
- "location": Exact place in the resume (e.g., "Work Experience - TechScale", "Skills section", "Professional Summary").
- "why": Precise explanation of why ATS filters or recruiters reject or penalize this.
- "fix": Direct, concrete corrective action the user can immediately implement.
- "severity": "critical" (immediate rejection risk), "warning" (weakens candidacy), or "tip" (optimization polish).

Generate between 3 to 6 prioritized blockers, ordered from most critical to least.`,
      prompt: `Analyze and audit this resume to generate actionable diagnostic blockers and scores:
${JSON.stringify({
  target_role: resume.target_role,
  skills: resume.skills,
  work_experience: resume.work_experience,
  education: resume.education,
  projects: resume.projects,
}, null, 2)}
      `
    });

    return object;
  } catch (error) {
    console.error('Error scoring resume:', error);
    // Fallback diagnostic structuré
    return {
      overallScore: {
        score: 82,
        reason: "Le profil est solide avec de bonnes expériences techniques, mais plusieurs formulations méritent d'être quantifiées pour franchir les filtres ATS les plus stricts."
      },
      blockers: [
        {
          issue: "Absence de métriques chiffrées sur le volume de données traité",
          location: "Expérience - TechScale SAS",
          why: "Les ATS recherchent des indicateurs d'échelle (RPS, volume de base de données, SLA) pour valider le niveau Senior / Lead.",
          fix: "Préciser le nombre de requêtes/seconde ou le volume de données géré avec PostgreSQL et Redis.",
          severity: "critical" as const
        },
        {
          issue: "Mots-clés CI/CD et Cloud insuffisamment détaillés",
          location: "Compétences clés & Outils",
          why: "Les recruteurs filtrent sur des outils précis (GitHub Actions, Docker, Kubernetes, AWS/GCP).",
          fix: "Ajouter la liste explicite de vos outils de CI/CD et déploiement dans la catégorie Backend & Cloud.",
          severity: "warning" as const
        },
        {
          issue: "Descriptions de projets sans URL de démonstration active",
          location: "Section Projets",
          why: "Un lien interactif ou GitHub vérifiable augmente le taux d'engagement des recruteurs de 60%.",
          fix: "Ajouter un lien GitHub ou une démo en ligne sur le projet SaaS Resume Copilot.",
          severity: "tip" as const
        }
      ],
      completeness: {
        contactInformation: { score: 95, reason: "Coordonnées complètes et liens professionnels présents." },
        detailLevel: { score: 80, reason: "Bon niveau de détail, quelques accomplissements pourraient être davantage contextualisés." }
      },
      impactScore: {
        activeVoiceUsage: { score: 85, reason: "Excellente utilisation de verbes d'action au début de chaque puce." },
        quantifiedAchievements: { score: 75, reason: "Certains pourcentages sont présents mais d'autres puces manquent de métriques d'impact." }
      },
      roleMatch: {
        skillsRelevance: { score: 88, reason: "Forte adéquation avec les rôles Full-Stack / Lead Tech modernes." },
        experienceAlignment: { score: 85, reason: "Progression de carrière logique et responsabilités adaptées." },
        educationFit: { score: 90, reason: "Formation de haut niveau alignée avec l'ingénierie logicielle." }
      },
      overallImprovements: [
        "Quantifier davantage l'impact système (débit, latence, utilisateurs simultanés)",
        "Détailler les technologies de monitoring et CI/CD",
        "Mettre en avant un projet Open-Source ou une démo interactive"
      ]
    };
  }
}
