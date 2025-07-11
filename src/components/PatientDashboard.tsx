import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Baby, 
  Droplets, 
  Scale,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Stethoscope,
  BookOpen,
  Target,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { Patient, HealthRecord, BloodPressureData, SugarLevelData, BabyMovementData, WeeklyUpdateData } from '../types';

interface PatientDashboardProps {
  patient: Patient;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordType, setRecordType] = useState<'blood_pressure' | 'sugar_level' | 'baby_movement' | 'weekly_update'>('blood_pressure');

  // Mock health records for demonstration
  const mockHealthRecords: HealthRecord[] = [
    {
      id: '1',
      patientId: patient.id,
      date: new Date().toISOString(),
      type: 'blood_pressure',
      data: { systolic: 120, diastolic: 80, heartRate: 72, notes: 'Normal reading' }
    },
    {
      id: '2',
      patientId: patient.id,
      date: new Date(Date.now() - 86400000).toISOString(),
      type: 'sugar_level',
      data: { level: 95, testType: 'fasting', notes: 'Good control' }
    },
    {
      id: '3',
      patientId: patient.id,
      date: new Date(Date.now() - 172800000).toISOString(),
      type: 'baby_movement',
      data: { count: 12, duration: 60, notes: 'Active baby' }
    }
  ];

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    ...mockHealthRecords,
    ...(patient.healthRecords || [])
  ]);

  const [formData, setFormData] = useState({
    // Blood Pressure
    systolic: '',
    diastolic: '',
    heartRate: '',
    // Sugar Level
    sugarLevel: '',
    testType: 'fasting' as 'fasting' | 'random' | 'post_meal',
    // Baby Movement
    movementCount: '',
    duration: '',
    // Weekly Update
    weight: '',
    symptoms: [] as string[],
    mood: 5,
    // Common
    notes: ''
  });

  // Save health records to localStorage and notify doctor
  const saveHealthRecord = (record: HealthRecord) => {
    const updatedRecords = [...healthRecords, record];
    setHealthRecords(updatedRecords);
    
    // Update patient's health records in localStorage
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === patient.id);
    if (userIndex !== -1) {
      existingUsers[userIndex].healthRecords = updatedRecords;
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    }
    
    // Create notification for doctor
    const notification = {
      id: Date.now().toString(),
      patientId: patient.id,
      patientName: patient.name,
      type: record.type === 'blood_pressure' && (record.data.systolic > 140 || record.data.diastolic > 90) ? 'urgent' : 'info',
      message: getNotificationMessage(record),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Save notification for doctor
    const existingNotifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('doctorNotifications', JSON.stringify(existingNotifications));
  };

  const getNotificationMessage = (record: HealthRecord) => {
    switch (record.type) {
      case 'blood_pressure':
        const bp = record.data as BloodPressureData;
        if (bp.systolic > 140 || bp.diastolic > 90) {
          return `High blood pressure reading: ${bp.systolic}/${bp.diastolic}`;
        }
        return `New blood pressure reading: ${bp.systolic}/${bp.diastolic}`;
      case 'sugar_level':
        const sugar = record.data as SugarLevelData;
        return `New sugar level reading: ${sugar.level} mg/dL (${sugar.testType})`;
      case 'baby_movement':
        const movement = record.data as BabyMovementData;
        return `Baby movement recorded: ${movement.count} movements in ${movement.duration} minutes`;
      case 'weekly_update':
        return 'New weekly update submitted';
      default:
        return 'New health record added';
    }
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    let data: any = {};
    
    switch (recordType) {
      case 'blood_pressure':
        data = {
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          heartRate: parseInt(formData.heartRate),
          notes: formData.notes
        };
        break;
      case 'sugar_level':
        data = {
          level: parseInt(formData.sugarLevel),
          testType: formData.testType,
          notes: formData.notes
        };
        break;
      case 'baby_movement':
        data = {
          count: parseInt(formData.movementCount),
          duration: parseInt(formData.duration),
          notes: formData.notes
        };
        break;
      case 'weekly_update':
        data = {
          weight: parseFloat(formData.weight),
          symptoms: formData.symptoms,
          mood: formData.mood,
          notes: formData.notes
        };
        break;
    }
    
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      patientId: patient.id,
      date: new Date().toISOString(),
      type: recordType,
      data
    };
    
    saveHealthRecord(newRecord);
    setShowAddRecord(false);
    
    // Reset form
    setFormData({
      systolic: '',
      diastolic: '',
      heartRate: '',
      sugarLevel: '',
      testType: 'fasting',
      movementCount: '',
      duration: '',
      weight: '',
      symptoms: [],
      mood: 5,
      notes: ''
    });
  };

  const calculateWeeksRemaining = () => {
    if (!patient.dueDate) return 0;
    const dueDate = new Date(patient.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, diffWeeks);
  };

  const getLatestReading = (type: string) => {
    return healthRecords
      .filter(record => record.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Pregnancy Progress */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Week {patient.currentWeek || 0}</h3>
            <p className="text-pink-100">of your pregnancy journey</p>
          </div>
          <Baby className="w-12 h-12 text-pink-200" />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(((patient.currentWeek || 0) / 40) * 100)}%</span>
          </div>
          <div className="w-full bg-pink-400 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${((patient.currentWeek || 0) / 40) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-pink-200">Due Date</p>
            <p className="font-semibold">{patient.dueDate ? new Date(patient.dueDate).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div>
            <p className="text-pink-200">Weeks Remaining</p>
            <p className="font-semibold">{calculateWeeksRemaining()} weeks</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blood Pressure</p>
              {(() => {
                const latest = getLatestReading('blood_pressure');
                return latest ? (
                  <p className="text-lg font-bold text-gray-800">
                    {latest.data.systolic}/{latest.data.diastolic}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-400">No data</p>
                );
              })()}
            </div>
            <Activity className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sugar Level</p>
              {(() => {
                const latest = getLatestReading('sugar_level');
                return latest ? (
                  <p className="text-lg font-bold text-gray-800">
                    {latest.data.level} mg/dL
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-400">No data</p>
                );
              })()}
            </div>
            <Droplets className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Baby Movements</p>
              {(() => {
                const latest = getLatestReading('baby_movement');
                return latest ? (
                  <p className="text-lg font-bold text-gray-800">
                    {latest.data.count} today
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-400">No data</p>
                );
              })()}
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Records</h3>
          <button
            onClick={() => setActiveTab('records')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </button>
        </div>
        
        <div className="space-y-3">
          {healthRecords.slice(0, 3).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  record.type === 'blood_pressure' ? 'bg-red-100' :
                  record.type === 'sugar_level' ? 'bg-blue-100' :
                  record.type === 'baby_movement' ? 'bg-pink-100' :
                  'bg-green-100'
                }`}>
                  {record.type === 'blood_pressure' && <Activity className="w-5 h-5 text-red-600" />}
                  {record.type === 'sugar_level' && <Droplets className="w-5 h-5 text-blue-600" />}
                  {record.type === 'baby_movement' && <Heart className="w-5 h-5 text-pink-600" />}
                  {record.type === 'weekly_update' && <Scale className="w-5 h-5 text-green-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-800 capitalize">
                    {record.type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
          
          {healthRecords.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No health records yet</p>
              <p className="text-sm text-gray-400">Start tracking your health data</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
        
        <div className="space-y-3">
          {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
            patient.emergencyContacts.slice(0, 2).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Phone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No emergency contacts set</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      {/* Add Record Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Health Records</h2>
        <button
          onClick={() => setShowAddRecord(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {healthRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  record.type === 'blood_pressure' ? 'bg-red-100' :
                  record.type === 'sugar_level' ? 'bg-blue-100' :
                  record.type === 'baby_movement' ? 'bg-pink-100' :
                  'bg-green-100'
                }`}>
                  {record.type === 'blood_pressure' && <Activity className="w-6 h-6 text-red-600" />}
                  {record.type === 'sugar_level' && <Droplets className="w-6 h-6 text-blue-600" />}
                  {record.type === 'baby_movement' && <Heart className="w-6 h-6 text-pink-600" />}
                  {record.type === 'weekly_update' && <Scale className="w-6 h-6 text-green-600" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {record.type.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {record.type === 'blood_pressure' && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Systolic</p>
                    <p className="font-semibold">{record.data.systolic} mmHg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Diastolic</p>
                    <p className="font-semibold">{record.data.diastolic} mmHg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className="font-semibold">{record.data.heartRate} bpm</p>
                  </div>
                </>
              )}
              
              {record.type === 'sugar_level' && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="font-semibold">{record.data.level} mg/dL</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Test Type</p>
                    <p className="font-semibold capitalize">{record.data.testType.replace('_', ' ')}</p>
                  </div>
                </>
              )}
              
              {record.type === 'baby_movement' && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Count</p>
                    <p className="font-semibold">{record.data.count} movements</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold">{record.data.duration} minutes</p>
                  </div>
                </>
              )}
              
              {record.type === 'weekly_update' && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-semibold">{record.data.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mood</p>
                    <p className="font-semibold">{record.data.mood}/10</p>
                  </div>
                </>
              )}
            </div>
            
            {record.data.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{record.data.notes}</p>
              </div>
            )}
          </div>
        ))}
        
        {healthRecords.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No health records yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your health data to monitor your pregnancy journey</p>
            <button
              onClick={() => setShowAddRecord(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              Add Your First Record
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddRecordModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Add Health Record</h3>
            <button
              onClick={() => setShowAddRecord(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Record Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Record Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecordType('blood_pressure')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  recordType === 'blood_pressure'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Activity className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Blood Pressure</span>
              </button>
              <button
                type="button"
                onClick={() => setRecordType('sugar_level')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  recordType === 'sugar_level'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Droplets className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Sugar Level</span>
              </button>
              <button
                type="button"
                onClick={() => setRecordType('baby_movement')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  recordType === 'baby_movement'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <Heart className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Baby Movement</span>
              </button>
              <button
                type="button"
                onClick={() => setRecordType('weekly_update')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  recordType === 'weekly_update'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Scale className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Weekly Update</span>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmitRecord} className="space-y-4">
            {recordType === 'blood_pressure' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      value={formData.systolic}
                      onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      value={formData.diastolic}
                      onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="80"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="72"
                    required
                  />
                </div>
              </>
            )}
            
            {recordType === 'sugar_level' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sugar Level (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.sugarLevel}
                    onChange={(e) => setFormData({...formData, sugarLevel: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="95"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type
                  </label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({...formData, testType: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="fasting">Fasting</option>
                    <option value="random">Random</option>
                    <option value="post_meal">Post Meal</option>
                  </select>
                </div>
              </>
            )}
            
            {recordType === 'baby_movement' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Movement Count
                  </label>
                  <input
                    type="number"
                    value={formData.movementCount}
                    onChange={(e) => setFormData({...formData, movementCount: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="60"
                    required
                  />
                </div>
              </>
            )}
            
            {recordType === 'weekly_update' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="65.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mood (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.mood}
                    onChange={(e) => setFormData({...formData, mood: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span className="font-medium">{formData.mood}</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddRecord(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'records':
        return renderRecords();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {patient.name}
          </h1>
          <p className="text-gray-600">
            Track your pregnancy journey and stay healthy
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'records'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Health Records
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'education'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Education
            </button>
          </nav>
        </div>

        {renderContent()}
      </div>
      
      {/* Add Record Modal */}
      {showAddRecord && renderAddRecordModal()}
    </div>
  );
};

export default PatientDashboard;