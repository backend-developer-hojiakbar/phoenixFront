// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole } from '../types';
import { LocalizationKeys } from '../constants';
import { 
  GlobeAltIcon, 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon, 
  BellIcon, 
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'; 

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
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
    <nav className="modern-navbar bg-primary-dark border-b border-slate-700 fixed top-0 left-0 right-0 h-16 z-50" style={{ zIndex: 60 }}>
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden mr-2 p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1
              className="text-lg md:text-xl font-semibold text-accent-sky cursor-pointer"
              onClick={() => navigate('/dashboard')}
              title={translate(LocalizationKeys.APP_TITLE_FULL, 'Phoenix Scientific Publication Center')}
            >
              {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
            </h1>
          </div>
          <div className="flex items-center space-x-1 md:space-x-3">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationDropdownOpen(prev => !prev)}
                className="p-1.5 md:p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150"
                aria-label={translate(LocalizationKeys.NOTIFICATION_BELL_ARIA_LABEL, 'View notifications')}
              >
                <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-primary-dark bg-red-500 transform -translate-y-1/2 translate-x-1/2">
                    <span className="sr-only">{unreadNotificationsCount} unread notifications</span>
                  </span>
                )}
              </button>
              {isNotificationDropdownOpen && (
                <div
                  className="modern-modal-overlay"
                  onClick={() => setIsNotificationDropdownOpen(false)}
                >
                  <div
                    className="modern-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modern-modal-header">
                      <h3 className="modern-modal-title">
                        {translate(LocalizationKeys.NOTIFICATIONS_TITLE, "Notifications")}
                      </h3>
                      <button
                        onClick={() => setIsNotificationDropdownOpen(false)}
                        className="modern-modal-close"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="modern-modal-body">
                      {notifications.length === 0 ? (
                        <p className="text-center text-medium-text py-4">
                          {translate(LocalizationKeys.NO_NOTIFICATIONS, "No new notifications.")}
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {notifications.map(notif => (
                            <li 
                              key={notif.id} 
                              className={`p-3 rounded-lg ${notif.isRead ? 'opacity-70' : 'bg-slate-700/30'}`}
                            >
                              <div className="flex items-start">
                                <div className={`mr-3 mt-1 flex-shrink-0 h-2 w-2 rounded-full ${
                                  notif.type === 'success' ? 'bg-emerald-500' : 
                                  notif.type === 'error' ? 'bg-red-500' : 
                                  notif.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                                }`}></div>
                                <div className="flex-1">
                                  <p className={`text-sm ${notif.isRead ? 'text-slate-400' : 'text-light-text'}`}>
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(notif.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <button 
                                    onClick={() => markAsRead(notif.id)} 
                                    className="text-xs text-accent-sky hover:underline"
                                  >
                                    {translate(LocalizationKeys.MARK_AS_READ, "Mark read")}
                                  </button>
                                )}
                              </div>
                              {notif.link && (
                                <a 
                                  href={notif.link} 
                                  onClick={() => {
                                    markAsRead(notif.id); 
                                    setIsNotificationDropdownOpen(false);
                                  }} 
                                  className="mt-2 block text-xs text-accent-purple hover:underline"
                                >
                                  {translate('view_details_button', 'View Details')}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {notifications.length > 0 && unreadNotificationsCount > 0 && (
                      <div className="modern-modal-footer">
                        <button 
                          onClick={markAllAsRead} 
                          className="modern-button modern-button-secondary text-sm"
                        >
                          {translate(LocalizationKeys.MARK_ALL_AS_READ, "Mark all as read")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-1">
                <UserCircleIcon className="h-6 w-6 md:h-7 md:w-7 text-accent-purple flex-shrink-0" />
                <div className="hidden sm:block">
                  <span className="text-light-text text-sm font-medium">
                    {user.name} {user.surname}
                  </span>
                  <p className="text-xs text-medium-text">
                    {getRoleName(user.role)}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="p-1.5 md:p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150"
              title={translate('logout_button', 'Logout')}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;