import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  emailType?: 'new' | 'confirmed' | 'edited' | 'cancelled';
  confirmedDate?: string;
  confirmedTime?: string;
  notes?: string;
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
      emailType = 'new',
      confirmedDate,
      confirmedTime,
      notes,
    }: BookingEmailRequest = await req.json();

    console.log("Received booking email request:", {
      customerName,
      customerEmail,
      destination,
      groupSize,
      emailType,
    });

    // Send admin notification email
    const adminEmailContent = `
      <h2>${emailType === 'new' ? 'New' : 'Updated'} Tour Booking Request</h2>
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
        ${confirmedDate ? `<li>Confirmed Date: ${confirmedDate}</li>` : ''}
        ${confirmedTime ? `<li>Confirmed Time: ${confirmedTime}</li>` : ''}
      </ul>
      
      ${specialRequests ? `<p><strong>Special Requests:</strong><br>${specialRequests}</p>` : ''}
      ${notes ? `<p><strong>Admin Notes:</strong><br>${notes}</p>` : ''}
      
      <p><strong>Status:</strong> ${emailType.toUpperCase()}</p>
    `;

    // Send customer notification email based on type
    let customerSubject = '';
    let customerEmailContent = '';

    switch (emailType) {
      case 'new':
        customerSubject = 'Booking Request Received - Richman Tours';
        customerEmailContent = `
          <h2>Thank you for your booking request!</h2>
          <p>Dear ${customerName},</p>
          <p>We have received your tour booking request for <strong>${destination}</strong>.</p>
          
          <p><strong>Your booking details:</strong></p>
          <ul>
            <li>Destination: ${destination}</li>
            <li>Group Size: ${groupSize} people</li>
            ${preferredDate ? `<li>Preferred Date: ${preferredDate}</li>` : ''}
          </ul>
          
          <p>We will review your request and contact you within 24 hours to confirm your booking and provide further details.</p>
          
          <p>Best regards,<br>
          Richard Wanjiku<br>
          Richman Tours & Travel</p>
        `;
        break;
      case 'confirmed':
        customerSubject = 'Booking Confirmed - Richman Tours';
        customerEmailContent = `
          <h2>Your booking has been confirmed!</h2>
          <p>Dear ${customerName},</p>
          <p>Great news! Your tour booking for <strong>${destination}</strong> has been confirmed.</p>
          
          <p><strong>Confirmed booking details:</strong></p>
          <ul>
            <li>Destination: ${destination}</li>
            <li>Group Size: ${groupSize} people</li>
            ${confirmedDate ? `<li>Date: ${confirmedDate}</li>` : ''}
            ${confirmedTime ? `<li>Time: ${confirmedTime}</li>` : ''}
          </ul>
          
          ${notes ? `<p><strong>Additional Information:</strong><br>${notes}</p>` : ''}
          
          <p>We're excited to have you join us on this adventure! We'll be in touch with more details about your tour soon.</p>
          
          <p>Best regards,<br>
          Richard Wanjiku<br>
          Richman Tours & Travel</p>
        `;
        break;
      case 'edited':
        customerSubject = 'Booking Updated - Richman Tours';
        customerEmailContent = `
          <h2>Your booking has been updated</h2>
          <p>Dear ${customerName},</p>
          <p>We've made some updates to your tour booking for <strong>${destination}</strong>.</p>
          
          <p><strong>Updated booking details:</strong></p>
          <ul>
            <li>Destination: ${destination}</li>
            <li>Group Size: ${groupSize} people</li>
            ${confirmedDate ? `<li>Date: ${confirmedDate}</li>` : ''}
            ${confirmedTime ? `<li>Time: ${confirmedTime}</li>` : ''}
          </ul>
          
          ${notes ? `<p><strong>Changes made:</strong><br>${notes}</p>` : ''}
          
          <p>Please review the updated details. If you have any questions, don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          Richard Wanjiku<br>
          Richman Tours & Travel</p>
        `;
        break;
      case 'cancelled':
        customerSubject = 'Booking Cancelled - Richman Tours';
        customerEmailContent = `
          <h2>Your booking has been cancelled</h2>
          <p>Dear ${customerName},</p>
          <p>We regret to inform you that your tour booking for <strong>${destination}</strong> has been cancelled.</p>
          
          ${notes ? `<p><strong>Reason:</strong><br>${notes}</p>` : ''}
          
          <p>We apologize for any inconvenience this may cause. Please feel free to contact us to discuss alternative arrangements or to reschedule your tour.</p>
          
          <p>Best regards,<br>
          Richard Wanjiku<br>
          Richman Tours & Travel</p>
        `;
        break;
    }

    // Send admin notification
    const { error: adminEmailError } = await resend.emails.send({
      from: "Richman Tours <onboarding@resend.dev>",
      to: ["richard@richmantours.com"], // Replace with actual admin email
      subject: `${emailType === 'new' ? 'New' : 'Updated'} Booking Request - ${destination}`,
      html: adminEmailContent,
    });

    if (adminEmailError) {
      console.error("Admin email error:", adminEmailError);
    }

    // Send customer notification
    const { error: customerEmailError } = await resend.emails.send({
      from: "Richman Tours <onboarding@resend.dev>",
      to: [customerEmail],
      subject: customerSubject,
      html: customerEmailContent,
    });

    if (customerEmailError) {
      console.error("Customer email error:", customerEmailError);
    }

    console.log("Emails sent successfully");
    
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