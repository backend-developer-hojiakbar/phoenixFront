// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

export const Layout = () => {
  const { isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar ochilganda orqa fon harakatlanmasligi uchun
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-dark text-light-text text-xl modern-loading">
        <div className="modern-spinner"></div>
        <span className="ml-3">Loading application...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-dark modern-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-dark p-4 md:p-6 lg:p-8 pb-24 md:pb-8 mt-16 modern-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};