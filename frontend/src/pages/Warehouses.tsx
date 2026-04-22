import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit2 } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
}

interface WarehouseFormData {
  name: string;
  address: string;
}

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { t } = useTranslation();

  const { register, handleSubmit, reset, setValue } = useForm<WarehouseFormData>();

  const { data: warehouses, isLoading, isError } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => (await axios.get('/api/v1/warehouses/')).data as Warehouse[]
  });

  const mutation = useMutation({
    mutationFn: async (data: { id?: string; payload: WarehouseFormData }) => {
      if (data.id) return axios.put(`/api/v1/warehouses/${data.id}`, data.payload);
      return axios.post('/api/v1/warehouses/', data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setEditingId(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/v1/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const onSubmit = (data: WarehouseFormData) => {
    mutation.mutate({ id: editingId === 'new' ? undefined : editingId || undefined, payload: data });
  };

  const handleEdit = (w: Warehouse) => {
    setEditingId(w.id);
    setValue('name', w.name);
    setValue('address', w.address || '');
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirm_delete'))) deleteMutation.mutate(id);
  };

  const openNewForm = () => {
    reset();
    setEditingId('new');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('warehouses.title')}</h1>
        <button 
          onClick={() => editingId ? setEditingId(null) : openNewForm()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          {editingId ? t('warehouses.cancel') : t('warehouses.add')}
        </button>
      </div>

      {editingId && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold mb-4">{t('warehouses.form.title')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('warehouses.form.name')}</label>
                 <input required {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Головний склад" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('warehouses.form.address')}</label>
                 <input {...register('address')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="м. Київ, вул. Перемоги, 1" />
               </div>
            </div>
            
            {mutation.isError && <p className="text-red-500 text-sm">{t('warehouses.form.error')}</p>}

            <div className="flex justify-end pt-2">
               <button type="submit" disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                 {mutation.isPending ? t('warehouses.form.saving') : t('warehouses.form.save')}
               </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{t('warehouses.table.loading')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('warehouses.table.name')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('warehouses.table.address')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs font-medium">{t('warehouses.table.status')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {warehouses?.map(w => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{w.name}</td>
                  <td className="px-6 py-4 text-gray-500">{w.address || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${w.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {w.is_active ? t('warehouses.table.active') : t('warehouses.table.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(w)} className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(w.id)} disabled={deleteMutation.isPending} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {warehouses?.length === 0 && (<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">{t('warehouses.table.empty')}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
