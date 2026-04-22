import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function Categories() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { t } = useTranslation();

  const { register, handleSubmit, reset, setValue } = useForm<{name: string}>();

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('/api/v1/categories/')).data as Category[]
  });

  const mutation = useMutation({
    mutationFn: async (data: { id?: string; name: string }) => {
      if (data.id) return axios.put(`/api/v1/categories/${data.id}`, { name: data.name });
      return axios.post('/api/v1/categories/', { name: data.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingId(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`/api/v1/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const onSubmit = (data: { name: string }) => {
    mutation.mutate({ id: editingId === 'new' ? undefined : editingId || undefined, name: data.name });
  };

  const handleEdit = (c: Category) => {
    setEditingId(c.id);
    setValue('name', c.name);
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
        <h1 className="text-2xl font-bold text-gray-900">{t('categories.title')}</h1>
        <button 
          onClick={() => editingId ? setEditingId(null) : openNewForm()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          {editingId ? t('categories.cancel') : t('categories.add')}
        </button>
      </div>

      {editingId && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold mb-4">{t('categories.form.title')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.form.name')}</label>
              <input required {...register('name')} className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            
            {mutation.isError && <p className="text-red-500 text-sm">{t('categories.form.error')}</p>}

            <div className="flex pt-2">
               <button type="submit" disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                 {mutation.isPending ? t('categories.form.saving') : t('categories.form.save')}
               </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{t('categories.table.loading')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:w-2/3">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{t('categories.table.name')}</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories?.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(c)} className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(c.id)} disabled={deleteMutation.isPending} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {categories?.length === 0 && (<tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">{t('categories.table.empty')}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
