// src/components/Schedule.tsx - Enhanced with CRUD operations
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, MapPin, Phone, Mail, Edit, Trash2, Plus } from "lucide-react";
import { apiClient, BookingResponse, TourResponse, TourData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EditTourFormProps {
  tour?: TourResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditTourForm = ({ tour, isOpen, onClose, onSave }: EditTourFormProps) => {
  const [formData, setFormData] = useState<TourData>({
    title: '',
    description: '',
    destination: '',
    start_date: '',
    end_date: '',
    start_time: '',
    max_capacity: 4,
    price_per_person: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title,
        description: tour.description || '',
        destination: tour.destination,
        start_date: tour.start_date,
        end_date: tour.end_date,
        start_time: tour.start_time || '',
        max_capacity: tour.max_capacity,
        price_per_person: tour.price_per_person || 0,
        notes: tour.notes || ''
      });
    } else {
      // Reset form for new tour
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);
      
      setFormData({
        title: '',
        description: '',
        destination: '',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        start_time: '08:00',
        max_capacity: 4,
        price_per_person: 0,
        notes: ''
      });
    }
  }, [tour, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tour) {
        await apiClient.updateTour(tour.id, formData);
        toast({
          title: "Success",
          description: "Tour updated successfully"
        });
      } else {
        await apiClient.createTour(formData);
        toast({
          title: "Success", 
          description: "Tour created successfully"
        });
      }
      onSave();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to ${tour ? 'update' : 'create'} tour: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TourData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tour ? 'Edit Tour' : 'Create New Tour'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tour Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Maasai Mara Safari"
                required
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., Maasai Mara National Reserve"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the tour..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_capacity">Max Capacity *</Label>
              <Input
                id="max_capacity"
                type="number"
                min="1"
                max="20"
                value={formData.max_capacity}
                onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price_per_person">Price per Person ($)</Label>
              <Input
                id="price_per_person"
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_person}
                onChange={(e) => handleInputChange('price_per_person', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Internal notes about this tour..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (tour ? 'Update Tour' : 'Create Tour')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Schedule = () => {
  const [confirmedBookings, setConfirmedBookings] = useState<BookingResponse[]>([]);
  const [tours, setTours] = useState<TourResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTour, setEditingTour] = useState<TourResponse | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'tours'>('bookings');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchConfirmedBookings(), fetchTours()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedBookings = async () => {
    try {
      const response = await apiClient.getBookings();
      const confirmed = response.results.filter(
        booking => booking.status === 'confirmed' && booking.confirmed_date
      );
      confirmed.sort((a, b) => {
        if (!a.confirmed_date || !b.confirmed_date) return 0;
        return new Date(a.confirmed_date).getTime() - new Date(b.confirmed_date).getTime();
      });
      setConfirmedBookings(confirmed);
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await apiClient.getTours();
      setTours(response.results || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteTour(tourId);
      await fetchTours();
      toast({
        title: "Success",
        description: "Tour deleted successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to delete tour: ${errorMessage}`,
        variant: "destructive"
      });
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

  const getTourStatusBadge = (tour: TourResponse) => {
    const statusColors = {
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={statusColors[tour.status]}>{tour.status}</Badge>;
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
            <span>Schedule Management</span>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Management</span>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Button>
          </CardTitle>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('bookings')}
            >
              Confirmed Bookings ({confirmedBookings.length})
            </Button>
            <Button
              variant={activeTab === 'tours' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('tours')}
            >
              Scheduled Tours ({tours.length})
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {activeTab === 'bookings' ? (
            <>
              {confirmedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No confirmed bookings scheduled yet.</p>
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
            </>
          ) : (
            <>
              {tours.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tours scheduled yet.</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4"
                  >
                    Create First Tour
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.map((tour) => (
                    <div
                      key={tour.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{tour.title}</h3>
                            {getTourStatusBadge(tour)}
                            {tour.is_full && (
                              <Badge className="bg-orange-100 text-orange-800">Full</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{tour.destination}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(tour.start_date)} - {formatDate(tour.end_date)}</span>
                              </div>
                              
                              {tour.start_time && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTime(tour.start_time)}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{tour.current_bookings}/{tour.max_capacity} people</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium">{tour.duration_days} day{tour.duration_days > 1 ? 's' : ''}</span>
                              </div>
                              
                              {tour.price_per_person && (
                                <div className="font-semibold text-green-600">
                                  ${tour.price_per_person}/person
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-500">
                                Created by {tour.created_by_name}
                              </div>
                            </div>
                          </div>
                          
                          {tour.description && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm">{tour.description}</p>
                            </div>
                          )}
                          
                          {tour.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <strong>Notes:</strong> {tour.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTour(tour)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTour(tour.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Tour Form */}
      <EditTourForm
        tour={editingTour || undefined}
        isOpen={!!editingTour}
        onClose={() => setEditingTour(null)}
        onSave={fetchTours}
      />

      {/* Create Tour Form */}
      <EditTourForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={fetchTours}
      />
    </>
  );
};

export default Schedule;