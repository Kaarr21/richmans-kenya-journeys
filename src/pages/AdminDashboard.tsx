// src/pages/AdminDashboard.tsx - Enhanced with location editing
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AuthPage from "@/components/AuthPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationUpload, { LocationEditDialog } from "@/components/LocationUpload";
import BookingManager from "@/components/BookingManager";
import Schedule from "@/components/Schedule";
import TourManager from "@/components/TourManager";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail,
  Star,
  TrendingUp,
  LogOut,
  Camera,
  Trash2,
  CalendarDays,
  Edit
} from "lucide-react";
import { apiClient, BookingResponse, LocationResponse, TourResponse } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

type TabType = 'overview' | 'bookings' | 'locations' | 'schedule' | 'tours';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [tours, setTours] = useState<TourResponse[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [scheduleKey, setScheduleKey] = useState(0);
  const [editingLocation, setEditingLocation] = useState<LocationResponse | null>(null);
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getProfile();
        setUser(userData.user);
        await Promise.all([fetchBookings(), fetchLocations(), fetchTours()]);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.getBookings();
      setBookings(response.results || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive"
      });
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiClient.getLocations();
      setLocations(response.results || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive"
      });
    }
  };

  const fetchTours = async () => {
    try {
      const response = await apiClient.getTours();
      setTours(response.results || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tours",
        variant: "destructive"
      });
    }
  };

  const handleBookingUpdated = async () => {
    await fetchBookings();
    setScheduleKey(prev => prev + 1);
  };

  const handleSignOut = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      apiClient.clearToken();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out."
      });
    }
  };

  const deleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteLocation(id);
      await fetchLocations();
      toast({
        title: "Success",
        description: "Location deleted successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to delete location: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats: StatItem[] = [
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
      title: "Active Tours",
      value: tours.filter(t => t.status === 'scheduled' || t.status === 'active').length.toString(),
      change: "+3",
      icon: CalendarDays,
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
                {bookings.map((booking) => (
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
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <BookingManager 
                        booking={booking} 
                        onBookingUpdated={handleBookingUpdated}
                      />
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No bookings yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'locations':
        return (
          <div className="space-y-6">
            <LocationUpload onLocationAdded={fetchLocations} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Location Gallery</span>
                  <Badge variant="outline">{locations.length} locations</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.map((location) => (
                    <div key={location.id} className="relative group border rounded-lg overflow-hidden">
                      <div className="aspect-video relative">
                        {location.image_url ? (
                          <img 
                            src={location.image_url} 
                            alt={location.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Camera className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingLocation(location)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteLocation(location.id)}
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
                        <p className="text-xs text-muted-foreground mt-2">
                          {location.images?.length || 0} image{location.images?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {locations.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-8">
                      No locations added yet. Upload your first location photo!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'schedule':
        return <Schedule key={scheduleKey} />;
      
      case 'tours':
        return <TourManager apiClient={apiClient} />;
      
      default:
        return null;
    }
  };

  if (loading) {
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
    return <AuthPage onAuthSuccess={checkAuth} />;
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
                Welcome back, {user.first_name || user.username}! Here's your business overview.
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg overflow-x-auto">
            {[
              { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
              { key: 'bookings' as const, label: 'Bookings', icon: Calendar },
              { key: 'tours' as const, label: 'Tours', icon: CalendarDays },
              { key: 'locations' as const, label: 'Locations', icon: Camera },
              { key: 'schedule' as const, label: 'Schedule', icon: MapPin }
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

      {/* Location Edit Dialog */}
      {editingLocation && (
        <LocationEditDialog
          location={editingLocation}
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          onUpdated={fetchLocations}
        />
      )}
    </div>
  );
};

export default AdminDashboard;