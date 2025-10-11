import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { TagIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; 
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface SohaField {
  id: string;
  name: string;
}

const SohaManagementPage: React.FC = () => {
    const { translate } = useLanguage();
    const [sohaFields, setSohaFields] = useState<SohaField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Form states
    const [newFieldName, setNewFieldName] = useState('');
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [editingFieldName, setEditingFieldName] = useState('');

    // Initial sample data - in a real app, this would come from an API
    const initialSohaFields: SohaField[] = [
        { id: 'physics', name: 'Fizika' },
        { id: 'chemistry', name: 'Kimyo' },
        { id: 'biology', name: 'Biologiya' },
        { id: 'mathematics', name: 'Matematika' },
        { id: 'computer_science', name: 'Kompyuter fanlari' },
        { id: 'medicine', name: 'Tibbiyot' },
        { id: 'engineering', name: 'Muhandislik' },
        { id: 'economics', name: 'Iqtisodiyot' },
        { id: 'literature', name: 'Adabiyot' },
        { id: 'history', name: 'Tarix' }
    ];

    const fetchSohaFields = async () => {
        setIsLoading(true);
        try {
            // In a real implementation, this would fetch from an API
            // const { data } = await apiService.get<SohaField[]>('/soha-fields/');
            // For now, we'll use the initial sample data
            setSohaFields(initialSohaFields);
        } catch (error) {
            setActionMessage({type: 'error', text: "SOHA maydonlarini yuklashda xatolik."});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSohaFields();
    }, []);

    const handleAddField = async () => {
        if (!newFieldName.trim()) {
            setActionMessage({type: 'error', text: "Maydon nomi bo'sh bo'lmasligi kerak."});
            return;
        }
        
        // Check for duplicates
        if (sohaFields.some(field => field.name.toLowerCase() === newFieldName.trim().toLowerCase())) {
            setActionMessage({type: 'error', text: "Bu nom allaqachon mavjud."});
            return;
        }
        
        setIsLoading(true);
        setActionMessage(null);
        
        try {
            const newId = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
            const newField: SohaField = { id: newId, name: newFieldName.trim() };
            
            // In a real implementation, this would save to an API
            // await apiService.post('/soha-fields/', newField);
            
            setSohaFields([...sohaFields, newField]);
            setNewFieldName('');
            setActionMessage({ type: 'success', text: "Yangi SOHA maydoni muvaffaqiyatli qo'shildi!" });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Maydon qo\'shishda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (field: SohaField) => {
        setEditingFieldId(field.id);
        setEditingFieldName(field.name);
    };

    const cancelEditing = () => {
        setEditingFieldId(null);
        setEditingFieldName('');
    };

    const handleUpdateField = async () => {
        if (!editingFieldId || !editingFieldName.trim()) {
            setActionMessage({type: 'error', text: "Maydon nomi bo'sh bo'lmasligi kerak."});
            return;
        }
        
        // Check for duplicates (excluding the current field being edited)
        if (sohaFields.some(field => field.id !== editingFieldId && field.name.toLowerCase() === editingFieldName.trim().toLowerCase())) {
            setActionMessage({type: 'error', text: "Bu nom allaqachon mavjud."});
            return;
        }
        
        setIsLoading(true);
        setActionMessage(null);
        
        try {
            // In a real implementation, this would update via an API
            // await apiService.patch(`/soha-fields/${editingFieldId}/`, { name: editingFieldName.trim() });
            
            setSohaFields(sohaFields.map(field => 
                field.id === editingFieldId 
                    ? { ...field, name: editingFieldName.trim() } 
                    : field
            ));
            
            setActionMessage({ type: 'success', text: "SOHA maydoni muvaffaqiyatli yangilandi!" });
            cancelEditing();
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Maydonni yangilashda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        // Prevent deletion of all fields
        if (sohaFields.length <= 1) {
            setActionMessage({type: 'error', text: "Kamida bitta SOHA maydoni bo'lishi kerak."});
            return;
        }
        
        setIsLoading(true);
        setActionMessage(null);
        
        try {
            // In a real implementation, this would delete via an API
            // await apiService.delete(`/soha-fields/${fieldId}/`);
            
            setSohaFields(sohaFields.filter(field => field.id !== fieldId));
            setActionMessage({ type: 'success', text: "SOHA maydoni muvaffaqiyatli o'chirildi!" });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Maydonni o\'chirishda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <TagIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">SOHA Maydonlarini Boshqarish</h1>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4 admin-alert admin-alert-success" />}

            {/* Add New Field Card */}
            <Card className="admin-card-gradient" title="Yangi SOHA Maydoni Qo'shish" icon={<PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                <div className="space-y-4">
                    <Input
                        label="Maydon nomi"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Yangi SOHA maydoni nomini kiriting"
                        className="admin-input"
                    />
                    <Button 
                        onClick={handleAddField} 
                        className="mt-2 w-full sm:w-auto admin-button-primary hover:opacity-90"
                        isLoading={isLoading}
                        leftIcon={<PlusIcon className="h-5 w-5" />}
                    >
                        Qo'shish
                    </Button>
                </div>
            </Card>

            {/* SOHA Fields List Card */}
            <Card className="admin-card-gradient" title="Mavjud SOHA Maydonlari" icon={<TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                {isLoading ? <LoadingSpinner /> : sohaFields.length > 0 ? (
                    <div className="space-y-4">
                        {sohaFields.map(field => (
                            <div key={field.id} className="mb-5 sm:mb-6 p-4 sm:p-5 border border-slate-700 rounded-md bg-slate-800/30 admin-card hover:shadow-lg transition-shadow">
                                {editingFieldId === field.id ? (
                                    // Edit mode
                                    <div className="space-y-4">
                                        <Input
                                            label="Maydon nomini tahrirlash"
                                            value={editingFieldName}
                                            onChange={(e) => setEditingFieldName(e.target.value)}
                                            className="admin-input"
                                        />
                                        <div className="flex space-x-3">
                                            <Button 
                                                onClick={handleUpdateField} 
                                                className="admin-button-primary hover:opacity-90"
                                                isLoading={isLoading}
                                            >
                                                Saqlash
                                            </Button>
                                            <Button 
                                                onClick={cancelEditing} 
                                                variant="secondary"
                                                className="admin-button-secondary"
                                            >
                                                Bekor qilish
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-light-text">
                                                {field.name}
                                            </h3>
                                            <p className="text-sm text-medium-text mt-1">
                                                ID: {field.id}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button 
                                                onClick={() => startEditing(field)} 
                                                variant="secondary"
                                                size="sm"
                                                className="admin-button-secondary flex items-center"
                                                leftIcon={<PencilIcon className="h-4 w-4" />}
                                            >
                                                Tahrirlash
                                            </Button>
                                            <Button 
                                                onClick={() => handleDeleteField(field.id)} 
                                                variant="danger"
                                                size="sm"
                                                className="admin-button-danger flex items-center"
                                                leftIcon={<TrashIcon className="h-4 w-4" />}
                                                disabled={sohaFields.length <= 1}
                                            >
                                                O'chirish
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-medium-text mb-4">Hech qanday SOHA maydoni topilmadi.</p>
                        <Button 
                            onClick={fetchSohaFields} 
                            variant="secondary" 
                            className="admin-button-secondary"
                        >
                            Qayta urinib ko'rish
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SohaManagementPage;