-- v5: Resume Builder + missing RLS policies
-- Run after schema_v4_additions.sql. Safe to re-run.

-- Keep updated_at fresh so "latest resume" means "most recently edited".
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resumes_touch_updated_at ON public.resumes;
CREATE TRIGGER resumes_touch_updated_at BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS resumes_user_updated ON public.resumes (user_id, updated_at DESC);

-- resumes: allow editing and deleting your own resumes (previously insert/select only)
DROP POLICY IF EXISTS "Users can update their resumes" ON public.resumes;
CREATE POLICY "Users can update their resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their resumes" ON public.resumes;
CREATE POLICY "Users can delete their resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- profiles: users could update but never create their row, so a first profile save failed.
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create the profile automatically on sign-up.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users.
INSERT INTO public.profiles (id) SELECT id FROM auth.users ON CONFLICT (id) DO NOTHING;

-- activity_log: let users log their own events from the browser
DROP POLICY IF EXISTS "Users can log their own activity" ON public.activity_log;
CREATE POLICY "Users can log their own activity" ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- generated_items / cover_letters: allow cleaning up your own history
DROP POLICY IF EXISTS "Users can delete their items" ON public.generated_items;
CREATE POLICY "Users can delete their items" ON public.generated_items
  FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their cover letters" ON public.cover_letters;
CREATE POLICY "Users can update their cover letters" ON public.cover_letters
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their cover letters" ON public.cover_letters;
CREATE POLICY "Users can delete their cover letters" ON public.cover_letters
  FOR DELETE USING (auth.uid() = user_id);

-- auto_tasks: allow deleting your own sessions
DROP POLICY IF EXISTS "Users can delete their own auto tasks" ON public.auto_tasks;
CREATE POLICY "Users can delete their own auto tasks" ON public.auto_tasks
  FOR DELETE USING (auth.uid() = user_id);
