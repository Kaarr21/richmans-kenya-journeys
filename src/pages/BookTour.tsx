import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
import { useBookingsDjango } from "@/hooks/useBookingsDjango";
import { BookingData } from "@/lib/api";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  destination: string;
  groupSize: string;
  preferredDate: string;
  specialRequests: string;
}

const BookTour = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    destination: "",
    groupSize: "",
    preferredDate: "",
    specialRequests: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { toast } = useToast();
  const { createBooking } = useBookingsDjango();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.destination || !formData.groupSize) {
      // Please fill in all required fields
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      const bookingData: BookingData = {
        customer_name: fullName,
        customer_email: formData.email,
        customer_phone: formData.phone || undefined,
        destination: formData.destination,
        group_size: parseInt(formData.groupSize) || 1,
        preferred_date: formData.preferredDate || undefined,
        special_requests: formData.specialRequests || undefined
      };

      // Save booking to database
      const result = await createBooking(bookingData, { silent: true });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Booking submitted successfully (silent mode: no popup)

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        destination: "",
        groupSize: "",
        preferredDate: "",
        specialRequests: ""
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Booking error:', error);
      // Failed to submit booking request
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Book Your Ride
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Need reliable transportation in Nairobi or anywhere in Kenya? Tell us your 
pickup and destination details, and we'll provide safe, comfortable service 
tailored to your needs.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Book Your Taxi Service</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email" 
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination *</Label>
                    <Input 
                      id="destination" 
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="e.g.,JKIA Airport, City Tour, Karen, Westlands" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupSize">Group Size *</Label>
                    <Select 
                      value={formData.groupSize} 
                      onValueChange={(value) => handleSelectChange('groupSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3">3 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="5">5 people</SelectItem>
                        <SelectItem value="6">6 people</SelectItem>
                        <SelectItem value="7">7 people</SelectItem>
                        <SelectItem value="8">8 people</SelectItem>
                        <SelectItem value="9">9+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferredDate">Pickup Date</Label>
                  <Input 
                    id="preferredDate" 
                    name="preferredDate"
                    type="date" 
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea 
                    id="specialRequests" 
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Pickup location, specific route preferences, child seats, luggage space, accessibility needs..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Request Taxi Service"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Richard will contact you within 12 hours to confirm your pickup details
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookTour;
