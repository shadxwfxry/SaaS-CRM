import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

interface Movement {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  quantity: number;
  created_at: string;
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

interface MovementFormData {
  type: 'IN' | 'OUT' | 'TRANSFER';
  product_id: string;
  quantity: number;
  from_warehouse_id?: string;
  to_warehouse_id?: string;
}

export default function Movements() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useTranslation();

  const { register, handleSubmit, watch, reset } = useForm<MovementFormData>({
    defaultValues: { type: 'IN', quantity: 1 }
  });

  const movementType = watch('type');

  const { data: movements, isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: async () => (await axios.get('/api/v1/movements/')).data as Movement[]
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
    mutationFn: async (data: MovementFormData) => {
      const payload = { ...data };
      if (!payload.from_warehouse_id) delete payload.from_warehouse_id;
      if (!payload.to_warehouse_id) delete payload.to_warehouse_id;
      const res = await axios.post('/api/v1/movements/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsFormOpen(false);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/v1/movements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const onSubmit = (data: MovementFormData) => {
    mutation.mutate({ ...data, quantity: parseInt(data.quantity as unknown as string, 10) });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirm_delete'))) deleteMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('movements.title')}</h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          {isFormOpen ? t('movements.cancel') : t('movements.add')}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold mb-4">{t('movements.form.title')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('movements.form.type')}</label>
                 <select {...register('type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                   <option value="IN">{t('movements.form.type_in')}</option>
                   <option value="OUT">{t('movements.form.type_out')}</option>
                   <option value="TRANSFER">{t('movements.form.type_transfer')}</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('movements.form.product')}</label>
                 <select required {...register('product_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                   <option value="">-- {t('movements.form.select_product')} --</option>
                   {products?.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.title}</option>)}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('movements.form.qty')}</label>
                 <input required type="number" min="1" {...register('quantity')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
               </div>
               
               {(movementType === 'OUT' || movementType === 'TRANSFER') && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">{t('movements.form.from')}</label>
                   <select required {...register('from_warehouse_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                     <option value="">-- {t('movements.form.select_warehouse')} --</option>
                     {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                   </select>
                 </div>
               )}
               
               {(movementType === 'IN' || movementType === 'TRANSFER') && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">{t('movements.form.to')}</label>
                   <select required {...register('to_warehouse_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                     <option value="">-- {t('movements.form.select_warehouse')} --</option>
                     {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                   </select>
                 </div>
               )}
            </div>
            
            {mutation.isError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {t('movements.form.error')}
              </div>
            )}

            <div className="flex justify-end pt-2">
               <button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                 {mutation.isPending ? t('movements.form.saving') : t('movements.form.save')}
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
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('movements.table.date')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('movements.table.type')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('movements.table.qty')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements?.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                      ${m.type === 'IN' ? 'bg-green-100 text-green-700' : m.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}
                    `}>
                      {m.type === 'IN' ? t('movements.table.in') : m.type === 'OUT' ? t('movements.table.out') : t('movements.table.transfer')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{m.quantity}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {movements?.length === 0 && (<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">{t('movements.table.empty')}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
