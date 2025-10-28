import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  TagIcon, 
  ArrowLeftIcon, 
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

interface ServiceOrder {
  id: number;
  user: {
    id: number;
    phone: string;
    name: string;
    surname: string;
  };
  service: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
  };
  status: string;
  form_data: any;
  udc_code: string | null;
  created_at: string;
  updated_at: string;
}

const WriterMyUDCOrdersPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/writer-udc-orders/');
      setOrders(response.data);
    } catch (err: any) {
      setError("Buyurtmalar ro'yxatini yuklashda xatolik yuz berdi.");
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <span className="modern-badge modern-badge-secondary">To'lov kutilmoqda</span>;
      case 'in_progress':
        return <span className="modern-badge modern-badge-primary">Jarayonda</span>;
      case 'udc_assigned':
        return <span className="modern-badge modern-badge-success">UDC tayinlangan</span>;
      case 'completed':
        return <span className="modern-badge modern-badge-success">Yakunlangan</span>;
      case 'cancelled':
        return <span className="modern-badge modern-badge-danger">Bekor qilingan</span>;
      default:
        return <span className="modern-badge modern-badge-secondary">Noma'lum</span>;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Buyurtmalar yuklanmoqda..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <TagIcon className="h-8 w-8 mr-2" />
          {translate('my_udc_orders_title', 'Mening UDC Buyurtmalarim')}
        </h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/writer/udc-assignment')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
        >
          {translate('back_to_udc_assignment', 'UDC tayinlashga qaytish')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card title={undefined} icon={undefined}>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{translate('article_title_label', 'Maqola')}</th>
                  <th>{translate('author_label', 'Muallif')}</th>
                  <th>{translate('field_label', 'Soha')}</th>
                  <th>{translate('udc_code_label', 'UDC kodi')}</th>
                  <th>{translate('status_label', 'Status')}</th>
                  <th>{translate('assigned_date_label', 'Tayinlangan sana')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="font-medium text-light-text">{order.form_data.articleTitle}</td>
                    <td>{order.user.name} {order.user.surname}</td>
                    <td>{order.form_data.field}</td>
                    <td>
                      {order.udc_code ? (
                        <span className="font-mono bg-slate-700 px-2 py-1 rounded">
                          {order.udc_code}
                        </span>
                      ) : (
                        <span className="text-medium-text">-</span>
                      )}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-light-text mb-2">
              {translate('no_assigned_orders', 'Tayinlangan buyurtmalar mavjud emas')}
            </h3>
            <p className="text-medium-text mb-6">
              {translate('no_assigned_orders_description', 'Hozirgi vaqtda sizga tayinlangan UDC buyurtmalar mavjud emas')}
            </p>
            <Button 
              onClick={() => navigate('/writer/udc-assignment')}
              leftIcon={<TagIcon className="h-4 w-4" />}
            >
              {translate('go_to_udc_assignment', 'UDC tayinlashga o\'tish')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WriterMyUDCOrdersPage;