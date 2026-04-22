import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit2 } from 'lucide-react';
import { formatCurrency } from '../i18n';

interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  category_id?: string;
  category?: { id: string, name: string };
  inventory?: { quantity: number, warehouse?: { name: string } }[];
}

interface Category {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface ProductFormData {
  sku: string;
  title: string;
  price: number;
  category_id?: string;
  initial_warehouse_id?: string;
  initial_quantity?: number;
}

export default function Products() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const { register, handleSubmit, watch, reset, setValue } = useForm<ProductFormData>({
     defaultValues: { initial_quantity: 1 }
  });

  const selectedWarehouse = watch('initial_warehouse_id');

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('/api/v1/products/')).data as Product[]
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('/api/v1/categories/')).data as Category[]
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => (await axios.get('/api/v1/warehouses/')).data as Warehouse[]
  });

  const mutation = useMutation({
    mutationFn: async (data: { id?: string; payload: ProductFormData }) => {
      const payload = { ...data.payload, price: parseFloat(data.payload.price as unknown as string) || 0 };
      if (!payload.category_id) delete payload.category_id;
      if (!payload.initial_warehouse_id) delete payload.initial_warehouse_id;
      if (payload.initial_quantity) payload.initial_quantity = parseInt(payload.initial_quantity as unknown as string, 10);
      
      if (data.id) return axios.put(`/api/v1/products/${data.id}`, payload);
      return axios.post('/api/v1/products/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setEditingId(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/v1/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setValue('sku', p.sku);
    setValue('title', p.title);
    setValue('price', p.price);
    if (p.category_id) setValue('category_id', p.category_id);
    setValue('initial_warehouse_id', '');
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirm_delete'))) deleteMutation.mutate(id);
  };

  const openNewForm = () => {
    reset();
    setEditingId('new');
  };

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate({ id: editingId === 'new' ? undefined : editingId || undefined, payload: data });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
        <button 
          onClick={() => editingId ? setEditingId(null) : openNewForm()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          {editingId ? t('products.cancel') : t('products.add')}
        </button>
      </div>

      {editingId && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold mb-4">{t('products.form.title')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.form.sku')}</label>
                 <input required {...register('sku')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.form.name')}</label>
                 <input required {...register('title')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.form.price')}</label>
                 <input required type="number" step="0.01" {...register('price')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
               </div>
               
               <div className="md:col-span-2 flex items-end gap-2">
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.form.category')}</label>
                   <select {...register('category_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                     <option value="">-- {t('products.form.select_category')} --</option>
                     {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
               </div>

               {editingId === 'new' && (
                 <>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.form.warehouse')}</label>
                     <select {...register('initial_warehouse_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                       <option value="">-- {t('movements.form.select_warehouse')} --</option>
                       {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                     </select>
                   </div>

                   {selectedWarehouse && (
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.form.initial_qty')}</label>
                       <input required type="number" min="1" {...register('initial_quantity')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                     </div>
                   )}
                 </>
               )}
            </div>
            
            {mutation.isError && (
              <p className="text-red-500 text-sm">
                {((mutation.error as any)?.response?.data?.detail) || t('products.form.error')}
              </p>
            )}

            <div className="flex justify-end pt-2">
               <button type="submit" disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                 {mutation.isPending ? t('products.form.saving') : t('products.form.save')}
               </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{t('products.table.loading')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('products.table.sku')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('products.table.name')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('products.table.category')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('products.table.price')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Наличие на складах</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products?.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">{p.sku}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.category_id ? categories?.find(c => c.id === p.category_id)?.name || '-' : '-'}
                  </td>
                  <td className="px-6 py-4 text-green-700 font-semibold">{formatCurrency(p.price, i18n.language)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {p.inventory?.filter(i => i.quantity > 0).map((inv, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                          {inv.warehouse?.name || 'Склад?'}: {inv.quantity} шт
                        </span>
                      ))}
                      {(!p.inventory || p.inventory.filter(i => i.quantity > 0).length === 0) && (
                        <span className="text-gray-400 text-xs text-italic">Нет в наличии</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (<tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">{t('products.table.empty')}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
