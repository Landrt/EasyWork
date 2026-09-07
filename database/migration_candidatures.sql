-- Migration: Add Candidature fields, Match Analysis, and Pending Questions to resumes table

ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS application_status text NULL DEFAULT 'preparing',
  ADD COLUMN IF NOT EXISTS match_analysis jsonb NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pending_questions jsonb NULL DEFAULT '[]'::jsonb;

-- Add check constraint for application_status
ALTER TABLE public.resumes
  DROP CONSTRAINT IF EXISTS resumes_application_status_check;

ALTER TABLE public.resumes
  ADD CONSTRAINT resumes_application_status_check CHECK (
    application_status = ANY (ARRAY['preparing'::text, 'applied'::text, 'interviewing'::text, 'rejected'::text, 'offer'::text])
  );
