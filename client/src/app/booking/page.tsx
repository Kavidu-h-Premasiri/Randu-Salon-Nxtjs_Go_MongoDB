'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Mail, Phone, CreditCard, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
}

interface Stylist {
  id: string;
  name: string;
  specialties: string[];
}

interface AppointmentSettings {
  feePerService: number;
  maxAppointmentFee: number;
  maxServicesPerBooking: number;
  otpExpiryMinutes: number;
  maxDaysAdvance: number;
  businessHours: { day: string; start: string; end: string }[];
}

const API_BASE_URL = 'http://localhost:8080/api';

// Convert time string to minutes for comparison
const timeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

// Convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Generate time slots in 30-minute increments
const generateTimeSlots = (startTime: string, endTime: string): string[] => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
};

interface BookedSlot {
  stylist: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
}

const isTimeSlotOverlapping = (
  slotTime: string,
  slotDuration: number,
  bookedSlots: BookedSlot[],
  stylist: string,
  date: string
): boolean => {
  const slotStartMinutes = timeToMinutes(slotTime);
  const slotEndMinutes = slotStartMinutes + slotDuration;
  
  return bookedSlots.some(booking => {
    if (booking.stylist !== stylist || booking.date !== date) return false;
    const bookedStartMinutes = timeToMinutes(booking.startTime);
    const bookedEndMinutes = timeToMinutes(booking.endTime);
    return (bookedEndMinutes > slotStartMinutes && bookedStartMinutes < slotEndMinutes);
  });
};

export default function Booking() {
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  // Data from API
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Error states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // OTP Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Booked time slots from database
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  const [formData, setFormData] = useState({
    services: [] as Array<{ name: string; price: number; category: string; duration: number; id?: string }>,
    stylist: '',
    stylistId: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Fetch all data from API
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchServices(),
      fetchStylists(),
      fetchSettings(),
      fetchBookings()
    ]);
    setLoading(false);
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      const data = await response.json();
      if (data.success && data.services) {
        setServices(data.services);
        // Set default open categories
        const uniqueCategories = [...new Set(data.services.map((s: Service) => s.category))];
        setOpenCategories(uniqueCategories.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStylists = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stylists`);
      const data = await response.json();
      if (data.success && data.stylists) {
        setStylists(data.stylists);
      }
    } catch (error) {
      console.error('Error fetching stylists:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      console.log('📊 Settings fetched from API:', data);
      if (data.success && data.settings) {
        setSettings({
          feePerService: data.settings.appointmentFeePerService || 50,
          maxAppointmentFee: data.settings.maxAppointmentFee || 200,
          maxServicesPerBooking: data.settings.maxServicesPerBooking || 10,
          otpExpiryMinutes: data.settings.otpExpiryMinutes || 10,
          maxDaysAdvance: data.settings.maxDaysAdvance || 14,
          businessHours: data.settings.businessHours || [
            { day: 'Monday', start: '09:00 AM', end: '08:00 PM' },
            { day: 'Tuesday', start: '09:00 AM', end: '08:00 PM' },
            { day: 'Wednesday', start: '09:00 AM', end: '08:00 PM' },
            { day: 'Thursday', start: '09:00 AM', end: '08:00 PM' },
            { day: 'Friday', start: '09:00 AM', end: '08:00 PM' },
            { day: 'Saturday', start: '09:00 AM', end: '06:00 PM' },
            { day: 'Sunday', start: '10:00 AM', end: '04:00 PM' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/all`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bookings) {
          const slots: BookedSlot[] = data.bookings.map((booking: any) => ({
            stylist: booking.stylistName || booking.stylist,
            date: booking.date,
            startTime: booking.startTime || booking.time,
            endTime: booking.endTime || booking.finishingTime,
            duration: booking.totalDuration || 0
          }));
          setBookedSlots(slots);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Get business hours for a specific date
  const getBusinessHoursForDate = (date: Date) => {
    if (!settings?.businessHours) {
      // Default fallback
      const dayIndex = date.getDay();
      if (dayIndex === 0) return { start: '10:00 AM', end: '04:00 PM' };
      if (dayIndex === 6) return { start: '09:00 AM', end: '06:00 PM' };
      return { start: '09:00 AM', end: '08:00 PM' };
    }
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const businessHour = settings.businessHours.find(bh => bh.day === dayName);
    if (businessHour) {
      return { start: businessHour.start, end: businessHour.end };
    }
    return { start: '09:00 AM', end: '08:00 PM' };
  };

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Phone number is required';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) return 'Phone number must be between 9-15 digits';
    return '';
  };

  const validateDate = (date: string) => {
    if (!date) return 'Please select a date';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) return 'Please select a future date';
    const maxDays = settings?.maxDaysAdvance || 14;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    if (selectedDate > maxDate) return `Please select a date within the next ${maxDays} days`;
    return '';
  };

  const validateTime = (time: string, date: string, selectedServices: any[], stylistName: string) => {
    if (!time) return 'Please select a time slot';
    if (selectedServices.length === 0) return 'Please select at least one service';
    if (!stylistName) return 'Please select a stylist first';
    
    const [year, month, day] = date.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hours = getBusinessHoursForDate(selectedDate);
    const startMinutes = timeToMinutes(hours.start);
    const endMinutes = timeToMinutes(hours.end);
    const slotMinutes = timeToMinutes(time);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const finishMinutes = slotMinutes + totalDuration;
    
    if (slotMinutes < startMinutes) return 'Selected time is before business hours';
    if (finishMinutes > endMinutes) return 'Appointment would end after business hours';
    
    if (isTimeSlotOverlapping(time, totalDuration, bookedSlots, stylistName, date)) {
      return `This time slot is already booked for ${stylistName}. Please select another time.`;
    }
    
    return '';
  };

  const validateServices = (selectedServices: any[]) => {
    if (selectedServices.length === 0) return 'Please select at least one service';
    const maxServices = settings?.maxServicesPerBooking || 10;
    if (selectedServices.length > maxServices) return `Maximum ${maxServices} services can be selected`;
    return '';
  };

  const validateStylist = (stylist: string) => {
    if (!stylist) return 'Please select a preferred stylist';
    return '';
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: {[key: string]: string} = {};
    
    if (stepNumber === 1) {
      const serviceError = validateServices(formData.services);
      if (serviceError) newErrors.services = serviceError;
      const stylistError = validateStylist(formData.stylist);
      if (stylistError) newErrors.stylist = stylistError;
    }
    else if (stepNumber === 2) {
      const dateError = validateDate(formData.date);
      if (dateError) newErrors.date = dateError;
      if (formData.date && formData.stylist) {
        const timeError = validateTime(formData.time, formData.date, formData.services, formData.stylist);
        if (timeError) newErrors.time = timeError;
      }
    }
    else if (stepNumber === 3) {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalDuration = () => {
    return formData.services.reduce((sum, service) => sum + service.duration, 0);
  };

  const getAvailableTimeSlots = () => {
    if (!formData.date || !formData.stylist) return [];
    
    const [year, month, day] = formData.date.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hours = getBusinessHoursForDate(selectedDate);
    const totalDuration = calculateTotalDuration();
    const allSlots = generateTimeSlots(hours.start, hours.end);
    
    return allSlots.filter(slot => {
      const slotMinutes = timeToMinutes(slot);
      const finishMinutes = slotMinutes + totalDuration;
      const endMinutes = timeToMinutes(hours.end);
      const maxStartMinutes = endMinutes - totalDuration;
      
      const isValidTime = slotMinutes >= timeToMinutes(hours.start) && 
                          slotMinutes <= maxStartMinutes && 
                          finishMinutes <= endMinutes;
      
      if (!isValidTime) return false;
      return !isTimeSlotOverlapping(slot, totalDuration, bookedSlots, formData.stylist, formData.date);
    });
  };

  const calculateFinishingTime = () => {
    if (!formData.time || formData.services.length === 0) return null;
    const totalDuration = calculateTotalDuration();
    const startTime = formData.time;
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return null;
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const endMinutesTotal = hours * 60 + minutes + totalDuration;
    return minutesToTime(endMinutesTotal);
  };

  const calculateAppointmentFee = () => {
    const serviceCount = formData.services.length;
    if (serviceCount === 0) return 0;
    const feePerService = settings?.feePerService || 50;
    const maxFee = settings?.maxAppointmentFee || 200;
    const calculatedFee = serviceCount * feePerService;
    const finalFee = Math.min(calculatedFee, maxFee);
    console.log(`💰 Fee calculation: ${serviceCount} services × ${feePerService} = ${calculatedFee}, capped at ${maxFee} = ${finalFee}`);
    return finalFee;
  };

  const calculateTotalPrice = () => {
    const servicesTotal = formData.services.reduce((sum, service) => sum + service.price, 0);
    const appointmentFee = calculateAppointmentFee();
    return servicesTotal + appointmentFee;
  };

  const generatePDF = (bookingData: any) => {
    const doc = new jsPDF();
    const gold = [212, 175, 55];
    const dark = [18, 18, 18];

    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(26);
    doc.text('RANDU SALON', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text('OFFICIAL BOOKING RECEIPT', 105, 35, { align: 'center' });

    doc.setTextColor(40, 40, 40);
    let yPos = 70;
    const addField = (label: string, value: string) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, 60, yPos);
      yPos += 8;
    };

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('Client Information', 20, yPos - 10);
    addField('Name', bookingData.name);
    addField('Email', bookingData.email);
    addField('Phone', bookingData.phone);
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Details', 20, yPos - 10);
    addField('Date', bookingData.date);
    addField('Time Slot', `${bookingData.time} - ${bookingData.finishingTime}`);
    addField('Stylist', bookingData.stylist);
    
    yPos += 5;
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Services Booked:', 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    bookingData.services.forEach((s: any) => {
      doc.text(`- ${s.name} (${s.duration} min)`, 25, yPos);
      doc.text(`Rs.${s.price}`, 170, yPos);
      yPos += 8;
    });
    yPos += 5;
    doc.text(`Appointment Fee:`, 25, yPos);
    doc.text(`Rs.${calculateAppointmentFee()}`, 170, yPos);
    yPos += 15;
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(20, yPos, 170, 15, 'F');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL AMOUNT: Rs.${bookingData.totalPrice}`, 105, yPos + 10, { align: 'center' });
    doc.save(`Booking_${bookingData.name.replace(/\s+/g, '_')}.pdf`);
  };

  const createPendingBooking = async () => {
  try {
    const selectedStylist = stylists.find(s => s.name === formData.stylist);
    
    // Calculate finishing time
    const finishingTime = calculateFinishingTime();
    
    const bookingData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      services: formData.services.map(s => ({
        name: s.name,
        price: s.price,
        category: s.category,
        duration: s.duration
      })),
      stylist: formData.stylist,
      stylistId: selectedStylist?.id || '',
      stylistName: formData.stylist,
      date: formData.date,
      time: formData.time,
      startTime: formData.time,
      finishingTime: finishingTime,
      endTime: finishingTime,
      notes: formData.notes,
      totalPrice: calculateTotalPrice(),
      appointmentFee: calculateAppointmentFee(),
      servicesTotal: formData.services.reduce((sum, s) => sum + s.price, 0),
      totalDuration: calculateTotalDuration(),
    };

    console.log('📤 Sending booking data:', bookingData);

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();
    console.log('📥 Booking response:', response.status, data);

    if (response.ok && data.success) {
      return true;
    } else {
      console.error('Booking creation failed:', data);
      alert(data.error || data.message || 'Failed to create booking');
      return false;
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Unable to create booking. Please check your connection.');
    return false;
  }
};

  const handleSendOTP = async () => {
    const isValid = validateStep(3);
    if (!isValid) {
      setTouched({ name: true, email: true, phone: true });
      alert(errors.name || errors.email || errors.phone || 'Please fill all required fields correctly');
      return;
    }
    
    setIsSendingOtp(true);
    
    try {
      const bookingCreated = await createPendingBooking();
      if (!bookingCreated) {
        throw new Error('Failed to create booking');
      }
      
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerifying(true);
        alert(`✓ Verification code sent to ${formData.email}`);
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to send verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndConfirm = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter the 6-digit verification code');
      return;
    }
    
    setIsSendingOtp(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const summary = {
          ...formData,
          finishingTime: calculateFinishingTime(),
          totalPrice: calculateTotalPrice(),
        };
        
        generatePDF(summary);
        alert('✓ Booking Confirmed successfully!');
        setIsVerifying(false);
        
        setStep(1);
        setFormData({
          services: [],
          stylist: '',
          stylistId: '',
          date: '',
          time: '',
          name: '',
          email: '',
          phone: '',
          notes: ''
        });
        setOtp('');
        setErrors({});
        setTouched({});
        
        fetchBookings();
      } else {
        alert(data.message || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (error) {
      alert('Failed to verify OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const availableTimeSlots = getAvailableTimeSlots();
  const businessHoursDisplay = () => {
    if (!formData.date) return null;
    const [year, month, day] = formData.date.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hours = getBusinessHoursForDate(selectedDate);
    return `${hours.start} - ${hours.end}`;
  };

  const getMaxDate = () => {
    const maxDays = settings?.maxDaysAdvance || 14;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    return maxDate;
  };

  const isDateSelectable = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Cannot select past dates
  if (date < today) return false;
  
  // Cannot select today (only tomorrow onwards)
  if (date.getTime() === today.getTime()) return false;
  
  const maxDate = getMaxDate();
  maxDate.setHours(0, 0, 0, 0);
  
  // Cannot select beyond max days
  if (date > maxDate) return false;
  
  return true;
};

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      setFormData({ ...formData, date: formatDate(date), time: '' });
      setErrors(prev => ({ ...prev, date: '', time: '' }));
      setShowCalendar(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (increment: number) => {
  const newMonth = new Date(currentMonth);
  newMonth.setMonth(currentMonth.getMonth() + increment);
  
  // Get min date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);
  
  // Get max date
  const maxDate = getMaxDate();
  maxDate.setHours(0, 0, 0, 0);
  
  // Don't go to months that are completely before min date
  const lastDayOfNewMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0);
  if (lastDayOfNewMonth < minDate) return;
  
  // Don't go to months that are completely after max date
  const firstDayOfNewMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
  if (firstDayOfNewMonth > maxDate) return;
  
  setCurrentMonth(newMonth);
};

  const renderCalendar = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Get first day of month (0 = Sunday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Get days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = getMaxDate();
  maxDate.setHours(0, 0, 0, 0);
  
  const days = [];
  
  // Add previous month's dates
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDate = daysInPrevMonth - i;
    const currentDate = new Date(year, month - 1, prevDate);
    currentDate.setHours(0, 0, 0, 0);
    const isSelectable = isDateSelectable(currentDate);
    
    days.push(
      <button
        key={`prev-${prevDate}`}
        onClick={() => isSelectable && handleDateSelect(currentDate)}
        disabled={!isSelectable}
        className={`h-10 w-10 rounded-full transition-all duration-200 ${
          isSelectable
            ? 'hover:bg-gold-500/20 text-gray-400 hover:text-white'
            : 'text-gray-600 cursor-not-allowed opacity-40'
        }`}
      >
        {prevDate}
      </button>
    );
  }
  
  // Add current month's dates
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    const isSelectable = isDateSelectable(currentDate);
    const isSelected = formData.date === formatDate(currentDate);
    const isToday = currentDate.getTime() === today.getTime();
    
    days.push(
      <button
        key={day}
        onClick={() => isSelectable && handleDateSelect(currentDate)}
        disabled={!isSelectable}
        className={`h-10 w-10 rounded-full transition-all duration-200 ${
          isSelectable
            ? isSelected
              ? 'gold-gradient text-dark-900 font-semibold shadow-lg scale-110'
              : isToday
              ? 'border-2 border-gold-500 text-gold-400 font-semibold'
              : 'hover:bg-gold-500/20 text-white'
            : 'text-gray-600 cursor-not-allowed opacity-40'
        }`}
      >
        {day}
      </button>
    );
  }
  
  // Add next month's dates to complete 6 rows (42 cells)
  const totalCells = 42;
  const remainingCells = totalCells - days.length;
  
  for (let i = 1; i <= remainingCells; i++) {
    const currentDate = new Date(year, month + 1, i);
    currentDate.setHours(0, 0, 0, 0);
    const isSelectable = isDateSelectable(currentDate);
    
    days.push(
      <button
        key={`next-${i}`}
        onClick={() => isSelectable && handleDateSelect(currentDate)}
        disabled={!isSelectable}
        className={`h-10 w-10 rounded-full transition-all duration-200 ${
          isSelectable
            ? 'hover:bg-gold-500/20 text-gray-400 hover:text-white'
            : 'text-gray-600 cursor-not-allowed opacity-40'
        }`}
      >
        {i}
      </button>
    );
  }
  
  return (
    <div className="bg-dark-300 rounded-xl border border-gold-600/30 p-6 absolute top-full mt-2 left-0 z-20 w-80 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <button 
          type="button" 
          onClick={() => changeMonth(-1)} 
          className="p-2 hover:bg-gold-500/20 rounded-full transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-gold-500" />
        </button>
        <span className="text-white font-semibold text-lg">{monthNames[month]} {year}</span>
        <button 
          type="button" 
          onClick={() => changeMonth(1)} 
          className="p-2 hover:bg-gold-500/20 rounded-full transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-gold-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gold-400 font-medium py-1">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gold-600/20 text-xs text-gray-400 text-center space-y-1">
        <p>📅 Available: Tomorrow - {settings?.maxDaysAdvance || 14} days from now</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full gold-gradient"></div>
            <span className="text-xs">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-gold-500"></div>
            <span className="text-xs">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-600 opacity-40"></div>
            <span className="text-xs">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  const handleServiceToggle = (service: Service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.some(s => s.name === service.name) 
        ? prev.services.filter(s => s.name !== service.name) 
        : [...prev.services, { 
            name: service.name, 
            price: service.price, 
            category: service.category, 
            duration: service.duration,
            id: service.id 
          }],
      time: '' 
    }));
    setErrors(prev => ({ ...prev, services: '' }));
  };

  const removeService = (serviceName: string) => {
    setFormData(prev => ({ ...prev, services: prev.services.filter(s => s.name !== serviceName), time: '' }));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'stylist') {
      const selectedStylist = stylists.find(s => s.name === value);
      setFormData(prev => ({ ...prev, stylist: value, stylistId: selectedStylist?.id || '', time: '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    let error = '';
    switch(fieldName) {
      case 'name': error = validateName(formData.name); break;
      case 'email': error = validateEmail(formData.email); break;
      case 'phone': error = validatePhone(formData.phone); break;
      case 'stylist': error = validateStylist(formData.stylist); break;
    }
    if (error) setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep(1)) setStep(2);
      else alert(errors.services || errors.stylist || 'Please fix the errors');
    } else if (step === 2) {
      if (validateStep(2)) setStep(3);
      else alert(errors.date || errors.time || 'Please fix the errors');
    } else {
      handleSendOTP();
    }
  };

  const serviceCount = formData.services.length;
  const appointmentFee = calculateAppointmentFee();
  const totalDuration = calculateTotalDuration();
  const finishingTime = calculateFinishingTime();

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-gold-400 text-xl">Loading services...</div>
      </main>
    );
  }

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <main className="min-h-screen relative">
      <Navbar />

      {isVerifying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-dark-900/90 backdrop-blur-sm">
          <div className="bg-dark-400 border border-gold-600/50 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="text-2xl font-bold gold-text-gradient">Verify Booking</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Enter the 6-digit verification code sent to your email
              </p>
            </div>
            
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-dark-300 border border-gold-600/30 rounded-xl py-4 text-center text-3xl tracking-[0.5em] text-gold-400 focus:outline-none focus:border-gold-500 mb-6 font-mono"
              placeholder="000000"
              autoFocus
            />
            
            <div className="flex gap-4">
              <button onClick={() => { setIsVerifying(false); setOtp(''); }} 
                className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-full font-semibold hover:bg-gray-800">
                Cancel
              </button>
              <button onClick={handleVerifyAndConfirm} disabled={isSendingOtp}
                className="flex-1 gold-gradient text-dark-900 py-3 rounded-full font-semibold hover:shadow-lg disabled:opacity-50">
                {isSendingOtp ? 'Verifying...' : 'Verify & Book'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <section className="relative py-32 bg-dark-400">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3" alt="Booking Background" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="gold-text-gradient">Book Your Appointment</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Schedule your Randu beauty experience with our expert stylists.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'gold-gradient text-dark-900' : 'bg-dark-400 text-gray-500 border border-gold-600/30'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-gold-500' : 'bg-dark-400'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <span className="text-sm text-gray-400">
                Step {step} of 3: {step === 1 ? 'Select Services' : step === 2 ? 'Choose Date & Time' : 'Your Information'}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-dark-400 rounded-3xl border border-gold-600/20 p-8 md:p-12">
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">Select Your Services</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Services (Select multiple) *</label>
                        <div className="space-y-4">
                          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                            <div key={category} className="border border-gold-600/20 rounded-lg overflow-hidden">
                              <button type="button" onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-4 bg-dark-300 hover:bg-dark-200">
                                <div className="flex items-center space-x-3">
                                  <h4 className="text-lg font-semibold text-white">{category}</h4>
                                  <span className="text-sm text-gold-400">({categoryServices.length} services)</span>
                                </div>
                                {openCategories.includes(category) ? <ChevronUp className="w-5 h-5 text-gold-500" /> : <ChevronDown className="w-5 h-5 text-gold-500" />}
                              </button>
                              {openCategories.includes(category) && (
                                <div className="p-4 space-y-2">
                                  {categoryServices.map((service) => (
                                    <label key={service.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                                      formData.services.some(s => s.name === service.name)
                                        ? 'border-gold-500 bg-gold-500/10 border'
                                        : 'border border-gold-600/20 bg-dark-400 hover:border-gold-500/50'
                                    }`}>
                                      <div className="flex items-center flex-1">
                                        <input
                                          type="checkbox"
                                          checked={formData.services.some(s => s.name === service.name)}
                                          onChange={() => handleServiceToggle(service)}
                                          className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 bg-dark-400 border-gold-600/30"
                                        />
                                        <div className="ml-3 flex-1">
                                          <span className="text-white font-medium">{service.name}</span>
                                          <div className="text-sm text-gray-400">{service.duration} min</div>
                                        </div>
                                      </div>
                                      <span className="text-gold-400 font-semibold">Rs.{service.price}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {errors.services && touched.services && (
                          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400">{errors.services}</p>
                          </div>
                        )}
                        {formData.services.length > 0 && (
                          <div className="mt-4 p-3 bg-gold-500/10 rounded-lg border border-gold-500/30">
                            <p className="text-gold-400 text-sm">Selected: {formData.services.length} | Duration: {totalDuration} min</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gold-400 mb-2">Preferred Stylist</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <select
                            name="stylist"
                            value={formData.stylist}
                            onChange={handleFieldChange}
                            onBlur={() => handleBlur('stylist')}
                            className={`w-full bg-white rounded-lg py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 appearance-none cursor-pointer ${
                              errors.stylist && touched.stylist 
                                ? 'border-red-500 border-2' 
                                : 'border border-gray-300 hover:border-gold-500'
                            }`}
                          >
                            <option value="" className="text-gray-500">-- Choose your preferred stylist --</option>
                            {stylists.map((stylist) => (
                              <option key={stylist.id} value={stylist.name} className="text-gray-900">
                                ✨ {stylist.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                        </div>
                        {formData.stylist && !errors.stylist && (
                          <div className="mt-2 flex items-center space-x-2 text-xs text-green-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span>✓ Stylist selected: {formData.stylist}</span>
                          </div>
                        )}
                        {errors.stylist && touched.stylist && (
                          <p className="mt-2 text-sm text-red-500">{errors.stylist}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">Choose Date & Time</h3>
                      {!formData.stylist && (
                        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-400 text-sm">Please select a stylist first</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Date *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            disabled={!formData.stylist}
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-left text-white focus:outline-none focus:border-gold-500 ${
                              !formData.stylist ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-200'
                            }`}
                          >
                            {formData.date || (formData.stylist ? 'Select date' : 'Select stylist first')}
                          </button>
                          <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${formData.stylist ? 'text-gold-500 cursor-pointer' : 'text-gray-500'}`}
                            onClick={() => formData.stylist && setShowCalendar(!showCalendar)} />
                          {showCalendar && formData.stylist && renderCalendar()}
                        </div>
                        {errors.date && <p className="mt-2 text-sm text-red-400">{errors.date}</p>}
                        {formData.date && businessHoursDisplay() && (
                          <p className="mt-2 text-xs text-gold-400">Hours: {businessHoursDisplay()}</p>
                        )}
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Time *</label>
                        {!formData.stylist ? (
                          <div className="p-6 border border-dashed border-yellow-600/30 rounded-xl text-center">
                            <User className="w-8 h-8 text-yellow-500/50 mx-auto mb-2" />
                            <p className="text-yellow-400 text-sm">Select a stylist first</p>
                          </div>
                        ) : !formData.date ? (
                          <div className="p-6 border border-dashed border-gold-600/30 rounded-xl text-center">
                            <Calendar className="w-8 h-8 text-gold-500/50 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Select a date first</p>
                          </div>
                        ) : availableTimeSlots.length === 0 ? (
                          <div className="p-6 border border-dashed border-red-500/30 bg-red-500/5 rounded-xl text-center">
                            <Clock className="w-8 h-8 text-red-500/50 mx-auto mb-2" />
                            <p className="text-red-400 text-sm">No available slots for {formData.stylist} on {formData.date}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto">
                            {availableTimeSlots.map((slot) => (
                              <button
                                type="button"
                                key={slot}
                                onClick={() => { setFormData({ ...formData, time: slot }); setErrors(prev => ({ ...prev, time: '' })); }}
                                className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                                  formData.time === slot
                                    ? 'bg-gold-500 border-gold-500 text-dark-900'
                                    : 'bg-dark-300 border-gold-600/30 text-gray-300 hover:border-gold-500/70'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                        {errors.time && <p className="mt-2 text-sm text-red-400">{errors.time}</p>}
                      </div>

                      {formData.time && formData.services.length > 0 && (
                        <div className="mt-4 p-4 bg-gold-500/10 rounded-lg border border-gold-500/30">
                          <div className="flex justify-between text-sm">
                            <div>
                              <p className="text-gray-400">Total Duration</p>
                              <p className="text-white font-semibold">{totalDuration} min</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Finishing Time</p>
                              <p className="text-gold-400 font-semibold">{finishingTime}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">Your Information</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input type="text" name="name" value={formData.name} onChange={handleFieldChange} onBlur={() => handleBlur('name')}
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 ${
                              errors.name && touched.name ? 'border-red-500' : 'border-gold-600/30'
                            }`} placeholder="Enter your full name" />
                        </div>
                        {errors.name && touched.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input type="email" name="email" value={formData.email} onChange={handleFieldChange} onBlur={() => handleBlur('email')}
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 ${
                              errors.email && touched.email ? 'border-red-500' : 'border-gold-600/30'
                            }`} placeholder="your@email.com" />
                        </div>
                        {errors.email && touched.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input type="tel" name="phone" value={formData.phone} onChange={handleFieldChange} onBlur={() => handleBlur('phone')}
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 ${
                              errors.phone && touched.phone ? 'border-red-500' : 'border-gold-600/30'
                            }`} placeholder="+94 XXX XXX XXX" />
                        </div>
                        {errors.phone && touched.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Special Requests (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={handleFieldChange}
                          rows={3} className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-gold-500 resize-none"
                          placeholder="Any special requests..." />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    {step > 1 && (
                      <button type="button" onClick={() => setStep(step - 1)}
                        className="px-6 py-3 border border-gold-500 text-gold-500 rounded-full font-semibold hover:bg-gold-500 hover:text-dark-900">
                        Previous
                      </button>
                    )}
                    <button type="submit" disabled={isSendingOtp}
                      className={`gold-gradient text-dark-900 px-8 py-3 rounded-full font-semibold hover:shadow-lg ${step === 1 ? 'ml-auto' : ''} ${isSendingOtp ? 'opacity-70' : ''}`}>
                      {isSendingOtp ? 'Sending...' : (step === 3 ? 'Send Verification' : 'Continue')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:w-96">
              <div className="bg-dark-400 rounded-3xl border border-gold-600/20 p-6 sticky top-24">
                <h4 className="font-display text-xl font-bold gold-text-gradient mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Booking Summary</span>
                </h4>
                
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Selected Services</p>
                  {formData.services.length > 0 ? (
                    <div className="space-y-2">
                      {formData.services.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm bg-dark-300 p-2 rounded-lg">
                          <span className="text-white">{service.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gold-400">Rs.{service.price}</span>
                            <button onClick={() => removeService(service.name)} className="text-gray-400 hover:text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No services selected</p>
                  )}
                </div>

                {formData.services.length > 0 && (
                  <div className="border-t border-gold-600/20 pt-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Services Total</span>
                        <span className="text-white">Rs.{formData.services.reduce((sum, s) => sum + s.price, 0)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-gray-400">Appointment Fee</span>
                          <span className="text-xs text-gold-400/70">
                            Rs.{settings?.feePerService || 50}/service
                            {serviceCount > Math.floor((settings?.maxAppointmentFee || 200) / (settings?.feePerService || 50)) && ` (max Rs.${settings?.maxAppointmentFee || 200})`}
                          </span>
                        </div>
                        <span className="text-white">
                          Rs.{appointmentFee}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gold-600/20 font-semibold">
                        <span className="text-gold-400">Total</span>
                        <span className="gold-text-gradient font-bold text-lg">Rs.{calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400">Stylist</p>
                    <p className={`font-semibold ${formData.stylist ? 'text-gold-400' : 'text-red-400'}`}>
                      {formData.stylist || 'Not selected'}
                    </p>
                  </div>
                  {formData.date && <div><p className="text-gray-400">Date</p><p className="text-white">{formData.date}</p></div>}
                  {formData.time && <div><p className="text-gray-400">Time</p><p className="text-white">{formData.time}</p></div>}
                  {formData.name && <div className="pt-3 border-t border-gold-600/20"><p className="text-gray-400">Name</p><p className="text-white">{formData.name}</p></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}