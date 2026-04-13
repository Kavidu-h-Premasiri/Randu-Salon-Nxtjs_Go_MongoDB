'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Award, Users, Clock, ThumbsUp, CheckCircle, ArrowRight } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Clients' },
    { icon: Clock, value: '15+', label: 'Years Experience' },
    { icon: Award, value: '25+', label: 'Expert Stylists' },
    { icon: ThumbsUp, value: '100%', label: 'Satisfaction' },
  ];

  const values = [
    { title: 'Excellence', description: 'We strive for perfection in every service we provide.' },
    { title: 'Innovation', description: 'Staying ahead with the latest techniques and trends.' },
    { title: 'Client Focus', description: 'Your satisfaction and comfort are our top priorities.' },
    { title: 'Quality', description: 'Using only premium products and equipment.' },
  ];

  const team = [
    { name: 'Isabella Montgomery', role: 'Founder & Creative Director', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3' },
    { name: 'Marcus Chen', role: 'Master Stylist', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3' },
    { name: 'Sofia Rodriguez', role: 'Color Specialist', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 bg-dark-400">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3"
            alt="About Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="gold-text-gradient">About Randu Salon</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Where luxury meets expertise. Discover the story behind the most prestigious salon in the city.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                <span className="gold-text-gradient">Our Story</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Founded in 2010, Randu Salon was born from a vision to create a sanctuary where beauty, 
                  luxury, and expertise converge. What started as a small boutique salon has grown into 
                  the city&apos;s most sought-after beauty destination.
                </p>
                <p>
                  Our founder, Isabella Montgomery, a third-generation stylist with a passion for 
                  excellence, set out to redefine the salon experience. With a commitment to using 
                  only premium products and employing the industry&apos;s finest talent, Randu Salon quickly 
                  established itself as the gold standard in beauty services.
                </p>
                <p>
                  Today, we continue to uphold these values, combining timeless techniques with 
                  innovative approaches to deliver exceptional results for every client who walks 
                  through our doors.
                </p>
              </div>
              <Link
                href="/booking"
                className="inline-flex items-center space-x-2 mt-8 gold-gradient text-dark-900 px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300"
              >
                <span>Book Your Experience</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3"
                alt="Salon Interior"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 gold-gradient rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gold-500/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gold-500" />
                  </div>
                  <div className="text-3xl font-bold gold-text-gradient mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gold-text-gradient">Our Core Values</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do at Randu Salon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-dark-300 p-8 rounded-2xl border border-gold-600/20 text-center hover:border-gold-500/50 transition-all duration-300">
                <CheckCircle className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gold-text-gradient">Meet Our Master Stylists</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Industry-leading professionals dedicated to your beauty transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-dark-300 rounded-2xl overflow-hidden border border-gold-600/20 hover:border-gold-500/50 transition-all duration-300 group">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-gold-400">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}