import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import apiService, { createFormData } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const EditorialApplicationPage: React.FC = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passportFile || !photoFile || !diplomaFile) {
            setError("Barcha fayllarni yuklash majburiy.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const formData = createFormData({
            passport_file: passportFile,
            photo_3x4: photoFile,
            diploma_file: diplomaFile,
        });

        try {
            await apiService.post('/applications/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess("Arizangiz muvaffaqiyatli yuborildi. Tez orada admin tomonidan ko'rib chiqiladi.");
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            setError("Arizani yuborishda xatolik yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-accent-sky">Tahririyat a'zoligiga ariza</h1>
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            {success && <Alert type="success" message={success} />}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Pasport nusxasi</label>
                        <Input type="file" onChange={(e) => setPassportFile(e.target.files?.[0] || null)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">3x4 Rasm</label>
                        <Input type="file" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Ilmiy daraja diplomi</label>
                        <Input type="file" onChange={(e) => setDiplomaFile(e.target.files?.[0] || null)} required />
                    </div>
                    <Button type="submit" isLoading={isLoading} leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}>
                        Arizani Yuborish
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default EditorialApplicationPage;