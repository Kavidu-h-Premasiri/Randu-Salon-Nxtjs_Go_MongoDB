import Link from 'next/link';
import { Scissors,  Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-600 border-t border-gold-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <Scissors className="w-8 h-8 text-gold-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-display font-bold gold-text-gradient">
                RANDU SALON
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              Elevating beauty standards with premium services and expert care in an atmosphere of luxury and sophistication.
            </p>
            
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'About Us', href: '/about' },
                { name: 'Services', href: '/services' },
                { name: 'Gallery', href: '/gallery' },
                { name: 'Contact', href: '/contact' },
                { name: 'Book Appointment', href: '/booking' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-gold-500 transition-colors duration-300">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-display text-lg font-bold mb-4">Our Services</h4>
            <ul className="space-y-3">
              <li><Link href="/services#haircuts" className="text-gray-400 hover:text-gold-500 transition-colors duration-300">Precision Haircuts</Link></li>
              <li><Link href="/services#coloring" className="text-gray-400 hover:text-gold-500 transition-colors duration-300">Color & Highlights</Link></li>
              <li><Link href="/services#styling" className="text-gray-400 hover:text-gold-500 transition-colors duration-300">Hair Styling</Link></li>
              <li><Link href="/services#facials" className="text-gray-400 hover:text-gold-500 transition-colors duration-300">Facial Treatments</Link></li>
              <li><Link href="/services#nails" className="text-gray-400 hover:text-gold-500 transition-colors duration-300">Manicure & Pedicure</Link></li>
              <li><Link href="/services#bridal" className="text-gray-400 hover:text-gold-500 transition-colors duration-300">Bridal Packages</Link></li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-white font-display text-lg font-bold mb-4">Contact & Hours</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-1" />
                <span className="text-gray-400">Randu Salon, No 41 , New Shopping Mall , First Floor , Wariyapola</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="text-gray-400">+94 729 852 612</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="text-gray-400">kavindupremasiri272@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gold-500 flex-shrink-0 mt-1" />
                <div className="text-gray-400">
                  <p>Mon - Fri: 9AM - 8PM</p>
                  <p>Saturday: 9AM - 6PM</p>
                  <p>Sunday: 10AM - 4PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gold-600/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Randu Salon. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-gold-500 text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-gold-500 text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-gold-500 text-sm transition-colors duration-300">
                FAQ
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              Designed with <span className="text-gold-500">♥</span> for beauty enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;