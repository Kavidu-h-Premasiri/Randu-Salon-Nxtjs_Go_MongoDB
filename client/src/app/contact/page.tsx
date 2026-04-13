'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Thank you for your message! We will get back to you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        alert('Failed to send message: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3"
            alt="Contact Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="gold-text-gradient">Contact Us</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              We&apos;d love to hear from you. Reach out to us for appointments, questions, or just to say hello.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-dark-400 p-8 rounded-2xl border border-gold-600/20 text-center hover:border-gold-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Visit Us</h3>
              <p className="text-gray-400">
                No 17, Punchiwariyapola , Werapola , Wariyapola
              </p>
            </div>

            <div className="bg-dark-400 p-8 rounded-2xl border border-gold-600/20 text-center hover:border-gold-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Call Us</h3>
              <p className="text-gray-400">
                Main: +94 729 852 612<br />
                Booking: +94 729 852 612
              </p>
            </div>

            <div className="bg-dark-400 p-8 rounded-2xl border border-gold-600/20 text-center hover:border-gold-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Email Us</h3>
              <div className="text-gray-400 break-all">
                kavindupremasiri272@gmail.com
              </div>
            </div>

            <div className="bg-dark-400 p-8 rounded-2xl border border-gold-600/20 text-center hover:border-gold-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gold-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Hours</h3>
              <p className="text-gray-400">
                Mon-Fri: 9AM - 8PM<br />
                Sat: 9AM - 6PM<br />
                Sun: 10AM - 4PM
              </p>
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">
                <span className="gold-text-gradient">Send Us a Message</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-dark-400 border border-gold-600/30 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-dark-400 border border-gold-600/30 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-dark-400 border border-gold-600/30 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="+94 729 852 612"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-dark-400 border border-gold-600/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-gold-500 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="appointment">Book Appointment</option>
                      <option value="question">General Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-dark-400 border border-gold-600/30 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="gold-gradient text-dark-900 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div>
              <h2 className="font-display text-3xl font-bold mb-6">
                <span className="gold-text-gradient">Find Us</span>
              </h2>
              <div className="bg-dark-400 p-4 rounded-2xl border border-gold-600/20">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.714895234567!2d-118.408530!3d34.073620!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0x5c6c1e5c6e5c6e5c!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full"
                  />
                </div>
                <div className="mt-6 p-4 bg-dark-300 rounded-lg">
                  <h4 className="text-white font-semibold mb-2 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-gold-500" />
                    <span>Need immediate assistance?</span>
                  </h4>
                  <p className="text-gray-400">
                    Call us at <span className="text-gold-400">+94 729 852 612</span> or use our 
                    <a href="/booking" className="text-gold-500 hover:text-gold-400 ml-1">
                      online booking system
                    </a>.
                  </p>
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