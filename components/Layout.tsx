
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

export const Layout: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-primary-dark text-light-text text-xl">Loading application...</div>;
  }

  return (
    <div className="flex h-screen bg-primary-dark">
      <Sidebar /> {/* Sidebar will handle its own visibility for desktop/mobile */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        {/* Added pb-20 (padding-bottom for mobile nav bar) and md:pb-8 for desktop */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-dark p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
