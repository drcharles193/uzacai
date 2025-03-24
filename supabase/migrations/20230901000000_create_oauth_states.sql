
-- Create oauth_states table to store temporary OAuth state tokens
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 minutes') NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS oauth_states_user_platform_idx ON public.oauth_states (user_id, platform);

-- Add expiration cleanup function
CREATE OR REPLACE FUNCTION delete_expired_oauth_states() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.oauth_states WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to clean up expired states
DROP TRIGGER IF EXISTS trigger_delete_expired_oauth_states ON public.oauth_states;
CREATE TRIGGER trigger_delete_expired_oauth_states
  AFTER INSERT ON public.oauth_states
  EXECUTE PROCEDURE delete_expired_oauth_states();

-- Add RLS policies
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OAuth states
CREATE POLICY oauth_states_select_policy ON public.oauth_states 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- Only users themselves can insert their own OAuth states
CREATE POLICY oauth_states_insert_policy ON public.oauth_states 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own OAuth states
CREATE POLICY oauth_states_delete_policy ON public.oauth_states 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);
