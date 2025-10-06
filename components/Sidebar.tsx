// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { NAV_LINKS, LocalizationKeys } from '../constants';
import { 
  HomeIcon, 
  DocumentPlusIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  Cog6ToothIcon, 
  PresentationChartBarIcon, 
  AcademicCapIcon, 
  AdjustmentsHorizontalIcon, 
  UserCircleIcon, 
  ShieldCheckIcon, 
  DocumentMagnifyingGlassIcon, 
  ArchiveBoxIcon, 
  BookOpenIcon, 
  QueueListIcon, 
  CalendarDaysIcon, 
  SparklesIcon as AiUtilsIcon, 
  DocumentCheckIcon as PlagiarismIcon, 
  BanknotesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { NavItem } from '../types';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleNavLinks = NAV_LINKS[user.role] || [];
  
  const getIcon = (labelKey, isMobile = false) => {
    const iconSizeClass = isMobile ? "h-5 w-5" : "h-5 w-5 mr-3";
    switch (labelKey) {
      case 'boshqaruv_paneli': return <HomeIcon className={iconSizeClass} />;
      case 'jurnallar': return <BookOpenIcon className={iconSizeClass} />;
      case 'maqola_yuborish': return <DocumentPlusIcon className={iconSizeClass} />;
      case 'mening_maqolalarim': return <DocumentTextIcon className={iconSizeClass} />;
      case 'profil_sahifasi': return <UserCircleIcon className={iconSizeClass} />;
      case 'mening_maqolalarim_muharrir': return <DocumentTextIcon className={iconSizeClass} />;
      case 'mening_jurnalim': return <BookOpenIcon className={iconSizeClass} />; 
      case 'foydalanuvchilarni_boshqarish': return <UserGroupIcon className={iconSizeClass} />;
      case 'jurnallarni_boshqarish_admin': return <AcademicCapIcon className={iconSizeClass} />; 
      case 'tizim_sozlamalari': return <Cog6ToothIcon className={iconSizeClass} />; 
      case 'maqolalarni_boshqarish_admin': return <ArchiveBoxIcon className={iconSizeClass} />; 
      case 'audit_jurnali_admin': return <DocumentMagnifyingGlassIcon className={iconSizeClass} />; 
      case LocalizationKeys.NAV_CALENDAR: return <CalendarDaysIcon className={iconSizeClass} />; 
      case LocalizationKeys.NAV_AI_DOCUMENT_UTILITIES: return <AiUtilsIcon className={iconSizeClass} />; 
      case LocalizationKeys.NAV_PLAGIARISM_CHECKER: return <PlagiarismIcon className={iconSizeClass} />;
      case LocalizationKeys.NAV_FINANCIAL_OVERVIEW: return <BanknotesIcon className={iconSizeClass} />;
      default: return <HomeIcon className={iconSizeClass} />;
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block modern-sidebar bg-primary-dark border-r border-slate-700 fixed top-16 left-0 bottom-0 w-64 z-40" style={{ zIndex: 50, paddingTop: '0' }}>
        <div 
          className="h-16 flex items-center justify-center cursor-pointer select-none"
          onClick={() => navigate('/dashboard')}
          title={translate(LocalizationKeys.APP_TITLE_FULL, 'Phoenix Scientific Publication Center')}
        >
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
            {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
          </span>
        </div>
        <nav className="modern-sidebar-nav">
          {roleNavLinks.map((link) => (
            <NavLink
              key={link.path + "-desktop"}
              to={link.path}
              className={({ isActive }) =>
                `modern-sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {getIcon(link.labelKey)}
              {translate(link.labelKey, link.labelKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-medium-text text-center">
          <span>
            © {new Date().getFullYear()} {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}. {translate('all_rights_reserved', 'All rights reserved.')}
          </span>
          <span className="mx-1 hidden md:inline">|</span>
          <span className="hidden md:block">
            {translate(LocalizationKeys.FOOTER_CDC_CREDIT, 'CDCGroup tomonidan ilmiy asosda ishlab chiqildi')}
          </span>
          <br className="hidden md:block" /> 
          <span className="hidden md:block">
            {translate(LocalizationKeys.FOOTER_CRADEV_CREDIT, 'CraDev Company texnologik hamkorligida')}
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="modern-sidebar open bg-primary-dark"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 50 }}
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
            <nav className="modern-sidebar-nav">
              {roleNavLinks.map((link) => (
                <NavLink
                  key={link.path + "-mobile"}
                  to={link.path}
                  className={({ isActive }) =>
                    `modern-sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {getIcon(link.labelKey, true)}
                  <span className="truncate">
                    {translate(link.labelKey, link.labelKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
                  </span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-700 text-xs text-medium-text text-center">
              <span>
                © {new Date().getFullYear()} {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}. {translate('all_rights_reserved', 'All rights reserved.')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;