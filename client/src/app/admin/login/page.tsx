'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Sparkles, Shield, Lock, Mail, LogIn, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Parallax and scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call - Replace with actual admin authentication
    setTimeout(() => {
      if (email === 'admin@randusalon.com' && password === 'admin123') {
        // Store admin session
        localStorage.setItem('adminAuthenticated', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating Scissors Icons */}
        <div className="absolute top-20 left-10 animate-float-slow opacity-20">
          <Scissors className="w-12 h-12 text-gold-400 rotate-45" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float-medium opacity-20">
          <Scissors className="w-16 h-16 text-gold-400 -rotate-12" />
        </div>
        <div className="absolute top-1/3 right-20 animate-float-fast opacity-10">
          <Sparkles className="w-8 h-8 text-gold-300" />
        </div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-gold-400/20 to-gold-600/20 rounded-full blur-2xl animate-orbit"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-gold-500/10 to-amber-600/10 rounded-full blur-2xl animate-orbit-reverse"></div>
      </div>

      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg border-b border-gold-500/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/')}>
              <Scissors className="w-8 h-8 text-gold-400 group-hover:rotate-12 transition-transform duration-500 group-hover:scale-110" />
              <span className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                RANDU SALON
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">Admin Portal</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Animated Card */}
          <div className="relative group">
            {/* Glowing Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-glow"></div>
            
            {/* Login Card */}
            <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-gold-500/30 shadow-2xl overflow-hidden">
              {/* Decorative Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
              
              {/* Header */}
              <div className="text-center pt-8 pb-6 px-6">
                <div className="inline-flex p-3 bg-gold-500/10 rounded-full mb-4 animate-bounce-slow">
                  <Lock className="w-10 h-10 text-gold-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
                  Admin Access
                </h1>
                <p className="text-gray-400 text-sm">Enter your credentials to manage the salon</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold-400" />
                    Email Address
                  </label>
                  <div className="relative group/input">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-700/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300"
                      placeholder="admin@randusalon.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-500/0 via-gold-500/0 to-gold-500/0 group-hover/input:via-gold-500/5 transition-all duration-500 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gold-400" />
                    Password
                  </label>
                  <div className="relative group/input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-700/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-500/0 via-gold-500/0 to-gold-500/0 group-hover/input:via-gold-500/5 transition-all duration-500 pointer-events-none"></div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-shake">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl font-semibold text-dark-900 overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Login to Dashboard
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-700 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                </button>

                {/* Demo Credentials */}
                <div className="text-center pt-4 border-t border-gold-500/20">
                  <p className="text-xs text-gray-500 mb-2">Demo Credentials</p>
                  <div className="flex justify-center gap-4 text-xs">
                    <span className="text-gold-400">admin@randusalon.com</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gold-400">admin123</span>
                  </div>
                </div>
              </form>

              {/* Footer Decoration */}
              <div className="px-6 pb-6">
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gold-500/40 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back to Site Link */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center justify-center gap-2 group"
            >
              <Scissors className="w-4 h-4 rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              Back to Salon Website
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes orbit {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(100px, 50px) rotate(360deg); }
        }
        @keyframes orbit-reverse {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-80px, -60px) rotate(-360deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        .animate-orbit {
          animation: orbit 12s linear infinite;
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 15s linear infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}