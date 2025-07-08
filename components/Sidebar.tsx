
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { NAV_LINKS, LocalizationKeys } from '../constants';
import { HomeIcon, DocumentPlusIcon, DocumentTextIcon, UserGroupIcon, Cog6ToothIcon, PresentationChartBarIcon, AcademicCapIcon, AdjustmentsHorizontalIcon, UserCircleIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, ArchiveBoxIcon, BookOpenIcon, QueueListIcon, CalendarDaysIcon, SparklesIcon as AiUtilsIcon, DocumentCheckIcon as PlagiarismIcon, BanknotesIcon } from '@heroicons/react/24/outline'; // Added CalendarDaysIcon, AiUtilsIcon, PlagiarismIcon
import { NavItem } from '../types';


const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleNavLinks = NAV_LINKS[user.role] || [];
  
  const getIcon = (labelKey: string, isMobile: boolean = false): React.ReactNode => {
    const iconSizeClass = isMobile ? "h-6 w-6" : "h-5 w-5 mr-3";
    switch (labelKey) {
      case 'boshqaruv_paneli': return <HomeIcon className={iconSizeClass} />;
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
      <div className="hidden md:w-64 md:bg-primary-dark md:text-light-text md:flex md:flex-col md:shadow-xl">
        <div 
          className="h-16 flex items-center justify-center cursor-pointer select-none"
          onClick={() => navigate('/dashboard')}
          title={translate(LocalizationKeys.APP_TITLE_FULL, 'Phoenix Scientific Publication Center')}
        >
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
            {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
          </span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {roleNavLinks.map((link: NavItem) => (
            <NavLink
              key={link.path + "-desktop"}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group
                ${isActive 
                  ? 'bg-gradient-to-r from-accent-purple to-accent-sky text-white shadow-md' 
                  : 'hover:bg-secondary-dark hover:text-accent-sky'
                }`
              }
            >
              {getIcon(link.labelKey)}
              {translate(link.labelKey, link.labelKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-medium-text text-center">
          <span>
            &copy; {new Date().getFullYear()} {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}. {translate('all_rights_reserved', 'All rights reserved.')}
          </span>
          <span className="mx-1">|</span>
          <span>
            {translate(LocalizationKeys.FOOTER_CDC_CREDIT, 'CDCGroup tomonidan ilmiy asosda ishlab chiqildi')}
          </span>
          <br /> 
          <span>
            {translate(LocalizationKeys.FOOTER_CRADEV_CREDIT, 'CraDev Company texnologik hamkorligida')}
          </span>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-primary-dark text-light-text flex items-center justify-around shadow-2xl z-50 border-t border-slate-700">
        {roleNavLinks.slice(0, 5).map((link: NavItem) => ( // Show max 5 items on mobile
          <NavLink
            key={link.path + "-mobile"}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all duration-150 ease-in-out group w-1/5
              ${isActive 
                ? 'text-accent-sky' 
                : 'text-medium-text hover:text-accent-sky'
              }`
            }
          >
            {getIcon(link.labelKey, true)}
            <span className={`mt-1 truncate text-center ${ (link.labelKey === 'maqola_yuborish' || link.labelKey === 'maqolalarni_boshqarish_admin' || link.labelKey === 'foydalanuvchilarni_boshqarish' || link.labelKey === 'jurnallarni_boshqarish_admin' || link.labelKey === 'mening_jurnalim' || link.labelKey === LocalizationKeys.NAV_CALENDAR || link.labelKey === LocalizationKeys.NAV_AI_DOCUMENT_UTILITIES || link.labelKey === LocalizationKeys.NAV_PLAGIARISM_CHECKER) ? 'text-[9px] leading-tight' : 'text-xs'}`}> {/* Adjust text size for longer labels */}
                {translate(link.labelKey, link.labelKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
            </span>
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Sidebar;