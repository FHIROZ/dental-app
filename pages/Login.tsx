import React, { useState } from 'react';
import { UserRole } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

interface LoginProps {
  onLogin: (role: UserRole, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Fake password for UI

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      onLogin(selectedRole, email);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to DentalCare<span className="text-teal-600">Connect</span></h1>
          <p className="text-gray-600 text-lg">Your smile is our priority. Please select your portal.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
          {/* Doctor Card */}
          <div 
            onClick={() => setSelectedRole(UserRole.DOCTOR)}
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-teal-500 transition-all cursor-pointer text-center"
          >
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 transition-colors">
              <svg className="w-10 h-10 text-teal-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Portal</h2>
            <p className="text-gray-500">Manage schedule, view upcoming appointments, and patient details.</p>
          </div>

          {/* Patient Card */}
          <div 
            onClick={() => setSelectedRole(UserRole.PATIENT)}
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer text-center"
          >
             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
              <svg className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Portal</h2>
            <p className="text-gray-500">Book appointments, chat with our AI assistant, and view history.</p>
          </div>
        </div>
      </div>
    );
  }

  // Login Form (Simulated)
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
       <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedRole === UserRole.DOCTOR ? 'Doctor Login' : 'Patient Login'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Please enter your details to continue.
            </p>
         </div>

         <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder={selectedRole === UserRole.DOCTOR ? "admin@dentalcare.com" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex gap-4">
               <button 
                 type="button" 
                 onClick={() => setSelectedRole(null)}
                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
               >
                 Back
               </button>
               <Button type="submit" className="flex-1">
                 Login
               </Button>
            </div>
         </form>
         
         <div className="mt-6 text-center text-xs text-gray-400">
           (For demo purposes, any password works)
         </div>
       </div>
    </div>
  );
};

export default Login;