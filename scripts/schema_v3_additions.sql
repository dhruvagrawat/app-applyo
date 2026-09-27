-- v3: smart job tracker, AI auto-applier sessions, application profile
-- Run after schema.sql, schema_additions.sql and schema_v2_additions.sql.

-- Application profile (contact details + common application answers used by the auto-applier)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS application_profile JSONB DEFAULT '{}';

-- Smart job tracker: parsed job details
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS job_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS work_mode TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS employment_type TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS seniority TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS red_flags JSONB DEFAULT '[]';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS match_score INT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS next_action_date DATE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- job_applications.applied_date may be NULL for jobs saved but not applied yet ("saved" status)
ALTER TABLE public.job_applications ALTER COLUMN applied_date DROP NOT NULL;

-- Auto-applier: live browser sessions
ALTER TABLE public.auto_tasks ADD COLUMN IF NOT EXISTS steel_session_id TEXT;
ALTER TABLE public.auto_tasks ADD COLUMN IF NOT EXISTS live_view_url TEXT;
ALTER TABLE public.auto_tasks ADD COLUMN IF NOT EXISTS current_url TEXT;
ALTER TABLE public.auto_tasks ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.auto_tasks ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.auto_tasks ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'auto_tasks' AND policyname = 'Users can update their own auto tasks'
  ) THEN
    CREATE POLICY "Users can update their own auto tasks" ON public.auto_tasks
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
