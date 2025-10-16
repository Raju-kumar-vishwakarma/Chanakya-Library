-- Fix RLS policy for user_roles to allow self-registration as student
-- Drop the existing "Admins can manage roles" policy and recreate with more specific policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Allow users to insert their own role ONLY as 'student'
CREATE POLICY "Users can insert their own student role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND role = 'student'
  );

-- Admins can insert any role
CREATE POLICY "Admins can insert any role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));