-- Fix security issues by updating RLS policies

-- Update bookings table policies to be more secure
-- First, drop existing policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Create new secure policies for bookings table
-- Only allow public to create bookings (for the booking form)
CREATE POLICY "Public can create bookings" 
ON public.bookings 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (get_user_role() = 'admin');

-- Only admins can update bookings
CREATE POLICY "Admins can update all bookings" 
ON public.bookings 
FOR UPDATE 
TO authenticated
USING (get_user_role() = 'admin');

-- Only admins can delete bookings  
CREATE POLICY "Admins can delete bookings" 
ON public.bookings 
FOR DELETE 
TO authenticated
USING (get_user_role() = 'admin');