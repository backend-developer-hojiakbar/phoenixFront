import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; 
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface DocumentType {
  id: string;
  name: string;
}

const DocumentTypeManagementPage: React.FC = () => {
    const { translate } = useLanguage();
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Form states
    const [newTypeName, setNewTypeName] = useState('');
    const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
    const [editingTypeName, setEditingTypeName] = useState('');

    // Initial sample data - in a real app, this would come from an API
    const initialDocumentTypes: DocumentType[] = [
        { id: 'article', name: 'Ilmiy maqola' },
        { id: 'dissertation', name: 'Dissertatsiya' },
        { id: 'abstract', name: 'Avtoreferat' },
        { id: 'monograph', name: 'Monografiya' },
        { id: 'report', name: 'Hisobot' },
        { id: 'other', name: 'Boshqa' }
    ];

    const fetchDocumentTypes = async () => {
        setIsLoading(true);
        try {
            // In a real implementation, this would fetch from an API
            // const { data } = await apiService.get<DocumentType[]>('/document-types/');
            // For now, we'll use the initial sample data
            setDocumentTypes(initialDocumentTypes);
        } catch (error) {
            setActionMessage({type: 'error', text: "Hujjat turlarini yuklashda xatolik."});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    const handleAddType = async () => {
        if (!newTypeName.trim()) {
            setActionMessage({type: 'error', text: "Tur nomi bo'sh bo'lmasligi kerak."});
            return;
        }
        
        // Check for duplicates
        if (documentTypes.some(type => type.name.toLowerCase() === newTypeName.trim().toLowerCase())) {
            setActionMessage({type: 'error', text: "Bu nom allaqachon mavjud."});
            return;
        }
        
        setIsLoading(true);
        setActionMessage(null);
        
        try {
            const newId = newTypeName.trim().toLowerCase().replace(/\s+/g, '_');
            const newType: DocumentType = { id: newId, name: newTypeName.trim() };
            
            // In a real implementation, this would save to an API
            // await apiService.post('/document-types/', newType);
            
            setDocumentTypes([...documentTypes, newType]);
            setNewTypeName('');
            setActionMessage({ type: 'success', text: "Yangi hujjat turi muvaffaqiyatli qo'shildi!" });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Tur qo\'shishda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (type: DocumentType) => {
        setEditingTypeId(type.id);
        setEditingTypeName(type.name);
    };

    const cancelEditing = () => {
        setEditingTypeId(null);
        setEditingTypeName('');
    };

    const handleUpdateType = async () => {
        if (!editingTypeId || !editingTypeName.trim()) {
            setActionMessage({type: 'error', text: "Tur nomi bo'sh bo'lmasligi kerak."});
            return;
        }
        
        // Check for duplicates (excluding the current type being edited)
        if (documentTypes.some(type => type.id !== editingTypeId && type.name.toLowerCase() === editingTypeName.trim().toLowerCase())) {
            setActionMessage({type: 'error', text: "Bu nom allaqachon mavjud."});
            return;
        }
        
        setIsLoading(true);
        setActionMessage(null);
        
        try {
            // In a real implementation, this would update via an API
            // await apiService.patch(`/document-types/${editingTypeId}/`, { name: editingTypeName.trim() });
            
            setDocumentTypes(documentTypes.map(type => 
                type.id === editingTypeId 
                    ? { ...type, name: editingTypeName.trim() } 
                    : type
            ));
            
            setActionMessage({ type: 'success', text: "Hujjat turi muvaffaqiyatli yangilandi!" });
            cancelEditing();
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Turi yangilashda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteType = async (typeId: string) => {
        // Prevent deletion of all types
        if (documentTypes.length <= 1) {
            setActionMessage({type: 'error', text: "Kamida bitta hujjat turi bo'lishi kerak."});
            return;
        }
        
        setIsLoading(true);
        setActionMessage(null);
        
        try {
            // In a real implementation, this would delete via an API
            // await apiService.delete(`/document-types/${typeId}/`);
            
            setDocumentTypes(documentTypes.filter(type => type.id !== typeId));
            setActionMessage({ type: 'success', text: "Hujjat turi muvaffaqiyatli o'chirildi!" });
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Turi o\'chirishda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">Hujjat Turlarini Boshqarish</h1>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4 admin-alert admin-alert-success" />}

            {/* Add New Type Card */}
            <Card className="admin-card-gradient" title="Yangi Hujjat Turi Qo'shish" icon={<PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                <div className="space-y-4">
                    <Input
                        label="Tur nomi"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="Yangi hujjat turi nomini kiriting"
                        className="admin-input"
                    />
                    <Button 
                        onClick={handleAddType} 
                        className="mt-2 w-full sm:w-auto admin-button-primary hover:opacity-90"
                        isLoading={isLoading}
                        leftIcon={<PlusIcon className="h-5 w-5" />}
                    >
                        Qo'shish
                    </Button>
                </div>
            </Card>

            {/* Document Types List Card */}
            <Card className="admin-card-gradient" title="Mavjud Hujjat Turlari" icon={<DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                {isLoading ? <LoadingSpinner /> : documentTypes.length > 0 ? (
                    <div className="space-y-4">
                        {documentTypes.map(type => (
                            <div key={type.id} className="mb-5 sm:mb-6 p-4 sm:p-5 border border-slate-700 rounded-md bg-slate-800/30 admin-card hover:shadow-lg transition-shadow">
                                {editingTypeId === type.id ? (
                                    // Edit mode
                                    <div className="space-y-4">
                                        <Input
                                            label="Tur nomini tahrirlash"
                                            value={editingTypeName}
                                            onChange={(e) => setEditingTypeName(e.target.value)}
                                            className="admin-input"
                                        />
                                        <div className="flex space-x-3">
                                            <Button 
                                                onClick={handleUpdateType} 
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
                                                {type.name}
                                            </h3>
                                            <p className="text-sm text-medium-text mt-1">
                                                ID: {type.id}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button 
                                                onClick={() => startEditing(type)} 
                                                variant="secondary"
                                                size="sm"
                                                className="admin-button-secondary flex items-center"
                                                leftIcon={<PencilIcon className="h-4 w-4" />}
                                            >
                                                Tahrirlash
                                            </Button>
                                            <Button 
                                                onClick={() => handleDeleteType(type.id)} 
                                                variant="danger"
                                                size="sm"
                                                className="admin-button-danger flex items-center"
                                                leftIcon={<TrashIcon className="h-4 w-4" />}
                                                disabled={documentTypes.length <= 1}
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
                        <p className="text-medium-text mb-4">Hech qanday hujjat turi topilmadi.</p>
                        <Button 
                            onClick={fetchDocumentTypes} 
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

export default DocumentTypeManagementPage;