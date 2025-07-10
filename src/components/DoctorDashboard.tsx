import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Activity, 
  Bell, 
  Search,
  Filter,
  MoreVertical,
  Phone,
  Video,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorDashboardProps {
  doctor: Doctor;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  // Load real patients and notifications
  useEffect(() => {
    const loadPatientsAndNotifications = () => {
      // Load all registered users and filter patients assigned to Dr. Rajesh
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const assignedPatients = registeredUsers.filter((user: any) => 
        user.role === 'patient' && user.doctorId === 'dr_rajesh'
      );
      
      // Transform patient data for display
      const transformedPatients = assignedPatients.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        age: calculateAge(patient.dueDate),
        week: patient.currentWeek || 0,
        dueDate: patient.dueDate || 'Not set',
        status: determinePatientStatus(patient),
        lastVisit: getLastVisit(patient),
        avatar: patient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        email: patient.email,
        healthRecords: patient.healthRecords || []
      }));
      
      setPatients(transformedPatients);
      
      // Load notifications
      const doctorNotifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
      setNotifications(doctorNotifications.slice(0, 5)); // Show latest 5
    };

    loadPatientsAndNotifications();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(loadPatientsAndNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const calculateAge = (dueDate: string) => {
    if (!dueDate) return 28; // Default age
    // Calculate approximate age based on due date (assuming average pregnancy age)
    return 28; // Simplified for demo
  };

  const determinePatientStatus = (patient: any) => {
    const healthRecords = patient.healthRecords || [];
    if (healthRecords.length === 0) return 'attention';
    
    // Check latest blood pressure reading
    const latestBP = healthRecords
      .filter((r: any) => r.type === 'blood_pressure')
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (latestBP) {
      const { systolic, diastolic } = latestBP.data;
      if (systolic > 140 || diastolic > 90) return 'critical';
      if (systolic > 130 || diastolic > 85) return 'attention';
    }
    
    return 'normal';
  };

  const getLastVisit = (patient: any) => {
    const healthRecords = patient.healthRecords || [];
    if (healthRecords.length === 0) return 'No records';
    
    const latestRecord = healthRecords
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    return new Date(latestRecord.date).toLocaleDateString();
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    
    // Update in localStorage
    const allNotifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
    const updatedAllNotifications = allNotifications.map((notif: any) => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    localStorage.setItem('doctorNotifications', JSON.stringify(updatedAllNotifications));
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-800">{patients.filter(p => p.healthRecords.some((r: any) => {
                const recordDate = new Date(r.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return recordDate > weekAgo;
              })).length}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Cases</p>
              <p className="text-2xl font-bold text-gray-800">{patients.filter(p => p.status === 'critical').length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-bold text-gray-800">{notifications.filter(n => !n.read).length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
        </div>
        
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
              }`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className={`w-2 h-2 rounded-full ${
                notification.type === 'urgent' ? 'bg-red-500' : 
                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{notification.patientName}</p>
                <p className="text-xs text-gray-600">{notification.message}</p>
              </div>
              <span className="text-xs text-gray-500">{getTimeAgo(notification.timestamp)}</span>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No recent alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Patients</h3>
          <button 
            onClick={() => setActiveTab('patients')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all patients
          </button>
        </div>
        
        <div className="space-y-3">
          {patients.slice(0, 3).map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {patient.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{patient.name}</p>
                  <p className="text-xs text-gray-600">Week {patient.week} • Due: {patient.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.status === 'normal' ? 'bg-green-100 text-green-800' :
                  patient.status === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {patient.status}
                </span>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {patient.avatar}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{patient.name}</p>
                  <p className="text-sm text-gray-600">{patient.age} years old</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pregnancy Week</span>
                <span className="font-medium">{patient.week}/40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="font-medium">{patient.dueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.status === 'normal' ? 'bg-green-100 text-green-800' :
                  patient.status === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {patient.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Phone className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {patients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No patients assigned yet</h3>
          <p className="text-gray-600">Patients will appear here when they register and are assigned to you.</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return renderPatients();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, Dr. {doctor.name}
          </h1>
          <p className="text-gray-600">
            Monitor your patients and provide the best care possible
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'patients'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Schedule
            </button>
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorDashboard;
