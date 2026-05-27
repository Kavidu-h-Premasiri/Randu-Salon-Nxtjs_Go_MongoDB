'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Clock, DollarSign, Calendar, Users, Scissors, 
  Mail, Phone, Globe, AlertCircle, CheckCircle, 
  Plus, Trash2, Edit2, X, RefreshCw, LogOut, Package,
  ChevronLeft
} from 'lucide-react';

interface BusinessHour {
  day: string;
  start: string;
  end: string;
}

interface AppointmentSettings {
  feePerService: number;
  maxAppointmentFee: number;
  maxServicesPerBooking: number;
  otpExpiryMinutes: number;
  maxDaysAdvance: number;
}

interface Stylist {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  isActive: boolean;
  bio?: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [appointmentSettings, setAppointmentSettings] = useState<AppointmentSettings>({
    feePerService: 50,
    maxAppointmentFee: 200,
    maxServicesPerBooking: 10,
    otpExpiryMinutes: 10,
    maxDaysAdvance: 14
  });
  
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { day: 'Monday', start: '09:00 AM', end: '08:00 PM' },
    { day: 'Tuesday', start: '09:00 AM', end: '08:00 PM' },
    { day: 'Wednesday', start: '09:00 AM', end: '08:00 PM' },
    { day: 'Thursday', start: '09:00 AM', end: '08:00 PM' },
    { day: 'Friday', start: '09:00 AM', end: '08:00 PM' },
    { day: 'Saturday', start: '09:00 AM', end: '06:00 PM' },
    { day: 'Sunday', start: '10:00 AM', end: '04:00 PM' }
  ]);
  
  // Categories State - from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    price: 0,
    duration: 30,
    description: ''
  });
  const [serviceErrors, setServiceErrors] = useState({ name: '', category: '', price: '', duration: '' });
  
  // Stylists State
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [showAddStylist, setShowAddStylist] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [newStylist, setNewStylist] = useState({ name: '', email: '', phone: '', specialties: '', bio: '' });
  const [stylistErrors, setStylistErrors] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuthenticated');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await fetchSettings();
    await fetchCategories();
    await fetchServices();
    await fetchStylists();
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      if (data.success && data.settings) {
        if (data.settings.appointmentFeePerService !== undefined) {
          setAppointmentSettings(prev => ({ ...prev, feePerService: data.settings.appointmentFeePerService }));
        }
        if (data.settings.maxAppointmentFee !== undefined) {
          setAppointmentSettings(prev => ({ ...prev, maxAppointmentFee: data.settings.maxAppointmentFee }));
        }
        if (data.settings.maxServicesPerBooking !== undefined) {
          setAppointmentSettings(prev => ({ ...prev, maxServicesPerBooking: data.settings.maxServicesPerBooking }));
        }
        if (data.settings.otpExpiryMinutes !== undefined) {
          setAppointmentSettings(prev => ({ ...prev, otpExpiryMinutes: data.settings.otpExpiryMinutes }));
        }
        if (data.settings.maxDaysAdvance !== undefined) {
          setAppointmentSettings(prev => ({ ...prev, maxDaysAdvance: data.settings.maxDaysAdvance }));
        }
        if (data.settings.businessHours) {
          setBusinessHours(data.settings.businessHours);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        // Default categories if API fails
        setCategories([
          { id: 'haircuts', name: 'Haircuts' },
          { id: 'coloring', name: 'Coloring' },
          { id: 'styling', name: 'Styling' },
          { id: 'facials', name: 'Facials' },
          { id: 'nails', name: 'Nails' },
          { id: 'bridal', name: 'Bridal' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set default categories on error
      setCategories([
        { id: 'haircuts', name: 'Haircuts' },
        { id: 'coloring', name: 'Coloring' },
        { id: 'styling', name: 'Styling' },
        { id: 'facials', name: 'Facials' },
        { id: 'nails', name: 'Nails' },
        { id: 'bridal', name: 'Bridal' }
      ]);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      if (data.success && data.services) {
        setServices(data.services);
      } else {
        // Default services
        setServices([
          { id: '1', name: "Women's Haircut & Style", category: 'Haircuts', price: 600, duration: 40, description: 'Professional haircut and styling', isActive: true },
          { id: '2', name: "Men's Haircut", category: 'Haircuts', price: 500, duration: 25, description: 'Precision men\'s haircut', isActive: true },
          { id: '3', name: 'Full Color', category: 'Coloring', price: 1300, duration: 50, description: 'Full hair color application', isActive: true },
          { id: '4', name: 'Highlights', category: 'Coloring', price: 1000, duration: 40, description: 'Professional highlights', isActive: true },
          { id: '5', name: 'Blowout', category: 'Styling', price: 600, duration: 45, description: 'Professional blowout styling', isActive: true },
          { id: '6', name: 'Classic Facial', category: 'Facials', price: 600, duration: 40, description: 'Deep cleansing facial', isActive: true }
        ]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchStylists = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stylists`);
      if (!response.ok) throw new Error('Failed to fetch stylists');
      const data = await response.json();
      if (data.success && data.stylists) {
        setStylists(data.stylists);
      } else {
        setStylists([
          { id: '1', name: 'Isabella Montgomery', email: 'isabella@randusalon.com', phone: '+94 77 123 4567', specialties: ['Haircuts', 'Color'], isActive: true },
          { id: '2', name: 'Marcus Chen', email: 'marcus@randusalon.com', phone: '+94 77 234 5678', specialties: ['Men\'s Haircuts', 'Fades'], isActive: true },
          { id: '3', name: 'Sofia Rodriguez', email: 'sofia@randusalon.com', phone: '+94 77 345 6789', specialties: ['Styling', 'Bridal'], isActive: true }
        ]);
      }
    } catch (err) {
      console.error('Error fetching stylists:', err);
      setStylists([
        { id: '1', name: 'Isabella Montgomery', email: 'isabella@randusalon.com', phone: '+94 77 123 4567', specialties: ['Haircuts', 'Color'], isActive: true },
        { id: '2', name: 'Marcus Chen', email: 'marcus@randusalon.com', phone: '+94 77 234 5678', specialties: ['Men\'s Haircuts', 'Fades'], isActive: true },
        { id: '3', name: 'Sofia Rodriguez', email: 'sofia@randusalon.com', phone: '+94 77 345 6789', specialties: ['Styling', 'Bridal'], isActive: true }
      ]);
    }
  };

  // Validation Functions
  const validateNumber = (value: number, min: number, max: number, fieldName: string): string => {
    if (isNaN(value) || value < min) return `${fieldName} must be at least ${min}`;
    if (value > max) return `${fieldName} must be less than ${max}`;
    return '';
  };

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) return 'Phone number must be between 9-15 digits';
    return '';
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    return '';
  };

  const saveAppointmentSetting = async (key: string, value: number) => {
    let validationError = '';
    switch(key) {
      case 'appointmentFeePerService':
        validationError = validateNumber(value, 0, 1000, 'Fee per service');
        break;
      case 'maxAppointmentFee':
        validationError = validateNumber(value, 0, 10000, 'Maximum fee');
        break;
      case 'maxServicesPerBooking':
        validationError = validateNumber(value, 1, 20, 'Maximum services');
        break;
      case 'otpExpiryMinutes':
        validationError = validateNumber(value, 1, 60, 'OTP expiry');
        break;
      case 'maxDaysAdvance':
        validationError = validateNumber(value, 1, 90, 'Maximum days advance');
        break;
    }
    
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      
      if (response.ok) {
        setSuccess(`${key} updated successfully`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save setting');
      setTimeout(() => setError(''), 3000);
    }
  };

  const saveBusinessHours = async () => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    for (const hour of businessHours) {
      if (!timeRegex.test(hour.start)) {
        setError(`Invalid start time format for ${hour.day}. Use format: 09:00 AM`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (!timeRegex.test(hour.end)) {
        setError(`Invalid end time format for ${hour.day}. Use format: 08:00 PM`);
        setTimeout(() => setError(''), 3000);
        return;
      }
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'businessHours', value: businessHours })
      });
      
      if (response.ok) {
        setSuccess('Business hours updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save business hours');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessHour = (index: number, field: string, value: string) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  // Category CRUD with API
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      
      if (response.ok) {
        await fetchCategories();
        setNewCategoryName('');
        setShowAddCategory(false);
        setSuccess('Category added successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add category');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to add category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteCategory = async (categoryName: string) => {
    if (!confirm(`Delete category "${categoryName}"? Services in this category will remain.`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/delete?name=${encodeURIComponent(categoryName)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchCategories();
        setSuccess('Category deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete category');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete category');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Service CRUD with Validation
  const validateNewService = (): boolean => {
    const errors = {
      name: validateName(newService.name),
      category: newService.category ? '' : 'Category is required',
      price: validateNumber(newService.price, 0, 50000, 'Price'),
      duration: validateNumber(newService.duration, 5, 480, 'Duration')
    };
    setServiceErrors(errors);
    return !errors.name && !errors.category && !errors.price && !errors.duration;
  };

  const addService = async () => {
    if (!validateNewService()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newService.name.trim(),
          category: newService.category,
          price: newService.price,
          duration: newService.duration,
          description: newService.description,
          isActive: true
        })
      });
      
      if (response.ok) {
        await fetchServices();
        setNewService({ name: '', category: '', price: 0, duration: 30, description: '' });
        setServiceErrors({ name: '', category: '', price: '', duration: '' });
        setShowAddService(false);
        setSuccess('Service added successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add service');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to add service');
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateService = async () => {
    if (!editingService) return;
    
    const nameError = validateName(editingService.name);
    const priceError = validateNumber(editingService.price, 0, 50000, 'Price');
    const durationError = validateNumber(editingService.duration, 5, 480, 'Duration');
    
    if (nameError || priceError || durationError) {
      setError(nameError || priceError || durationError);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/services/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      
      if (response.ok) {
        await fetchServices();
        setEditingService(null);
        setSuccess('Service updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update service');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to update service');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/services/delete?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchServices();
        setSuccess('Service deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete service');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete service');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Stylist CRUD with Validation
  const validateNewStylist = (): boolean => {
    const errors = {
      name: validateName(newStylist.name),
      email: validateEmail(newStylist.email),
      phone: validatePhone(newStylist.phone)
    };
    setStylistErrors(errors);
    return !errors.name && !errors.email && !errors.phone;
  };

  const addStylist = async () => {
    if (!validateNewStylist()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/stylists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStylist.name.trim(),
          email: newStylist.email.trim(),
          phone: newStylist.phone.trim(),
          specialties: newStylist.specialties.split(',').map(s => s.trim()).filter(s => s),
          bio: newStylist.bio || '',
          isActive: true
        })
      });
      
      if (response.ok) {
        await fetchStylists();
        setNewStylist({ name: '', email: '', phone: '', specialties: '', bio: '' });
        setStylistErrors({ name: '', email: '', phone: '' });
        setShowAddStylist(false);
        setSuccess('Stylist added successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add stylist');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to add stylist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateStylist = async () => {
    if (!editingStylist) return;
    
    const nameError = validateName(editingStylist.name);
    const emailError = validateEmail(editingStylist.email);
    const phoneError = validatePhone(editingStylist.phone);
    
    if (nameError || emailError || phoneError) {
      setError(nameError || emailError || phoneError);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/stylists/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStylist)
      });
      
      if (response.ok) {
        await fetchStylists();
        setEditingStylist(null);
        setSuccess('Stylist updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update stylist');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to update stylist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteStylist = async (id: string) => {
    if (!confirm('Delete this stylist?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/stylists/delete?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchStylists();
        setSuccess('Stylist deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete stylist');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete stylist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-500 text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-yellow-500/30 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Back Button to Dashboard */}
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">System Settings</h1>
              <p className="text-gray-400 text-sm">Configure appointment rules, business hours, services, stylists, and more</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAllData} className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Appointment Settings */}
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-6">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Appointment Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Appointment Fee Per Service (Rs.)</label>
                <input type="number" min="0" max="1000" value={appointmentSettings.feePerService}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 1000) {
                      setAppointmentSettings({...appointmentSettings, feePerService: val});
                      saveAppointmentSetting('appointmentFeePerService', val);
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                <p className="text-xs text-gray-400 mt-1">Affects new bookings (0-1000 Rs.)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Appointment Fee (Rs.)</label>
                <input type="number" min="0" max="10000" value={appointmentSettings.maxAppointmentFee}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 10000) {
                      setAppointmentSettings({...appointmentSettings, maxAppointmentFee: val});
                      saveAppointmentSetting('maxAppointmentFee', val);
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Services Per Booking</label>
                <input type="number" min="1" max="20" value={appointmentSettings.maxServicesPerBooking}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= 20) {
                      setAppointmentSettings({...appointmentSettings, maxServicesPerBooking: val});
                      saveAppointmentSetting('maxServicesPerBooking', val);
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">OTP Expiry Time (Minutes)</label>
                <input type="number" min="1" max="60" value={appointmentSettings.otpExpiryMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= 60) {
                      setAppointmentSettings({...appointmentSettings, otpExpiryMinutes: val});
                      saveAppointmentSetting('otpExpiryMinutes', val);
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Booking Days in Advance</label>
                <input type="number" min="1" max="90" value={appointmentSettings.maxDaysAdvance}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= 90) {
                      setAppointmentSettings({...appointmentSettings, maxDaysAdvance: val});
                      saveAppointmentSetting('maxDaysAdvance', val);
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-6">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Business Hours
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {businessHours.map((hour, idx) => (
                <div key={`${hour.day}-${idx}`} className="bg-gray-700/50 rounded-lg p-3">
                  <div className="font-semibold text-white mb-2">{hour.day}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">Start Time</label>
                      <input type="text" value={hour.start}
                        onChange={(e) => updateBusinessHour(idx, 'start', e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">End Time</label>
                      <input type="text" value={hour.end}
                        onChange={(e) => updateBusinessHour(idx, 'end', e.target.value)}
                        placeholder="08:00 PM"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveBusinessHours} disabled={saving}
              className="w-full mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400">
              {saving ? 'Saving...' : 'Save Business Hours'}
            </button>
          </div>

          {/* Service Categories */}
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-6">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Service Categories
            </h2>
            <p className="text-gray-400 text-sm mb-4">Manage service categories</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-white">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat.name)} className="p-1 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {showAddCategory ? (
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <input type="text" placeholder="Category name" value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm" />
                  <div className="flex gap-2">
                    <button onClick={addCategory} className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 rounded">Save</button>
                    <button onClick={() => setShowAddCategory(false)} className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddCategory(true)} className="w-full mt-3 px-4 py-2 border border-dashed border-yellow-500/30 text-yellow-400 rounded-lg">
                  <Plus className="w-4 h-4 inline mr-2" /> Add Category
                </button>
              )}
            </div>
          </div>

          {/* Services Management */}
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-6">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Services Management
            </h2>
            <p className="text-gray-400 text-sm mb-4">Add, edit, or remove services available for booking</p>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  {editingService?.id === service.id ? (
                    <div className="flex-1 space-y-2">
                      <input type="text" value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Service Name" />
                      <select value={editingService.category}
                        onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input type="number" value={editingService.price}
                          onChange={(e) => setEditingService({ ...editingService, price: parseInt(e.target.value) })}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Price (Rs.)" />
                        <input type="number" value={editingService.duration}
                          onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Duration (min)" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={updateService} className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 rounded">Save</button>
                        <button onClick={() => setEditingService(null)} className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-white font-medium">{service.name}</span>
                        <p className="text-xs text-gray-400">{service.category} • {service.duration} min</p>
                        <p className="text-xs text-yellow-400">Rs.{service.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingService(service)} className="p-1 text-blue-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteService(service.id)} className="p-1 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {showAddService && (
                <div className="p-3 bg-gray-700/50 rounded-lg space-y-2">
                  <input type="text" placeholder="Service Name *" value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className={`w-full bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                      serviceErrors.name ? 'border-red-500' : 'border-gray-600'
                    }`} />
                  {serviceErrors.name && <p className="text-red-400 text-xs">{serviceErrors.name}</p>}
                  
                  <select value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className={`w-full bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                      serviceErrors.category ? 'border-red-500' : 'border-gray-600'
                    }`}>
                    <option value="">Select Category *</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {serviceErrors.category && <p className="text-red-400 text-xs">{serviceErrors.category}</p>}
                  
                  <div className="flex gap-2">
                    <input type="number" placeholder="Price (Rs.) *" value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
                      className={`flex-1 bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                        serviceErrors.price ? 'border-red-500' : 'border-gray-600'
                      }`} />
                    <input type="number" placeholder="Duration (min) *" value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })}
                      className={`flex-1 bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                        serviceErrors.duration ? 'border-red-500' : 'border-gray-600'
                      }`} />
                  </div>
                  {(serviceErrors.price || serviceErrors.duration) && (
                    <p className="text-red-400 text-xs">{serviceErrors.price || serviceErrors.duration}</p>
                  )}
                  
                  <textarea placeholder="Description (optional)" value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    rows={2}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm" />
                  
                  <div className="flex gap-2">
                    <button onClick={addService} className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 rounded">Save</button>
                    <button onClick={() => setShowAddService(false)} className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded">Cancel</button>
                  </div>
                </div>
              )}
              <button onClick={() => setShowAddService(true)} className="w-full mt-3 px-4 py-2 border border-dashed border-yellow-500/30 text-yellow-400 rounded-lg">
                <Plus className="w-4 h-4 inline mr-2" /> Add Service
              </button>
            </div>
          </div>

          {/* Stylist Management */}
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-6">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Stylist Management
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {stylists.map((stylist) => (
                <div key={stylist.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  {editingStylist?.id === stylist.id ? (
                    <div className="flex-1 space-y-2">
                      <input type="text" value={editingStylist.name}
                        onChange={(e) => setEditingStylist({ ...editingStylist, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Name" />
                      <input type="email" value={editingStylist.email}
                        onChange={(e) => setEditingStylist({ ...editingStylist, email: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Email" />
                      <input type="text" value={editingStylist.phone}
                        onChange={(e) => setEditingStylist({ ...editingStylist, phone: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Phone" />
                      <input type="text" value={editingStylist.specialties.join(', ')}
                        onChange={(e) => setEditingStylist({ ...editingStylist, specialties: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="Specialties" />
                      <div className="flex gap-2">
                        <button onClick={updateStylist} className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 rounded">Save</button>
                        <button onClick={() => setEditingStylist(null)} className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-white">{stylist.name}</span>
                        <p className="text-xs text-gray-400">{stylist.specialties?.join(', ')}</p>
                        <p className="text-xs text-gray-500">{stylist.email} | {stylist.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingStylist(stylist)} className="p-1 text-blue-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteStylist(stylist.id)} className="p-1 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {showAddStylist && (
                <div className="p-3 bg-gray-700/50 rounded-lg space-y-2">
                  <input type="text" placeholder="Name *" value={newStylist.name}
                    onChange={(e) => setNewStylist({ ...newStylist, name: e.target.value })}
                    className={`w-full bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                      stylistErrors.name ? 'border-red-500' : 'border-gray-600'
                    }`} />
                  {stylistErrors.name && <p className="text-red-400 text-xs">{stylistErrors.name}</p>}
                  
                  <input type="email" placeholder="Email *" value={newStylist.email}
                    onChange={(e) => setNewStylist({ ...newStylist, email: e.target.value })}
                    className={`w-full bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                      stylistErrors.email ? 'border-red-500' : 'border-gray-600'
                    }`} />
                  {stylistErrors.email && <p className="text-red-400 text-xs">{stylistErrors.email}</p>}
                  
                  <input type="text" placeholder="Phone *" value={newStylist.phone}
                    onChange={(e) => setNewStylist({ ...newStylist, phone: e.target.value })}
                    className={`w-full bg-gray-700 border rounded px-3 py-2 text-white text-sm ${
                      stylistErrors.phone ? 'border-red-500' : 'border-gray-600'
                    }`} />
                  {stylistErrors.phone && <p className="text-red-400 text-xs">{stylistErrors.phone}</p>}
                  
                  <input type="text" placeholder="Specialties (comma separated)" value={newStylist.specialties}
                    onChange={(e) => setNewStylist({ ...newStylist, specialties: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm" />
                  
                  <div className="flex gap-2">
                    <button onClick={addStylist} className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 rounded">Save</button>
                    <button onClick={() => setShowAddStylist(false)} className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded">Cancel</button>
                  </div>
                </div>
              )}
              <button onClick={() => setShowAddStylist(true)} className="w-full mt-3 px-4 py-2 border border-dashed border-yellow-500/30 text-yellow-400 rounded-lg">
                <Plus className="w-4 h-4 inline mr-2" /> Add Stylist
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}