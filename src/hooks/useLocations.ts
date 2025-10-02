import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Location {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const createLocation = async (formData: FormData) => {
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const imageFile = formData.get('image') as File;

      if (!title || !imageFile) {
        throw new Error('Title and image are required');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('locations')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('locations')
        .getPublicUrl(filePath);

      // Create location record
      const { data, error } = await supabase
        .from('locations')
        .insert({
          title,
          description,
          image_url: publicUrl,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location created successfully!"
      });

      await fetchLocations();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create location: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location deleted successfully!"
      });

      await fetchLocations();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete location: " + error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  return {
    locations,
    loading,
    fetchLocations,
    createLocation,
    deleteLocation
  };
}
