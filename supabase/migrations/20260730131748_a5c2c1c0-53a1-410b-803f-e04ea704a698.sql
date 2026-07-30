CREATE TABLE public.shared_notes (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT 'Untitled note',
  body text NOT NULL,
  revoke_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.shared_notes TO service_role;

ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
-- No policies: all access flows through trusted server functions (service role).