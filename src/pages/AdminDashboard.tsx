import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuthPageDjango } from "@/components/AuthPageDjango";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  TrendingUp,
  LogOut,
  Camera,
  Trash2,
  Edit,
  Plus,
  Upload
} from "lucide-react";
import { useAuthDjango } from "@/hooks/useAuthDjango";
import { useBookingsDjango } from "@/hooks/useBookingsDjango";
import { useLocationsDjango } from "@/hooks/useLocationsDjango";
import { BookingResponse, LocationResponse } from "@/lib/api";

type TabType = 'overview' | 'bookings' | 'locations';

const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuthDjango();
  const { bookings, loading: bookingsLoading, updateBooking, deleteBooking } = useBookingsDjango();
  const { locations, loading: locationsLoading, createLocation, deleteLocation, updateLocation } = useLocationsDjango();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editingBooking, setEditingBooking] = useState<BookingResponse | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocationResponse | null>(null);
  const [locationUpload, setLocationUpload] = useState({ title: '', description: '', file: null as File | null });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleUpdateBooking = async (id: string, status: string, notes?: string) => {
    await updateBooking(id, { 
      status: status as any, 
      notes,
      updated_at: new Date().toISOString()
    });
    setEditingBooking(null);
  };

  const handleLocationUpload = async () => {
    if (!locationUpload.file || !locationUpload.title) return;
    
    await uploadLocationImage(locationUpload.file, locationUpload.title, locationUpload.description);
    setLocationUpload({ title: '', description: '', file: null });
  };

  const handleLocationEdit = async (id: string, title: string, description?: string) => {
    await updateLocation(id, { title, description });
    setEditingLocation(null);
  };

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length.toString(),
      change: "+12%",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Pending Bookings", 
      value: bookings.filter(b => b.status === 'pending').length.toString(),
      change: "New",
      icon: MapPin,
      color: "text-orange-600"
    },
    {
      title: "Confirmed Bookings",
      value: bookings.filter(b => b.status === 'confirmed').length.toString(),
      change: "+3",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Locations",
      value: locations.length.toString(),
      change: "+2", 
      icon: Camera,
      color: "text-purple-600"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 'bookings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingsLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bookings yet.</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-foreground">{booking.customer_name}</h4>
                            <p className="text-sm text-muted-foreground">{booking.destination}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 mr-1" />
                                {booking.customer_email}
                              </div>
                              {booking.customer_phone && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.customer_phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {booking.group_size} people
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status || 'pending')}>
                          {booking.status || 'pending'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingBooking(booking)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Booking</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Status</Label>
                                <Select
                                  defaultValue={booking.status || 'pending'}
                                  onValueChange={(value) => handleUpdateBooking(booking.id, value, booking.notes || undefined)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="destructive" 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this booking?')) {
                                      deleteBooking(booking.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'locations':
        return (
          <div className="space-y-6">
            {/* Location Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload New Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={locationUpload.title}
                    onChange={(e) => setLocationUpload({...locationUpload, title: e.target.value})}
                    placeholder="Location title"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={locationUpload.description}
                    onChange={(e) => setLocationUpload({...locationUpload, description: e.target.value})}
                    placeholder="Location description"
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLocationUpload({...locationUpload, file: e.target.files?.[0] || null})}
                  />
                </div>
                <Button 
                  onClick={handleLocationUpload}
                  disabled={!locationUpload.file || !locationUpload.title}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Location
                </Button>
              </CardContent>
            </Card>

            {/* Locations Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Location Gallery</span>
                  <Badge variant="outline">{locations.length} locations</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {locationsLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading locations...</p>
                ) : locations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No locations added yet. Upload your first location photo!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((location) => (
                      <div key={location.id} className="relative group border rounded-lg overflow-hidden">
                        <div className="aspect-video relative">
                          <img 
                            src={location.image_url} 
                            alt={location.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" size="sm" onClick={() => setEditingLocation(location)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Location</DialogTitle>
                                  </DialogHeader>
                                  {editingLocation && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Title</Label>
                                        <Input
                                          defaultValue={editingLocation.title}
                                          onChange={(e) => setEditingLocation({...editingLocation, title: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label>Description</Label>
                                        <Textarea
                                          defaultValue={editingLocation.description || ''}
                                          onChange={(e) => setEditingLocation({...editingLocation, description: e.target.value})}
                                        />
                                      </div>
                                      <Button
                                        onClick={() => editingLocation && handleLocationEdit(editingLocation.id, editingLocation.title, editingLocation.description || undefined)}
                                      >
                                        Save Changes
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this location?')) {
                                    deleteLocation(location.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-1">{location.title}</h3>
                          {location.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPageDjango />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's your business overview.
              </p>
            </div>
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg overflow-x-auto">
            {[
              { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
              { key: 'bookings' as const, label: 'Bookings', icon: Calendar },
              { key: 'locations' as const, label: 'Locations', icon: Camera },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;