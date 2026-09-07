'use server';

import { generateObject, LanguageModelV1 } from 'ai';
import { z } from 'zod';
import { 
  simplifiedJobSchema, 
  simplifiedResumeSchema,
  matchAnalysisSchema,
  pendingQuestionSchema,
} from "@/lib/zod-schemas";
import { Job, Resume, MatchAnalysis, PendingQuestion } from "@/lib/types";
import { AIConfig } from '@/utils/ai-tools';
import { initializeAIClient } from '@/utils/ai-tools';
import { getSubscriptionPlan } from '../flutterwave/actions';
import { checkRateLimit } from '@/lib/rateLimiter';

/**
 * Point 5: Moteur de correspondance Offre <-> Profil
 * Analyse l'adéquation entre un CV (ou profil) et une offre d'emploi.
 * Classe chaque exigence en: demonstrated, weakly_demonstrated, to_confirm, absent.
 */
export async function analyzeJobMatch(
  resume: Resume,
  jobListing: z.infer<typeof simplifiedJobSchema>,
  jobId: string,
  config?: AIConfig
): Promise<MatchAnalysis> {
  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro, true) : initializeAIClient(config);
  await checkRateLimit(id);

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      schema: matchAnalysisSchema,
      system: `You are an elite ATS and Technical Recruiter Auditor.
Your task is to conduct an objective, strict, evidence-based matching analysis between a Candidate Resume and a Job Offer.

MATCHING CRITERIA:
For every key requirement, skill, competency, or qualification found in the Job Description, extract it as an item and evaluate its status:
1. "demonstrated": The resume provides clear, concrete proof (mentioning tools, projects, or achievements) that this requirement is met.
   - Must provide "evidence" citing or referencing the exact resume section/bullet point.
2. "weakly_demonstrated": The candidate mentions the skill/topic, but lacks depth, context, or clear measurable impact.
   - Must provide "evidence" of what was found, AND "suggestion" explaining precisely how to strengthen it.
3. "to_confirm": The requirement appears related to the candidate's domain/experience, but is not explicitly declared or has missing details that need user clarification.
   - Must provide "evidence" explaining why clarification is needed.
4. "absent": The requirement is completely absent from the resume. No evidence or false claims allowed.

CRITICAL DIRECTIVE ON MISSING KEYWORDS:
- Extract all critical technical keywords, methodologies, certifications, or tool names from the job description that do NOT appear anywhere in the resume into "missingKeywords".
- Ensure "jobId" is set to "${jobId}".`,
      prompt: `CANDIDATE RESUME:
${JSON.stringify({
  target_role: resume.target_role,
  skills: resume.skills,
  work_experience: resume.work_experience,
  education: resume.education,
  projects: resume.projects,
}, null, 2)}

JOB OFFER:
${JSON.stringify(jobListing, null, 2)}

Perform the thorough matching analysis. Be honest and factual. Do not assume or invent unstated qualifications.`
    });

    return {
      ...object,
      jobId: jobId || object.jobId,
    };
  } catch (error) {
    console.error('Error analyzing job match:', error);
    // Fallback gracieux en cas d'indisponibilité de l'IA
    return {
      jobId,
      items: (jobListing.keywords || []).map((keyword) => ({
        requirement: keyword,
        status: 'to_confirm' as const,
        evidence: `Exigence extraite des mots-clés de l'offre : ${keyword}`,
        suggestion: `Précisez votre niveau d'expérience sur ${keyword}`,
      })),
      missingKeywords: jobListing.keywords || [],
    };
  }
}

/**
 * Point 4: IA Interactive - Génération de questions ciblées
 * Si des informations manquent ou restent ambiguës (items to_confirm ou weakly_demonstrated),
 * pose des questions ciblées à l'utilisateur avant de finaliser le CV.
 */
export async function generateClarificationQuestions(
  matchAnalysis: MatchAnalysis,
  resume: Resume,
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig
): Promise<PendingQuestion[]> {
  // Sélectionner les éléments nécessitant clarification
  const uncertainItems = matchAnalysis.items.filter(
    item => item.status === 'to_confirm' || item.status === 'weakly_demonstrated'
  ).slice(0, 3); // Max 3 questions ciblées pour ne pas surcharger l'utilisateur

  if (uncertainItems.length === 0) {
    return [];
  }

  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro, true) : initializeAIClient(config);
  await checkRateLimit(id);

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      schema: z.object({
        questions: z.array(pendingQuestionSchema)
      }),
      system: `You are EasyWork Interactive Copilot.
Your mission is to formulate concise, high-value questions for a job candidate to clarify missing or weakly demonstrated points before generating their tailored resume.
- Only ask questions about real, plausible experience relevant to the job requirements.
- Never ask rhetorical or vague questions.
- Formulate each question politely in French or English matching the job listing language.
- Provide a clear "context" explaining why this question matters for ATS matching.`,
      prompt: `TARGET JOB: ${jobListing.position_title} at ${jobListing.company_name}
UNCERTAIN / WEAK REQUIREMENTS:
${JSON.stringify(uncertainItems, null, 2)}

Generate up to 3 high-impact targeted clarification questions.`
    });

    return object.questions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
    }));
  } catch (error) {
    console.error('Error generating clarification questions:', error);
    // Fallback statique basé sur les items
    return uncertainItems.map((item, idx) => ({
      id: `q-fallback-${idx}`,
      requirement: item.requirement,
      context: `L'offre valorise ${item.requirement}.`,
      question: `Avez-vous une expérience pratique ou des réalisations avec ${item.requirement} à valoriser ?`,
    }));
  }
}

/**
 * Points 3 & 4: Adaptation du CV à l'offre avec fiabilité stricte et intégration des réponses
 */
export async function tailorResumeToJob(
  resume: Resume, 
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig,
  userAnswers?: Record<string, string>
) {
  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro, true) : initializeAIClient(config);
  await checkRateLimit(id);

  const answersContext = userAnswers && Object.keys(userAnswers).length > 0
    ? `\n\nADDITIONAL CONFIRMED USER CLARIFICATIONS (Incorporated with full truthfulness):\n${Object.entries(userAnswers)
        .map(([k, v]) => `- Exigence/Question "${k}": Réponse de l'utilisateur: "${v}"`)
        .join('\n')}`
    : '';

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1, 
      schema: z.object({
        content: simplifiedResumeSchema,
      }),
      system: `You are EasyWork, an advanced AI resume transformer that specializes in optimizing technical resumes for software engineering roles using machine-learning-driven ATS strategies.

STRICT SOURCE-TRUTHFULNESS & RELIABILITY DIRECTIVE (CRITICAL):
1. **Zero Hallucination:** NEVER invent new jobs, employers, dates, academic degrees, or technologies that do not exist in the candidate's source resume or verified user answers.
2. **Metrics Fidelity:** NEVER invent artificial numerical metrics (e.g. fake "reduced latency by 82%" or "boosted sales by $2M"). Only highlight or rephrase metrics provided in the source. If an achievement has no metric, describe the concrete technical outcome truthfully.
3. **Uncertainty Marking:** If a detail is assumed or needs candidate confirmation, mark it with "[À CONFIRMER]" in the text.
4. **Keyword & Focus Alignment:** Reorder bullet points and sections to prioritize the most relevant experiences matching the job offer. Rephrase existing bullet points using active technical vocabulary from the job description while preserving the truth of what was done.
5. **Incorporate User Answers:** If the candidate provided verified answers to clarification questions, weave those truthful facts into the relevant experience or skills.`,
      prompt: `SOURCE RESUME:
${JSON.stringify({
  target_role: resume.target_role,
  skills: resume.skills,
  work_experience: resume.work_experience,
  education: resume.education,
  projects: resume.projects,
}, null, 2)}

TARGET JOB LISTING:
${JSON.stringify(jobListing, null, 2)}
${answersContext}

Transform the resume adhering strictly to the zero-hallucination directive.`,
    });

    return object.content satisfies z.infer<typeof simplifiedResumeSchema>;
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
}

export async function formatJobListing(jobListing: string, config?: AIConfig) {
  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro, true) : initializeAIClient(config);
  await checkRateLimit(id);

  try {
    const { object } = await generateObject({
      model: aiClient as LanguageModelV1,
      schema: z.object({
        content: simplifiedJobSchema
      }),
      system: `You are an AI assistant specializing in structured data extraction from job listings. You have been provided with a schema and must adhere to it strictly.
IMPORTANT: For any missing or uncertain information, you must return an empty string ("") - never return "<UNKNOWN>" or similar placeholders.
Do not guess or fabricate information that is not present in the listing.`,
      prompt: `Analyze this job listing carefully and extract structured information:\n\n${jobListing}`,
    });

    return object.content satisfies Partial<Job>;
  } catch (error) {
    console.error('Error formatting job listing:', error);
    throw error;
  }
}