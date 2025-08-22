
// src/components/Schedule.tsx - Type fixes
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { apiClient, BookingResponse } from "@/lib/api";

const Schedule = () => {
  const [confirmedBookings, setConfirmedBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfirmedBookings();
  }, []);

  const fetchConfirmedBookings = async () => {
    try {
      const response = await apiClient.getBookings();
      // Filter confirmed bookings with confirmed_date
      const confirmed = response.results.filter(
        booking => booking.status === 'confirmed' && booking.confirmed_date
      );
      
      // Sort by confirmed_date
      confirmed.sort((a, b) => {
        if (!a.confirmed_date || !b.confirmed_date) return 0;
        return new Date(a.confirmed_date).getTime() - new Date(b.confirmed_date).getTime();
      });
      
      setConfirmedBookings(confirmed);
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEndDate = (startDate: string, duration: number): Date => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end;
  };

  const isCurrentTrip = (startDate: string, duration: number): boolean => {
    const today = new Date();
    const start = new Date(startDate);
    const end = getEndDate(startDate, duration);
    return today >= start && today <= end;
  };

  const isUpcoming = (startDate: string): boolean => {
    const today = new Date();
    const start = new Date(startDate);
    return start > today;
  };

  // Rest of component remains the same...
  return (
    <Card>
      {/* Component JSX remains the same */}
    </Card>
  );
};

export default Schedule;
