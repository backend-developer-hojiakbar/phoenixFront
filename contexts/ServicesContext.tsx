import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Service } from '../types';
import apiService from '../services/apiService';

interface ServicesContextType {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    getServiceBySlug: (slug: string) => Service | undefined;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.get<Service[]>('/services/');
                setServices(response.data);
                setError(null);
            } catch (err) {
                setError("Xizmatlarni yuklashda xatolik yuz berdi.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    const getServiceBySlug = (slug: string): Service | undefined => {
        return services.find(s => s.slug === slug);
    };

    return (
        <ServicesContext.Provider value={{ services, isLoading, error, getServiceBySlug }}>
            {children}
        </ServicesContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServicesContext);
    if (context === undefined) {
        throw new Error('useServices must be used within a ServicesProvider');
    }
    return context;
};