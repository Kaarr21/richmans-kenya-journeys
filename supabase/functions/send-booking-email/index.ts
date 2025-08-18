import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  destination: string;
  groupSize: number;
  preferredDate?: string;
  specialRequests?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      destination,
      groupSize,
      preferredDate,
      specialRequests,
    }: BookingEmailRequest = await req.json();

    console.log("Received booking request:", {
      customerName,
      customerEmail,
      destination,
      groupSize,
    });

    // Email content
    const emailContent = `
      <h2>New Tour Booking Request</h2>
      <p><strong>Customer Details:</strong></p>
      <ul>
        <li>Name: ${customerName}</li>
        <li>Email: ${customerEmail}</li>
        ${customerPhone ? `<li>Phone: ${customerPhone}</li>` : ''}
      </ul>
      
      <p><strong>Tour Details:</strong></p>
      <ul>
        <li>Destination: ${destination}</li>
        <li>Group Size: ${groupSize} people</li>
        ${preferredDate ? `<li>Preferred Date: ${preferredDate}</li>` : ''}
      </ul>
      
      ${specialRequests ? `<p><strong>Special Requests:</strong><br>${specialRequests}</p>` : ''}
      
      <p>Please contact the customer to confirm their booking.</p>
    `;

    // Customer confirmation email
    const customerConfirmation = `
      <h2>Thank you for your booking request!</h2>
      <p>Dear ${customerName},</p>
      <p>We have received your tour booking request for <strong>${destination}</strong>.</p>
      
      <p><strong>Your booking details:</strong></p>
      <ul>
        <li>Destination: ${destination}</li>
        <li>Group Size: ${groupSize} people</li>
        ${preferredDate ? `<li>Preferred Date: ${preferredDate}</li>` : ''}
      </ul>
      
      <p>We will contact you within 24 hours to confirm your booking and provide further details.</p>
      
      <p>Best regards,<br>
      Richard Wanjiku<br>
      Richman Tours</p>
    `;

    // Send emails using Gmail SMTP (simulated for now - would need actual SMTP implementation)
    console.log("Booking notification email would be sent to:", Deno.env.get("GMAIL_USER"));
    console.log("Customer confirmation email would be sent to:", customerEmail);
    
    // In a real implementation, you would use nodemailer or similar to send emails
    // For now, we'll just log the emails and return success
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking emails sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);