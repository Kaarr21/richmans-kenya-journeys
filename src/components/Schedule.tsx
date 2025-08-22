// src/components/Schedule.tsx - Complete implementation
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, Phone, Mail } from "lucide-react";
import { apiClient, BookingResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Schedule = () => {
  const [confirmedBookings, setConfirmedBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch schedule",
        variant: "destructive"
      });
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
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = getEndDate(startDate, duration);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  };

  const isUpcoming = (startDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return start > today;
  };

  const isPast = (startDate: string, duration: number): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = getEndDate(startDate, duration);
    end.setHours(23, 59, 59, 999);
    return today > end;
  };

  const getStatusBadge = (booking: BookingResponse) => {
    if (!booking.confirmed_date) return null;
    
    const duration = booking.duration_days || 1;
    
    if (isCurrentTrip(booking.confirmed_date, duration)) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (isUpcoming(booking.confirmed_date)) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else if (isPast(booking.confirmed_date, duration)) {
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Time TBD';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Tour Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Tour Schedule</span>
          <Badge variant="outline">{confirmedBookings.length} confirmed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {confirmedBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No confirmed tours scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {confirmedBookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{booking.destination}</h3>
                      {getStatusBadge(booking)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(booking.confirmed_date!)}
                            {booking.duration_days && booking.duration_days > 1 && (
                              <span> - {formatDate(getEndDate(booking.confirmed_date!, booking.duration_days).toISOString().split('T')[0])}</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(booking.confirmed_time)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{booking.group_size} people</span>
                        </div>
                        
                        {booking.duration_days && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.duration_days} day{booking.duration_days > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customer_name}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <Mail className="h-3 w-3" />
                            <span>{booking.customer_email}</span>
                          </div>
                          {booking.customer_phone && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{booking.customer_phone}</span>
                            </div>
                          )}
                        </div>
                        
                        {booking.amount && (
                          <div className="text-right">
                            <span className="font-semibold text-green-600">
                              ${booking.amount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {booking.admin_message && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> {booking.admin_message}
                        </p>
                      </div>
                    )}
                    
                    {booking.special_requests && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Special requests:</strong> {booking.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Schedule;
