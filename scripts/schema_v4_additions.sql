-- v4: Interview Studio history
-- Run after schema_v3_additions.sql.

CREATE TABLE IF NOT EXISTS public.interview_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  mode TEXT DEFAULT 'text',          -- 'text' | 'video'
  role TEXT,
  category TEXT,
  score NUMERIC,
  feedback JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_title TEXT,
  score INT NOT NULL,
  total INT NOT NULL,
  duration_sec INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interview_attempts_user_created ON public.interview_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_results_user_created ON public.quiz_results (user_id, created_at DESC);

ALTER TABLE public.interview_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their interview attempts" ON public.interview_attempts;
CREATE POLICY "Users manage their interview attempts" ON public.interview_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their quiz results" ON public.quiz_results;
CREATE POLICY "Users manage their quiz results" ON public.quiz_results
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
