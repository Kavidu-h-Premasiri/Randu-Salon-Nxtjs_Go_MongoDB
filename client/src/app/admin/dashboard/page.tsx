'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Scissors, 
  Search, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  LogOut,
  Menu,
  X,
  Settings,
  BarChart3,
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Printer,
  Undo,
  Timer
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Appointment {
  _id: string;
  services: Array<{ name: string; price: number; category: string; duration: number }>;
  stylist: string;
  date: string;
  time: string;
  finishingTime: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  totalPrice: number;
  appointmentFee: number;
  servicesTotal: number;
  totalDuration: number;
  status: 'confirmed' | 'completed' | 'cancelled';
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

interface Countdown {
  id: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const API_BASE_URL = 'http://localhost:8080/api'; // Pointing directly to Go backend

export default function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [countdowns, setCountdowns] = useState<Map<string, Countdown>>(new Map());
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    totalRevenue: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0
  });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string; newStatus: Appointment['status']; appointmentName: string; oldStatus: Appointment['status'] } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [router]);

  // Calculate countdown for each appointment
  const calculateCountdown = (date: string, time: string): Countdown => {
    const [year, month, day] = date.split('-');
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!timeMatch) {
      return { id: '', days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
    const now = new Date();
    
    const diffMs = appointmentDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { id: '', days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
      id: '',
      days,
      hours: hoursRemaining,
      minutes: minutesRemaining,
      seconds: secondsRemaining,
      isPast: false
    };
  };

  // Update all countdowns
  const updateCountdowns = () => {
    const newCountdowns = new Map<string, Countdown>();
    appointments.forEach(app => {
      if (app.status === 'confirmed') {
        const countdown = calculateCountdown(app.date, app.time);
        newCountdowns.set(app._id, { ...countdown, id: app._id });
      }
    });
    setCountdowns(newCountdowns);
  };

  // Run countdown timer every second
  useEffect(() => {
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [appointments]);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/all`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bookings) {
          const bookingsWithStatus = data.bookings.map((booking: any) => ({
            ...booking,
            _id: booking._id || booking.id,
            status: booking.status === 'pending' ? 'confirmed' : (booking.status || 'confirmed')
          }));
          setAppointments(bookingsWithStatus);
          filterAppointments(bookingsWithStatus, searchTerm, statusFilter, dateFilter);
          calculateStats(bookingsWithStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const filterAppointments = (data: Appointment[], search: string, status: string, date: string) => {
    let filtered = [...data];
    
    if (search) {
      filtered = filtered.filter(apt => 
        apt.name.toLowerCase().includes(search.toLowerCase()) ||
        apt.email.toLowerCase().includes(search.toLowerCase()) ||
        apt.phone.includes(search) ||
        (apt._id && apt._id.includes(search))
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
    
    // Revenue only from non-cancelled appointments
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

  // Show confirmation modal before updating status
  const requestStatusUpdate = (id: string, newStatus: Appointment['status'], appointmentName: string, oldStatus: Appointment['status']) => {
    setPendingStatusUpdate({ id, newStatus, appointmentName, oldStatus });
    setShowConfirmModal(true);
  };

  // Execute the status update after confirmation
  const executeStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;
    
    const { id, newStatus } = pendingStatusUpdate;
    setUpdatingStatus(id);
    setShowConfirmModal(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }) 
      });
      
      if (response.ok) {
        const updatedAppointments = appointments.map(apt =>
          apt._id === id ? { ...apt, status: newStatus } : apt
        );
        setAppointments(updatedAppointments);
        filterAppointments(updatedAppointments, searchTerm, statusFilter, dateFilter);
        calculateStats(updatedAppointments);
        
        if (selectedAppointment && selectedAppointment._id === id) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus });
        }
        
        // Update Email notification (Assuming Next.js API handles emails)
        const appointment = appointments.find(apt => apt._id === id);
        if (appointment) {
          fetch('/api/send-status-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: appointment.email,
              name: appointment.name,
              status: newStatus,
              oldStatus: pendingStatusUpdate.oldStatus,
              date: appointment.date,
              time: appointment.time
            })
          }).catch(err => console.error('Email notification error:', err));
        }
        
        const statusMessages = {
          confirmed: `✓ Booking for ${appointment?.name || 'client'} has been CONFIRMED!`,
          completed: `✓ Appointment for ${appointment?.name || 'client'} marked as COMPLETED!`,
          cancelled: `✗ Booking for ${appointment?.name || 'client'} has been CANCELLED.`
        };
        alert(statusMessages[newStatus as keyof typeof statusMessages] || `Status updated to ${newStatus}`);
      } else {
        const errorMsg = await response.text().catch(() => 'Unknown error response');
        console.error(`Failed to update status. Server responded with ${response.status}:`, errorMsg);
        alert('Failed to update status in Database. Please check your network or try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('A network error occurred. Please try again.');
    } finally {
      setUpdatingStatus(null);
      setPendingStatusUpdate(null);
    }
  };

  // Cancel status update
  const cancelStatusUpdate = () => {
    setShowConfirmModal(false);
    setPendingStatusUpdate(null);
  };

  const generateAppointmentPDF = (appointment: Appointment) => {
    const doc = new jsPDF();
    const gold = [212, 175, 55];
    const dark = [18, 18, 18];

    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, 210, 55, 'F');
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 52, 210, 3, 'F');
    
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(26);
    doc.text('RANDU SALON', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text('OFFICIAL APPOINTMENT DETAILS', 105, 38, { align: 'center' });
    
    const statusColors: Record<string, number[]> = {
      confirmed: [34, 197, 94],
      completed: [59, 130, 246],
      cancelled: [239, 68, 68]
    };
    const statusColor = statusColors[appointment.status] || [156, 163, 175];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(145, 15, 55, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(appointment.status.toUpperCase(), 172.5, 22, { align: 'center' });
    
    let yPos = 70;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Reference:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment._id ? appointment._id.slice(-8).toUpperCase() : 'N/A', 70, yPos);
    yPos += 12;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, 170, 45, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('CLIENT INFORMATION', 25, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Full Name:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.name, 70, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Email Address:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.email, 70, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Phone Number:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.phone, 70, yPos);
    yPos += 15;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, 170, 45, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('APPOINTMENT DETAILS', 25, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Date:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.date, 70, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Time Slot:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${appointment.time} - ${appointment.finishingTime}`, 70, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Stylist:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.stylist, 70, yPos);
    yPos += 15;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, 170, 35 + (appointment.services.length * 7), 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('SERVICES BOOKED', 25, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    appointment.services.forEach((service, idx) => {
      doc.text(`${idx + 1}. ${service.name}`, 30, yPos);
      doc.text(`${service.duration} min`, 130, yPos);
      doc.text(`Rs.${service.price}`, 170, yPos, { align: 'right' });
      yPos += 6;
    });
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 130, yPos);
    doc.text(`Rs.${appointment.servicesTotal}`, 170, yPos, { align: 'right' });
    yPos += 6;
    
    doc.text('Appointment Fee:', 130, yPos);
    doc.text(`Rs.${appointment.appointmentFee}`, 170, yPos, { align: 'right' });
    yPos += 8;
    
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(115, yPos - 3, 75, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('TOTAL AMOUNT:', 120, yPos + 3);
    doc.text(`Rs.${appointment.totalPrice}`, 182, yPos + 3, { align: 'right' });
    
    if (appointment.notes) {
      yPos += 20;
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 5, 170, 30, 'F');
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SPECIAL NOTES', 25, yPos);
      yPos += 7;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(appointment.notes, 160);
      doc.text(splitNotes, 25, yPos);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for choosing Randu Salon', 105, 285, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 292, { align: 'center' });
    }
    
    doc.save(`Appointment_${appointment.name.replace(/\s+/g, '_')}_${appointment.date}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    const icons = {
      confirmed: <CheckCircle className="w-3 h-3" />,
      completed: <Star className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCountdownDisplay = (appointmentId: string) => {
    const countdown = countdowns.get(appointmentId);
    if (!countdown || countdown.isPast) {
      return <span className="text-gray-500 text-xs">Expired</span>;
    }
    return (
      <div className="flex items-center space-x-1 text-xs">
        <Timer className="w-3 h-3 text-gold-400" />
        <span className="text-gold-400 font-mono">
          {countdown.days > 0 && `${countdown.days}d `}
          {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
        </span>
      </div>
    );
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = (appointment: Appointment) => {
    generateAppointmentPDF(appointment);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin/login');
  };

  const navItems = [
    { id: 'appointments', label: 'Appointments', icon: <CalendarDays className="w-5 h-5" />, count: stats.totalAppointments },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="w-5 h-5" />, count: appointments.length },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const getConfirmationMessage = () => {
    if (!pendingStatusUpdate) return '';
    const statusMessages: Record<string, string> = {
      confirmed: `Are you sure you want to CONFIRM the booking for ${pendingStatusUpdate.appointmentName}?`,
      completed: `Are you sure you want to mark the appointment for ${pendingStatusUpdate.appointmentName} as COMPLETED?`,
      cancelled: `Are you sure you want to CANCEL the booking for ${pendingStatusUpdate.appointmentName}?`
    };
    return statusMessages[pendingStatusUpdate.newStatus] || `Are you sure you want to change status to ${pendingStatusUpdate.newStatus}?`;
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    const allStatuses = [
      { value: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' },
      { value: 'completed', label: 'Completed', icon: <Star className="w-4 h-4" />, color: 'text-blue-400' },
      { value: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' }
    ];
    return allStatuses.filter(status => status.value !== currentStatus);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Confirmation Modal */}
      {showConfirmModal && pendingStatusUpdate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-dark-900/90 backdrop-blur-sm">
          <div className="bg-dark-800 rounded-2xl border border-gold-600/30 max-w-md w-full p-6 animate-fade-in shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                pendingStatusUpdate.newStatus === 'confirmed' ? 'bg-green-500/20' :
                pendingStatusUpdate.newStatus === 'completed' ? 'bg-blue-500/20' :
                'bg-red-500/20'
              }`}>
                {pendingStatusUpdate.newStatus === 'confirmed' && <CheckCircle className="w-8 h-8 text-green-400" />}
                {pendingStatusUpdate.newStatus === 'completed' && <Star className="w-8 h-8 text-blue-400" />}
                {pendingStatusUpdate.newStatus === 'cancelled' && <XCircle className="w-8 h-8 text-red-400" />}
              </div>
              <h3 className="text-2xl font-bold gold-text-gradient mb-2">Confirm Status Change</h3>
              <p className="text-gray-400 text-sm">
                {getConfirmationMessage()}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={cancelStatusUpdate}
                className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-xl font-semibold hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeStatusUpdate}
                disabled={updatingStatus === pendingStatusUpdate.id}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                  pendingStatusUpdate.newStatus === 'confirmed' ? 'bg-green-500 hover:bg-green-600 text-white' :
                  pendingStatusUpdate.newStatus === 'completed' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                  'bg-red-500 hover:bg-red-600 text-white'
                } ${updatingStatus === pendingStatusUpdate.id ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {updatingStatus === pendingStatusUpdate.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Yes, Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} bg-dark-800/95 backdrop-blur-md border-r border-gold-600/30`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gold-600/30">
            <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <Scissors className="w-8 h-8 text-gold-400 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 py-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gold-500/10 border-r-2 border-gold-500 text-gold-400'
                    : 'text-gray-400 hover:text-gold-400 hover:bg-gold-500/5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {sidebarOpen && item.count !== undefined && (
                    <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-gold-600/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-md border-b border-gold-600/30 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                {activeTab === 'appointments' && 'Appointment Management'}
                {activeTab === 'analytics' && 'Analytics Dashboard'}
                {activeTab === 'clients' && 'Client Management'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, Administrator
              </p>
            </div>
            <button
              onClick={fetchAppointments}
              className="flex items-center space-x-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400 hover:bg-gold-500/20 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'appointments' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAppointments}</p>
                  </div>
                  <CalendarDays className="w-8 h-8 text-gold-400 opacity-50" />
                </div>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Revenue</p>
                    <p className="text-2xl font-bold text-gold-400">Rs.{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
                </div>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Confirmed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.confirmedAppointments}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
                </div>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Completed</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.completedAppointments}</p>
                  </div>
                  <Star className="w-8 h-8 text-blue-400 opacity-50" />
                </div>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Upcoming</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.upcomingAppointments}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
                </div>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Cancelled</p>
                    <p className="text-2xl font-bold text-red-400">{stats.cancelledAppointments}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400 opacity-50" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-6 mb-8">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or booking ID..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        filterAppointments(appointments, e.target.value, statusFilter, dateFilter);
                      }}
                      className="w-full bg-dark-700 border border-gold-600/30 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    filterAppointments(appointments, searchTerm, e.target.value, dateFilter);
                  }}
                  className="bg-dark-700 border border-gold-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    filterAppointments(appointments, searchTerm, statusFilter, e.target.value);
                  }}
                  className="bg-dark-700 border border-gold-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-all"
                />
                
                {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter('');
                      setFilteredAppointments(appointments);
                    }}
                    className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700 border-b border-gold-600/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400 w-10"></th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Client</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Date & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Countdown</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Services</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Stylist</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gold-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr key="loading-state">
                        <td colSpan={9} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400">Loading appointments...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr key="empty-state">
                        <td colSpan={9} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                            <p className="text-gray-400 text-lg">No appointments found</p>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment, index) => (
                        <React.Fragment key={appointment._id || `apt-${index}`}>
                          <tr className="border-b border-gold-600/10 hover:bg-gold-500/5 transition-colors">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleRowExpansion(appointment._id)}
                                className="text-gray-400 hover:text-gold-400 transition-colors"
                              >
                                {expandedRows.has(appointment._id) ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">{appointment.name}</p>
                                <p className="text-gray-400 text-xs">{appointment.email}</p>
                                <p className="text-gray-400 text-xs">{appointment.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gold-400" />
                                <span className="text-white text-sm">{appointment.date}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400 text-xs">{appointment.time}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {appointment.status === 'confirmed' ? (
                                getCountdownDisplay(appointment._id)
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {appointment.services.slice(0, 2).map((service, idx) => (
                                  <p key={`srvc-${idx}`} className="text-gray-300 text-sm">{service.name}</p>
                                ))}
                                {appointment.services.length > 2 && (
                                  <p className="text-gold-400 text-xs">+{appointment.services.length - 2} more</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gold-400" />
                                <span className="text-white text-sm">{appointment.stylist}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gold-400 font-semibold">Rs.{appointment.totalPrice}</span>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(appointment.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewDetails(appointment)}
                                  className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-300 flex items-center space-x-1"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="text-xs hidden sm:inline">View</span>
                                </button>
                                
                                <button
                                  onClick={() => handleDownloadPDF(appointment)}
                                  className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all duration-300 flex items-center space-x-1"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="text-xs hidden sm:inline">PDF</span>
                                </button>
                                
                                <div className="relative group">
                                  <button 
                                    disabled={updatingStatus === appointment._id}
                                    className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400 hover:bg-gold-500/20 transition-all duration-300 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {updatingStatus === appointment._id ? (
                                      <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <MoreVertical className="w-4 h-4" />
                                    )}
                                    <span className="text-xs hidden sm:inline">
                                      {updatingStatus === appointment._id ? 'Updating...' : 'Status'}
                                    </span>
                                  </button>
                                  <div className="absolute right-0 mt-2 w-48 bg-dark-700 rounded-xl border border-gold-600/30 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    {getAvailableStatusOptions(appointment.status).map((statusOption, idx) => (
                                      <button
                                        key={statusOption.value}
                                        onClick={() => requestStatusUpdate(appointment._id, statusOption.value as Appointment['status'], appointment.name, appointment.status)}
                                        disabled={updatingStatus === appointment._id}
                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center space-x-3 ${
                                          statusOption.value === 'confirmed' ? 'hover:bg-green-500/10' :
                                          statusOption.value === 'completed' ? 'hover:bg-blue-500/10' :
                                          'hover:bg-red-500/10'
                                        } ${
                                          idx === 0 ? 'rounded-t-xl' : ''
                                        } ${
                                          idx === getAvailableStatusOptions(appointment.status).length - 1 ? 'rounded-b-xl' : ''
                                        } disabled:opacity-50`}
                                      >
                                        <div className={`${statusOption.color}`}>
                                          {statusOption.icon}
                                        </div>
                                        <span className={`${statusOption.color}`}>
                                          {statusOption.label}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {expandedRows.has(appointment._id) && (
                            <tr key={`expanded-${appointment._id}`} className="bg-dark-700/30">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="bg-dark-800 rounded-xl p-4 border border-gold-600/20">
                                  <h4 className="text-gold-400 font-semibold mb-3 flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>All Services ({appointment.services.length})</span>
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {appointment.services.map((service, idx) => (
                                      <div key={`exp-srvc-${idx}`} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <div>
                                          <p className="text-white text-sm">{service.name}</p>
                                          <p className="text-gray-400 text-xs">{service.category} • {service.duration} min</p>
                                        </div>
                                        <p className="text-gold-400 font-semibold text-sm">Rs.{service.price}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {appointment.notes && (
                                    <div className="mt-4 pt-3 border-t border-gold-600/20">
                                      <p className="text-gray-400 text-sm flex items-center space-x-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Notes: {appointment.notes}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gold-text-gradient">Revenue Analytics</h2>
                  <BarChart3 className="w-6 h-6 text-gold-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-dark-700/30 rounded-xl">
                    <span className="text-gray-300">Total Revenue</span>
                    <span className="text-2xl font-bold text-gold-400">Rs.{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-dark-700/30 rounded-xl">
                    <span className="text-gray-300">Average per Appointment</span>
                    <span className="text-xl font-semibold text-white">
                      Rs.{stats.totalAppointments > 0 ? Math.round(stats.totalRevenue / stats.totalAppointments).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-dark-700/30 rounded-xl">
                    <span className="text-gray-300">Total Appointments</span>
                    <span className="text-xl font-semibold text-white">{stats.totalAppointments}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gold-text-gradient">Status Distribution</h2>
                </div>
                <div className="h-64 flex items-center justify-center border border-gold-600/20 rounded-xl bg-dark-700/30">
                  <div className="text-center">
                    <div className="flex justify-center space-x-8 mb-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-green-400">{stats.confirmedAppointments}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Confirmed</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-blue-400">{stats.completedAppointments}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-red-400">{stats.cancelledAppointments}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Cancelled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="p-8">
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 overflow-hidden">
              <div className="p-6 border-b border-gold-600/30">
                <h2 className="text-2xl font-bold gold-text-gradient">Client Directory</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {new Set(appointments.map(a => a.email)).size} unique clients • {appointments.length} total appointments
                </p>
              </div>
              <div className="divide-y divide-gold-600/10 max-h-[600px] overflow-y-auto">
                {[...new Map(appointments.map(apt => [apt.email, apt])).values()].map((client, index) => {
                  const clientAppointments = appointments.filter(apt => apt.email === client.email);
                  const totalSpent = clientAppointments.reduce((sum, apt) => sum + apt.totalPrice, 0);
                  const lastVisit = clientAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  
                  return (
                    <div key={client.email || `client-${index}`} className="p-6 hover:bg-gold-500/5 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gold-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{client.name}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-400 text-sm">{client.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-400 text-sm">{client.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gold-400 font-semibold">
                            {clientAppointments.length} appointment{clientAppointments.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Total: Rs.{totalSpent.toLocaleString()}
                          </p>
                          {lastVisit && (
                            <p className="text-gray-500 text-xs mt-1">
                              Last visit: {lastVisit.date}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-8">
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gold-600/20 p-8">
              <h2 className="text-2xl font-bold gold-text-gradient mb-6">Administrator Settings</h2>
              <div className="space-y-4">
                <div className="p-4 bg-dark-700/30 rounded-xl border border-gold-600/20 hover:border-gold-500/50 transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gold-400" />
                    <span>Email Notifications</span>
                  </h3>
                  <p className="text-gray-400 text-sm">Configure email notification settings for appointment updates and reminders</p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-xl border border-gold-600/20 hover:border-gold-500/50 transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gold-400" />
                    <span>Business Hours</span>
                  </h3>
                  <p className="text-gray-400 text-sm">Set salon operating hours, break times, and holiday schedules</p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-xl border border-gold-600/20 hover:border-gold-500/50 transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                    <Scissors className="w-5 h-5 text-gold-400" />
                    <span>Service Management</span>
                  </h3>
                  <p className="text-gray-400 text-sm">Add, edit, or remove services, pricing, and duration times</p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-xl border border-gold-600/20 hover:border-gold-500/50 transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gold-400" />
                    <span>Stylist Management</span>
                  </h3>
                  <p className="text-gray-400 text-sm">Manage stylist profiles, schedules, and specializations</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-dark-900/90 backdrop-blur-sm">
          <div className="bg-dark-800 rounded-2xl border border-gold-600/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800 border-b border-gold-600/30 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold gold-text-gradient">Appointment Details</h3>
                <p className="text-gray-400 text-sm mt-1">Booking ID: {selectedAppointment._id ? selectedAppointment._id.slice(-8).toUpperCase() : 'N/A'}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDownloadPDF(selectedAppointment)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/20 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedAppointment.status === 'confirmed' ? 'bg-green-400 animate-pulse' :
                    selectedAppointment.status === 'completed' ? 'bg-blue-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-white font-medium">Current Status:</span>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <div className="flex space-x-2">
                  {getAvailableStatusOptions(selectedAppointment.status).map((statusOption) => (
                    <button
                      key={statusOption.value}
                      onClick={() => {
                        requestStatusUpdate(selectedAppointment._id, statusOption.value as Appointment['status'], selectedAppointment.name, selectedAppointment.status);
                        setShowDetailsModal(false);
                      }}
                      disabled={updatingStatus === selectedAppointment._id}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                        statusOption.value === 'confirmed' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                        statusOption.value === 'completed' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                        'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      } disabled:opacity-50`}
                    >
                      {statusOption.icon}
                      <span>Set {statusOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gold-600/20 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gold-400 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Client Information</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Full Name</p>
                      <p className="text-white font-medium">{selectedAppointment.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email Address</p>
                      <p className="text-white font-medium">{selectedAppointment.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-white font-medium">{selectedAppointment.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gold-600/20 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gold-400 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Appointment Details</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">{selectedAppointment.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Time Slot</p>
                      <p className="text-white font-medium">{selectedAppointment.time} - {selectedAppointment.finishingTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Stylist</p>
                      <p className="text-white font-medium">{selectedAppointment.stylist}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Duration</p>
                      <p className="text-white font-medium">{selectedAppointment.totalDuration} minutes</p>
                    </div>
                    {selectedAppointment.status === 'confirmed' && (
                      <div>
                        <p className="text-gray-400 text-sm">Time Remaining</p>
                        <div className="text-gold-400 font-mono">
                          {getCountdownDisplay(selectedAppointment._id)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gold-600/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gold-400 mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Services Booked ({selectedAppointment.services.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedAppointment.services.map((service, idx) => (
                    <div key={`modal-srvc-${idx}`} className="flex items-center justify-between py-2 border-b border-gold-600/10 last:border-0">
                      <div>
                        <p className="text-white">{service.name}</p>
                        <p className="text-gray-400 text-xs">{service.category} • {service.duration} min</p>
                      </div>
                      <p className="text-gold-400 font-semibold">Rs.{service.price}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-gold-600/30">
                    <span className="text-gray-400">Services Total</span>
                    <span className="text-white">Rs.{selectedAppointment.servicesTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Appointment Fee</span>
                    <span className="text-white">Rs.{selectedAppointment.appointmentFee}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gold-400 font-bold text-lg">Total Amount</span>
                    <span className="text-gold-400 font-bold text-2xl">Rs.{selectedAppointment.totalPrice}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="border border-gold-600/20 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gold-400 mb-3 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Special Notes</span>
                  </h4>
                  <p className="text-gray-300 bg-dark-700/30 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="text-center pt-4 border-t border-gold-600/20">
                <p className="text-gray-500 text-xs">
                  Created on {new Date(selectedAppointment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}