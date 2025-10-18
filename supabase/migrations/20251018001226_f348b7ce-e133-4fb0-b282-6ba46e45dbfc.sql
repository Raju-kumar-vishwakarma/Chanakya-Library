-- Function: get_library_status to expose aggregated occupancy without exposing rows
CREATE OR REPLACE FUNCTION public.get_library_status()
RETURNS TABLE(current_occupied integer, total_seats integer, available integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH occ AS (
    SELECT count(*)::int AS c
    FROM public.attendance
    WHERE check_in IS NOT NULL AND check_out IS NULL
  ), seats AS (
    SELECT COALESCE((SELECT total_seats FROM public.library_settings ORDER BY updated_at DESC LIMIT 1), 0)::int AS t
  )
  SELECT occ.c AS current_occupied,
         seats.t AS total_seats,
         GREATEST(seats.t - occ.c, 0) AS available
  FROM occ CROSS JOIN seats;
$$;

-- Optional: grant execute to authenticated (not needed with SECURITY DEFINER, but explicit usage policy can be added via RLS not applicable to functions)