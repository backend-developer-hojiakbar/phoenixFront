// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { NAV_LINKS, LocalizationKeys } from '../constants';
import { HomeIcon, DocumentPlusIcon, DocumentTextIcon, UserGroupIcon, Cog6ToothIcon, PresentationChartBarIcon, AcademicCapIcon, AdjustmentsHorizontalIcon, UserCircleIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, ArchiveBoxIcon, BookOpenIcon, QueueListIcon, CalendarDaysIcon, SparklesIcon as AiUtilsIcon, DocumentCheckIcon as PlagiarismIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { NavItem } from '../types';

const Sidebar = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleNavLinks = NAV_LINKS[user.role] || [];
  
  const getIcon = (labelKey, isMobile = false) => {
    const iconSizeClass = isMobile ? "h-5 w-5 md:h-6 md:w-6" : "h-5 w-5 mr-3";
    switch (labelKey) {
      case 'boshqaruv_paneli': return React.createElement(HomeIcon, { className: iconSizeClass });
      case 'jurnallar': return React.createElement(BookOpenIcon, { className: iconSizeClass });
      case 'maqola_yuborish': return React.createElement(DocumentPlusIcon, { className: iconSizeClass });
      case 'mening_maqolalarim': return React.createElement(DocumentTextIcon, { className: iconSizeClass });
      case 'profil_sahifasi': return React.createElement(UserCircleIcon, { className: iconSizeClass });
      case 'mening_maqolalarim_muharrir': return React.createElement(DocumentTextIcon, { className: iconSizeClass });
      case 'mening_jurnalim': return React.createElement(BookOpenIcon, { className: iconSizeClass }); 
      case 'foydalanuvchilarni_boshqarish': return React.createElement(UserGroupIcon, { className: iconSizeClass });
      case 'jurnallarni_boshqarish_admin': return React.createElement(AcademicCapIcon, { className: iconSizeClass }); 
      case 'tizim_sozlamalari': return React.createElement(Cog6ToothIcon, { className: iconSizeClass }); 
      case 'maqolalarni_boshqarish_admin': return React.createElement(ArchiveBoxIcon, { className: iconSizeClass }); 
      case 'audit_jurnali_admin': return React.createElement(DocumentMagnifyingGlassIcon, { className: iconSizeClass }); 
      case LocalizationKeys.NAV_CALENDAR: return React.createElement(CalendarDaysIcon, { className: iconSizeClass }); 
      case LocalizationKeys.NAV_AI_DOCUMENT_UTILITIES: return React.createElement(AiUtilsIcon, { className: iconSizeClass }); 
      case LocalizationKeys.NAV_PLAGIARISM_CHECKER: return React.createElement(PlagiarismIcon, { className: iconSizeClass });
      case LocalizationKeys.NAV_FINANCIAL_OVERVIEW: return React.createElement(BanknotesIcon, { className: iconSizeClass });
      default: return React.createElement(HomeIcon, { className: iconSizeClass });
    }
  };

  return (
    React.createElement(React.Fragment, null,
      // Desktop Sidebar
      React.createElement('div', { className: 'hidden md:w-64 md:bg-primary-dark md:text-light-text md:flex md:flex-col md:shadow-xl' },
        React.createElement('div', {
            className: 'h-14 md:h-16 flex items-center justify-center cursor-pointer select-none',
            onClick: () => navigate('/dashboard'),
            title: translate(LocalizationKeys.APP_TITLE_FULL, 'Phoenix Scientific Publication Center')
          },
          React.createElement('span', { className: 'text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky' },
            translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')
          )
        ),
        React.createElement('nav', { className: 'flex-1 px-2 py-3 md:py-4 space-y-1 md:space-y-2' },
          roleNavLinks.map((link) => 
            React.createElement(NavLink, {
              key: link.path + "-desktop",
              to: link.path,
              className: ({ isActive }) =>
                `flex items-center px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group
                ${isActive 
                  ? 'bg-gradient-to-r from-accent-purple to-accent-sky text-white shadow-md' 
                  : 'hover:bg-secondary-dark hover:text-accent-sky'
                }`
            },
              getIcon(link.labelKey),
              translate(link.labelKey, link.labelKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
            )
          )
        ),
        React.createElement('div', { className: 'p-3 md:p-4 border-t border-slate-700 text-[9px] md:text-xs text-medium-text text-center' },
          React.createElement('span', null,
            '© ', new Date().getFullYear(), ' ', translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC'), '. ', translate('all_rights_reserved', 'All rights reserved.')
          ),
          React.createElement('span', { className: 'mx-1 hidden md:inline' }, '|'),
          React.createElement('span', { className: 'hidden md:block' },
            translate(LocalizationKeys.FOOTER_CDC_CREDIT, 'CDCGroup tomonidan ilmiy asosda ishlab chiqildi')
          ),
          React.createElement('br', { className: 'hidden md:block' }), 
          React.createElement('span', { className: 'hidden md:block' },
            translate(LocalizationKeys.FOOTER_CRADEV_CREDIT, 'CraDev Company texnologik hamkorligida')
          )
        )
      ),

      // Mobile Bottom Navigation Bar
      React.createElement('div', { className: 'md:hidden fixed bottom-0 left-0 right-0 h-[60px] md:h-[70px] bg-primary-dark text-light-text flex items-center justify-around shadow-2xl z-50 border-t border-slate-700' },
        roleNavLinks.slice(0, 5).map((link) => {
          const isActive = window.location.hash.includes(link.path);
          return React.createElement(NavLink, {
              key: link.path + "-mobile",
              to: link.path,
              className: `flex flex-col items-center justify-center p-1 md:p-2 rounded-lg text-[10px] md:text-xs transition-all duration-150 ease-in-out group w-1/5
              ${isActive 
                ? 'text-accent-sky' 
                : 'text-medium-text hover:text-accent-sky'
              }`
            },
            getIcon(link.labelKey, true),
            React.createElement('span', { className: `mt-0.5 md:mt-1 truncate text-center ${ (link.labelKey === 'maqola_yuborish' || link.labelKey === 'maqolalarni_boshqarish_admin' || link.labelKey === 'foydalanuvchilarni_boshqarish' || link.labelKey === 'jurnallarni_boshqarish_admin' || link.labelKey === 'mening_jurnalim' || link.labelKey === LocalizationKeys.NAV_CALENDAR || link.labelKey === LocalizationKeys.NAV_AI_DOCUMENT_UTILITIES || link.labelKey === LocalizationKeys.NAV_PLAGIARISM_CHECKER) ? 'text-[8px] md:text-[9px] leading-tight' : 'text-[9px] md:text-xs'}` },
                translate(link.labelKey, link.labelKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
            )
          )
        })
      )
    )
  );
};

export default Sidebar;