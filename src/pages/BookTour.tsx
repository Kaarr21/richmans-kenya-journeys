import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BookTour = () => {
  const [formData, setFormData] = useState({
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
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.destination || !formData.groupSize) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Save booking to database
      const { error: dbError } = await supabase
        .from('bookings')
        .insert([{
          customer_name: fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          destination: formData.destination,
          group_size: parseInt(formData.groupSize) || 1,
          preferred_date: formData.preferredDate || null,
          special_requests: formData.specialRequests
        }]);

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-booking-email', {
        body: {
          customerName: fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          destination: formData.destination,
          groupSize: parseInt(formData.groupSize) || 1,
          preferredDate: formData.preferredDate,
          specialRequests: formData.specialRequests
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw error here as booking was saved successfully
      }

      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted successfully. Richard will contact you within 24 hours."
      });

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

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive"
      });
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
              Book Your Adventure
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to explore Kenya's incredible destinations? Tell us where you'd like 
              to go and we'll create the perfect adventure tailored just for you.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Book Your Custom Tour</CardTitle>
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
                      placeholder="e.g., Maasai Mara, Mount Kenya, Diani Beach" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupSize">Group Size *</Label>
                    <Select value={formData.groupSize} onValueChange={(value) => handleSelectChange('groupSize', value)}>
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
                  <Label htmlFor="preferredDate">Preferred Start Date</Label>
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
                    placeholder="Tell us about any special requirements, dietary restrictions, accessibility needs, or specific activities you're interested in..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Richard will contact you within 24 hours to confirm your booking details.
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