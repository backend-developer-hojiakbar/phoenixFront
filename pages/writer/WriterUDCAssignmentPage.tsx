import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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

const WriterUDCAssignmentPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [udcCode, setUdcCode] = useState('');

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/udc-assignments/');
      setOrders(response.data);
    } catch (err: any) {
      setError("Buyurtmalar ro'yxatini yuklashda xatolik yuz berdi.");
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignUDC = async (orderId: number) => {
    if (!udcCode.trim()) {
      setError("Iltimos, UDC kodini kiriting.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await apiService.post(`/udc-assignments/${orderId}/assign-udc/`, {
        udc_code: udcCode
      });
      
      setSuccessMessage("UDC kodi muvaffaqiyatli tayinlandi!");
      setUdcCode('');
      setSelectedOrder(null);
      
      // Update the orders list
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err: any) {
      setError("UDC kodini tayinlashda xatolik yuz berdi.");
      console.error("Failed to assign UDC", err);
    } finally {
      setIsSubmitting(false);
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
          {translate('udc_assignment_title', 'UDC Tayinlash')}
        </h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/writer/dashboard')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
        >
          {translate('back_to_dashboard', 'Panelga qaytish')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={translate('pending_udc_orders', 'Kutilayotgan UDC Buyurtmalar')} icon={<DocumentTextIcon className="h-6 w-6 text-accent-sky"/>}>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div 
                    key={order.id} 
                    className="modern-card cursor-pointer hover:border-accent-purple transition-all duration-300"
                    onClick={() => {
                      setSelectedOrder(order);
                      setUdcCode(order.udc_code || '');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-light-text">{order.form_data.articleTitle}</h3>
                        <p className="text-medium-text text-sm mt-1">
                          {order.user.name} {order.user.surname} ({order.user.phone})
                        </p>
                        <div className="flex items-center text-sm text-medium-text mt-2">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(order.status)}
                        <span className="text-sm text-medium-text mt-2">
                          {order.service.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-light-text mb-2">
                  {translate('no_pending_orders', 'Kutilayotgan buyurtmalar mavjud emas')}
                </h3>
                <p className="text-medium-text">
                  {translate('no_pending_orders_description', 'Hozirgi vaqtda UDC tayinlash uchun buyurtmalar mavjud emas')}
                </p>
              </div>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          {selectedOrder ? (
            <Card title={translate('assign_udc', 'UDC Tayinlash')} icon={<TagIcon className="h-6 w-6 text-accent-sky"/>}>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-light-text mb-2">{selectedOrder.form_data.articleTitle}</h3>
                  <p className="text-medium-text text-sm">
                    {selectedOrder.user.name} {selectedOrder.user.surname}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-light-text mb-2">
                    {translate('article_abstract', 'Maqola annotatsiyasi')}
                  </h4>
                  <p className="text-medium-text text-sm">
                    {selectedOrder.form_data.articleAbstract}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-light-text mb-2">
                    {translate('selected_field', 'Tanlangan soha')}
                  </h4>
                  <p className="text-medium-text">
                    {selectedOrder.form_data.field}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    {translate('udc_code_label', 'UDC kodi')}
                  </label>
                  <Input
                    value={udcCode}
                    onChange={(e) => setUdcCode(e.target.value)}
                    placeholder="Masalan: 530.145"
                    required
                  />
                </div>
                
                <Button
                  fullWidth
                  onClick={() => handleAssignUDC(selectedOrder.id)}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  leftIcon={<CheckCircleIcon className="h-5 w-5" />}
                >
                  {translate('assign_udc_button', 'UDC kodini tayinlash')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card title={translate('order_details', 'Buyurtma tafsilotlari')} icon={<DocumentTextIcon className="h-6 w-6 text-accent-sky"/>}>
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-light-text mb-2">
                  {translate('select_order', 'Buyurtma tanlang')}
                </h3>
                <p className="text-medium-text">
                  {translate('select_order_description', 'Tafsilotlarni ko\'rish va UDC kodini tayinlash uchun chapdagi ro\'yxatdan buyurtma tanlang')}
                </p>
              </div>
            </Card>
          )}
          
          <Card title={translate('your_assigned_orders', 'Sizning tayinlangan buyurtmalaringiz')} icon={<UserIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="text-center py-4">
              <p className="text-medium-text">
                {translate('assigned_orders_info', 'Sizga tayinlangan UDC buyurtmalar bu yerda ko\'rinadi')}
              </p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => navigate('/writer/my-udc-orders')}
              >
                {translate('view_assigned_orders', 'Tayinlangan buyurtmalarni ko\'rish')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WriterUDCAssignmentPage;