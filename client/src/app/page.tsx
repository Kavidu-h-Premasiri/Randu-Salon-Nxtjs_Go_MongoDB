'use client';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Link from 'next/link';
import { Star, Clock, MapPin, Scissors, Sparkles, Palette, SprayCan, Flower, Crown, ArrowRight } from 'lucide-react';

export default function Home() {
  const services = [
    {
      icon: Scissors,
      title: 'Precision Haircut',
      description: 'Expert cutting techniques tailored to your face shape and style preferences.',
      price: 'Rs.200+',
      featured: true,
      link: '/services#haircuts'
    },
    {
      icon: Palette,
      title: 'Color & Highlights',
      description: 'Vibrant, long-lasting color treatments using premium organic products.',
      price: 'Rs.700+',
      featured: true,
      link: '/services#coloring'
    },
    {
      icon: Sparkles,
      title: 'Facial Treatments',
      description: 'Rejuvenating facials customized for your unique skin type and concerns.',
      price: 'Rs.400+',
      featured: false,
      link: '/services#facials'
    },
    {
      icon: SprayCan,
      title: 'Hair Styling',
      description: 'Professional blowouts, updos, and special occasion styling.',
      price: 'Rs.600+',
      featured: false,
      link: '/services#styling'
    },
    {
      icon: Flower,
      title: 'Manicure & Pedicure',
      description: 'Luxurious nail care with premium polishes and treatments.',
      price: 'Rs.300+',
      featured: false,
      link: '/services#nails'
    },
    {
      icon: Crown,
      title: 'Bridal Package',
      description: 'Complete beauty experience for your special day with trials included.',
      price: 'Rs.3000+',
      featured: true,
      link: '/services#bridal'
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3"
            alt="Salon Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 to-dark-900/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="flex items-center space-x-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold-500 fill-current" />
                ))}
                <span className="text-gold-400 ml-2">5.0 (500+ Reviews)</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="text-white">Elevate Your</span>
                <br />
                <span className="gold-text-gradient">Beauty Experience</span>
              </h1>

              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                Indulge in luxury grooming and styling services tailored to enhance your natural beauty. 
                Experience the perfect blend of elegance and expertise.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/booking"
                  className="gold-gradient text-dark-900 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 text-lg hover:scale-105 transform text-center"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-gold-500 text-gold-500 px-8 py-4 rounded-full font-semibold hover:bg-gold-500 hover:text-dark-900 transition-all duration-300 text-lg text-center"
                >
                  View Services
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-gold-500" />
                  <div>
                    <p className="text-sm text-gray-400">Open Hours</p>
                    <p className="text-white font-semibold">Mon - Sat: 9AM - 8PM</p>
                  </div>
                </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Location</p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    Randu Salon, No 41 , New Shopping Mall , First Floor , Wariyapola
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-dark-400/30 backdrop-blur-md p-8 rounded-3xl border border-gold-600/30">
                <h3 className="text-2xl font-display font-bold gold-text-gradient mb-6">
                  Premium Services
                </h3>
                <div className="space-y-4">
                  {services.slice(0, 5).map((service, idx) => {
                    const Icon = service.icon;
                    return (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-gold-600/20 last:border-0">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gold-500" />
                          <span className="text-gray-200">{service.title}</span>
                        </div>
                        <span className="text-gold-400 font-semibold">{service.price}</span>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/services"
                  className="mt-6 w-full border border-gold-500 text-gold-500 px-6 py-3 rounded-full font-semibold hover:bg-gold-500 hover:text-dark-900 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>View All Services</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gold-text-gradient">Our Premium Services</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience world-class beauty treatments delivered by award-winning stylists and technicians.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-dark-300 p-8 rounded-2xl border border-gold-600/20 hover:border-gold-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/10"
                >
                  {service.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="gold-gradient text-dark-900 text-xs font-bold px-3 py-1 rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-xl flex items-center justify-center group-hover:bg-gold-500/20 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-gold-500" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold gold-text-gradient">
                      {service.price}
                    </span>
                    <Link
                      href={service.link}
                      className="text-gold-500 hover:text-gold-400 font-semibold transition-colors duration-300 flex items-center space-x-1 group"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-dark-600 to-dark-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-text-gradient">Ready for Your Transformation?</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Book your appointment today and experience the luxury you deserve.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center space-x-2 gold-gradient text-dark-900 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 text-lg hover:scale-105 transform"
          >
            <span>Book Your Appointment</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}