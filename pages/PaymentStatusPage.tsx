import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const PaymentStatusPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading');
    const [message, setMessage] = useState('');
    const [redirectPath, setRedirectPath] = useState('/dashboard');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const errorCode = params.get('error_code');
        const merchantTransId = params.get('merchant_trans_id');

        let serviceType = 'article';
        if (merchantTransId?.startsWith('service_')) {
            serviceType = merchantTransId.split('_')[1]; 
        }

        const determineRedirectPath = (transId: string) => {
            if (transId.startsWith('article_')) {
                return '/my-articles';
            }
            if (transId.startsWith('service_')) {
                const serviceSlug = transId.split('_')[1].replace(/\d/g, ''); // Raqamlarni olib tashlash
                // Bu joyni xizmatlaringiz slug'lariga moslab kengaytirishingiz mumkin
                if (transId.includes('plagiarism')) return '/plagiarism-check';
                if (transId.includes('ai-document')) return '/ai-document-utilities';
                // va hokazo
                return '/services'; 
            }
            return '/dashboard';
        };

        if (merchantTransId) {
            setRedirectPath(determineRedirectPath(merchantTransId));
        }

        if (errorCode === '0') {
            setStatus('success');
            setMessage('Toʻlov muvaffaqiyatli amalga oshirildi! Buyurtmangiz qayta ishlanmoqda.');
            if (merchantTransId) {
                const completedPayments = JSON.parse(localStorage.getItem('completedPayments') || '[]');
                if (!completedPayments.includes(merchantTransId)) {
                    completedPayments.push(merchantTransId);
                    localStorage.setItem('completedPayments', JSON.stringify(completedPayments));
                }
            }
        } else if (errorCode === '-1' || errorCode === '-9') {
            setStatus('cancelled');
            setMessage('Toʻlov bekor qilindi.');
        } else {
            setStatus('error');
            setMessage(`Toʻlovda xatolik yuz berdi. Xato kodi: ${errorCode || 'Noma\'lum'}.`);
        }
    }, [location]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <LoadingSpinner message="To'lov statusi tekshirilmoqda..." />;
            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="h-20 w-20 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-light-text mb-2">To'lov Muvaffaqiyatli</h2>
                        <p className="text-medium-text">{message}</p>
                        <Button onClick={() => navigate(redirectPath)} className="mt-6">
                            Sahifaga qaytish
                        </Button>
                    </div>
                );
            case 'error':
            case 'cancelled':
                return (
                    <div className="text-center">
                        {status === 'error' ? (
                            <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
                        ) : (
                            <ExclamationTriangleIcon className="h-20 w-20 text-amber-500 mx-auto mb-4" />
                        )}
                        <h2 className="text-2xl font-bold text-light-text mb-2">
                            {status === 'error' ? "To'lovda Xatolik" : "To'lov Bekor Qilindi"}
                        </h2>
                        <p className="text-medium-text">{message}</p>
                         <Button onClick={() => navigate(redirectPath)} className="mt-6">
                            Orqaga qaytish
                        </Button>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                {renderContent()}
            </Card>
        </div>
    );
};

export default PaymentStatusPage;