-- Add seat_number to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seat_number TEXT;

-- Create library_settings table for tracking available seats
CREATE TABLE IF NOT EXISTS public.library_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_seats INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to view settings
CREATE POLICY "Admins can view library settings"
  ON public.library_settings
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update settings
CREATE POLICY "Admins can update library settings"
  ON public.library_settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert settings
CREATE POLICY "Admins can insert library settings"
  ON public.library_settings
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings if not exists
INSERT INTO public.library_settings (total_seats)
SELECT 100
WHERE NOT EXISTS (SELECT 1 FROM public.library_settings);