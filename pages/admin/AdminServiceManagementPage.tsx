import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import { Cog6ToothIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'; 
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const AdminServiceManagementPage: React.FC = () => {
    const { translate } = useLanguage();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Form states
    const [newService, setNewService] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        is_active: true
    });
    
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingService, setEditingService] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        is_active: true
    });

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const { data } = await apiService.get<Service[]>('/services/');
            setServices(data);
        } catch (error) {
            setActionMessage({type: 'error', text: "Xizmatlarni yuklashda xatolik."});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAddService = async () => {
        if (!newService.name.trim() || !newService.slug.trim() || !newService.price) {
            setActionMessage({type: 'error', text: "Xizmat nomi, slug va narxini to'ldirish shart."});
            return;
        }
        
        // Validate price is a number
        if (isNaN(parseFloat(newService.price))) {
            setActionMessage({type: 'error', text: "Narx to'g'ri raqam bo'lishi kerak."});
            return;
        }
        
        setIsSubmitting(true);
        setActionMessage(null);
        
        try {
            const serviceData = {
                ...newService,
                price: parseFloat(newService.price)
            };
            
            const response = await apiService.post<Service>('/services/', serviceData);
            
            setServices([...services, response.data]);
            setNewService({
                name: '',
                slug: '',
                description: '',
                price: '',
                is_active: true
            });
            setActionMessage({ type: 'success', text: "Yangi xizmat muvaffaqiyatli qo'shildi!" });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Xizmat qo\'shishda xatolik.'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (service: Service) => {
        setEditingServiceId(service.id);
        setEditingService({
            name: service.name,
            slug: service.slug,
            description: service.description,
            price: service.price,
            is_active: service.is_active
        });
    };

    const cancelEditing = () => {
        setEditingServiceId(null);
        setEditingService({
            name: '',
            slug: '',
            description: '',
            price: '',
            is_active: true
        });
    };

    const handleUpdateService = async () => {
        if (!editingServiceId || !editingService.name.trim() || !editingService.slug.trim() || !editingService.price) {
            setActionMessage({type: 'error', text: "Xizmat nomi, slug va narxini to'ldirish shart."});
            return;
        }
        
        // Validate price is a number
        if (isNaN(parseFloat(editingService.price))) {
            setActionMessage({type: 'error', text: "Narx to'g'ri raqam bo'lishi kerak."});
            return;
        }
        
        setIsSubmitting(true);
        setActionMessage(null);
        
        try {
            const serviceData = {
                ...editingService,
                price: parseFloat(editingService.price)
            };
            
            const response = await apiService.patch<Service>(`/services/${editingService.slug}/`, serviceData);
            
            setServices(services.map(service => 
                service.id === editingServiceId 
                    ? { ...service, ...response.data } 
                    : service
            ));
            
            setActionMessage({ type: 'success', text: "Xizmat muvaffaqiyatli yangilandi!" });
            cancelEditing();
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Xizmatni yangilashda xatolik.'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (serviceId: number, serviceSlug: string) => {
        setIsSubmitting(true);
        setActionMessage(null);
        
        try {
            await apiService.delete(`/services/${serviceSlug}/`);
            
            setServices(services.filter(service => service.id !== serviceId));
            setActionMessage({ type: 'success', text: "Xizmat muvaffaqiyatli o'chirildi!" });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Xizmatni o\'chirishda xatolik.'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (service: Service) => {
        setIsSubmitting(true);
        setActionMessage(null);
        
        try {
            const response = await apiService.patch<Service>(`/services/${service.slug}/`, {
                is_active: !service.is_active
            });
            
            setServices(services.map(s => 
                s.id === service.id 
                    ? { ...s, is_active: response.data.is_active } 
                    : s
            ));
            
            setActionMessage({ 
                type: 'success', 
                text: `Xizmat ${response.data.is_active ? 'faollashtirildi' : 'o\'chirildi'}!` 
            });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Xizmat holatini yangilashda xatolik.'});
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Update slug when name changes in new service form
    useEffect(() => {
        if (newService.name && !editingServiceId) {
            setNewService(prev => ({
                ...prev,
                slug: generateSlug(prev.name)
            }));
        }
    }, [newService.name, editingServiceId]);

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Cog6ToothIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">Xizmatlarni Boshqarish</h1>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4 admin-alert admin-alert-success" />}

            {/* Add New Service Card */}
            <Card className="admin-card-gradient" title="Yangi Xizmat Qo'shish" icon={<PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                <div className="space-y-4">
                    <Input
                        label="Xizmat nomi"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        placeholder="Xizmat nomini kiriting"
                        className="admin-input"
                    />
                    
                    <Input
                        label="Slug (URL uchun)"
                        value={newService.slug}
                        onChange={(e) => setNewService({...newService, slug: e.target.value})}
                        placeholder="slug-url-uchun"
                        className="admin-input"
                    />
                    
                    <Textarea
                        label="Tavsif"
                        value={newService.description}
                        onChange={(e) => setNewService({...newService, description: e.target.value})}
                        placeholder="Xizmat tavsifi"
                        rows={3}
                        className="admin-input"
                    />
                    
                    <Input
                        label="Narx (UZS)"
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        placeholder="Narxni kiriting"
                        className="admin-input"
                    />
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="new-service-active"
                            checked={newService.is_active}
                            onChange={(e) => setNewService({...newService, is_active: e.target.checked})}
                            className="h-4 w-4 text-accent-purple focus:ring-accent-purple border-slate-600 rounded"
                        />
                        <label htmlFor="new-service-active" className="ml-2 block text-sm text-light-text">
                            Xizmat faol
                        </label>
                    </div>
                    
                    <Button 
                        onClick={handleAddService} 
                        className="mt-2 w-full sm:w-auto admin-button-primary hover:opacity-90"
                        isLoading={isSubmitting}
                        leftIcon={<PlusIcon className="h-5 w-5" />}
                    >
                        Qo'shish
                    </Button>
                </div>
            </Card>

            {/* Services List Card */}
            <Card className="admin-card-gradient" title="Mavjud Xizmatlar" icon={<Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                {isLoading ? <LoadingSpinner /> : services.length > 0 ? (
                    <div className="space-y-4">
                        {services.map(service => (
                            <div key={service.id} className="mb-5 sm:mb-6 p-4 sm:p-5 border border-slate-700 rounded-md bg-slate-800/30 admin-card hover:shadow-lg transition-shadow">
                                {editingServiceId === service.id ? (
                                    // Edit mode
                                    <div className="space-y-4">
                                        <Input
                                            label="Xizmat nomi"
                                            value={editingService.name}
                                            onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                                            className="admin-input"
                                        />
                                        
                                        <Input
                                            label="Slug (URL uchun)"
                                            value={editingService.slug}
                                            onChange={(e) => setEditingService({...editingService, slug: e.target.value})}
                                            className="admin-input"
                                        />
                                        
                                        <Textarea
                                            label="Tavsif"
                                            value={editingService.description}
                                            onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                                            rows={3}
                                            className="admin-input"
                                        />
                                        
                                        <Input
                                            label="Narx (UZS)"
                                            type="number"
                                            value={editingService.price}
                                            onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                                            className="admin-input"
                                        />
                                        
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`edit-service-active-${service.id}`}
                                                checked={editingService.is_active}
                                                onChange={(e) => setEditingService({...editingService, is_active: e.target.checked})}
                                                className="h-4 w-4 text-accent-purple focus:ring-accent-purple border-slate-600 rounded"
                                            />
                                            <label htmlFor={`edit-service-active-${service.id}`} className="ml-2 block text-sm text-light-text">
                                                Xizmat faol
                                            </label>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <Button 
                                                onClick={handleUpdateService}
                                                className="admin-button-primary"
                                                isLoading={isSubmitting}
                                                leftIcon={<CheckIcon className="h-4 w-4" />}
                                            >
                                                Saqlash
                                            </Button>
                                            <Button 
                                                onClick={cancelEditing}
                                                variant="secondary"
                                                className="admin-button-secondary"
                                                leftIcon={<XMarkIcon className="h-4 w-4" />}
                                            >
                                                Bekor qilish
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-medium text-light-text flex items-center">
                                                    {service.name}
                                                    {service.is_active ? (
                                                        <span className="ml-2 modern-badge modern-badge-success text-xs">Faol</span>
                                                    ) : (
                                                        <span className="ml-2 modern-badge modern-badge-danger text-xs">Nofaol</span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-medium-text mt-1">{service.slug}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button 
                                                    onClick={() => startEditing(service)}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="admin-button-secondary"
                                                    leftIcon={<PencilIcon className="h-4 w-4" />}
                                                >
                                                    Tahrirlash
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDeleteService(service.id, service.slug)}
                                                    variant="danger"
                                                    size="sm"
                                                    className="admin-button-danger"
                                                    leftIcon={<TrashIcon className="h-4 w-4" />}
                                                    disabled={isSubmitting}
                                                >
                                                    O'chirish
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-medium-text">{service.description}</p>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-700/50">
                                            <p className="text-lg font-bold text-accent-sky">
                                                {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS
                                            </p>
                                            <Button 
                                                onClick={() => handleToggleActive(service)}
                                                variant={service.is_active ? "secondary" : "primary"}
                                                size="sm"
                                                className={service.is_active ? "admin-button-secondary" : "admin-button-primary"}
                                            >
                                                {service.is_active ? "O'chirish" : "Faollashtirish"}
                                            </Button>
                                        </div>
                                        
                                        {service.created_at && (
                                            <p className="text-xs text-medium-text mt-2">
                                                Yaratilgan: {new Date(service.created_at).toLocaleDateString('uz-UZ')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Cog6ToothIcon className="h-12 w-12 mx-auto text-slate-500" />
                        <h3 className="mt-4 text-lg font-medium text-light-text">Xizmatlar mavjud emas</h3>
                        <p className="mt-2 text-medium-text">Boshlash uchun yangi xizmat qo'shing.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminServiceManagementPage;