import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }
    
    // Call your Go backend API
    const backendUrl = process.env.BACKEND_URL || process.env.GO_BACKEND_URL || 'http://localhost:8080';
    
    console.log(`Verifying OTP for email: ${email} with OTP: ${otp}`);
    
    const response = await fetch(`${backendUrl}/api/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await response.json();
    console.log('Backend verify response:', data);
    
    if (!response.ok) {
      let errorMessage = data.error || 'Invalid OTP';
      if (response.status === 400) {
        errorMessage = 'Invalid or expired OTP. Please try again.';
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: data.booking
    });
    
  } catch (error) {
    console.error('Error in verify-otp API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Unable to connect to the server. Please make sure the backend is running on port 8080.' 
      },
      { status: 500 }
    );
  }
}