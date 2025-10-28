import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  BookOpenIcon, 
  ArrowLeftIcon, 
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { UserRole } from '../../types';

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
  attached_file: string | null;
  assigned_writer: {
    id: number;
    name: string;
    surname: string;
  } | null;
  printing_status: string | null;
  tracking_number: string | null;
  shipped_date: string | null;
  calculated_price: string;
  created_at: string;
  updated_at: string;
}

const WriterPrintedPublicationsPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [printingStatus, setPrintingStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/printed-publications/');
      setOrders(response.data);
    } catch (err: any) {
      setError("Buyurtmalar ro'yxatini yuklashda xatolik yuz berdi.");
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number) => {
    if (!status) {
      setError("Iltimos, statusni tanlang.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await apiService.post(`/printed-publications/${orderId}/update-status/`, {
        status,
        printing_status: printingStatus || undefined,
        tracking_number: trackingNumber || undefined
      });
      
      setSuccessMessage("Status muvaffaqiyatli yangilandi!");
      setPrintingStatus('');
      setTrackingNumber('');
      setStatus('');
      setSelectedOrder(null);
      
      // Update the orders list
      setOrders(orders.map(order => order.id === orderId ? response.data : order));
    } catch (err: any) {
      setError("Statusni yangilashda xatolik yuz berdi.");
      console.error("Failed to update status", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToMe = async (orderId: number) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await apiService.post(`/printed-publications/${orderId}/assign-writer/`, {
        writer_id: user.id
      });
      
      setSuccessMessage("Buyurtma sizga tayinlandi!");
      
      // Update the orders list
      setOrders(orders.map(order => order.id === orderId ? response.data : order));
    } catch (err: any) {
      setError("Buyurtmani tayinlashda xatolik yuz berdi.");
      console.error("Failed to assign order", err);
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
      case 'printing':
        return <span className="modern-badge modern-badge-warning">Chop etilmoqda</span>;
      case 'shipped':
        return <span className="modern-badge modern-badge-success">Yuborilgan</span>;
      case 'completed':
        return <span className="modern-badge modern-badge-success">Yakunlangan</span>;
      case 'cancelled':
        return <span className="modern-badge modern-badge-danger">Bekor qilingan</span>;
      default:
        return <span className="modern-badge modern-badge-secondary">Noma'lum</span>;
    }
  };

  const getStatusOptions = () => {
    return [
      { value: 'in_progress', label: 'Jarayonda' },
      { value: 'printing', label: 'Chop etilmoqda' },
      { value: 'shipped', label: 'Yuborilgan' },
      { value: 'completed', label: 'Yakunlangan' },
      { value: 'cancelled', label: 'Bekor qilingan' }
    ];
  };

  if (isLoading) {
    return <LoadingSpinner message="Buyurtmalar yuklanmoqda..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <BookOpenIcon className="h-8 w-8 mr-2" />
          {translate('printed_publications_title', 'Bosma Nashrlar')}
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
          <Card title={translate('printed_publications_orders', 'Bosma Nashrlar Buyurtmalari')} icon={<DocumentTextIcon className="h-6 w-6 text-accent-sky"/>}>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div 
                    key={order.id} 
                    className="modern-card cursor-pointer hover:border-accent-purple transition-all duration-300"
                    onClick={() => {
                      setSelectedOrder(order);
                      setPrintingStatus(order.printing_status || '');
                      setTrackingNumber(order.tracking_number || '');
                      setStatus(order.status);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-light-text">{order.form_data.bookTitle}</h3>
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
                    
                    {order.assigned_writer && (
                      <div className="mt-3 flex items-center text-sm text-medium-text">
                        <UserIcon className="h-4 w-4 mr-1" />
                        Tayinlangan: {order.assigned_writer.name} {order.assigned_writer.surname}
                      </div>
                    )}
                    
                    {order.tracking_number && (
                      <div className="mt-2 flex items-center text-sm text-medium-text">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        Kuzatuv raqami: {order.tracking_number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-light-text mb-2">
                  {translate('no_printed_orders', 'Bosma nashrlar buyurtmalari mavjud emas')}
                </h3>
                <p className="text-medium-text">
                  {translate('no_printed_orders_description', 'Hozirgi vaqtda bosma nashrlar uchun buyurtmalar mavjud emas')}
                </p>
              </div>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          {selectedOrder ? (
            <Card title={translate('order_details', 'Buyurtma tafsilotlari')} icon={<BookOpenIcon className="h-6 w-6 text-accent-sky"/>}>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-light-text mb-2">{selectedOrder.form_data.bookTitle}</h3>
                  <p className="text-medium-text text-sm">
                    {selectedOrder.user.name} {selectedOrder.user.surname}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-light-text mb-1">
                      {translate('book_pages', 'Betlar soni')}
                    </h4>
                    <p className="text-medium-text">
                      {selectedOrder.form_data.bookPages}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-light-text mb-1">
                      {translate('quantity', 'Miqdor')}
                    </h4>
                    <p className="text-medium-text">
                      {selectedOrder.form_data.quantity || 1} dona
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-light-text mb-1">
                      {translate('cover_type', 'Muqova turi')}
                    </h4>
                    <p className="text-medium-text">
                      {selectedOrder.form_data.coverType === 'hard' ? 'Qattiq muqova' : 
                       selectedOrder.form_data.coverType === 'soft' ? 'Yumshoq muqova' : 'Noma\'lum'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-light-text mb-1">
                    {translate('delivery_address', 'Yetkazib berish manzili')}
                  </h4>
                  <p className="text-medium-text">
                    {selectedOrder.form_data.deliveryAddress}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-light-text mb-1">
                    {translate('contact_phone', 'Telefon raqami')}
                  </h4>
                  <p className="text-medium-text">
                    {selectedOrder.form_data.contactPhone}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-light-text mb-1">
                    {translate('order_price', 'Buyurtma narxi')}
                  </h4>
                  <p className="text-medium-text font-bold text-accent-sky">
                    {new Intl.NumberFormat('uz-UZ').format(Number(selectedOrder.calculated_price))} UZS
                  </p>
                </div>
                
                {selectedOrder.form_data.includeISBN && (
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <p className="text-amber-500 font-medium">
                      ISBN raqami so'ralgan
                    </p>
                  </div>
                )}
                
                {selectedOrder.attached_file && (
                  <div>
                    <h4 className="font-medium text-light-text mb-1">
                      {translate('attached_file', 'Biriktirilgan fayl')}
                    </h4>
                    <a 
                      href={selectedOrder.attached_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent-sky hover:underline"
                    >
                      {translate('download_file', 'Faylni yuklab olish')}
                    </a>
                  </div>
                )}
                
                {!selectedOrder.assigned_writer && user?.role === UserRole.WRITER && (
                  <Button
                    fullWidth
                    onClick={() => handleAssignToMe(selectedOrder.id)}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    leftIcon={<UserIcon className="h-5 w-5" />}
                  >
                    {translate('assign_to_me', 'Menga tayinlash')}
                  </Button>
                )}
                
                {selectedOrder.assigned_writer?.id === user?.id && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-light-text mb-2">
                        {translate('status_label', 'Status')}
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                      >
                        <option value="">{translate('select_status', 'Statusni tanlang')}</option>
                        {getStatusOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {status === 'printing' && (
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                          {translate('printing_status', 'Chop etish statusi')}
                        </label>
                        <Input
                          value={printingStatus}
                          onChange={(e) => setPrintingStatus(e.target.value)}
                          placeholder="Chop etish jarayoni haqida ma'lumot"
                        />
                      </div>
                    )}
                    
                    {status === 'shipped' && (
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                          {translate('tracking_number', 'Kuzatuv raqami')}
                        </label>
                        <Input
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Pochta yoki kuryer kuzatuv raqami"
                        />
                      </div>
                    )}
                    
                    <Button
                      fullWidth
                      onClick={() => handleUpdateStatus(selectedOrder.id)}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      leftIcon={<PencilIcon className="h-5 w-5" />}
                    >
                      {translate('update_status', 'Statusni yangilash')}
                    </Button>
                  </div>
                )}
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
                  {translate('select_order_description', 'Tafsilotlarni ko\'rish va statusni yangilash uchun chapdagi ro\'yxatdan buyurtma tanlang')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriterPrintedPublicationsPage;