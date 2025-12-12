import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">DentalCare<span className="text-teal-600">Connect</span></span>
            </div>
            {userRole !== UserRole.NONE && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:block">
                  Logged in as <span className="font-semibold text-gray-700">{userRole === UserRole.DOCTOR ? 'Dr. Smith' : 'Patient'}</span>
                </span>
                <button 
                  onClick={onLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} DentalCare Connect. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;