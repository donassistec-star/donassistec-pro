
-- Block all write operations on user_roles via RLS
CREATE POLICY "Block user role inserts" ON public.user_roles
  FOR INSERT TO public WITH CHECK (false);

CREATE POLICY "Block user role updates" ON public.user_roles
  FOR UPDATE TO public USING (false);

CREATE POLICY "Block user role deletes" ON public.user_roles
  FOR DELETE TO public USING (false);

-- Admin function to manage roles securely
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only administrators can modify user roles';
  END IF;
  UPDATE public.user_roles SET role = new_role WHERE user_id = target_user_id;
END;
$$;
