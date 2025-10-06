// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import { 
    DocumentCheckIcon, SparklesIcon, BookOpenIcon, ChatBubbleLeftRightIcon, 
    DocumentTextIcon, GlobeAltIcon, CheckCircleIcon, TagIcon, IdentificationIcon, 
    CalendarDaysIcon, EyeIcon, UserGroupIcon, ChartBarIcon, AcademicCapIcon 
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Service } from '../../types';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const ServiceCard = ({ name, description, slug, price, icon, colorClasses, onClick }) => (
    <div
        className={`p-4 bg-gradient-to-br rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${colorClasses}`}
        onClick={onClick}
    >
        <div className="flex items-center">
            <div className={`flex-shrink-0 mr-4 p-3 rounded-full ${colorClasses.split(' ')[2]}`}>
                {React.createElement(icon, { className: `h-8 w-8 ${colorClasses.split(' ')[3]}` })}
            </div>
            <div>
                <h3 className='font-semibold text-light-text'>{name}</h3>
                <p className='text-sm text-medium-text mt-1'>{description}</p>
            </div>
        </div>
        <div className="text-right mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-lg font-bold text-accent-sky">
                {new Intl.NumberFormat('uz-UZ').format(Number(price))} UZS
            </p>
        </div>
    </div>
);

const ServicesPage = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.get<Service[]>('/services/');
                setServices(response.data);
            } catch (err) {
                setError(translate('error_loading_services', "Xizmatlarni yuklashda xatolik yuz berdi."));
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    const findService = (slug) => services.find(s => s.slug === slug);
    
    if (isLoading) {
        return <LoadingSpinner message={translate('loading_services', "Xizmatlar yuklanmoqda...")} />;
    }

    if (error) {
        return <Alert type="error" message={error} />;
    }
    
    const serviceMap = {
        'plagiarism-check': { icon: DocumentCheckIcon, color: 'from-purple-900/50 to-purple-700/30 border-purple-500/30 hover:border-purple-500/60 bg-purple-500/20 text-purple-400' },
        'ai-document-utilities': { icon: SparklesIcon, color: 'from-sky-900/50 to-sky-700/30 border-sky-500/30 hover:border-sky-500/60 bg-sky-500/20 text-sky-400' },
        'printed-publications': { icon: BookOpenIcon, color: 'from-amber-900/50 to-amber-700/30 border-amber-500/30 hover:border-amber-500/60 bg-amber-500/20 text-amber-400' },
        'translation-service': { icon: GlobeAltIcon, color: 'from-green-900/50 to-green-700/30 border-green-500/30 hover:border-green-500/60 bg-green-500/20 text-green-400' },
        'article-writing': { icon: DocumentTextIcon, color: 'from-indigo-900/50 to-indigo-700/30 border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/20 text-indigo-400' },
        'editor-communication': { icon: ChatBubbleLeftRightIcon, color: 'from-rose-900/50 to-rose-700/30 border-rose-500/30 hover:border-rose-500/60 bg-rose-500/20 text-rose-400' },
        'literacy-check': { icon: CheckCircleIcon, color: 'from-teal-900/50 to-teal-700/30 border-teal-500/30 hover:border-teal-500/60 bg-teal-500/20 text-teal-400' },
        'udc-classification': { icon: TagIcon, color: 'from-cyan-900/50 to-cyan-700/30 border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/20 text-cyan-400' },
        'orcid-integration': { icon: IdentificationIcon, color: 'from-emerald-900/50 to-emerald-700/30 border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/20 text-emerald-400' },
        // 'calendar-service': { icon: CalendarDaysIcon, color: 'from-violet-900/50 to-violet-700/30 border-violet-500/30 hover:border-violet-500/60 bg-violet-500/20 text-violet-400' },
        'document-preview': { icon: EyeIcon, color: 'from-blue-900/50 to-blue-700/30 border-blue-500/30 hover:border-blue-500/60 bg-blue-500/20 text-blue-400' },
        'coauthor-management': { icon: UserGroupIcon, color: 'from-fuchsia-900/50 to-fuchsia-700/30 border-fuchsia-500/30 hover:border-fuchsia-500/60 bg-fuchsia-500/20 text-fuchsia-400' },
        'statistical-reports': { icon: ChartBarIcon, color: 'from-rose-900/50 to-rose-700/30 border-rose-500/30 hover:border-rose-500/60 bg-rose-500/20 text-rose-400' },
        'google-scholar-indexing': { icon: AcademicCapIcon, color: 'from-indigo-900/50 to-indigo-700/30 border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/20 text-indigo-400' },
    };

    const serviceOrder = Object.keys(serviceMap);
    
    const handleNavigate = (slug) => {
        const serviceData = findService(slug);
        if (serviceData) {
            navigate(`/${slug}`, { state: { service: serviceData } });
        }
    };

    return (
        <Card title={translate('services_title', 'Xizmatlar')}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {serviceOrder.map(slug => {
                    const serviceData = findService(slug);
                    if (!serviceData || !serviceData.is_active) return null;
                    const visualData = serviceMap[slug];

                    return (
                        <ServiceCard
                            key={slug}
                            name={serviceData.name}
                            description={serviceData.description}
                            slug={slug}
                            price={serviceData.price}
                            icon={visualData.icon}
                            colorClasses={visualData.color}
                            onClick={() => handleNavigate(slug)}
                        />
                    );
                })}
            </div>
             {services.length === 0 && !isLoading && (
                <p className="text-center text-medium-text py-8">{translate('no_active_services', 'Hozircha faol xizmatlar mavjud emas.')}</p>
            )}
        </Card>
    );
};

export default ServicesPage;