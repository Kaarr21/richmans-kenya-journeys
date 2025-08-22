-- Create a security definer function to check user roles without RLS conflicts
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete bookings" 
  ON public.bookings 
  FOR DELETE 
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage locations" 
  ON public.locations 
  FOR ALL 
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_user_role() = 'admin');

-- Ensure there's an admin user (replace with your actual email)
-- You'll need to update this with the correct email after migration
INSERT INTO public.profiles (user_id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- placeholder, update with real user_id
  'admin@example.com', -- replace with actual admin email
  'Admin User',
  'admin'
) ON CONFLICT (user_id) DO UPDATE SET role = 'admin';