'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Scissors, Palette, Sparkles, SprayCan, Flower, Crown, Clock, Check } from 'lucide-react';

export default function Services() {
  const serviceCategories = [
    {
      id: 'haircuts',
      title: 'Precision Haircuts',
      icon: Scissors,
      description: 'Expert cutting techniques tailored to your unique face shape and style preferences.',
      services: [
        { name: 'Women\'s Haircut & Style', price: 'Rs.600 - Rs.800', duration: '40 min' },
        { name: 'Men\'s Haircut', price: 'Rs.500 - Rs.600', duration: '25 min' },
        { name: 'Children\'s Haircut', price: 'Rs.400 - Rs.450', duration: '30 min' },
        { name: 'Bang Trim', price: 'Rs.200', duration: '15 min' },
      ]
    },
    {
      id: 'coloring',
      title: 'Color & Highlights',
      icon: Palette,
      description: 'Vibrant, long-lasting color treatments using premium organic and ammonia-free products.',
      services: [
        { name: 'Full Color', price: 'Rs.1300 - Rs.1800', duration: '50 min' },
        { name: 'Highlights (Partial)', price: 'Rs.1000 - Rs.1200', duration: '40 min' },
        { name: 'Highlights (Full)', price: 'Rs.1200 - Rs.1400', duration: '60 min' },
        { name: 'Balayage', price: 'Rs.800 - Rs.1000', duration: '180 min' },
        { name: 'Root Touch-Up', price: 'Rs.700 - Rs.800', duration: '60 min' },
      ]
    },
    {
      id: 'styling',
      title: 'Hair Styling',
      icon: SprayCan,
      description: 'Professional styling for any occasion, from everyday looks to special events.',
      services: [
        { name: 'Blowout', price: 'Rs.600 - Rs.800', duration: '45 min' },
        { name: 'Updo/Special Occasion', price: 'Rs.500 - Rs.800', duration: '45 min' },
        { name: 'Curling/Iron Work', price: 'Rs.1200 - Rs.1800', duration: '30 min' },
        { name: 'Hair Extensions (Consultation)', price: 'Rs.400 - Rs.800', duration: '30 min' },
      ]
    },
    {
      id: 'facials',
      title: 'Facial Treatments',
      icon: Sparkles,
      description: 'Rejuvenating facials customized for your unique skin type and concerns.',
      services: [
        { name: 'Classic Facial', price: 'Rs.600 ', duration: '40 min' },
        { name: 'Deep Cleansing Facial', price: 'Rs.800', duration: '35 min' },
        { name: 'Anti-Aging Facial', price: 'Rs.1000', duration: '30 min' },
        { name: 'Hydrating Facial', price: 'Rs.600 - Rs.800', duration: '20 min' },
      ]
    },
    {
      id: 'nails',
      title: 'Manicure & Pedicure',
      icon: Flower,
      description: 'Luxurious nail care with premium polishes and relaxing treatments.',
      services: [
        { name: 'Classic Manicure', price: 'Rs.600 - Rs.800', duration: '15 min' },
        { name: 'Gel Manicure', price: 'Rs.800', duration: '30 min' },
        { name: 'Classic Pedicure', price: 'Rs.650', duration: '20 min' },
        { name: 'Spa Pedicure', price: 'Rs.850', duration: '35 min' },
      ]
    },
    {
      id: 'bridal',
      title: 'Bridal Packages',
      icon: Crown,
      description: 'Complete beauty experience for your special day with trials and consultation included.',
      services: [
        { name: 'Bridal Hair & Makeup Trial', price: 'Rs.3500', duration: '180 min' },
        { name: 'Day-of Bridal Hair & Makeup', price: 'Rs.4000', duration: '240 min' },
        { name: 'Bridal Party Hair', price: 'Rs.3000', duration: '60 min' },
        { name: 'Bridal Party Makeup', price: 'Rs.5000', duration: '45 min' },
      ]
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 bg-dark-400">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.0.3"
            alt="Services Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="gold-text-gradient">Our Premium Services</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Experience world-class beauty treatments delivered by award-winning stylists and technicians.
            </p>
          </div>
        </div>
      </section>

      {/* Services Categories */}
      <section className="py-20 bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} id={category.id} className="scroll-mt-24">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-gold-500" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-bold">
                        <span className="gold-text-gradient">{category.title}</span>
                      </h2>
                      <p className="text-gray-400 mt-2">{category.description}</p>
                    </div>
                  </div>

                  <div className="bg-dark-400 rounded-3xl border border-gold-600/20 overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-gold-600/20">
                      {category.services.map((service, idx) => (
                        <div key={idx} className="p-6 md:p-8 hover:bg-dark-300/50 transition-colors duration-300">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1 text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  <span>{service.duration}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold gold-text-gradient">{service.price}</span>
                              <Link
                                href="/booking"
                                className="gold-gradient text-dark-900 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 text-sm"
                              >
                                Book
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Membership CTA */}
          <div className="mt-16 bg-gradient-to-r from-dark-400 to-dark-300 rounded-3xl p-8 md:p-12 border border-gold-600/30">
            <div className="text-center max-w-3xl mx-auto">
              <Crown className="w-16 h-16 text-gold-500 mx-auto mb-6" />
              <h3 className="font-display text-3xl font-bold mb-4">
                <span className="gold-text-gradient">Join Our VIP Membership</span>
              </h3>
              <p className="text-gray-300 mb-8">
                Get exclusive benefits, priority booking, and special discounts on all services.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {['10% off all services', 'Priority booking', 'Free birthday treatment', 'Exclusive events'].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-dark-500/50 px-4 py-2 rounded-full">
                    <Check className="w-4 h-4 text-gold-500" />
                    <span className="text-sm text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 border-2 border-gold-500 text-gold-500 px-8 py-3 rounded-full font-semibold hover:bg-gold-500 hover:text-dark-900 transition-all duration-300"
              >
                <span>Learn More About Membership</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}