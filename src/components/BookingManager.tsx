import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Calendar, Clock, Users, MapPin } from "lucide-react";

interface BookingManagerProps {
  booking: any;
  onBookingUpdated: () => void;
}

const BookingManager = ({ booking, onBookingUpdated }: BookingManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState(booking.confirmed_date || "");
  const [confirmedTime, setConfirmedTime] = useState(booking.confirmed_time || "");
  const [durationDays, setDurationDays] = useState(booking.duration_days || 1);
  const [notes, setNotes] = useState(booking.notes || "");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (status: string, sendEmail = true) => {
    setUpdating(true);

    try {
      const updateData: any = { status };
      
      if (status === 'confirmed' && confirmedDate) {
        updateData.confirmed_date = confirmedDate;
        updateData.confirmed_time = confirmedTime;
        updateData.duration_days = durationDays;
        updateData.notes = notes;
      }

      // Update booking in database
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id);
      
      if (error) throw error;

      // Send email notification if requested
      if (sendEmail) {
        const emailType = status === 'confirmed' ? 'confirmed' : 
                         status === 'cancelled' ? 'cancelled' : 'edited';

        await supabase.functions.invoke('send-booking-email', {
          body: {
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            customerPhone: booking.customer_phone,
            destination: booking.destination,
            groupSize: booking.group_size,
            preferredDate: booking.preferred_date,
            specialRequests: booking.special_requests,
            emailType,
            confirmedDate,
            confirmedTime,
            notes
          }
        });
      }

      await onBookingUpdated();
      setIsOpen(false);
      
      toast({
        title: "Success",
        description: `Booking ${status} and customer notified via email`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Booking - {booking.customer_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.customer_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.destination}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.group_size} people</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString() : 'No date specified'}
              </span>
            </div>
          </div>

          {/* Confirmation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="confirmedDate">Confirmed Date</Label>
                <Input
                  id="confirmedDate"
                  type="date"
                  value={confirmedDate}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmedTime">Start Time</Label>
                <Input
                  id="confirmedTime"
                  type="time"
                  value={confirmedTime}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="durationDays">Duration (days)</Label>
              <Input
                id="durationDays"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes/Changes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes, changes, or special instructions..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={updating || !confirmedDate}
              className="flex-1"
            >
              {updating ? "Updating..." : "Confirm Booking"}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleStatusUpdate('edited')}
              disabled={updating}
            >
              Save Changes
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updating}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingManager;