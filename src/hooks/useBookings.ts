import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'>;
type BookingInsert = TablesInsert<'bookings'>;
type BookingUpdate = TablesUpdate<'bookings'>;

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const createBooking = async (bookingData: BookingInsert) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Send booking email notification
      await supabase.functions.invoke('send-booking-email', {
        body: {
          ...bookingData,
          emailType: 'new'
        }
      });

      toast({
        title: "Success",
        description: "Booking created successfully!"
      });

      await fetchBookings();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create booking: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateBooking = async (id: string, updates: BookingUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Send notification email if status changed
      if (updates.status) {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          await supabase.functions.invoke('send-booking-email', {
            body: {
              ...booking,
              ...updates,
              emailType: updates.status === 'confirmed' ? 'confirmed' : 
                        updates.status === 'cancelled' ? 'cancelled' : 'edited'
            }
          });
        }
      }

      toast({
        title: "Success",
        description: "Booking updated successfully!"
      });

      await fetchBookings();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update booking: " + error.message,
        variant: "destructive"
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
        description: "Booking deleted successfully!"
      });

      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete booking: " + error.message,
        variant: "destructive"
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
    refetch: fetchBookings
  };
}