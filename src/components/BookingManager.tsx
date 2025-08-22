// src/components/BookingManager.tsx - Enhanced version
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Calendar, Clock, Users, MapPin, DollarSign, MessageSquare, Send } from "lucide-react";
import { apiClient, BookingResponse } from "@/lib/api";

interface BookingManagerProps {
  booking: BookingResponse;
  onBookingUpdated: () => void;
}

const BookingManager = ({ booking, onBookingUpdated }: BookingManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState(booking.confirmed_date || "");
  const [confirmedTime, setConfirmedTime] = useState(booking.confirmed_time || "");
  const [durationDays, setDurationDays] = useState(booking.duration_days || 1);
  const [amount, setAmount] = useState(booking.amount?.toString() || "");
  const [notes, setNotes] = useState(booking.notes || "");
  const [adminMessage, setAdminMessage] = useState(booking.admin_message || "");
  const [sendNotification, setSendNotification] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (status: 'confirmed' | 'cancelled' | 'completed') => {
    setUpdating(true);

    try {
      const updateData: any = { 
        status,
        send_notification: sendNotification
      };
      
      if (status === 'confirmed') {
        if (!confirmedDate) {
          toast({
            title: "Error",
            description: "Please set a confirmed date before confirming the booking",
            variant: "destructive"
          });
          setUpdating(false);
          return;
        }
        updateData.confirmed_date = confirmedDate;
        updateData.confirmed_time = confirmedTime || null;
        updateData.duration_days = durationDays;
      }

      if (amount) {
        updateData.amount = parseFloat(amount);
      }

      if (notes) {
        updateData.notes = notes;
      }

      if (adminMessage) {
        updateData.admin_message = adminMessage;
      }

      await apiClient.updateBooking(booking.id, updateData);
      await onBookingUpdated();
      setIsOpen(false);
      
      const notificationMsg = sendNotification 
        ? ' and customer has been notified' 
        : '';
      
      toast({
        title: "Success",
        description: `Booking ${status} successfully${notificationMsg}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to update booking: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendNotification = async () => {
    setUpdating(true);
    try {
      await apiClient.sendBookingNotification(booking.id);
      toast({
        title: "Success",
        description: "Notification sent to customer successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to send notification: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Booking</span>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><strong>Name:</strong> {booking.customer_name}</p>
              <p><strong>Email:</strong> {booking.customer_email}</p>
              <p><strong>Phone:</strong> {booking.customer_phone || 'Not provided'}</p>
              <p><strong>Group Size:</strong> {booking.group_size} people</p>
            </div>
            <div className="mt-2">
              <p><strong>Destination:</strong> {booking.destination}</p>
              {booking.special_requests && (
                <p><strong>Special Requests:</strong> {booking.special_requests}</p>
              )}
            </div>
          </div>

          {/* Booking Details Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="confirmedTime">Confirmed Time</Label>
                <Input
                  id="confirmedTime"
                  type="time"
                  value={confirmedTime}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Tour cost"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adminMessage">Message to Customer</Label>
              <Textarea
                id="adminMessage"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Optional message that will be included in the notification email..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes (not visible to customer)..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendNotification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(!!checked)}
              />
              <Label htmlFor="sendNotification" className="text-sm">
                Send email notification to customer
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {booking.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Confirm Booking
              </Button>
            )}

            {booking.status === 'confirmed' && (
              <Button
                onClick={() => handleStatusUpdate('completed')}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Mark Complete
              </Button>
            )}

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={updating}
                variant="destructive"
              >
                Cancel Booking
              </Button>
            )}

            <Button
              onClick={handleSendNotification}
              disabled={updating}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-1" />
              Send Notification
            </Button>
          </div>

          {/* Notification History */}
          {booking.customer_notified && booking.last_notification_sent && (
            <div className="text-xs text-gray-500 border-t pt-2">
              Last notification sent: {new Date(booking.last_notification_sent).toLocaleString()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingManager;
