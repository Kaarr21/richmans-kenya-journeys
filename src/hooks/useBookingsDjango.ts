import { useState, useEffect } from 'react';
import { apiClient, BookingData, BookingResponse, BookingUpdateData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useBookingsDjango() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBookings();
      setBookings(response.results || []);
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

  const createBooking = async (bookingData: BookingData, options?: { silent?: boolean }) => {
    try {
      const response = await apiClient.createBooking(bookingData);
      
      if (!options?.silent) {
        toast({
          title: "Success",
          description: "Booking created successfully!"
        });
      }

      // Refresh bookings list
      await fetchBookings();
      return { data: response, error: null };
    } catch (error: any) {
      if (!options?.silent) {
        toast({
          title: "Error",
          description: "Failed to create booking: " + error.message,
          variant: "destructive"
        });
      }
      return { data: null, error };
    }
  };

  const updateBooking = async (id: string, updates: BookingUpdateData) => {
    try {
      const response = await apiClient.updateBooking(id, updates);
      
      toast({
        title: "Success",
        description: "Booking updated successfully!"
      });

      // Refresh bookings list
      await fetchBookings();
      return { data: response, error: null };
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
      await apiClient.deleteBooking(id);
      
      toast({
        title: "Success",
        description: "Booking deleted successfully!"
      });

      // Refresh bookings list
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

  const sendNotification = async (id: string) => {
    try {
      const response = await apiClient.sendBookingNotification(id);
      
      toast({
        title: "Success",
        description: `Notification sent to ${response.customer_email}`
      });

      return { data: response, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send notification: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const getStatistics = async () => {
    try {
      const response = await apiClient.getBookingStatistics();
      return { data: response, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch statistics: " + error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  return {
    bookings,
    loading,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    sendNotification,
    getStatistics
  };
}
