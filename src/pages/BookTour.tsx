import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, MapPin, Clock } from "lucide-react";

const BookTour = () => {
  const tourPackages = [
    {
      id: 1,
      name: "Maasai Mara Classic Safari",
      duration: "3 Days / 2 Nights",
      price: "$450",
      groupSize: "2-6 people"
    },
    {
      id: 2,
      name: "Mount Kenya Adventure",
      duration: "4 Days / 3 Nights",
      price: "$650",
      groupSize: "2-8 people"
    },
    {
      id: 3,
      name: "Coastal Beach & Culture",
      duration: "5 Days / 4 Nights",
      price: "$550",
      groupSize: "2-10 people"
    },
    {
      id: 4,
      name: "Ultimate Kenya Experience",
      duration: "7 Days / 6 Nights",
      price: "$950",
      groupSize: "2-8 people"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Book Your Adventure
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to explore Kenya with Richard? Choose from our popular packages 
              or let us create a custom adventure just for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Tour Packages */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">Popular Tour Packages</h2>
              <div className="space-y-6">
                {tourPackages.map((tour) => (
                  <Card key={tour.id} className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg">{tour.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {tour.duration}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {tour.groupSize}
                          </div>
                        </div>
                        <div className="text-xl font-bold text-primary">{tour.price}</div>
                      </div>
                      <Button className="w-full">Select This Package</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Book Your Tour</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter your phone number" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tourPackage">Tour Package</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          {tourPackages.map((tour) => (
                            <SelectItem key={tour.id} value={tour.name}>
                              {tour.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Tour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="groupSize">Group Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2">2 people</SelectItem>
                          <SelectItem value="3-4">3-4 people</SelectItem>
                          <SelectItem value="5-8">5-8 people</SelectItem>
                          <SelectItem value="9+">9+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferredDate">Preferred Start Date</Label>
                    <Input id="preferredDate" type="date" />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea 
                      id="specialRequests" 
                      placeholder="Tell us about any special requirements, dietary restrictions, or preferences..."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    Submit Booking Request
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Richard will contact you within 24 hours to confirm your booking details.
                  </p>
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

export default BookTour;