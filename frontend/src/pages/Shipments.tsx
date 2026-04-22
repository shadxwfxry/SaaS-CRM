import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PackageOpen, MapPin, Trash2 } from 'lucide-react';

interface Shipment {
  id: string;
  recipient_name: string;
  recipient_address: string;
  delivery_method: string;
  order_number?: string;
  payment_method?: string;
  status: string;
  quantity: number;
  created_at: string;
  product: { title: string, sku: string };
}

interface Product {
  id: string;
  title: string;
  sku: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface ShipmentFormData {
  recipient_name: string;
  recipient_address: string;
  delivery_method: string;
  order_number?: string;
  payment_method?: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
}

export default function Shipments() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useTranslation();

  const { register, handleSubmit, reset } = useForm<ShipmentFormData>({
    defaultValues: { quantity: 1, delivery_method: 'Почта' }
  });

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => (await axios.get('/api/v1/shipments/')).data as Shipment[]
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('/api/v1/products/')).data as Product[]
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => (await axios.get('/api/v1/warehouses/')).data as Warehouse[]
  });

  const mutation = useMutation({
    mutationFn: async (data: ShipmentFormData) => {
      const res = await axios.post('/api/v1/shipments/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsFormOpen(false);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/v1/shipments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => axios.patch(`/api/v1/shipments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const onSubmit = (data: ShipmentFormData) => {
    mutation.mutate({ 
      ...data, 
      quantity: parseInt(data.quantity as unknown as string, 10),
      warehouse_id: data.warehouse_id || undefined 
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'RETURNED' && !confirm('Вы уверены? Товар будет возвращен на склад, и статус нельзя будет откатить!')) return;
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirm_delete'))) deleteMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('shipments.title')}</h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          {isFormOpen ? t('shipments.cancel') : t('shipments.add')}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold mb-4">{t('shipments.form.title')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-gray-50/50 p-5 rounded-lg border border-gray-100 mb-6">
                <div className="lg:col-span-1">
                  {/* Номер заказа (произвольный) */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.order_number')}</label>
                  <input {...register('order_number')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" placeholder="#ORD-12345" />
                </div>
                <div className="lg:col-span-2">
                  {/* ФИО */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.name')}</label>
                  <input required {...register('recipient_name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" placeholder="Іван Іваненко / John Doe" />
                </div>
                <div className="lg:col-span-3">
                  {/* Адрес */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.address')}</label>
                  <input required {...register('recipient_address')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" placeholder="м. Київ, вул. Хрещатик, буд. 1" />
                </div>
                <div className="lg:col-span-1">
                  {/* Доставка */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.method')}</label>
                  <input required {...register('delivery_method')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" placeholder="Нова Пошта / Укрпошта" />
                </div>
                <div className="lg:col-span-2">
                  {/* Оплата */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.payment')}</label>
                  <select required {...register('payment_method')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                    <option value={t('shipments.form.payment_card')}>{t('shipments.form.payment_card')}</option>
                    <option value={t('shipments.form.payment_cash')}>{t('shipments.form.payment_cash')}</option>
                    <option value={t('shipments.form.payment_prepaid')}>{t('shipments.form.payment_prepaid')}</option>
                    <option value={t('shipments.form.payment_bank')}>{t('shipments.form.payment_bank')}</option>
                  </select>
                </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.product')}</label>
                 <select required {...register('product_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                   <option value="">-- Выберите товар --</option>
                   {products?.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.title}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.qty')}</label>
                 <input required type="number" min="1" {...register('quantity')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.form.warehouse')}</label>
                 <select {...register('warehouse_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                   <option value="">-- {t('shipments.form.warehouse')} --</option>
                   {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                 </select>
               </div>
            </div>
            
            {mutation.isError && (
              <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
                {t('shipments.form.error')}
              </div>
            )}

            <div className="flex justify-end pt-2">
               <button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-bold transition-colors">
                 {mutation.isPending ? t('shipments.form.saving') : t('shipments.form.save')}
               </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('shipments.table.date')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('shipments.table.recipient')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('shipments.table.method')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('shipments.table.product')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('shipments.table.qty')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('shipments.table.status')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shipments?.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                     {s.order_number && <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold mb-1">{s.order_number}</span>}
                     <p className="font-semibold text-gray-900">{s.recipient_name}</p>
                     <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {s.recipient_address}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="flex items-center gap-1.5"><PackageOpen className="w-4 h-4 text-gray-400"/> {s.delivery_method}</span>
                     {s.payment_method && <span className="block mt-1 text-xs text-gray-500">{s.payment_method}</span>}
                  </td>
                  <td className="px-6 py-4 font-medium">{s.product?.title || 'Товар удален'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{s.quantity} шт</td>
                  <td className="px-6 py-4">
                     <select 
                       value={s.status} 
                       disabled={s.status === 'RETURNED' || updateStatusMutation.isPending}
                       onChange={(e) => handleStatusChange(s.id, e.target.value)}
                       className={`px-2 py-1 rounded-full text-xs font-bold outline-none cursor-pointer border-r-[6px] border-transparent
                         ${s.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                           s.status === 'DELIVERED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                           'bg-red-100 text-red-700 cursor-not-allowed'}
                       `}
                     >
                        <option value="SHIPPED" className="bg-white text-gray-900">В пути</option>
                        <option value="DELIVERED" className="bg-white text-gray-900">Завершено</option>
                        <option value="RETURNED" className="bg-white text-gray-900">Возврат</option>
                     </select>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end">
                    <button onClick={() => handleDelete(s.id)} disabled={deleteMutation.isPending} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {shipments?.length === 0 && (<tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t('shipments.table.empty')}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
