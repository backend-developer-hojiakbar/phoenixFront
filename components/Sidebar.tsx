// @ts-nocheck
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { NAV_LINKS, LocalizationKeys } from '../constants';
import { 
  HomeIcon, DocumentPlusIcon, DocumentTextIcon, UserGroupIcon, Cog6ToothIcon,
  AcademicCapIcon, ArchiveBoxIcon, UserCircleIcon, XMarkIcon, BookOpenIcon,
  CalendarDaysIcon, SparklesIcon as AiUtilsIcon, DocumentCheckIcon as PlagiarismIcon,
  BanknotesIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;
  const roleNavLinks = NAV_LINKS[user.role] || [];

  const getIcon = (labelKey, isMobile = false) => {
    const iconSizeClass = isMobile ? "h-5 w-5" : (isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3");
    switch (labelKey) {
      case 'boshqaruv_paneli': return <HomeIcon className={iconSizeClass} />;
      case 'jurnallar': return <BookOpenIcon className={iconSizeClass} />;
      case 'maqola_yuborish': return <DocumentPlusIcon className={iconSizeClass} />;
      case 'mening_maqolalarim': return <DocumentTextIcon className={iconSizeClass} />;
      case 'profil_sahifasi': return <UserCircleIcon className={iconSizeClass} />;
      case 'foydalanuvchilarni_boshqarish': return <UserGroupIcon className={iconSizeClass} />;
      case 'tizim_sozlamalari': return <Cog6ToothIcon className={iconSizeClass} />;
      case LocalizationKeys.NAV_CALENDAR: return <CalendarDaysIcon className={iconSizeClass} />;
      case LocalizationKeys.NAV_AI_DOCUMENT_UTILITIES: return <AiUtilsIcon className={iconSizeClass} />;
      case LocalizationKeys.NAV_PLAGIARISM_CHECKER: return <PlagiarismIcon className={iconSizeClass} />;
      case LocalizationKeys.NAV_FINANCIAL_OVERVIEW: return <BanknotesIcon className={iconSizeClass} />;
      default: return <HomeIcon className={iconSizeClass} />;
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Using the correct CSS classes from responsive.css */}
      <div className={`sidebar bg-primary-dark border-r border-slate-700 fixed top-0 left-0 bottom-0 z-[50] transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div 
          className="h-16 flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          {isCollapsed ? (
            <span className="text-xl font-bold text-accent-sky">P</span>
          ) : (
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
              {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
            </span>
          )}
        </div>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-3 bg-primary-dark border border-slate-700 rounded-full p-1 shadow-lg hover:bg-secondary-dark transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-medium-text" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-medium-text" />
          )}
        </button>
        <nav className="flex-1 overflow-y-auto py-4">
          {roleNavLinks.map(link => (
            <NavLink
              key={link.path + "-desktop"}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-medium-text hover:bg-secondary-dark hover:text-light-text transition duration-150 ${isActive ? 'bg-secondary-dark text-accent-sky border-l-4 border-accent-sky' : ''}`
              }
            >
              {getIcon(link.labelKey)}
              {!isCollapsed && (
                <span className="truncate">{translate(link.labelKey, link.labelKey)}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[70] transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={`fixed top-0 left-0 bottom-0 w-64 bg-primary-dark border-r border-slate-700 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <span
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky cursor-pointer"
              onClick={() => {
                navigate('/dashboard');
                setSidebarOpen(false);
              }}
            >
              {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-medium-text hover:text-accent-sky"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {roleNavLinks.map(link => (
              <NavLink
                key={link.path + "-mobile"}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-medium-text hover:bg-secondary-dark hover:text-light-text transition duration-150 ${isActive ? 'bg-secondary-dark text-accent-sky border-l-4 border-accent-sky' : ''}`
                }
              >
                {getIcon(link.labelKey, true)}
                <span className="truncate">{translate(link.labelKey, link.labelKey)}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;