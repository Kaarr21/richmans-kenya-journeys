import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  destination: string;
  group_size: number;
  preferred_date?: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmed_date?: string;
  confirmed_time?: string;
  duration_days?: number;
  amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchBookings = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{ ...bookingData, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking created successfully!",
      });

      await fetchBookings();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking updated successfully!",
      });

      await fetchBookings();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update booking.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking deleted successfully!",
      });

      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    bookings,
    loading,
    createBooking,
    updateBooking,
    deleteBooking,
    refetch: fetchBookings,
  };
}
