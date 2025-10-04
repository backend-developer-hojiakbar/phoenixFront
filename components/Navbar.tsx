// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole } from '../types';
import { LocalizationKeys } from '../constants';
import { GlobeAltIcon, ArrowRightOnRectangleIcon, UserCircleIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const storedNotifications = localStorage.getItem(`pspc_notifications_${user.id}`);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    }
  }, [user]);
  
  useEffect(() => {
    const handleNewNotification = (event) => {
      const customEvent = event;
      if (user && customEvent.detail) {
        const newNotification = {
          id: `notif-${Date.now()}`,
          message: translate(customEvent.detail.messageKey, customEvent.detail.messageKey),
          type: customEvent.detail.type,
          timestamp: new Date().toISOString(),
          isRead: false,
          link: customEvent.detail.link,
        };
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          localStorage.setItem(`pspc_notifications_${user.id}`, JSON.stringify(updated));
          return updated;
        });
      }
    };
    window.addEventListener('addPspcNotification', handleNewNotification);
    return () => window.removeEventListener('addPspcNotification', handleNewNotification);
  }, [user, translate]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role) => {
    switch (role) {
      case UserRole.CLIENT: return translate('role_client', 'Author');
      case UserRole.JOURNAL_MANAGER: return translate('role_journal_manager', 'Editor');
      case UserRole.ADMIN: return translate('role_admin', 'Admin');
      default: return 'User';
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id) => {
    if(user){
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
        localStorage.setItem(`pspc_notifications_${user.id}`, JSON.stringify(updated));
        return updated;
      });
    }
  };
  
  const markAllAsRead = () => {
    if(user){
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        localStorage.setItem(`pspc_notifications_${user.id}`, JSON.stringify(updated));
        return updated;
      });
    }
  };


  return (
    React.createElement('nav', { className: 'bg-primary-dark shadow-lg' },
      React.createElement('div', { className: 'max-w-full mx-auto px-2 sm:px-4 lg:px-6' },
        React.createElement('div', { className: 'flex items-center justify-between h-14 md:h-16' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('h1', {
                className: 'text-lg md:text-xl font-semibold text-accent-sky cursor-pointer',
                onClick: () => navigate('/dashboard'),
                title: translate(LocalizationKeys.APP_TITLE_FULL, 'Phoenix Scientific Publication Center')
              },
              translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')
            )
          ),
          React.createElement('div', { className: 'flex items-center space-x-1 md:space-x-3' },
            
            // Notification Bell
            React.createElement('div', { className: 'relative' },
              React.createElement('button', {
                onClick: () => setIsNotificationDropdownOpen(prev => !prev),
                className: 'p-1.5 md:p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150',
                'aria-label': translate(LocalizationKeys.NOTIFICATION_BELL_ARIA_LABEL, 'View notifications')
              },
                React.createElement(BellIcon, { className: 'h-5 w-5 md:h-6 md:w-6' }),
                unreadNotificationsCount > 0 && (
                  React.createElement('span', { className: 'absolute top-0 right-0 block h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-primary-dark bg-red-500 transform -translate-y-1/2 translate-x-1/2' },
                    React.createElement('span', { className: 'sr-only' }, unreadNotificationsCount, ' unread notifications')
                  )
                )
              ),
              isNotificationDropdownOpen && (
                React.createElement('div', {
                    className: 'absolute right-0 mt-1 w-72 md:w-80 sm:w-96 bg-secondary-dark border border-slate-700 rounded-lg shadow-2xl z-50 animate-modal-appear overflow-hidden',
                    onClick: (e) => e.stopPropagation()
                },
                  React.createElement('div', { className: 'flex justify-between items-center p-2 md:p-3 border-b border-slate-700' },
                    React.createElement('h3', { className: 'text-sm font-semibold text-light-text' }, translate(LocalizationKeys.NOTIFICATIONS_TITLE, "Notifications")),
                    notifications.length > 0 && unreadNotificationsCount > 0 && (
                       React.createElement('button', { onClick: markAllAsRead, className: 'text-xs text-accent-sky hover:underline hidden sm:block' },
                           translate(LocalizationKeys.MARK_ALL_AS_READ, "Mark all as read")
                       )
                    ),
                    React.createElement('button', { onClick: () => setIsNotificationDropdownOpen(false), className: 'text-slate-400 hover:text-accent-sky' },
                      React.createElement(XMarkIcon, { className: 'h-4 w-4 md:h-5 md:w-5' })
                    )
                  ),
                  notifications.length === 0 ? (
                    React.createElement('p', { className: 'p-3 md:p-4 text-sm text-medium-text text-center' }, translate(LocalizationKeys.NO_NOTIFICATIONS, "No new notifications."))
                  ) : (
                    React.createElement('ul', { className: 'max-h-80 md:max-h-96 overflow-y-auto divide-y divide-slate-700' },
                      notifications.map(notif => (
                        React.createElement('li', { key: notif.id, className: `p-2 md:p-3 hover:bg-slate-700/50 ${notif.isRead ? 'opacity-70' : ''}` },
                          React.createElement('div', { className: 'flex items-start' },
                            React.createElement('div', { className: `mr-1.5 md:mr-2 mt-1 flex-shrink-0 h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${
                                notif.type === 'success' ? 'bg-emerald-500' : 
                                notif.type === 'error' ? 'bg-red-500' : 
                                notif.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                            }` }),
                            React.createElement('div', { className: 'flex-1' },
                              React.createElement('p', { className: `text-xs md:text-sm ${notif.isRead ? 'text-slate-400' : 'text-light-text'}` }, notif.message),
                              React.createElement('p', { className: 'text-xs text-slate-500 mt-0.5' }, new Date(notif.timestamp).toLocaleString())
                            ),
                            !notif.isRead && (
                              React.createElement('button', { onClick: () => markAsRead(notif.id), className: 'ml-1 md:ml-2 text-xs text-accent-sky hover:underline flex-shrink-0 hidden sm:block' },
                                translate(LocalizationKeys.MARK_AS_READ, "Mark read")
                              )
                            )
                          ),
                          notif.link && (
                            React.createElement('a', { href: notif.link, onClick: () => {markAsRead(notif.id); setIsNotificationDropdownOpen(false);}, className: 'mt-1 block text-xs text-accent-purple hover:underline' },
                                translate('view_details_button', 'View Details')
                            )
                          )
                        )
                      ))
                    )
                  )
                )
              )
            ),


            user && (
              React.createElement('div', { className: 'flex items-center space-x-1' },
                React.createElement(UserCircleIcon, { className: 'h-6 w-6 md:h-7 md:w-7 text-accent-purple flex-shrink-0' }),
                React.createElement('div', { className: 'hidden sm:block' },
                    React.createElement('span', { className: 'text-light-text text-sm font-medium' }, user.name, ' ', user.surname),
                    React.createElement('p', { className: 'text-xs text-medium-text' }, getRoleName(user.role))
                )
              )
            ),
            
            React.createElement('button', {
              onClick: handleLogout,
              className: 'p-1.5 md:p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150',
              title: translate('logout_button', 'Logout')
            },
              React.createElement(ArrowRightOnRectangleIcon, { className: 'h-5 w-5 md:h-6 md:w-6' })
            )
          )
        )
      )
    )
  );
};

export default Navbar;