'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Mail, Phone, CreditCard, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

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

// Business hours configuration
// Monday to Friday: 9:00 AM - 8:00 PM
// Saturday: 9:00 AM - 6:00 PM
// Sunday: 10:00 AM - 4:00 PM
const BUSINESS_HOURS: { [key: string]: { start: string; end: string } } = {
  'Monday': { start: '9:00 AM', end: '8:00 PM' },
  'Tuesday': { start: '9:00 AM', end: '8:00 PM' },
  'Wednesday': { start: '9:00 AM', end: '8:00 PM' },
  'Thursday': { start: '9:00 AM', end: '8:00 PM' },
  'Friday': { start: '9:00 AM', end: '8:00 PM' },
  'Saturday': { start: '9:00 AM', end: '6:00 PM' },
  'Sunday': { start: '10:00 AM', end: '4:00 PM' }
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

export default function Booking() {
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openCategories, setOpenCategories] = useState<string[]>(['haircuts']);
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
    'Sofia Rodriguez',
    'Any Available Stylist'
  ];

  // Calculate total duration in minutes
  const calculateTotalDuration = () => {
    return formData.services.reduce((sum, service) => sum + service.duration, 0);
  };

  // Generate available time slots based on selected date
  const getAvailableTimeSlots = () => {
    if (!formData.date) return [];
    
    const selectedDate = new Date(formData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = BUSINESS_HOURS[dayName];
    
    if (!hours) return [];
    
    const startMinutes = timeToMinutes(hours.start);
    const endMinutes = timeToMinutes(hours.end);
    const totalDuration = calculateTotalDuration();
    
    // Generate all possible time slots (in 1-hour increments)
    const allSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
      '5:00 PM', '6:00 PM', '7:00 PM'
    ];
    
    // Filter slots based on business hours and ensure appointment finishes before closing
    return allSlots.filter(slot => {
      const slotMinutes = timeToMinutes(slot);
      const finishMinutes = slotMinutes + totalDuration;
      
      // Check if slot is within business hours and appointment finishes before closing
      return slotMinutes >= startMinutes && finishMinutes <= endMinutes;
    });
  };

  // Calculate finishing time based on start time and total duration
  const calculateFinishingTime = () => {
    if (!formData.time || formData.services.length === 0) return null;
    
    const totalDuration = calculateTotalDuration();
    const startTime = formData.time;
    
    // Parse start time
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // Calculate end time
    const endMinutesTotal = hours * 60 + minutes + totalDuration;
    const endHours24 = Math.floor(endMinutesTotal / 60) % 24;
    const endMins = endMinutesTotal % 60;
    
    // Convert back to 12-hour format
    const endPeriod = endHours24 >= 12 ? 'PM' : 'AM';
    let endHours12 = endHours24 % 12;
    if (endHours12 === 0) endHours12 = 12;
    
    return `${endHours12}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
  };

  // Calculate appointment fee based on number of services
  const calculateAppointmentFee = () => {
    const serviceCount = formData.services.length;
    if (serviceCount === 0) return 0;
    const calculatedFee = serviceCount * APPOINTMENT_FEE_PER_SERVICE;
    return Math.min(calculatedFee, MAX_APPOINTMENT_FEE);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const servicesTotal = formData.services.reduce((sum, service) => sum + service.price, 0);
    const appointmentFee = calculateAppointmentFee();
    return servicesTotal + appointmentFee;
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Get business hours display for selected date
  const getBusinessHoursDisplay = () => {
    if (!formData.date) return null;
    const selectedDate = new Date(formData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = BUSINESS_HOURS[dayName];
    if (!hours) return null;
    return `${hours.start} - ${hours.end}`;
  };

  // Date helper functions
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
    
    // Check if date is within range
    if (date <= today || date > maxDate) return false;
    
    // Check if date is a valid business day
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return BUSINESS_HOURS.hasOwnProperty(dayName);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      // Reset time when date changes
      setFormData({
        ...formData,
        date: formatDate(date),
        time: ''
      });
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
      <div className="bg-dark-300 rounded-xl border border-gold-600/30 p-6 absolute top-full mt-2 left-0 z-20 w-80">
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
      time: '' // Reset time when services change as duration affects available slots
    }));
  };

  const removeService = (serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.name !== serviceName),
      time: '' // Reset time when services change as duration affects available slots
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.services.length === 0) {
        alert('Please select at least one service');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.date || !formData.time) {
        alert('Please select both date and time');
        return;
      }
      setStep(3);
    } else {
      const finishingTime = calculateFinishingTime();
      const bookingSummary = {
        services: formData.services,
        stylist: formData.stylist,
        date: formData.date,
        time: formData.time,
        finishingTime: finishingTime,
        totalDuration: calculateTotalDuration(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        totalPrice: calculateTotalPrice()
      };
      console.log('Booking submitted:', bookingSummary);
      alert(`Thank you for booking! We will send a confirmation email to ${formData.email} shortly.\n\nServices booked: ${formData.services.map(s => s.name).join(', ')}\nStart Time: ${formData.time}\nFinishing Time: ${finishingTime}\nTotal Duration: ${calculateTotalDuration()} minutes\nTotal: Rs.${calculateTotalPrice()}`);
      // Reset form or redirect here
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const serviceCount = formData.services.length;
  const appointmentFee = calculateAppointmentFee();
  const totalDuration = calculateTotalDuration();
  const finishingTime = calculateFinishingTime();
  const businessHours = getBusinessHoursDisplay();

  return (
    <main className="min-h-screen">
      <Navbar />
      
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
              Schedule your luxury beauty experience with our expert stylists.
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
                          Preferred Stylist
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <select
                            name="stylist"
                            value={formData.stylist}
                            onChange={handleChange}
                            className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors"
                          >
                            <option value="">Choose a stylist</option>
                            {stylists.map((stylist) => (
                              <option key={stylist} value={stylist}>{stylist}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">
                        Choose Date & Time
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Select Date *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-left text-white focus:outline-none focus:border-gold-500 transition-colors hover:bg-dark-200"
                          >
                            {formData.date || 'Click calendar icon to select date'}
                          </button>
                          <Calendar 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500 cursor-pointer"
                            onClick={() => setShowCalendar(!showCalendar)}
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
                          {showCalendar && renderCalendar()}
                        </div>
                        {formData.date && businessHours && (
                          <p className="mt-2 text-xs text-gold-400">
                            Business hours: {businessHours}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Select Time *
                        </label>
                        <div className="relative mb-4">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <select
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            disabled={availableTimeSlots.length === 0}
                            className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select a time slot</option>
                            {availableTimeSlots.map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                        {formData.date && availableTimeSlots.length === 0 && formData.services.length > 0 && (
                          <p className="text-red-400 text-sm mt-2">
                            No available time slots for the selected date and service duration. Please choose another date.
                          </p>
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
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                            placeholder="Enter your full name"
                          />
                        </div>
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
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                            placeholder="your@email.com"
                          />
                        </div>
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
                            onChange={handleChange}
                            required
                            className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                            placeholder="+94 XXX XXX XXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Special Requests or Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                          placeholder="Any special requests or notes for your stylist..."
                        />
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
                      className={`gold-gradient text-dark-900 px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 ${
                        step === 1 ? 'ml-auto' : ''
                      }`}
                    >
                      {step === 3 ? 'Confirm Booking' : 'Continue'}
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
                    <p className="text-white font-semibold">{formData.stylist || 'Not selected'}</p>
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