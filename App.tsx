import React, { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { UserRole, UserSession } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>({
    role: UserRole.NONE
  });

  const handleLogin = (role: UserRole, email: string) => {
    setSession({
      role,
      email
    });
  };

  const handleLogout = () => {
    setSession({ role: UserRole.NONE });
  };

  const renderContent = () => {
    switch (session.role) {
      case UserRole.DOCTOR:
        return <DoctorDashboard />;
      case UserRole.PATIENT:
        return <PatientDashboard userEmail={session.email || ''} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <Layout userRole={session.role} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;