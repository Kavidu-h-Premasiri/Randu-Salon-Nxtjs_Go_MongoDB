'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Mail, Phone, Scissors, CreditCard } from 'lucide-react';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    stylist: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const services = [
    'Precision Haircut',
    'Color & Highlights',
    'Hair Styling',
    'Facial Treatment',
    'Manicure & Pedicure',
    'Bridal Package'
  ];

  const stylists = [
    'Isabella Montgomery',
    'Marcus Chen',
    'Sofia Rodriguez',
    'Any Available Stylist'
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      alert('Thank you for booking! We will send a confirmation email shortly.');
      // Reset form or redirect
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Step {step} of 3: {step === 1 ? 'Select Service' : step === 2 ? 'Choose Date & Time' : 'Your Information'}
              </span>
            </div>
          </div>

          <div className="bg-dark-400 rounded-3xl border border-gold-600/20 p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="font-display text-2xl font-bold gold-text-gradient mb-6">
                    Select Your Service
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Service Type *
                    </label>
                    <div className="relative">
                      <Scissors className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors"
                      >
                        <option value="">Choose a service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
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
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-500" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
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
                        className="w-full bg-dark-300 border border-gold-600/30 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors"
                      >
                        <option value="">Select a time slot</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                        placeholder="(555) 123-4567"
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

          {/* Booking Summary */}
          {step > 1 && (
            <div className="mt-8 p-6 bg-dark-400/50 rounded-2xl border border-gold-600/20">
              <h4 className="font-display text-lg font-bold gold-text-gradient mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Booking Summary</span>
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Service</p>
                  <p className="text-white font-semibold">{formData.service || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date & Time</p>
                  <p className="text-white font-semibold">
                    {formData.date && formData.time ? `${formData.date} at ${formData.time}` : 'Not selected'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Stylist</p>
                  <p className="text-white font-semibold">{formData.stylist || 'Not selected'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}