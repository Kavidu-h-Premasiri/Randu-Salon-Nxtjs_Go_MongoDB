'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, User, Mail, Phone, CreditCard, Scissors, 
  Search, Download, Eye, CheckCircle, XCircle, LogOut,
  Menu, X, Settings, BarChart3, Users, CalendarDays,
  DollarSign, TrendingUp, Star, MessageSquare, MoreVertical,
  RefreshCw, ChevronDown, ChevronUp, Printer, Timer, Edit2, Save
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Appointment {
  _id: string;
  id?: string;
  services: Array<{ name: string; price: number; category: string; duration: number }>;
  stylistName?: string;
  stylist?: string;
  date: string;
  startTime?: string;
  time?: string;
  endTime?: string;
  finishingTime?: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  totalPrice: number;
  appointmentFee: number;
  servicesTotal: number;
  totalDuration: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  createdAt: string;
}

interface Stats {
  totalAppointments: number;
  totalRevenue: number;
  completedAppointments: number;
  upcomingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Appointment | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    totalRevenue: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/bookings/all`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      let bookings = [];
      if (data.success && data.bookings) {
        bookings = data.bookings;
      } else if (Array.isArray(data)) {
        bookings = data;
      } else if (data.bookings) {
        bookings = data.bookings;
      } else {
        bookings = [];
      }
      
      const transformedBookings = bookings.map((booking: any) => ({
        ...booking,
        _id: booking._id || booking.id,
        id: booking._id || booking.id,
        stylist: booking.stylistName || booking.stylist || 'Not assigned',
        time: booking.startTime || booking.time || 'N/A',
        finishingTime: booking.endTime || booking.finishingTime || 'N/A',
        status: booking.status === 'pending' ? 'confirmed' : (booking.status || 'confirmed')
      }));
      
      setAppointments(transformedBookings);
      setFilteredAppointments(transformedBookings);
      calculateStats(transformedBookings);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Failed to load appointments. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const filterAppointments = (search: string, status: string, date: string) => {
    let filtered = [...appointments];
    
    if (search) {
      filtered = filtered.filter(apt => 
        apt.name?.toLowerCase().includes(search.toLowerCase()) ||
        apt.email?.toLowerCase().includes(search.toLowerCase()) ||
        apt.phone?.includes(search)
      );
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(apt => apt.status === status);
    }
    
    if (date) {
      filtered = filtered.filter(apt => apt.date === date);
    }
    
    setFilteredAppointments(filtered);
  };

  const calculateStats = (data: Appointment[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const totalRevenue = data
      .filter(apt => apt.status !== 'cancelled')
      .reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
      
    const completedAppointments = data.filter(apt => apt.status === 'completed').length;
    const upcomingAppointments = data.filter(apt => apt.date >= today && apt.status === 'confirmed').length;
    const confirmedAppointments = data.filter(apt => apt.status === 'confirmed').length;
    const cancelledAppointments = data.filter(apt => apt.status === 'cancelled').length;
    
    setStats({
      totalAppointments: data.length,
      totalRevenue,
      completedAppointments,
      upcomingAppointments,
      confirmedAppointments,
      cancelledAppointments
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      
      if (response.ok) {
        await fetchAppointments();
        setSuccess(`Booking status updated to ${newStatus}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.text();
        setError(`Failed to update status: ${error}`);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingBooking({ ...appointment });
    setShowEditModal(true);
  };

  const handleEditChange = (field: string, value: any) => {
    if (editingBooking) {
      setEditingBooking({ ...editingBooking, [field]: value });
    }
  };

  const updateBooking = async () => {
    if (!editingBooking) return;
    
    setSavingEdit(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBooking._id,
          name: editingBooking.name,
          email: editingBooking.email,
          phone: editingBooking.phone,
          services: editingBooking.services,
          stylistName: editingBooking.stylist || editingBooking.stylistName,
          date: editingBooking.date,
          startTime: editingBooking.time || editingBooking.startTime,
          endTime: editingBooking.finishingTime || editingBooking.endTime,
          totalPrice: editingBooking.totalPrice,
          appointmentFee: editingBooking.appointmentFee,
          servicesTotal: editingBooking.servicesTotal,
          totalDuration: editingBooking.totalDuration,
          status: editingBooking.status,
          notes: editingBooking.notes
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Booking updated successfully!');
        await fetchAppointments();
        setShowEditModal(false);
        setEditingBooking(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update booking');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingEdit(false);
    }
  };

  const generateAppointmentPDF = (appointment: Appointment) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Randu Salon - Appointment Details', 20, 20);
      doc.setFontSize(12);
      doc.text(`Customer: ${appointment.name}`, 20, 40);
      doc.text(`Email: ${appointment.email}`, 20, 50);
      doc.text(`Phone: ${appointment.phone}`, 20, 60);
      doc.text(`Date: ${appointment.date}`, 20, 70);
      doc.text(`Time: ${appointment.time || appointment.startTime}`, 20, 80);
      doc.text(`Stylist: ${appointment.stylist || appointment.stylistName}`, 20, 90);
      doc.text(`Total: Rs.${appointment.totalPrice}`, 20, 100);
      doc.save(`appointment_${appointment.name}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-gray-700 transition-all"
    >
      <Menu className="w-5 h-5" />
    </button>
  );

  // Sidebar component
  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 lg:w-72 bg-gray-800 border-r border-yellow-500/30`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-yellow-500/30">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Scissors className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
              <span className="text-lg lg:text-xl font-bold text-yellow-500">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-yellow-400 hover:text-yellow-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 py-4 lg:py-6">
            <button
              onClick={() => {
                setActiveTab('appointments');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 lg:px-6 py-2.5 lg:py-3 transition-all ${
                activeTab === 'appointments'
                  ? 'bg-yellow-500/10 border-r-2 border-yellow-500 text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/5'
              }`}
            >
              <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
              <span className="text-sm lg:text-base">Appointments</span>
              {stats.totalAppointments > 0 && (
                <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  {stats.totalAppointments}
                </span>
              )}
            </button>
            
            <button
              onClick={() => {
                router.push('/admin/settings');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center px-4 lg:px-6 py-2.5 lg:py-3 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/5 transition-all"
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
              <span className="text-sm lg:text-base">Settings</span>
            </button>
          </nav>

          <div className="p-4 lg:p-6 border-t border-yellow-500/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-500 text-lg lg:text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <MobileMenuButton />
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64 xl:ml-72">
        {/* Header */}
        <div className="bg-gray-800 border-b border-yellow-500/30 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">
                {activeTab === 'appointments' && 'Appointment Management'}
                {activeTab === 'analytics' && 'Analytics Dashboard'}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Welcome back, Administrator</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAppointments}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 text-sm sm:text-base"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="m-4 sm:m-6 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="m-4 sm:m-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm sm:text-base">
            <XCircle className="w-4 h-4 inline mr-2" />
            {error}
          </div>
        )}

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-yellow-500/30">
            <p className="text-gray-400 text-xs sm:text-sm">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalAppointments}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-green-500/30">
            <p className="text-gray-400 text-xs sm:text-sm">Revenue</p>
            <p className="text-lg sm:text-2xl font-bold text-green-400">Rs.{stats.totalRevenue}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-green-500/30">
            <p className="text-gray-400 text-xs sm:text-sm">Confirmed</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.confirmedAppointments}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-blue-500/30">
            <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.completedAppointments}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-purple-500/30">
            <p className="text-gray-400 text-xs sm:text-sm">Upcoming</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.upcomingAppointments}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-red-500/30">
            <p className="text-gray-400 text-xs sm:text-sm">Cancelled</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.cancelledAppointments}</p>
          </div>
        </div>

        {/* Filters - Responsive */}
        <div className="px-4 sm:px-6 mb-4 sm:mb-6">
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      filterAppointments(e.target.value, statusFilter, dateFilter);
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-3 text-white text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  filterAppointments(searchTerm, e.target.value, dateFilter);
                }}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  filterAppointments(searchTerm, statusFilter, e.target.value);
                }}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
              />
              
              {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('');
                    setFilteredAppointments(appointments);
                  }}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm sm:text-base"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments Table - Responsive */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="bg-gray-800 rounded-xl border border-yellow-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Customer</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Contact</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Date & Time</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Stylist</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Services</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Amount</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-yellow-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400 text-sm sm:text-base">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-white text-sm sm:text-base">{apt.name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm text-gray-300 break-all">{apt.email}</div>
                          <div className="text-xs text-gray-400">{apt.phone}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-white text-sm sm:text-base">{apt.date}</div>
                          <div className="text-xs text-gray-400">{apt.time || apt.startTime}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white text-sm sm:text-base">{apt.stylist || apt.stylistName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm text-gray-300">{apt.services?.length || 0} service(s)</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-yellow-400 font-semibold text-sm sm:text-base">Rs.{apt.totalPrice}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">{getStatusBadge(apt.status)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setShowDetailsModal(true);
                              }}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(apt)}
                              className="p-1 text-yellow-400 hover:text-yellow-300"
                              title="Edit Booking"
                            >
                              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => generateAppointmentPDF(apt)}
                              className="p-1 text-green-400 hover:text-green-300"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <select
                              value={apt.status}
                              onChange={(e) => updateStatus(apt._id, e.target.value)}
                              disabled={updatingStatus === apt._id}
                              className="bg-gray-900 border border-gray-700 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Booking Modal - Responsive */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-yellow-500/30 p-3 sm:p-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-yellow-500">Edit Booking</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Customer Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingBooking.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingBooking.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingBooking.phone}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select
                      value={editingBooking.status}
                      onChange={(e) => handleEditChange('status', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-3">Appointment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={editingBooking.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Time</label>
                    <input
                      type="text"
                      value={editingBooking.time || editingBooking.startTime || ''}
                      onChange={(e) => handleEditChange('time', e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Stylist</label>
                    <input
                      type="text"
                      value={editingBooking.stylist || editingBooking.stylistName || ''}
                      onChange={(e) => handleEditChange('stylist', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Total Price</label>
                    <input
                      type="number"
                      value={editingBooking.totalPrice}
                      onChange={(e) => handleEditChange('totalPrice', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={editingBooking.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                />
              </div>

              {/* Services */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-3">Services</h3>
                <div className="space-y-2">
                  {editingBooking.services?.map((service, idx) => (
                    <div key={idx} className="bg-gray-700/50 rounded-lg p-2 sm:p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5 sm:col-span-6">
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => {
                              const updatedServices = [...editingBooking.services];
                              updatedServices[idx] = { ...updatedServices[idx], name: e.target.value };
                              handleEditChange('services', updatedServices);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs sm:text-sm"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-3">
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => {
                              const updatedServices = [...editingBooking.services];
                              updatedServices[idx] = { ...updatedServices[idx], price: parseInt(e.target.value) || 0 };
                              const newTotal = updatedServices.reduce((sum, s) => sum + s.price, 0);
                              handleEditChange('services', updatedServices);
                              handleEditChange('totalPrice', newTotal + editingBooking.appointmentFee);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs sm:text-sm"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) => {
                              const updatedServices = [...editingBooking.services];
                              updatedServices[idx] = { ...updatedServices[idx], duration: parseInt(e.target.value) || 0 };
                              handleEditChange('services', updatedServices);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs sm:text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => {
                              const updatedServices = editingBooking.services.filter((_, i) => i !== idx);
                              const newTotal = updatedServices.reduce((sum, s) => sum + s.price, 0);
                              handleEditChange('services', updatedServices);
                              handleEditChange('totalPrice', newTotal + editingBooking.appointmentFee);
                            }}
                            className="w-full p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const updatedServices = [...(editingBooking.services || []), { name: '', price: 0, duration: 0, category: '' }];
                    handleEditChange('services', updatedServices);
                  }}
                  className="mt-2 px-3 py-1 text-xs sm:text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                >
                  + Add Service
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBooking}
                  disabled={savingEdit}
                  className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 text-sm sm:text-base"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Responsive */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-yellow-500/30 p-3 sm:p-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-yellow-500">Appointment Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-2">Customer Information</h3>
                <p className="text-sm sm:text-base"><strong>Name:</strong> {selectedAppointment.name}</p>
                <p className="text-sm sm:text-base break-all"><strong>Email:</strong> {selectedAppointment.email}</p>
                <p className="text-sm sm:text-base"><strong>Phone:</strong> {selectedAppointment.phone}</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-2">Appointment Details</h3>
                <p className="text-sm sm:text-base"><strong>Date:</strong> {selectedAppointment.date}</p>
                <p className="text-sm sm:text-base"><strong>Time:</strong> {selectedAppointment.time || selectedAppointment.startTime}</p>
                <p className="text-sm sm:text-base"><strong>Stylist:</strong> {selectedAppointment.stylist || selectedAppointment.stylistName}</p>
                <p className="text-sm sm:text-base"><strong>Status:</strong> {getStatusBadge(selectedAppointment.status)}</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-2">Services</h3>
                {selectedAppointment.services?.map((service, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-sm sm:text-base">
                    <span>{service.name}</span>
                    <span>Rs.{service.price}</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <div className="flex justify-between font-bold text-sm sm:text-base">
                    <span>Total</span>
                    <span className="text-yellow-500">Rs.{selectedAppointment.totalPrice}</span>
                  </div>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-500 mb-2">Notes</h3>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}