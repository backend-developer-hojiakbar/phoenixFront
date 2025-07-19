
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole, NotificationItem } from '../types';
import { LocalizationKeys } from '../constants';
import { GlobeAltIcon, ArrowRightOnRectangleIcon, UserCircleIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'; 

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<{ messageKey: string; type: NotificationItem['type']; link?: string }>;
      if (user && customEvent.detail) {
        const newNotification: NotificationItem = {
          id: `notif-${Date.now()}`,
          message: translate(customEvent.detail.messageKey, customEvent.detail.messageKey), // Translate the key
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

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.CLIENT: return translate('role_client', 'Author');
      case UserRole.JOURNAL_MANAGER: return translate('role_journal_manager', 'Editor');
      case UserRole.ADMIN: return translate('role_admin', 'Admin');
      default: return 'User';
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
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
    <nav className="bg-primary-dark shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 
              className="text-xl font-semibold text-accent-sky cursor-pointer"
              onClick={() => navigate('/dashboard')}
              title={translate(LocalizationKeys.APP_TITLE_FULL, 'Phoenix Scientific Publication Center')}
            >
                {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationDropdownOpen(prev => !prev)}
                className="p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150"
                aria-label={translate(LocalizationKeys.NOTIFICATION_BELL_ARIA_LABEL, 'View notifications')}
              >
                <BellIcon className="h-6 w-6" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-primary-dark bg-red-500 transform -translate-y-1/2 translate-x-1/2">
                    <span className="sr-only">{unreadNotificationsCount} unread notifications</span>
                  </span>
                )}
              </button>
              {isNotificationDropdownOpen && (
                <div 
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-secondary-dark border border-slate-700 rounded-lg shadow-2xl z-50 animate-modal-appear overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center p-3 border-b border-slate-700">
                    <h3 className="text-sm font-semibold text-light-text">{translate(LocalizationKeys.NOTIFICATIONS_TITLE, "Notifications")}</h3>
                    {notifications.length > 0 && unreadNotificationsCount > 0 && (
                       <button onClick={markAllAsRead} className="text-xs text-accent-sky hover:underline">
                           {translate(LocalizationKeys.MARK_ALL_AS_READ, "Mark all as read")}
                       </button>
                    )}
                    <button onClick={() => setIsNotificationDropdownOpen(false)} className="text-slate-400 hover:text-accent-sky">
                      <XMarkIcon className="h-5 w-5"/>
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-medium-text text-center">{translate(LocalizationKeys.NO_NOTIFICATIONS, "No new notifications.")}</p>
                  ) : (
                    <ul className="max-h-96 overflow-y-auto divide-y divide-slate-700">
                      {notifications.map(notif => (
                        <li key={notif.id} className={`p-3 hover:bg-slate-700/50 ${notif.isRead ? 'opacity-70' : ''}`}>
                          <div className="flex items-start">
                            <div className={`mr-2 mt-1 flex-shrink-0 h-2 w-2 rounded-full ${
                                notif.type === 'success' ? 'bg-emerald-500' : 
                                notif.type === 'error' ? 'bg-red-500' : 
                                notif.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className={`text-sm ${notif.isRead ? 'text-slate-400' : 'text-light-text'}`}>{notif.message}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{new Date(notif.timestamp).toLocaleString()}</p>
                            </div>
                            {!notif.isRead && (
                              <button onClick={() => markAsRead(notif.id)} className="ml-2 text-xs text-accent-sky hover:underline flex-shrink-0">
                                {translate(LocalizationKeys.MARK_AS_READ, "Mark read")}
                              </button>
                            )}
                          </div>
                          {notif.link && (
                            <a href={notif.link} onClick={() => {markAsRead(notif.id); setIsNotificationDropdownOpen(false);}} className="mt-1 block text-xs text-accent-purple hover:underline">
                                {translate('view_details_button', 'View Details')}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>


            {user && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <UserCircleIcon className="h-7 w-7 text-accent-purple flex-shrink-0" />
                <div className="hidden sm:block">
                    <span className="text-light-text text-sm font-medium">{user.name} {user.surname}</span>
                    <p className="text-xs text-medium-text">{getRoleName(user.role)}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-medium-text hover:text-accent-sky hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-accent-sky transition duration-150"
              title={translate('logout_button', 'Logout')}
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
