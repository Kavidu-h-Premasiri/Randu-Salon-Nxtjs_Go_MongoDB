import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const stylistId = request.nextUrl.searchParams.get('stylistId');
    const date = request.nextUrl.searchParams.get('date');
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const response = await fetch(`${backendUrl}/timeslots?stylistId=${stylistId}&date=${date}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, timeSlots: [] }, { status: 500 });
  }
}