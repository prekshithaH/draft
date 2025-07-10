import React, { useState , useEffect} from 'react';
import { 
  Activity, 
  Droplets, 
  Baby,
  Edit3
  Zap
  ChefHat, 
  Phone, 
  MessageCircle, 
  FileText, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  Heart,
  Plus,
  Home,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { Patient, HealthRecord, BloodPressureData, SugarLevelData, BabyMovementData, WeeklyUpdateData } from '../types';

interface PatientDashboardProps {
  patient: Patient;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [recordType, setRecordType] = useState<'blood_pressure' | 'sugar_level' | 'baby_movement' | 'weekly_update'>('blood_pressure');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(patient.healthRecords || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Mock health records for demonstration
  
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    ...mockHealthRecords,
    ...(patient.healthRecords || [])
  ]);
  // Form states
  const [bloodPressureForm, setBloodPressureForm] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    notes: ''
  });

  const [sugarLevelForm, setSugarLevelForm] = useState({
    level: '',
    testType: 'fasting' as 'fasting' | 'random' | 'post_meal',
    notes: ''
  });

  const [babyMovementForm, setBabyMovementForm] = useState({
    count: '',
    duration: '',
    notes: ''
  });

    const [weeklyUpdateForm, setWeeklyUpdateForm] = useState({
    weight: '',
    symptoms: [] as string[],
    mood: 5,
    notes: ''
  });

  const [nutritionForm, setNutritionForm] = useState({
    meal: '',
    foods: '',
    calories: '',
    notes: ''
  });
  // Load health records from localStorage on component mount
  useEffect(() => {
    const storedRecords = localStorage.getItem(`healthRecords_${patient.id}`);
    if (storedRecords) {
      setHealthRecords(JSON.parse(storedRecords));
    }
  }, [patient.id]);

  // Save health records to localStorage and notify doctor
  const saveHealthRecords = (records: HealthRecord[]) => {
    localStorage.setItem(`healthRecords_${patient.id}`, JSON.stringify(records));
    
    // Update patient's health records in user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id === patient.id) {
      currentUser.healthRecords = records;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }

    // Update in registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = registeredUsers.findIndex((u: any) => u.id === patient.id);
    if (userIndex !== -1) {
      registeredUsers[userIndex].healthRecords = records;
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    // Create notification for Dr. Rajesh
    const notifications = JSON.parse(localStorage.getItem('doctorNotifications') || '[]');
    const newNotification = {
      id: Date.now().toString(),
      patientId: patient.id,
      patientName: patient.name,
      message: `New health record added`,
      type: 'health_update',
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.push(newNotification);
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));
  };
  const handleSubmitRecord = async () => {
    setIsSubmitting(true);
    
    let recordData: any;
    
    switch (recordType) {
      case 'blood_pressure':
        recordData = {
          systolic: parseInt(bloodPressureForm.systolic),
          diastolic: parseInt(bloodPressureForm.diastolic),
          heartRate: parseInt(bloodPressureForm.heartRate),
          notes: bloodPressureForm.notes
        };
        break;
      case 'sugar_level':
        recordData = {
          level: parseFloat(sugarLevelForm.level),
          testType: sugarLevelForm.testType,
          notes: sugarLevelForm.notes
        };
        break;
      case 'baby_movement':
        recordData = {
          count: parseInt(babyMovementForm.count),
          duration: parseInt(babyMovementForm.duration),
          notes: babyMovementForm.notes
        };
        break;
      case 'weekly_update':
        recordData = {
          weight: parseFloat(weeklyUpdateForm.weight),
          symptoms: weeklyUpdateForm.symptoms,
          mood: weeklyUpdateForm.mood,
          notes: weeklyUpdateForm.notes
        };
        break;
    }

    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      patientId: patient.id,
      date: new Date().toISOString(),
      type: recordType,
      data: recordData
    };

    const updatedRecords = [...healthRecords, newRecord];
    setHealthRecords(updatedRecords);
    saveHealthRecords(updatedRecords);

    // Reset forms
    setBloodPressureForm({ systolic: '', diastolic: '', heartRate: '', notes: '' });
    setSugarLevelForm({ level: '', testType: 'fasting', notes: '' });
    setBabyMovementForm({ count: '', duration: '', notes: '' });
    setWeeklyUpdateForm({ weight: '', symptoms: [], mood: 5, notes: '' });
    
    setShowAddRecord(false);
    setIsSubmitting(false);
  };

  const getLatestRecord = (type: string) => {
    return healthRecords
      .filter(record => record.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };
  const features = [
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      icon: Activity,
      color: 'bg-red-500',
      description: 'Track your blood pressure readings'
    },
    {
      id: 'sugar-level',
      title: 'Sugar Level',
      icon: Droplets,
      color: 'bg-blue-500',
      description: 'Monitor your glucose levels'
    },
    {
      id: 'baby-movement',
      title: 'Baby Movement',
      icon: Baby,
      color: 'bg-pink-500',
      description: 'Record your baby\'s movements'
    },
    {
      id: 'nutrition',
      title: 'Nutrition Chart',
      icon: ChefHat,
      color: 'bg-green-500',
      description: 'Weekly nutritional guidance'
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: Phone,
      color: 'bg-orange-500',
      description: 'Quick access to emergency contacts'
    },
    {
      id: 'doctor-chat',
      title: 'Doctor Connect',
      icon: MessageCircle,
      color: 'bg-purple-500',
      description: 'Chat with your doctor'
    },
    {
      id: 'health-update',
      title: 'Health Update',
      icon: FileText,
      color: 'bg-indigo-500',
      description: 'Submit weekly health updates'
    },
    {
      id: 'sos',
      title: 'SOS Emergency',
      icon: AlertTriangle,
      color: 'bg-red-600',
      description: 'Emergency alert button'
    }
  ];

  const addHealthRecord = (type: string, data: any) => {
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      patientId: patient.id,
      date: new Date().toISOString(),
      type: type as any,
      data
    };

    const updatedRecords = [newRecord, ...healthRecords];
    setHealthRecords(updatedRecords);
    
    // Save only user-added records (not mock data) to localStorage
    const userRecords = updatedRecords.filter(record => !record.id.startsWith('mock-'));
    const updatedPatient = { ...patient, healthRecords: userRecords };
    localStorage.setItem('user', JSON.stringify(updatedPatient));
    
    // Update registered users as well
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === patient.id);
    if (userIndex !== -1) {
      existingUsers[userIndex] = { ...existingUsers[userIndex], healthRecords: userRecords };
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    }
    
    setShowAddForm(false);
    resetForms();
  };

  const resetForms = () => {
    setBloodPressureForm({ systolic: '', diastolic: '', heartRate: '', notes: '' });
    setSugarLevelForm({ level: '', testType: 'fasting', notes: '' });
    setBabyMovementForm({ count: '', duration: '', notes: '' });
    setNutritionForm({ meal: '', foods: '', calories: '', notes: '' });
  };

  const getRecordsByType = (type: string) => {
    return healthRecords.filter(record => record.type === type);
  };

  const getLatestRecord = (type: string) => {
    const records = getRecordsByType(type);
    return records.length > 0 ? records[0] : null;
  };

  const getAverageBloodPressure = () => {
    const records = getRecordsByType('blood_pressure');
    if (records.length === 0) return null;
    
    const total = records.reduce((acc, record) => ({
      systolic: acc.systolic + record.data.systolic,
      diastolic: acc.diastolic + record.data.diastolic,
      heartRate: acc.heartRate + (record.data.heartRate || 0)
    }), { systolic: 0, diastolic: 0, heartRate: 0 });
    
    return {
      systolic: Math.round(total.systolic / records.length),
      diastolic: Math.round(total.diastolic / records.length),
      heartRate: Math.round(total.heartRate / records.length)
    };
  };

  const getAverageSugarLevel = () => {
    const records = getRecordsByType('sugar_level');
    if (records.length === 0) return null;
    
    const total = records.reduce((acc, record) => acc + record.data.level, 0);
    return Math.round(total / records.length);
  };

  const getAverageBabyMovement = () => {
    const records = getRecordsByType('baby_movement');
    if (records.length === 0) return null;
    
    const total = records.reduce((acc, record) => ({
      count: acc.count + record.data.count,
      duration: acc.duration + (record.data.duration || 0)
    }), { count: 0, duration: 0 });
    
    return {
      count: Math.round(total.count / records.length),
      duration: Math.round(total.duration / records.length)
    };
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOverview = () => {
     const weeksRemaining = calculateWeeksRemaining();
    const latestBP = getLatestRecord('blood_pressure');
    const latestSugar = getLatestRecord('sugar_level');
    const latestMovement = getLatestRecord('baby_movement');
    return (
    <div className="space-y-6">
      {/* Pregnancy Progress */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pregnancy Progress</h3>
            <p className="text-pink-100">Week {patient.currentWeek || 0} of 40</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{patient.currentWeek || 0}/40</p>
            <p className="text-pink-100">weeks</p>
          </div>
        </div>
        <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${((patient.currentWeek || 0) / 40) * 100}%` }}
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
            onClick={() => setActiveTab(feature.id)}
          >
            <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
              <feature.icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
       {/* Recent Records */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Health Records</h3>
            <button
              onClick={() => setActiveTab('records')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </button>
          </div>
          
          {healthRecords.length > 0 ? (
            <div className="space-y-3">
              {healthRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        record.type === 'blood_pressure' ? 'bg-red-100' :
                        record.type === 'sugar_level' ? 'bg-blue-100' :
                        record.type === 'baby_movement' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {record.type === 'blood_pressure' && <Activity className="w-4 h-4 text-red-600" />}
                        {record.type === 'sugar_level' && <Droplets className="w-4 h-4 text-blue-600" />}
                        {record.type === 'baby_movement' && <Zap className="w-4 h-4 text-green-600" />}
                        {record.type === 'weekly_update' && <Weight className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {record.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {record.type === 'blood_pressure' && `${record.data.systolic}/${record.data.diastolic}`}
                        {record.type === 'sugar_level' && `${record.data.level} mg/dL`}
                        {record.type === 'baby_movement' && `${record.data.count} kicks`}
                        {record.type === 'weekly_update' && `${record.data.weight} kg`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No health records yet</p>
              <button
                onClick={() => {
                  setShowAddRecord(true);
                  setActiveTab('records');
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Your First Record
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecords = () => (
    <div className="space-y-6">
      {/* Add Record Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Health Records</h2>
        <button
          onClick={() => setShowAddRecord(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 gap-4">
        {healthRecords
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((record) => (
            <div key={record.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.type === 'blood_pressure' ? 'bg-red-100' :
                    record.type === 'sugar_level' ? 'bg-blue-100' :
                    record.type === 'baby_movement' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {record.type === 'blood_pressure' && <Activity className="w-5 h-5 text-red-600" />}
                    {record.type === 'sugar_level' && <Droplets className="w-5 h-5 text-blue-600" />}
                    {record.type === 'baby_movement' && <Zap className="w-5 h-5 text-green-600" />}
                    {record.type === 'weekly_update' && <Weight className="w-5 h-5 text-purple-600" />}
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <p className="text-xs text-gray-500">Kick Count</p>
                      <p className="font-semibold">{record.data.count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold">{record.data.duration} min</p>
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
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{record.data.notes}</p>
                </div>
              )}
            </div>
          ))}
      </div>

      {healthRecords.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No health records yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your health by adding your first record</p>
          <button
            onClick={() => setShowAddRecord(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Your First Record
          </button>
        </div>
      )}
    </div>
  );

  const renderAddRecordForm = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Add Health Record</h3>
        <button
          onClick={() => setShowAddRecord(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {healthRecords.length > 0 ? (
          <div className="space-y-3">
            {healthRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{record.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                </div>
                <div className="text-right">
                  {record.type === 'blood_pressure' && (
                    <p className="text-xs font-medium text-gray-700">
                      {record.data.systolic}/{record.data.diastolic}
                    </p>
                  )}
                  {record.type === 'sugar_level' && (
                    <p className="text-xs font-medium text-gray-700">
                      {record.data.level} mg/dL
                    </p>
                  )}
                  {record.type === 'baby_movement' && (
                    <p className="text-xs font-medium text-gray-700">
                      {record.data.count} moves
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activity yet. Start tracking your health!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBloodPressureForm = () => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h4 className="text-lg font-semibold mb-4">Add Blood Pressure Reading</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Systolic (mmHg)</label>
          <input
            type="number"
            value={bloodPressureForm.systolic}
            onChange={(e) => setBloodPressureForm({...bloodPressureForm, systolic: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="120"
            min="60"
            max="250"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic (mmHg)</label>
          <input
            type="number"
            value={bloodPressureForm.diastolic}
            onChange={(e) => setBloodPressureForm({...bloodPressureForm, diastolic: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="80"
            min="40"
            max="150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
          <input
            type="number"
            value={bloodPressureForm.heartRate}
            onChange={(e) => setBloodPressureForm({...bloodPressureForm, heartRate: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="72"
            min="40"
            max="200"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={bloodPressureForm.notes}
          onChange={(e) => setBloodPressureForm({...bloodPressureForm, notes: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows={3}
          placeholder="Any additional notes..."
        />
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            const systolic = parseInt(bloodPressureForm.systolic);
            const diastolic = parseInt(bloodPressureForm.diastolic);
            const heartRate = bloodPressureForm.heartRate ? parseInt(bloodPressureForm.heartRate) : 0;
            
            if (systolic && diastolic && systolic > 0 && diastolic > 0) {
              addHealthRecord('blood_pressure', {
                systolic,
                diastolic,
                heartRate,
                notes: bloodPressureForm.notes
              });
            } else {
              alert('Please enter valid systolic and diastolic values');
            }
          }}
          disabled={!bloodPressureForm.systolic || !bloodPressureForm.diastolic}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Reading</span>
        </button>
        <button
          onClick={() => setShowAddForm(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );

  const renderBloodPressure = () => {
    const records = getRecordsByType('blood_pressure');
    const latestRecord = getLatestRecord('blood_pressure');
    const averageData = getAverageBloodPressure();
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold">Blood Pressure Tracker</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reading</span>
            </button>
          </div>
        </div>
        
        {showAddForm && renderBloodPressureForm()}
         {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xs text-gray-500">Latest</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Blood Pressure</h4>
            {latestBP ? (
              <p className="text-lg font-bold text-gray-900">
                {latestBP.data.systolic}/{latestBP.data.diastolic}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No records yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Latest</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Sugar Level</h4>
            {latestSugar ? (
              <p className="text-lg font-bold text-gray-900">
                {latestSugar.data.level} mg/dL
              </p>
            ) : (
              <p className="text-sm text-gray-500">No records yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Latest</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Baby Movements</h4>
            {latestMovement ? (
              <p className="text-lg font-bold text-gray-900">
                {latestMovement.data.count} kicks
              </p>
            ) : (
              <p className="text-sm text-gray-500">No records yet</p>
            )}
          </div>
        </div>
        
        {/* Doctor Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Healthcare Team</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              DR
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Dr. Rajesh</p>
              <p className="text-sm text-gray-600">Obstetrician & Gynecologist</p>
              <p className="text-xs text-gray-500">Your assigned doctor</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                <Phone className="w-4 h-4 text-blue-600" />
              </button>
              <button className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h4 className="font-medium text-red-800 mb-2">Latest Reading</h4>
              {latestRecord && (
                <div>
                  <p className="text-lg font-bold text-red-700">
                    {latestRecord.data.systolic}/{latestRecord.data.diastolic} mmHg
                  </p>
                  {latestRecord.data.heartRate > 0 && (
                    <p className="text-sm text-red-600">HR: {latestRecord.data.heartRate} bpm</p>
                  )}
                  <p className="text-xs text-red-500 mt-1">{formatDate(latestRecord.date)}</p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Average ({records.length} readings)</h4>
              {averageData && (
                <div>
                  <p className="text-lg font-bold text-blue-700">
                    {averageData.systolic}/{averageData.diastolic} mmHg
                  </p>
                  {averageData.heartRate > 0 && (
                    <p className="text-sm text-blue-600">Avg HR: {averageData.heartRate} bpm</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {record.data.systolic}/{record.data.diastolic} mmHg
                      </p>
                      {record.data.heartRate > 0 && (
                        <p className="text-sm text-gray-600">Heart Rate: {record.data.heartRate} bpm</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                  </div>
                  {record.data.notes && (
                    <p className="text-sm text-gray-600 mt-2">{record.data.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No readings yet</h4>
              <p className="text-gray-500 mb-6">Start tracking your blood pressure by adding your first reading</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add First Reading
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSugarLevelForm = () => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h4 className="text-lg font-semibold mb-4">Add Sugar Level Reading</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sugar Level (mg/dL)</label>
          <input
            type="number"
            value={sugarLevelForm.level}
            onChange={(e) => setSugarLevelForm({...sugarLevelForm, level: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="100"
            min="50"
            max="400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
          <select
            value={sugarLevelForm.testType}
            onChange={(e) => setSugarLevelForm({...sugarLevelForm, testType: e.target.value as any})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fasting">Fasting</option>
            <option value="random">Random</option>
            <option value="post_meal">Post Meal</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={sugarLevelForm.notes}
          onChange={(e) => setSugarLevelForm({...sugarLevelForm, notes: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Any additional notes..."
        />
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            const level = parseInt(sugarLevelForm.level);
            
            if (level && level > 0) {
              addHealthRecord('sugar_level', {
                level,
                testType: sugarLevelForm.testType,
                notes: sugarLevelForm.notes
              });
            } else {
              alert('Please enter a valid sugar level');
            }
          }}
          disabled={!sugarLevelForm.level}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Reading</span>
        </button>
        <button
          onClick={() => setShowAddForm(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );

  const renderSugarLevel = () => {
    const records = getRecordsByType('sugar_level');
    const latestRecord = getLatestRecord('sugar_level');
    const averageLevel = getAverageSugarLevel();
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold">Sugar Level Tracker</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reading</span>
            </button>
          </div>
        </div>
        
        {showAddForm && renderSugarLevelForm()}
        
        {/* Statistics Cards */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Latest Reading</h4>
              {latestRecord && (
                <div>
                  <p className="text-lg font-bold text-blue-700">{latestRecord.data.level} mg/dL</p>
                  <p className="text-sm text-blue-600 capitalize">{latestRecord.data.testType.replace('_', ' ')}</p>
                  <p className="text-xs text-blue-500 mt-1">{formatDate(latestRecord.date)}</p>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h4 className="font-medium text-green-800 mb-2">Average ({records.length} readings)</h4>
              {averageLevel && (
                <div>
                  <p className="text-lg font-bold text-green-700">{averageLevel} mg/dL</p>
                  <p className="text-sm text-green-600">All test types</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{record.data.level} mg/dL</p>
                      <p className="text-sm text-gray-600 capitalize">{record.data.testType.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                  </div>
                  {record.data.notes && (
                    <p className="text-sm text-gray-600 mt-2">{record.data.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No readings yet</h4>
              <p className="text-gray-500 mb-6">Start monitoring your sugar levels by adding your first reading</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add First Reading
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBabyMovementForm = () => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h4 className="text-lg font-semibold mb-4">Log Baby Movement</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Movement Count</label>
          <input
            type="number"
            value={babyMovementForm.count}
            onChange={(e) => setBabyMovementForm({...babyMovementForm, count: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="10"
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={babyMovementForm.duration}
            onChange={(e) => setBabyMovementForm({...babyMovementForm, duration: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="30"
            min="1"
            max="300"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={babyMovementForm.notes}
          onChange={(e) => setBabyMovementForm({...babyMovementForm, notes: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows={3}
          placeholder="Describe the movements..."
        />
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            const count = parseInt(babyMovementForm.count);
            const duration = babyMovementForm.duration ? parseInt(babyMovementForm.duration) : 0;
            
            if (count && count > 0) {
              addHealthRecord('baby_movement', {
                count,
                duration,
                notes: babyMovementForm.notes
              });
            } else {
              alert('Please enter a valid movement count');
            }
          }}
          disabled={!babyMovementForm.count}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Movement</span>
        </button>
        <button
          onClick={() => setShowAddForm(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );

  const renderBabyMovement = () => {
    const records = getRecordsByType('baby_movement');
    const latestRecord = getLatestRecord('baby_movement');
    const averageData = getAverageBabyMovement();
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold">Baby Movement Tracker</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Movement</span>
            </button>
          </div>
        </div>
        
        {showAddForm && renderBabyMovementForm()}
        
        {/* Statistics Cards */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <h4 className="font-medium text-pink-800 mb-2">Latest Activity</h4>
              {latestRecord && (
                <div>
                  <p className="text-lg font-bold text-pink-700">{latestRecord.data.count} movements</p>
                  {latestRecord.data.duration > 0 && (
                    <p className="text-sm text-pink-600">{latestRecord.data.duration} minutes</p>
                  )}
                  <p className="text-xs text-pink-500 mt-1">{formatDate(latestRecord.date)}</p>
                </div>
              )}
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Average ({records.length} sessions)</h4>
              {averageData && (
                <div>
                  <p className="text-lg font-bold text-purple-700">{averageData.count} movements</p>
                  {averageData.duration > 0 && (
                    <p className="text-sm text-purple-600">Avg: {averageData.duration} min</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{record.data.count} movements</p>
                      {record.data.duration > 0 && (
                        <p className="text-sm text-gray-600">Duration: {record.data.duration} minutes</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                  </div>
                  {record.data.notes && (
                    <p className="text-sm text-gray-600 mt-2">{record.data.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No movements logged yet</h4>
              <p className="text-gray-500 mb-6">Start tracking your baby's movements to monitor their activity</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Log First Movement
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNutrition = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold">Nutrition Chart</h3>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Current Week Recommendations */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Week {patient.currentWeek || 0} Nutrition Focus</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-green-700 mb-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Key Nutrients This Week
              </h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Folic acid: 600-800 mcg daily</li>
                <li>• Iron: 27 mg daily</li>
                <li>• Calcium: 1000 mg daily</li>
                <li>• Protein: 75-100g daily</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-blue-700 mb-2 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Daily Hydration
              </h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Water: 8-10 glasses (2-2.5L)</li>
                <li>• Coconut water: 1-2 glasses</li>
                <li>• Fresh fruit juices: 1 glass</li>
                <li>• Herbal teas: 1-2 cups</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Macronutrients */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Macronutrients Breakdown</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-medium text-red-700 mb-3">Proteins (25-30%)</h5>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">Target: 75-100g daily</p>
                <div className="text-gray-600">
                  <p className="font-medium mb-1">Best Sources:</p>
                  <ul className="space-y-1">
                    <li>• Lean chicken, fish</li>
                    <li>• Eggs, dairy products</li>
                    <li>• Lentils, beans</li>
                    <li>• Nuts, quinoa</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <h5 className="font-medium text-yellow-700 mb-3">Carbohydrates (45-65%)</h5>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">Target: 175-265g daily</p>
                <div className="text-gray-600">
                  <p className="font-medium mb-1">Best Sources:</p>
                  <ul className="space-y-1">
                    <li>• Whole grains, oats</li>
                    <li>• Sweet potatoes</li>
                    <li>• Fruits, vegetables</li>
                    <li>• Brown rice, quinoa</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-700 mb-3">Healthy Fats (20-35%)</h5>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">Target: 44-78g daily</p>
                <div className="text-gray-600">
                  <p className="font-medium mb-1">Best Sources:</p>
                  <ul className="space-y-1">
                    <li>• Avocados, olive oil</li>
                    <li>• Nuts, seeds</li>
                    <li>• Fatty fish (salmon)</li>
                    <li>• Coconut oil</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Micronutrients */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Essential Micronutrients</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-medium text-purple-700 mb-2">Folic Acid</h5>
              <p className="text-sm text-gray-600 mb-2">600-800 mcg daily</p>
              <p className="text-xs text-gray-500">Leafy greens, citrus fruits, fortified cereals</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-medium text-red-700 mb-2">Iron</h5>
              <p className="text-sm text-gray-600 mb-2">27 mg daily</p>
              <p className="text-xs text-gray-500">Red meat, spinach, lentils, tofu</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-700 mb-2">Calcium</h5>
              <p className="text-sm text-gray-600 mb-2">1000 mg daily</p>
              <p className="text-xs text-gray-500">Dairy, sardines, broccoli, almonds</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h5 className="font-medium text-orange-700 mb-2">Vitamin D</h5>
              <p className="text-sm text-gray-600 mb-2">600 IU daily</p>
              <p className="text-xs text-gray-500">Fortified milk, fatty fish, sunlight</p>
            </div>
            
            <div className="bg-teal-50 rounded-lg p-4">
              <h5 className="font-medium text-teal-700 mb-2">Omega-3</h5>
              <p className="text-sm text-gray-600 mb-2">200-300 mg DHA daily</p>
              <p className="text-xs text-gray-500">Salmon, walnuts, chia seeds</p>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <h5 className="font-medium text-pink-700 mb-2">Vitamin B12</h5>
              <p className="text-sm text-gray-600 mb-2">2.6 mcg daily</p>
              <p className="text-xs text-gray-500">Meat, fish, dairy, fortified foods</p>
            </div>
          </div>
        </div>
        
        {/* Foods to Avoid by Trimester */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Foods to Avoid During Pregnancy</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-medium text-red-700 mb-3">First Trimester (1-12 weeks)</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Raw or undercooked meat</li>
                <li>• Raw eggs and mayonnaise</li>
                <li>• High-mercury fish (shark, swordfish)</li>
                <li>• Unpasteurized dairy products</li>
                <li>• Alcohol and smoking</li>
                <li>• Excessive caffeine ({'>'}200mg/day)</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h5 className="font-medium text-orange-700 mb-3">Second Trimester (13-27 weeks)</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Continue first trimester restrictions</li>
                <li>• Deli meats (unless heated)</li>
                <li>• Raw sprouts</li>
                <li>• Unwashed fruits/vegetables</li>
                <li>• Herbal supplements without approval</li>
                <li>• Artificial sweeteners in excess</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <h5 className="font-medium text-yellow-700 mb-3">Third Trimester (28-40 weeks)</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• All previous restrictions</li>
                <li>• Excessive salt/sodium</li>
                <li>• Large amounts of liver</li>
                <li>• Energy drinks</li>
                <li>• Raw seafood (sushi, oysters)</li>
                <li>• Processed/junk foods</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Exercise Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recommended Exercises by Trimester</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-700 mb-3">First Trimester</h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Safe Activities:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Walking (30 min daily)</li>
                    <li>• Swimming</li>
                    <li>• Prenatal yoga</li>
                    <li>• Light strength training</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Benefits:</p>
                  <p className="text-gray-600">Reduces nausea, improves energy</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-700 mb-3">Second Trimester</h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Safe Activities:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Brisk walking</li>
                    <li>• Water aerobics</li>
                    <li>• Modified pilates</li>
                    <li>• Stationary cycling</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Benefits:</p>
                  <p className="text-gray-600">Peak energy, easier movement</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-medium text-purple-700 mb-3">Third Trimester</h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Safe Activities:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Gentle walking</li>
                    <li>• Prenatal yoga</li>
                    <li>• Pelvic floor exercises</li>
                    <li>• Breathing exercises</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Benefits:</p>
                  <p className="text-gray-600">Prepares for labor, reduces discomfort</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
            <h6 className="font-medium text-red-700 mb-2">⚠️ Exercises to Avoid:</h6>
            <ul className="text-sm text-red-600 space-y-1">
              <li>• Contact sports • High-impact activities • Hot yoga • Lying flat on back (after 1st trimester)</li>
              <li>• Heavy lifting • Activities with fall risk • Scuba diving • High-altitude activities</li>
            </ul>
          </div>
        </div>

        {/* Weekly Meal Plan Suggestion */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Sample Daily Meal Plan</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-purple-700 mb-2">Breakfast</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Oatmeal with berries</li>
                <li>• Greek yogurt</li>
                <li>• Orange juice</li>
                <li>• Prenatal vitamin</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-blue-700 mb-2">Lunch</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Grilled chicken salad</li>
                <li>• Whole grain bread</li>
                <li>• Avocado slices</li>
                <li>• Water with lemon</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-green-700 mb-2">Snacks</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Apple with almond butter</li>
                <li>• Cheese and crackers</li>
                <li>• Smoothie with spinach</li>
                <li>• Mixed nuts</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-orange-700 mb-2">Dinner</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Baked salmon</li>
                <li>• Quinoa pilaf</li>
                <li>• Steamed broccoli</li>
                <li>• Herbal tea</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorChat = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold">Doctor Connect</h3>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
      
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-600 mb-2">Doctor messaging coming soon</h4>
        <p className="text-gray-500 mb-6">Connect with your healthcare provider for guidance and support</p>
      </div>
    </div>
  );

  const renderHealthUpdate = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold">Health Update</h3>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <h4 className="font-medium text-indigo-800 mb-2">Week {patient.currentWeek || 0} Health Check</h4>
          <p className="text-sm text-indigo-600">Please complete your weekly health update to keep your doctor informed.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Enter your weight" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (if any)</label>
            <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" rows={3} placeholder="Describe any symptoms you're experiencing"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Overall Mood (1-10)</label>
            <input type="range" min="1" max="10" className="w-full" />
          </div>
          
          <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium">
            Submit Health Update
          </button>
        </div>
      </div>
    </div>
  );

  const renderSOS = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold">SOS Emergency</h3>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
      
      <div className="text-center space-y-6">
        <div className="bg-red-50 rounded-xl p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-red-700 mb-2">Emergency Alert</h4>
          <p className="text-red-600 mb-6">Press the button below if you need immediate medical assistance</p>
          
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all">
            EMERGENCY CALL
          </button>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <h5 className="font-medium text-orange-800 mb-2">Quick Actions</h5>
          <div className="space-y-2">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">Call Doctor</button>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Call Emergency Contact</button>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg">Send Location to Family</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
          <>
            {patient.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{contact.phone}</p>
                  <button className="text-xs text-orange-600 hover:text-orange-800">Call now</button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-8">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No emergency contacts</h4>
            <p className="text-gray-500 mb-6">Emergency contacts were not set up during profile completion</p>
          </div>
        )}
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Emergency Services</p>
              <p className="text-sm text-red-600">24/7 Emergency Line</p>
            </div>
          </div>
          <button className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium">
            Call 911
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'blood-pressure':
        return renderBloodPressure();
      case 'sugar-level':
        return renderSugarLevel();
      case 'baby-movement':
        return renderBabyMovement();
      case 'nutrition':
        return renderNutrition();
      case 'doctor-chat':
        return renderDoctorChat();
      case 'health-update':
        return renderHealthUpdate();
      case 'sos':
        return renderSOS();
      case 'emergency':
        return renderEmergencyContacts();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome back, {patient.name}
            </h1>
            <p className="text-gray-600">
              Track your pregnancy journey and stay connected with your healthcare team
            </p>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default PatientDashboard;
