import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, MapPin, Clock, Star, CheckCircle } from "lucide-react";
import { useState } from "react";

const BookTour = () => {
  const [selectedTour, setSelectedTour] = useState("");

  const tourPackages = [
    {
      id: "maasai-mara-3d",
      name: "Maasai Mara 3-Day Safari",
      duration: "3 Days, 2 Nights",
      price: "$450",
      highlights: ["Big Five Game Drives", "Maasai Village Visit", "Great Migration (seasonal)"],
      rating: 4.9,
    },
    {
      id: "kenya-highlights-7d",
      name: "Kenya Highlights 7-Day Tour",
      duration: "7 Days, 6 Nights",
      price: "$1,200",
      highlights: ["Multiple National Parks", "Cultural Experiences", "Hot Air Balloon Safari"],
      rating: 4.8,
    },
    {
      id: "mount-kenya-5d",
      name: "Mount Kenya Climbing Adventure",
      duration: "5 Days, 4 Nights",
      price: "$800",
      highlights: ["Point Lenana Summit", "Alpine Lakes", "Mountain Wildlife"],
      rating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-safari-sunset/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">Kenya Adventure</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our carefully crafted tour packages or create a custom itinerary. 
              Let Richard guide you through the wonders of Kenya.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Tour Packages */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Popular Tour Packages</h2>
              <div className="space-y-6">
                {tourPackages.map((tour) => (
                  <Card 
                    key={tour.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTour === tour.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedTour(tour.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-foreground">{tour.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {tour.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-current text-yellow-500" />
                              {tour.rating}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{tour.price}</div>
                          <div className="text-sm text-muted-foreground">per person</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tour.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Book Your Tour</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and Richard will contact you within 24 hours to confirm your booking.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div>
                    <Label htmlFor="tour">Select Tour Package</Label>
                    <Select value={selectedTour} onValueChange={setSelectedTour}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tour package" />
                      </SelectTrigger>
                      <SelectContent>
                        {tourPackages.map((tour) => (
                          <SelectItem key={tour.id} value={tour.id}>
                            {tour.name} - {tour.price}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Tour Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="travelers">Number of Travelers</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Traveler</SelectItem>
                          <SelectItem value="2">2 Travelers</SelectItem>
                          <SelectItem value="3">3 Travelers</SelectItem>
                          <SelectItem value="4">4 Travelers</SelectItem>
                          <SelectItem value="5+">5+ Travelers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Preferred Date</Label>
                      <Input id="date" type="date" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Special Requirements</Label>
                    <Textarea 
                      id="requirements" 
                      placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                      className="h-24"
                    />
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                    Submit Booking Request
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>By submitting this form, you agree to our terms and conditions.</p>
                    <p className="mt-2">Richard will contact you within 24 hours to confirm availability and details.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Why Book With Us */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Book With Richard?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience Kenya through the eyes of a local expert with over 15 years of guiding experience.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Local Expertise</h3>
                <p className="text-muted-foreground">Born and raised in Kenya, Richard knows every hidden gem and cultural secret.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Personal Touch</h3>
                <p className="text-muted-foreground">Small groups, personalized itineraries, and genuine local connections.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Flexible Scheduling</h3>
                <p className="text-muted-foreground">Custom dates and itineraries to match your preferences and schedule.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BookTour;