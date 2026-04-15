import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend('re_tTvckTU3_JEkZ9ANdDkc5oyvsZxRiktjH');

export async function POST(request: Request) {
  try {
    const { email, otp, name } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`Sending OTP ${otp} to ${email}`);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Randu Salon <onboarding@resend.dev>',
      to: [email],
      subject: '🔐 Your Randu Salon Booking Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Main Card -->
            <div style="background: #1a1a1a; border-radius: 24px; border: 1px solid #d4af37; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
              
              <!-- Header with Gold Accent -->
              <div style="background: linear-gradient(135deg, #d4af37 0%, #b8942e 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #0a0a0a; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px;">RANDU SALON</h1>
                <p style="color: #0a0a0a; margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Luxury Beauty & Wellness</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 12px 0; font-weight: 600;">
                  Hello ${name || 'Valued Customer'}! 👋
                </h2>
                
                <p style="color: #b0b0b0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Thank you for choosing Randu Salon. Please use the verification code below to complete your booking.
                </p>
                
                <!-- OTP Box -->
                <div style="background: #0a0a0a; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #d4af37;">
                  <div style="font-size: 14px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">
                    Verification Code
                  </div>
                  <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #d4af37; font-family: monospace;">
                    ${otp}
                  </div>
                  <div style="font-size: 12px; color: #666; margin-top: 12px;">
                    This code expires in 10 minutes
                  </div>
                </div>
                
                <p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  If you didn't request this code, please ignore this email or contact our support team.
                </p>
                
                <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
                
                <!-- Booking Details Preview -->
                <div style="background: #0a0a0a; border-radius: 12px; padding: 16px; margin: 20px 0;">
                  <p style="color: #d4af37; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">BOOKING SUMMARY</p>
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    • Appointment requires verification to confirm<br>
                    • A booking receipt will be generated upon confirmation<br>
                    • Please arrive 10 minutes before your appointment
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #0f0f0f; padding: 20px 30px; text-align: center; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">
                  Randu Salon | Randu Salon, No 41 , New Shopping Mall , First Floor , Wariyapola
                </p>
                <p style="color: #666; font-size: 12px; margin: 0;">
                  📞 +94 729852612 | ✉️ kavindupremasiri272@gmail.com
                </p>
                <p style="color: #444; font-size: 11px; margin: 16px 0 0 0;">
                  © 2024 Randu Salon. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error details:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 400 }
      );
    }

    console.log('Email sent successfully to:', email, 'ID:', data?.id);
    return NextResponse.json(
      { success: true, message: 'Verification code sent successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}