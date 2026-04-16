'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Mail, Phone, CreditCard, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Service data matching the services page
const serviceCategories = [
  {
    id: 'haircuts',
    title: 'Precision Haircuts',
    services: [
      { name: 'Women\'s Haircut & Style', price: 600, priceRange: 'Rs.600 - Rs.800', duration: 40, durationText: '40 min' },
      { name: 'Men\'s Haircut', price: 500, priceRange: 'Rs.500 - Rs.600', duration: 25, durationText: '25 min' },
      { name: 'Children\'s Haircut', price: 400, priceRange: 'Rs.400 - Rs.450', duration: 30, durationText: '30 min' },
      { name: 'Bang Trim', price: 200, priceRange: 'Rs.200', duration: 15, durationText: '15 min' },
    ]
  },
  {
    id: 'coloring',
    title: 'Color & Highlights',
    services: [
      { name: 'Full Color', price: 1300, priceRange: 'Rs.1300 - Rs.1800', duration: 50, durationText: '50 min' },
      { name: 'Highlights (Partial)', price: 1000, priceRange: 'Rs.1000 - Rs.1200', duration: 40, durationText: '40 min' },
      { name: 'Highlights (Full)', price: 1200, priceRange: 'Rs.1200 - Rs.1400', duration: 60, durationText: '60 min' },
      { name: 'Balayage', price: 800, priceRange: 'Rs.800 - Rs.1000', duration: 180, durationText: '180 min' },
      { name: 'Root Touch-Up', price: 700, priceRange: 'Rs.700 - Rs.800', duration: 60, durationText: '60 min' },
    ]
  },
  {
    id: 'styling',
    title: 'Hair Styling',
    services: [
      { name: 'Blowout', price: 600, priceRange: 'Rs.600 - Rs.800', duration: 45, durationText: '45 min' },
      { name: 'Updo/Special Occasion', price: 500, priceRange: 'Rs.500 - Rs.800', duration: 45, durationText: '45 min' },
      { name: 'Curling/Iron Work', price: 1200, priceRange: 'Rs.1200 - Rs.1800', duration: 30, durationText: '30 min' },
      { name: 'Hair Extensions (Consultation)', price: 400, priceRange: 'Rs.400 - Rs.800', duration: 30, durationText: '30 min' },
    ]
  },
  {
    id: 'facials',
    title: 'Facial Treatments',
    services: [
      { name: 'Classic Facial', price: 600, priceRange: 'Rs.600', duration: 40, durationText: '40 min' },
      { name: 'Deep Cleansing Facial', price: 800, priceRange: 'Rs.800', duration: 35, durationText: '35 min' },
      { name: 'Anti-Aging Facial', price: 1000, priceRange: 'Rs.1000', duration: 30, durationText: '30 min' },
      { name: 'Hydrating Facial', price: 600, priceRange: 'Rs.600 - Rs.800', duration: 20, durationText: '20 min' },
    ]
  },
  {
    id: 'nails',
    title: 'Manicure & Pedicure',
    services: [
      { name: 'Classic Manicure', price: 600, priceRange: 'Rs.600 - Rs.800', duration: 15, durationText: '15 min' },
      { name: 'Gel Manicure', price: 800, priceRange: 'Rs.800', duration: 30, durationText: '30 min' },
      { name: 'Classic Pedicure', price: 650, priceRange: 'Rs.650', duration: 20, durationText: '20 min' },
      { name: 'Spa Pedicure', price: 850, priceRange: 'Rs.850', duration: 35, durationText: '35 min' },
    ]
  },
  {
    id: 'bridal',
    title: 'Bridal Packages',
    services: [
      { name: 'Bridal Hair & Makeup Trial', price: 3500, priceRange: 'Rs.3500', duration: 180, durationText: '180 min' },
      { name: 'Day-of Bridal Hair & Makeup', price: 4000, priceRange: 'Rs.4000', duration: 240, durationText: '240 min' },
      { name: 'Bridal Party Hair', price: 3000, priceRange: 'Rs.3000', duration: 60, durationText: '60 min' },
      { name: 'Bridal Party Makeup', price: 5000, priceRange: 'Rs.5000', duration: 45, durationText: '45 min' },
    ]
  }
];

const APPOINTMENT_FEE_PER_SERVICE = 50;
const MAX_APPOINTMENT_FEE = 200;

// Business hours based on day index (0 = Sunday, 1 = Monday, etc.)
const getBusinessHours = (date: Date) => {
  const dayIndex = date.getDay(); 
  switch(dayIndex) {
    case 0: // Sunday
      return { start: '10:00 AM', end: '4:00 PM' };
    case 6: // Saturday
      return { start: '9:00 AM', end: '6:00 PM' };
    default: // Monday to Friday (1-5)
      return { start: '9:00 AM', end: '8:00 PM' };
  }
};

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

// Generate time slots in 30-minute increments
const generateTimeSlots = (startTime: string, endTime: string): string[] => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    const timeStr = `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
    slots.push(timeStr);
  }
  
  return slots;
};

interface BookedSlot {
  stylist: string;
  date: string;
  time: string;
}

export default function Booking() {
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openCategories, setOpenCategories] = useState<string[]>(['haircuts']);
  
  // Error states for validation
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // OTP Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Booked time slots from database
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const [formData, setFormData] = useState({
    services: [] as Array<{ name: string; price: number; category: string; duration: number }>,
    stylist: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const stylists = [
    'Isabella Montgomery',
    'Marcus Chen',
    'Sofia Rodriguez'
  ];

  // Fetch existing bookings from database
  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const response = await fetch('/api/get-bookings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bookings) {
          // Extract only stylist, date, and time from each booking
          const slots: BookedSlot[] = data.bookings.map((booking: any) => ({
            stylist: booking.stylist,
            date: booking.date,
            time: booking.time
          }));
          setBookedSlots(slots);
          console.log('Fetched booked slots:', slots);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, []);

  // Check if a time slot is already booked for the selected stylist and date
  const isTimeSlotBooked = (stylist: string, date: string, time: string): boolean => {
    return bookedSlots.some(
      slot => slot.stylist === stylist && slot.date === date && slot.time === time
    );
  };

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address (e.g., name@example.com)';
    if (email.length > 100) return 'Email must be less than 100 characters';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    if (!phoneRegex.test(phone.trim())) return 'Please enter a valid phone number';
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
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    if (selectedDate > maxDate) return 'Please select a date within the next 14 days';
    return '';
  };

  const validateTime = (time: string, date: string, services: any[], stylist: string) => {
    if (!time) return 'Please select a time slot';
    if (services.length === 0) return 'Please select at least one service';
    if (!stylist) return 'Please select a stylist first';
    
    // Check if time slot is valid for the selected date
    const [year, month, day] = date.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hours = getBusinessHours(selectedDate);
    const startMinutes = timeToMinutes(hours.start);
    const endMinutes = timeToMinutes(hours.end);
    const slotMinutes = timeToMinutes(time);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const finishMinutes = slotMinutes + totalDuration;
    
    if (slotMinutes < startMinutes) return 'Selected time is before business hours';
    if (finishMinutes > endMinutes) return 'Appointment would end after business hours';
    if (slotMinutes > endMinutes - 60) return 'Please select an earlier time slot to complete your services';
    
    // Check if the time slot is already booked for this stylist on this date
    if (isTimeSlotBooked(stylist, date, time)) {
      return `This time slot is already booked for ${stylist}. Please select another time.`;
    }
    
    return '';
  };

  const validateServices = (services: any[]) => {
    if (services.length === 0) return 'Please select at least one service';
    if (services.length > 10) return 'Maximum 10 services can be selected per appointment';
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
      } else if (!formData.stylist) {
        newErrors.stylist = 'Please select a stylist before choosing time';
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
    
    const hours = getBusinessHours(selectedDate);
    const totalDuration = calculateTotalDuration();
    
    const allSlots = generateTimeSlots(hours.start, hours.end);
    
    // Filter available slots - only show slots that are NOT booked and fit within business hours with duration
    return allSlots.filter(slot => {
      const slotMinutes = timeToMinutes(slot);
      const finishMinutes = slotMinutes + totalDuration;
      const endMinutes = timeToMinutes(hours.end);
      const maxStartMinutes = endMinutes - totalDuration;
      
      // Check if slot is within business hours
      const isValidTime = slotMinutes >= timeToMinutes(hours.start) && 
                          slotMinutes <= maxStartMinutes && 
                          finishMinutes <= endMinutes;
      
      if (!isValidTime) return false;
      
      // Check if the slot is already booked for this stylist on this date
      const isBooked = isTimeSlotBooked(formData.stylist, formData.date, slot);
      
      return !isBooked;
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
    const endHours24 = Math.floor(endMinutesTotal / 60) % 24;
    const endMins = endMinutesTotal % 60;
    
    const endPeriod = endHours24 >= 12 ? 'PM' : 'AM';
    let endHours12 = endHours24 % 12;
    if (endHours12 === 0) endHours12 = 12;
    
    return `${endHours12}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
  };

  const calculateAppointmentFee = () => {
    const serviceCount = formData.services.length;
    if (serviceCount === 0) return 0;
    const calculatedFee = serviceCount * APPOINTMENT_FEE_PER_SERVICE;
    return Math.min(calculatedFee, MAX_APPOINTMENT_FEE);
  };

  const calculateTotalPrice = () => {
    const servicesTotal = formData.services.reduce((sum, service) => sum + service.price, 0);
    const appointmentFee = calculateAppointmentFee();
    return servicesTotal + appointmentFee;
  };

  // --- PDF GENERATION LOGIC ---
  const generatePDF = (bookingData: any) => {
    const doc = new jsPDF();
    
    // Background & Theme Colors
    const gold = [212, 175, 55];
    const dark = [18, 18, 18];

    // Header Background
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Title
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(26);
    doc.text('RANDU SALON', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text('OFFICIAL BOOKING RECEIPT', 105, 35, { align: 'center' });

    // Body
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

  // --- SAVE BOOKING TO DATABASE ---
  const saveBookingToDatabase = async (bookingData: any) => {
    try {
      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: bookingData.services,
          stylist: bookingData.stylist,
          date: bookingData.date,
          time: bookingData.time,
          finishingTime: bookingData.finishingTime,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          notes: bookingData.notes,
          totalPrice: bookingData.totalPrice,
          appointmentFee: calculateAppointmentFee(),
          servicesTotal: bookingData.services.reduce((sum: number, s: any) => sum + s.price, 0),
          totalDuration: calculateTotalDuration(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Booking saved to database:', result.bookingId);
        // Refresh bookings after saving
        await fetchBookings();
        return true;
      } else {
        console.error('Failed to save booking:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      return false;
    }
  };

  // --- OTP VERIFICATION LOGIC ---
  const handleSendOTP = async () => {
    // Final validation before sending OTP
    const isValid = validateStep(3);
    if (!isValid) {
      // Mark all fields as touched to show errors
      setTouched({
        name: true,
        email: true,
        phone: true
      });
      return;
    }
    
    setIsSendingOtp(true);
    
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: newOtp,
          name: formData.name || 'Valued Customer'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGeneratedOtp(newOtp);
        setIsVerifying(true);
        alert(`Verification code sent to ${formData.email}. Please check your inbox.`);
      } else {
        throw new Error(data.message || 'Failed to send OTP email');
      }
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Unable to send verification code. Please ensure your backend is correctly configured.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndConfirm = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter the 6-digit verification code');
      return;
    }
    
    if (otp === generatedOtp) {
      const summary = {
        ...formData,
        finishingTime: calculateFinishingTime(),
        totalPrice: calculateTotalPrice(),
      };
      
      // Save to MongoDB via Go backend
      const saved = await saveBookingToDatabase(summary);
      
      if (saved) {
        generatePDF(summary);
        alert('Booking Confirmed successfully! Your receipt has been downloaded and booking has been saved.');
        setIsVerifying(false);
        
        // Reset form
        setStep(1);
        setFormData({
          services: [],
          stylist: '',
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
      } else {
        alert('Booking confirmed but failed to save to database. Please contact support.');
      }
    } else {
      alert('Invalid OTP. Please try again.');
      setOtp('');
    }
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const getBusinessHoursDisplay = () => {
    if (!formData.date) return null;
    const [year, month, day] = formData.date.split('-');
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hours = getBusinessHours(selectedDate);
    return `${hours.start} - ${hours.end}`;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();
    maxDate.setHours(0, 0, 0, 0);
    
    if (date <= today || date > maxDate) return false;
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
      setFormData({
        ...formData,
        date: formatDate(date),
        time: ''
      });
      setErrors(prev => ({ ...prev, date: '', time: '' }));
      setShowCalendar(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + increment);
    
    const today = new Date();
    const maxDate = getMaxDate();
    
    if (newMonth > maxDate) return;
    if (newMonth < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();
    maxDate.setHours(0, 0, 0, 0);

    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      const isSelectable = isDateSelectable(currentDate);
      const isSelected = formData.date === formatDate(currentDate);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(currentDate)}
          disabled={!isSelectable}
          className={`h-10 w-10 rounded-full transition-all duration-200 ${
            isSelectable
              ? isSelected
                ? 'gold-gradient text-dark-900 font-semibold'
                : 'hover:bg-gold-500/20 text-white'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-dark-300 rounded-xl border border-gold-600/30 p-6 absolute top-full mt-2 left-0 z-20 w-80 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-gold-500/20 rounded-full transition-colors"
            disabled={currentMonth <= new Date()}
          >
            <ChevronLeft className="w-5 h-5 text-gold-500" />
          </button>
          <span className="text-white font-semibold">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-gold-500/20 rounded-full transition-colors"
            disabled={currentMonth >= maxDate}
          >
            <ChevronRight className="w-5 h-5 text-gold-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>Available: Tomorrow - 2 weeks from now</p>
          <p className="mt-1">Mon-Fri: 9AM - 8PM | Sat: 9AM - 6PM | Sun: 10AM - 4PM</p>
        </div>
      </div>
    );
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleServiceToggle = (service: { name: string; price: number; category: string; duration: number }) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.some(s => s.name === service.name)
        ? prev.services.filter(s => s.name !== service.name)
        : [...prev.services, service],
      time: '' 
    }));
    setErrors(prev => ({ ...prev, services: '' }));
  };

  const removeService = (serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.name !== serviceName),
      time: '' 
    }));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Reset time when stylist changes
    if (name === 'stylist') {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate on blur
    let error = '';
    switch(fieldName) {
      case 'name':
        error = validateName(formData.name);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      case 'stylist':
        error = validateStylist(formData.stylist);
        break;
    }
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (validateStep(1)) {
        setStep(2);
      } else {
        // Show specific error messages
        if (errors.services) {
          alert(errors.services);
        } else if (errors.stylist) {
          alert(errors.stylist);
        } else {
          alert('Please fix the errors before proceeding');
        }
      }
    } else if (step === 2) {
      if (validateStep(2)) {
        setStep(3);
      } else {
        alert(errors.date || errors.time || errors.stylist || 'Please fix the errors before proceeding');
      }
    } else {
      handleSendOTP();
    }
  };

  const serviceCount = formData.services.length;
  const appointmentFee = calculateAppointmentFee();
  const totalDuration = calculateTotalDuration();
  const finishingTime = calculateFinishingTime();
  const businessHours = getBusinessHoursDisplay();

  return (
    <main className="min-h-screen relative">
      <Navbar />

      {/* OTP Verification Modal Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-dark-900/90 backdrop-blur-sm">
          <div className="bg-dark-400 border border-gold-600/50 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="text-2xl font-bold gold-text-gradient">Verify Booking</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Enter the 6-digit verification code sent to your email to confirm your booking
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
              <button 
                onClick={() => {
                  setIsVerifying(false);
                  setOtp('');
                }}
                className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-full font-semibold hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerifyAndConfirm}
                className="flex-1 gold-gradient text-dark-900 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all"
              >
                Verify & Book
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative py-32 bg-dark-400">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3"
            alt="Booking Background"
            className="w-full h-full object-cover opacity-20"
          />
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

      {/* Booking Form */}
      <section className="py-20 bg-dark-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'gold-gradient text-dark-900' : 'bg-dark-400 text-gray-500 border border-gold-600/30'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step > s ? 'bg-gold-500' : 'bg-dark-400'
                    }`} />
                  )}
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
            {/* Main Form */}
            <div className="flex-1">
              <div className="bg-dark-400 rounded-3xl border border-gold-600/20 p-8 md:p-12">
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">
                        Select Your Services
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Services (Select multiple from dropdowns) *
                        </label>
                        <div className="space-y-4">
                          {serviceCategories.map((category) => (
                            <div key={category.id} className="border border-gold-600/20 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between p-4 bg-dark-300 hover:bg-dark-200 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <h4 className="text-lg font-semibold text-white">{category.title}</h4>
                                  <span className="text-sm text-gold-400">
                                    ({category.services.length} services)
                                  </span>
                                </div>
                                {openCategories.includes(category.id) ? (
                                  <ChevronUp className="w-5 h-5 text-gold-500" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gold-500" />
                                )}
                              </button>
                              
                              {openCategories.includes(category.id) && (
                                <div className="p-4 space-y-2">
                                  {category.services.map((service) => (
                                    <label
                                      key={service.name}
                                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                                        formData.services.some(s => s.name === service.name)
                                          ? 'border-gold-500 bg-gold-500/10 border'
                                          : 'border border-gold-600/20 bg-dark-400 hover:border-gold-500/50'
                                      }`}
                                    >
                                      <div className="flex items-center flex-1">
                                        <input
                                          type="checkbox"
                                          checked={formData.services.some(s => s.name === service.name)}
                                          onChange={() => handleServiceToggle({
                                            name: service.name,
                                            price: service.price,
                                            category: category.title,
                                            duration: service.duration
                                          })}
                                          className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500 bg-dark-400 border-gold-600/30"
                                        />
                                        <div className="ml-3 flex-1">
                                          <span className="text-white font-medium">{service.name}</span>
                                          <div className="text-sm text-gray-400">{service.durationText}</div>
                                        </div>
                                      </div>
                                      <span className="text-gold-400 font-semibold">{service.priceRange}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {errors.services && touched.services && (
                          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{errors.services}</p>
                          </div>
                        )}
                        
                        {formData.services.length > 0 && (
                          <div className="mt-4 p-3 bg-gold-500/10 rounded-lg border border-gold-500/30">
                            <p className="text-gold-400 text-sm">
                              Selected services: {formData.services.length} | Total duration: {totalDuration} minutes
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Preferred Stylist *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <select
                            name="stylist"
                            value={formData.stylist}
                            onChange={handleFieldChange}
                            onBlur={() => handleBlur('stylist')}
                            className={`w-full bg-dark-300 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer ${
                              errors.stylist && touched.stylist 
                                ? 'border-red-500 border-2 bg-red-500/5' 
                                : formData.stylist 
                                  ? 'border-gold-500 border bg-gold-500/5'
                                  : 'border border-gold-600/30'
                            }`}
                          >
                            <option value="" className="text-gray-400">-- Choose your preferred stylist --</option>
                            {stylists.map((stylist) => (
                              <option key={stylist} value={stylist} className="text-white">
                                ✨ {stylist}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500 pointer-events-none" />
                        </div>
                        
                        {/* Beautiful Stylist Error Message */}
                        {errors.stylist && touched.stylist && (
                          <div className="mt-3 animate-slide-down">
                            <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 border-l-4 border-red-500 rounded-r-lg p-3 flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-400">Stylist Selection Required</p>
                                <p className="text-xs text-red-300/80 mt-0.5">{errors.stylist}</p>
                                <p className="text-xs text-gray-400 mt-1.5 flex items-center space-x-1">
                                  <span>💡</span>
                                  <span>Choose from our expert stylists to ensure the best experience</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Success Message when stylist is selected */}
                        {formData.stylist && !errors.stylist && (
                          <div className="mt-2 flex items-center space-x-2 text-xs text-green-400">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span>✓ Stylist selected: {formData.stylist}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">
                        Choose Date & Time
                      </h3>
                      
                      {!formData.stylist && (
                        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-400 text-sm flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Please select a stylist first to see available time slots</span>
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Select Date *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            disabled={!formData.stylist}
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-left text-white focus:outline-none focus:border-gold-500 transition-colors ${
                              !formData.stylist 
                                ? 'opacity-50 cursor-not-allowed border-gold-600/30'
                                : errors.date 
                                  ? 'border-red-500 hover:bg-dark-200' 
                                  : 'border-gold-600/30 hover:bg-dark-200'
                            }`}
                          >
                            {formData.date || (formData.stylist ? 'Click calendar icon to select date' : 'Select a stylist first')}
                          </button>
                          <Calendar 
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                              formData.stylist ? 'text-gold-500 cursor-pointer' : 'text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={() => formData.stylist && setShowCalendar(!showCalendar)}
                          />
                          {formData.date && (
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, date: '', time: ''})}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              <X className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                          )}
                          {showCalendar && formData.stylist && renderCalendar()}
                        </div>
                        {errors.date && <p className="mt-2 text-sm text-red-400">{errors.date}</p>}
                        {formData.date && businessHours && (
                          <p className="mt-2 text-xs text-gold-400">
                            Business hours: {businessHours}
                          </p>
                        )}
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Select Time *
                          </label>
                          {formData.date && formData.stylist && availableTimeSlots.length > 0 && (
                            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                              {availableTimeSlots.length} slots available for {formData.stylist}
                            </span>
                          )}
                          {formData.date && formData.stylist && availableTimeSlots.length === 0 && (
                            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                              No available slots
                            </span>
                          )}
                        </div>

                        {!formData.stylist ? (
                          <div className="p-6 border border-dashed border-yellow-600/30 rounded-xl text-center bg-yellow-500/5">
                            <User className="w-8 h-8 text-yellow-500/50 mx-auto mb-2" />
                            <p className="text-yellow-400 text-sm">Please select a stylist first to see available time slots.</p>
                          </div>
                        ) : !formData.date ? (
                          <div className="p-6 border border-dashed border-gold-600/30 rounded-xl text-center">
                            <Calendar className="w-8 h-8 text-gold-500/50 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Please select a date to see available times for {formData.stylist}.</p>
                          </div>
                        ) : availableTimeSlots.length === 0 ? (
                          <div className="p-6 border border-dashed border-red-500/30 bg-red-500/5 rounded-xl text-center">
                            <Clock className="w-8 h-8 text-red-500/50 mx-auto mb-2" />
                            <p className="text-red-400 text-sm">
                              No available time slots for {formData.stylist} on {formData.date}. <br/>
                              Please choose another date or select a different stylist.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                              {availableTimeSlots.map((slot) => {
                                const isBooked = isTimeSlotBooked(formData.stylist, formData.date, slot);
                                return (
                                  <button
                                    type="button"
                                    key={slot}
                                    onClick={() => {
                                      if (!isBooked) {
                                        setFormData({ ...formData, time: slot });
                                        setErrors(prev => ({ ...prev, time: '' }));
                                      }
                                    }}
                                    disabled={isBooked}
                                    className={`p-3 rounded-xl text-sm font-medium border transition-all duration-200 flex items-center justify-center ${
                                      formData.time === slot
                                        ? 'bg-gold-500 border-gold-500 text-dark-900 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                                        : isBooked
                                          ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed line-through'
                                          : 'bg-dark-300 border-gold-600/30 text-gray-300 hover:border-gold-500/70 hover:text-white hover:bg-dark-200'
                                    }`}
                                  >
                                    {slot}
                                    {isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                                  </button>
                                );
                              })}
                            </div>
                            {errors.time && <p className="mt-2 text-sm text-red-400">{errors.time}</p>}
                            {availableTimeSlots.length > 0 && (
                              <p className="mt-3 text-xs text-gray-400 text-center">
                                Showing available slots for {formData.stylist} on {formData.date}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Duration and Finishing Time Display */}
                      {formData.time && formData.services.length > 0 && (
                        <div className="mt-4 p-4 bg-gold-500/10 rounded-lg border border-gold-500/30">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <p className="text-gray-400">Total Duration</p>
                              <p className="text-white font-semibold">{totalDuration} minutes</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400">Estimated Finishing Time</p>
                              <p className="text-gold-400 font-semibold text-lg">{finishingTime}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gold-500/20">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>Start: {formData.time}</span>
                              <span>→</span>
                              <span>End: {finishingTime}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">
                        Your Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFieldChange}
                            onBlur={() => handleBlur('name')}
                            required
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors ${
                              errors.name && touched.name ? 'border-red-500' : 'border-gold-600/30'
                            }`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {errors.name && touched.name && (
                          <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFieldChange}
                            onBlur={() => handleBlur('email')}
                            required
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors ${
                              errors.email && touched.email ? 'border-red-500' : 'border-gold-600/30'
                            }`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && touched.email && (
                          <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFieldChange}
                            onBlur={() => handleBlur('phone')}
                            required
                            className={`w-full bg-dark-300 border rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors ${
                              errors.phone && touched.phone ? 'border-red-500' : 'border-gold-600/30'
                            }`}
                            placeholder="+94 XXX XXX XXX"
                          />
                        </div>
                        {errors.phone && touched.phone && (
                          <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Special Requests or Notes (Optional)
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleFieldChange}
                          rows={3}
                          className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                          placeholder="Any special requests or notes for your stylist..."
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Max 500 characters
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-3 border border-gold-500 text-gold-500 rounded-full font-semibold hover:bg-gold-500 hover:text-dark-900 transition-all duration-300"
                      >
                        Previous
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className={`gold-gradient text-dark-900 px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 ${
                        step === 1 ? 'ml-auto' : ''
                      } ${isSendingOtp ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSendingOtp ? 'Sending Code...' : (step === 3 ? 'Send Verification Code' : 'Continue')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:w-96">
              <div className="bg-dark-400 rounded-3xl border border-gold-600/20 p-6 sticky top-24">
                <h4 className="font-display text-xl font-bold gold-text-gradient mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Booking Summary</span>
                </h4>
                
                {/* Selected Services */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Selected Services</p>
                  {formData.services.length > 0 ? (
                    <div className="space-y-2">
                      {formData.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-dark-300 p-2 rounded-lg">
                          <div className="flex-1">
                            <span className="text-white">{service.name}</span>
                            <span className="text-xs text-gray-400 ml-2">({service.duration} min)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gold-400">Rs.{service.price}</span>
                            <button
                              type="button"
                              onClick={() => removeService(service.name)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
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

                {/* Duration Info */}
                {formData.services.length > 0 && (
                  <div className="mb-4 p-3 bg-dark-300 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Duration</span>
                      <span className="text-white font-semibold">{totalDuration} minutes</span>
                    </div>
                    {formData.time && finishingTime && (
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gold-600/20">
                        <span className="text-gray-400">Time Slot</span>
                        <span className="text-gold-400 font-semibold">
                          {formData.time} - {finishingTime}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
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
                            Rs.{APPOINTMENT_FEE_PER_SERVICE}/service
                            {serviceCount > 3 && ` (max Rs.${MAX_APPOINTMENT_FEE})`}
                          </span>
                        </div>
                        <span className="text-white">
                          Rs.{appointmentFee}
                          {serviceCount > 3 && (
                            <span className="text-xs text-gold-400 ml-1">
                              (was Rs.{serviceCount * APPOINTMENT_FEE_PER_SERVICE})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gold-600/20 font-semibold">
                        <span className="text-gold-400">Total</span>
                        <span className="gold-text-gradient font-bold text-lg">Rs.{calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment Fee Info Box */}
                {serviceCount > 0 && (
                  <div className="mb-4 p-3 bg-gold-500/5 rounded-lg border border-gold-500/20">
                    <p className="text-xs text-gray-400">
                      💡 {serviceCount === 1 ? 'Appointment fee: Rs.50 per service' : 
                          serviceCount === 2 ? 'Appointment fee: Rs.50 per service (Total: Rs.100)' :
                          serviceCount === 3 ? 'Appointment fee: Rs.50 per service (Total: Rs.150)' :
                          `Appointment fee capped at Rs.${MAX_APPOINTMENT_FEE} for ${serviceCount} services (You save Rs.${serviceCount * APPOINTMENT_FEE_PER_SERVICE - MAX_APPOINTMENT_FEE})`}
                    </p>
                  </div>
                )}

                {/* Other Details */}
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400">Stylist</p>
                    <p className={`font-semibold ${formData.stylist ? 'text-gold-400' : 'text-red-400'}`}>
                      {formData.stylist || 'Not selected'}
                    </p>
                    {!formData.stylist && (
                      <p className="text-xs text-red-400/70 mt-1">⚠️ Please select a stylist</p>
                    )}
                  </div>
                  {formData.date && (
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="text-white font-semibold">{formData.date}</p>
                    </div>
                  )}
                  {formData.time && (
                    <div>
                      <p className="text-gray-400">Time</p>
                      <p className="text-white font-semibold">{formData.time}</p>
                    </div>
                  )}

                  {/* Dynamically added User Information */}
                  {formData.name && (
                    <div className="pt-3 border-t border-gold-600/20">
                      <p className="text-gray-400">Name</p>
                      <p className="text-white font-semibold">{formData.name}</p>
                    </div>
                  )}
                  {formData.email && (
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="text-white font-semibold">{formData.email}</p>
                    </div>
                  )}
                  {formData.phone && (
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="text-white font-semibold">{formData.phone}</p>
                    </div>
                  )}
                  {formData.notes && (
                    <div>
                      <p className="text-gray-400">Notes</p>
                      <p className="text-white font-semibold break-words">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}