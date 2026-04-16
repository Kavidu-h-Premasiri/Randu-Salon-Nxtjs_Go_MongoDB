import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the Go backend URL from environment variable or use default
    const backendUrl = process.env.GO_BACKEND_URL || 'http://localhost:8080';
    
    console.log('Fetching bookings from:', `${backendUrl}/api/bookings/all`);
    
    // Fetch all bookings from Go backend
    const response = await fetch(`${backendUrl}/api/bookings/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.error('Backend response not OK:', response.status, response.statusText);
      // Return empty array instead of error to prevent frontend crash
      return NextResponse.json(
        { success: true, bookings: [], message: 'No bookings found' },
        { status: 200 }
      );
    }
    
    const data = await response.json();
    console.log('Bookings fetched successfully:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    // Return empty array instead of error to prevent frontend crash
    return NextResponse.json(
      { success: true, bookings: [], message: 'Unable to fetch bookings' },
      { status: 200 }
    );
  }
}