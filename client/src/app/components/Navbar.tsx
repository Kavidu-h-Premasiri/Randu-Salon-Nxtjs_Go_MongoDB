'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Scissors, ChevronDown, Shield } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  dropdown?: NavItem[];
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { 
      name: 'Services', 
      href: '/services',
      dropdown: [
        { name: 'Haircuts', href: '/services#haircuts' },
        { name: 'Coloring', href: '/services#coloring' },
        { name: 'Styling', href: '/services#styling' },
        { name: 'Facials', href: '/services#facials' },
        { name: 'Nails', href: '/services#nails' },
      ]
    },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-dark-500/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    } border-b border-gold-600/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Scissors className="w-8 h-8 text-gold-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-display font-bold gold-text-gradient">
              RANDU SALON
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      className={`flex items-center space-x-1 font-medium transition-colors duration-300 ${
                        isActive(item.href) 
                          ? 'text-gold-500' 
                          : 'text-gray-300 hover:text-gold-500'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-dark-400 rounded-lg shadow-xl border border-gold-600/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-3 text-gray-300 hover:text-gold-500 hover:bg-dark-300 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`font-medium transition-colors duration-300 ${
                      isActive(item.href) 
                        ? 'text-gold-500' 
                        : 'text-gray-300 hover:text-gold-500'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Admin Login Link - Desktop */}
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/50 text-gold-400 hover:text-gold-300 hover:border-gold-400 hover:bg-gold-500/10 transition-all duration-300 font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
            
            <Link
              href="/booking"
              className="gold-gradient text-dark-900 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300 hover:scale-105 transform"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gold-500 hover:text-gold-400 transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gold-600/20 animate-fade-in">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      className="w-full text-left py-3 text-gray-300 hover:text-gold-500 transition-colors duration-300 font-medium flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isServicesOpen && (
                      <div className="pl-4 space-y-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-2 text-gray-400 hover:text-gold-500 transition-colors duration-300"
                            onClick={() => {
                              setIsOpen(false);
                              setIsServicesOpen(false);
                            }}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-3 text-gray-300 hover:text-gold-500 transition-colors duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Admin Login Link - Mobile */}
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 w-full mt-2 py-3 border border-gold-500/50 rounded-full text-gold-400 hover:text-gold-300 hover:border-gold-400 hover:bg-gold-500/10 transition-all duration-300 font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </Link>
            
            <Link
              href="/booking"
              className="block w-full mt-4 gold-gradient text-dark-900 px-6 py-3 rounded-full font-semibold text-center hover:shadow-lg hover:shadow-gold-500/30 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;