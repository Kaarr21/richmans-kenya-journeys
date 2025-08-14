import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, DollarSign, MapPin, Eye, Edit, Trash2, Plus } from "lucide-react";

const Admin = () => {
  // Mock data for demonstration
  const stats = [
    { title: "Total Bookings", value: "156", icon: Calendar, color: "text-blue-600" },
    { title: "Active Tours", value: "12", icon: MapPin, color: "text-green-600" },
    { title: "Total Revenue", value: "$48,250", icon: DollarSign, color: "text-purple-600" },
    { title: "Customers", value: "89", icon: Users, color: "text-orange-600" },
  ];

  const recentBookings = [
    { id: 1, customer: "John Smith", tour: "Maasai Mara 3-Day Safari", date: "2024-09-15", status: "Confirmed", amount: "$450" },
    { id: 2, customer: "Sarah Johnson", tour: "Kenya Highlights 7-Day Tour", date: "2024-09-20", status: "Pending", amount: "$1,200" },
    { id: 3, customer: "Mike Davis", tour: "Mount Kenya Climbing", date: "2024-09-25", status: "Confirmed", amount: "$800" },
    { id: 4, customer: "Emma Wilson", tour: "Coastal Beach Safari", date: "2024-10-01", status: "Confirmed", amount: "$650" },
  ];

  const tours = [
    { id: 1, name: "Maasai Mara 3-Day Safari", duration: "3 Days", price: "$450", status: "Active", bookings: 45 },
    { id: 2, name: "Kenya Highlights 7-Day Tour", duration: "7 Days", price: "$1,200", status: "Active", bookings: 28 },
    { id: 3, name: "Mount Kenya Climbing", duration: "5 Days", price: "$800", status: "Active", bookings: 15 },
    { id: 4, name: "Coastal Beach Safari", duration: "4 Days", price: "$650", status: "Draft", bookings: 0 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your tours, bookings, and customer interactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
            <TabsTrigger value="tours">Tour Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Booking
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Tour</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.customer}</TableCell>
                        <TableCell>{booking.tour}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{booking.amount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tours Tab */}
          <TabsContent value="tours">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Tour Packages</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tour
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tour Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow key={tour.id}>
                        <TableCell className="font-medium">{tour.name}</TableCell>
                        <TableCell>{tour.duration}</TableCell>
                        <TableCell>{tour.price}</TableCell>
                        <TableCell>{getStatusBadge(tour.status)}</TableCell>
                        <TableCell>{tour.bookings}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Revenue Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Popular Tours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Tours Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Trends Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Satisfaction Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;