import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import ProfileCompletion from './components/ProfileCompletion';
import Navigation from './components/Navigation';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { Patient, Doctor } from './types';

function App() {
  const AppContent: React.FC = () => {
    const { user, isAuthenticated, isProfileComplete } = useAuth();

    if (!isAuthenticated) {
      return <LoginPage />;
    }

    // Show profile completion for new patients
    if (user?.role === 'patient' && !isProfileComplete) {
      return <ProfileCompletion />;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        {user?.role === 'patient' ? (
          <PatientDashboard patient={user as Patient} />
        ) : (
          <DoctorDashboard doctor={user as Doctor} />
        )}
      </div>
    );
  };

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
