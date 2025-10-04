// @ts-nocheck
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

export const Layout = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return React.createElement('div', { className: 'flex items-center justify-center h-screen bg-primary-dark text-light-text text-xl' }, 'Loading application...');
  }

  return (
    React.createElement('div', { className: 'flex h-screen bg-primary-dark' },
      React.createElement(Sidebar, null),
      React.createElement('div', { className: 'flex-1 flex flex-col overflow-hidden' },
        React.createElement(Navbar, null),
        // Added pb-20 (padding-bottom for mobile nav bar) and md:pb-8 for desktop
        React.createElement('main', { className: 'flex-1 overflow-x-hidden overflow-y-auto bg-secondary-dark p-4 md:p-6 lg:p-8 pb-24 md:pb-8' },
          React.createElement(Outlet, null)
        )
      )
    )
  );
};