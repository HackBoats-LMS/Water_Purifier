CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPZ DEFAULT NOW()
);


CREATE TABLE public.jobs (
  id UUID DEFAULTgen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) on DELETE CASCADE,
  job_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMPZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ALLOW READ ACCESS TO ALL USERS" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow read access to all users" ON public.jobs FOR SELECT USING(true);