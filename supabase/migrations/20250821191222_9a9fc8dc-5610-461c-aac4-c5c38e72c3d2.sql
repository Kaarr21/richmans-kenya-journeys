-- Enable Row Level Security on profiles table
-- This enforces the existing RLS policies that restrict access to users' own profiles and admins
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;