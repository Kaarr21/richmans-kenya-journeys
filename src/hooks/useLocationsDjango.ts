import { useState, useEffect } from 'react';
import { apiClient, LocationResponse, LocationUpdateData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useLocationsDjango() {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLocations();
      setLocations(response.results || []);
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

  const createLocation = async (formData: FormData) => {
    try {
      const response = await apiClient.createLocation(formData);
      
      toast({
        title: "Success",
        description: "Location created successfully!"
      });

      // Refresh locations list
      await fetchLocations();
      return { data: response, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create location: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateLocation = async (id: string, updates: LocationUpdateData) => {
    try {
      const response = await apiClient.updateLocation(id, updates);
      
      toast({
        title: "Success",
        description: "Location updated successfully!"
      });

      // Refresh locations list
      await fetchLocations();
      return { data: response, error: null };
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
      await apiClient.deleteLocation(id);
      
      toast({
        title: "Success",
        description: "Location deleted successfully!"
      });

      // Refresh locations list
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
    updateLocation,
    deleteLocation
  };
}
