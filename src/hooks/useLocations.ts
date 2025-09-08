import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Location = Tables<'locations'>;
type LocationInsert = TablesInsert<'locations'>;
type LocationUpdate = TablesUpdate<'locations'>;

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLocations(data || []);
    } catch (error: any) {
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

  const uploadLocationImage = async (file: File, title: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('locations')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('locations')
        .getPublicUrl(filePath);

      // Create location record
      const locationData: LocationInsert = {
        title,
        description: description || null,
        image_url: data.publicUrl,
        user_id: user.id
      };

      const { data: location, error: insertError } = await supabase
        .from('locations')
        .insert(locationData)
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Location uploaded successfully!"
      });

      await fetchLocations();
      return { data: location, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload location: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateLocation = async (id: string, updates: LocationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location updated successfully!"
      });

      await fetchLocations();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update location: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      // Get the location to find the image URL
      const location = locations.find(l => l.id === id);
      
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete image from storage if it exists
      if (location?.image_url) {
        const filePath = location.image_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('locations')
          .remove([filePath]);
      }

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
    uploadLocationImage,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations
  };
}