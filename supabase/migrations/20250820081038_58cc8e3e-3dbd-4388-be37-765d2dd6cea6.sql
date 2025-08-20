-- Create locations table for photo uploads
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view locations" 
ON public.locations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage locations" 
ON public.locations 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create storage bucket for location images
INSERT INTO storage.buckets (id, name, public) VALUES ('locations', 'locations', true);

-- Create storage policies
CREATE POLICY "Anyone can view location images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'locations');

CREATE POLICY "Admins can upload location images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'locations' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update location images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'locations' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete location images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'locations' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add trigger for locations timestamps
CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add schedule tracking to bookings table
ALTER TABLE public.bookings 
ADD COLUMN confirmed_date DATE,
ADD COLUMN confirmed_time TIME,
ADD COLUMN duration_days INTEGER DEFAULT 1,
ADD COLUMN notes TEXT;