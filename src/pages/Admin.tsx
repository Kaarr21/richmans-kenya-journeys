import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";

const Admin = () => {
  const stats = [
    {
      title: "Total Bookings",
      value: "127",
      change: "+12%",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Active Tours",
      value: "8",
      change: "+2",
      icon: MapPin,
      color: "text-green-600"
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      change: "+18%",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Customer Rating",
      value: "4.9",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  const recentBookings = [
    {
      id: 1,
      customer: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "+254 712 345 678",
      tour: "Maasai Mara Classic Safari",
      date: "2024-02-15",
      status: "confirmed",
      amount: "$450"
    },
    {
      id: 2,
      customer: "Mike Chen",
      email: "mike@email.com",
      phone: "+254 723 456 789",
      tour: "Mount Kenya Adventure",
      date: "2024-02-20",
      status: "pending",
      amount: "$650"
    },
    {
      id: 3,
      customer: "Emma Wilson",
      email: "emma@email.com",
      phone: "+254 734 567 890",
      tour: "Coastal Beach & Culture",
      date: "2024-02-25",
      status: "confirmed",
      amount: "$550"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Richard! Here's your business overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Bookings</span>
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold text-foreground">{booking.customer}</h4>
                              <p className="text-sm text-muted-foreground">{booking.tour}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {booking.email}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.phone}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{booking.amount}</p>
                            <p className="text-sm text-muted-foreground">{booking.date}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="default">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add New Tour
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Customers
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Gallery
                  </Button>
                  <Button className="w-full" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Maasai Mara Tour</p>
                        <p className="text-xs text-muted-foreground">9:00 AM - Sarah Johnson</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Customer Call</p>
                        <p className="text-xs text-muted-foreground">2:00 PM - New Inquiry</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Vehicle Maintenance</p>
                        <p className="text-xs text-muted-foreground">4:00 PM - Service Check</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;