import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

const Schedule = () => {
  const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfirmedBookings();
  }, []);

  const fetchConfirmedBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'confirmed')
        .not('confirmed_date', 'is', null)
        .order('confirmed_date', { ascending: true });
      
      if (error) throw error;
      setConfirmedBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching confirmed bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEndDate = (startDate: string, duration: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end;
  };

  const isCurrentTrip = (startDate: string, duration: number) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = getEndDate(startDate, duration);
    return today >= start && today <= end;
  };

  const isUpcoming = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    return start > today;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Schedule</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {confirmedBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No confirmed bookings scheduled yet.
            </p>
          ) : (
            confirmedBookings.map((booking) => {
              const startDate = new Date(booking.confirmed_date);
              const endDate = getEndDate(booking.confirmed_date, booking.duration_days);
              const isCurrent = isCurrentTrip(booking.confirmed_date, booking.duration_days);
              const upcoming = isUpcoming(booking.confirmed_date);
              
              return (
                <div key={booking.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      {booking.customer_name}
                    </h4>
                    <Badge variant={isCurrent ? "default" : upcoming ? "secondary" : "outline"}>
                      {isCurrent ? "Current Trip" : upcoming ? "Upcoming" : "Completed"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{booking.group_size} people</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                      </span>
                    </div>
                    {booking.confirmed_time && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{booking.confirmed_time}</span>
                      </div>
                    )}
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Schedule;