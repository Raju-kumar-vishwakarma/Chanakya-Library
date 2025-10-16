-- Refresh database types by adding a helpful comment
COMMENT ON TABLE public.profiles IS 'User profile information including student details';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';
COMMENT ON TABLE public.attendance IS 'Library attendance check-in and check-out records';
COMMENT ON TABLE public.library_settings IS 'Library configuration and settings';