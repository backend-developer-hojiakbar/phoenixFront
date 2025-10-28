import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ExclamationTriangleIcon, HomeIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  const { translate } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark text-center p-6 pb-24 md:pb-6">
      <div className="max-w-2xl w-full">
        <Card title={undefined} icon={undefined} className="bg-secondary-dark/50 backdrop-blur-sm border border-slate-700 shadow-2xl">
          <div className="py-8 px-4 sm:px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 mb-6">
              <ExclamationTriangleIcon className="h-12 w-12 text-amber-400 animate-pulse-fast" />
            </div>
            
            <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-sky mb-4">
              404
            </h1>
            
            <h2 className="text-3xl font-bold text-light-text mb-4">
              {translate('notfound_title', 'Sahifa topilmadi')}
            </h2>
            
            <p className="text-lg text-medium-text mb-8 max-w-md mx-auto">
              {translate('notfound_message', 'Kechirasiz! Siz qidirayotgan sahifa mavjud emas. U ko\'chirilgan yoki o\'chirilgan bo\'lishi mumkin.')}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button
                variant="primary"
                size="lg"
                className="px-6 py-3"
                leftIcon={<HomeIcon className="h-5 w-5" />}
              >
                <Link to="/dashboard">
                  {translate('go_to_dashboard_button', 'Boshqaruv paneliga qaytish')}
                </Link>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="px-6 py-3"
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              >
                <Link to="/search">
                  Qidiruv sahifasi
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-700">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <BookOpenIcon className="h-8 w-8 text-accent-sky mx-auto mb-2" />
                <h3 className="font-semibold text-light-text mb-1">Jurnallar</h3>
                <p className="text-sm text-medium-text">Barcha jurnallarni ko'rish</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <MagnifyingGlassIcon className="h-8 w-8 text-accent-purple mx-auto mb-2" />
                <h3 className="font-semibold text-light-text mb-1">Qidiruv</h3>
                <p className="text-sm text-medium-text">Maqolalarni qidirish</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-semibold text-light-text mb-1">Yordam</h3>
                <p className="text-sm text-medium-text">Foydalanish bo'yicha yordam</p>
              </div>
            </div>
          </div>
        </Card>
        
        <p className="text-sm text-slate-500 mt-8">
          Agar siz bu sahifani kirishga harakat qilayotgan bo'lsangiz, tizim administratoriga murojaat qiling.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;