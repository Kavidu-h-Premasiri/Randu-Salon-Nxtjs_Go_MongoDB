import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    // Get the Go backend URL from environment variable or use default
    const backendUrl = process.env.GO_BACKEND_URL || 'http://localhost:8080';
    
    // Send to Go backend
    const response = await fetch(`${backendUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create booking' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}