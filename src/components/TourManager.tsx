// src/components/TourManager.tsx - New component for managing tours/schedules
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign,
  CalendarDays
} from "lucide-react";

interface TourData {
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  start_time: string;
  max_capacity: number;
  price_per_person: number;
  notes: string;
}

interface Tour extends TourData {
  id: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  current_bookings: number;
  available_spots: number;
  is_full: boolean;
  duration_days: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface TourManagerProps {
  apiClient: any; // We'll use the existing apiClient
}

const TourManager = ({ apiClient }: TourManagerProps) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState<TourData>({
    title: "",
    description: "",
    destination: "",
    start_date: "",
    end_date: "",
    start_time: "",
    max_capacity: 8,
    price_per_person: 0,
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await apiClient.request('/tours/');
      setTours(response.results || response || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TourData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      destination: "",
      start_date: "",
      end_date: "",
      start_time: "",
      max_capacity: 8,
      price_per_person: 0,
      notes: ""
    });
    setEditingTour(null);
  };

  const openDialog = (tour?: Tour) => {
    if (tour) {
      setEditingTour(tour);
      setFormData({
        title: tour.title,
        description: tour.description,
        destination: tour.destination,
        start_date: tour.start_date,
        end_date: tour.end_date,
        start_time: tour.start_time,
        max_capacity: tour.max_capacity,
        price_per_person: tour.price_per_person,
        notes: tour.notes
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.destination || !formData.start_date || !formData.end_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingTour) {
        await apiClient.request(`/tours/${editingTour.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
        toast({
          title: "Success",
          description: "Tour updated successfully"
        });
      } else {
        await apiClient.request('/tours/', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast({
          title: "Success",
          description: "Tour created successfully"
        });
      }
      
      await fetchTours();
      setIsDialogOpen(false);
      resetForm();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to ${editingTour ? 'update' : 'create'} tour: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (tour: Tour) => {
    if (!window.confirm(`Are you sure you want to delete the tour "${tour.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.request(`/tours/${tour.id}/`, { method: 'DELETE' });
      toast({
        title: "Success",
        description: "Tour deleted successfully"
      });
      await fetchTours();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to delete tour: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
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
          <CardTitle>Tour Schedule Management</CardTitle>
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Tour Schedule Management</span>
            <Badge variant="outline">{tours.length} tours</Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tour
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTour ? 'Edit Tour' : 'Create New Tour'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Tour Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Maasai Mara Safari Adventure"
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
                    placeholder="Describe the tour experience..."
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
                    <Label htmlFor="max_capacity">Max Capacity</Label>
                    <Input
                      id="max_capacity"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.max_capacity}
                      onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_per_person">Price per Person ($)</Label>
                    <Input
                      id="price_per_person"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_per_person}
                      onChange={(e) => handleInputChange('price_per_person', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Internal notes for this tour..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingTour ? 'Update Tour' : 'Create Tour'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tours.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tours scheduled yet.</p>
            <p className="text-sm text-gray-400 mt-2">Create your first tour to get started!</p>
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
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{tour.title}</h3>
                      <Badge className={getStatusColor(tour.status)}>
                        {tour.status}
                      </Badge>
                      {tour.is_full && (
                        <Badge variant="destructive">Full</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{tour.destination}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(tour.start_date)}
                            {tour.duration_days > 1 && ` - ${formatDate(tour.end_date)}`}
                          </span>
                        </div>
                        {tour.start_time && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(tour.start_time)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {tour.current_bookings}/{tour.max_capacity} booked
                          </span>
                        </div>
                        {tour.price_per_person > 0 && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span>${tour.price_per_person}/person</span>
                          </div>
                        )}
                        <div className="text-xs">
                          <span>{tour.duration_days} day{tour.duration_days > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 md:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(tour)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tour)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {tour.description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">{tour.description}</p>
                      </div>
                    )}
                    
                    {tour.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <strong>Notes:</strong> {tour.notes}
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

export default TourManager;
