import { useQuery } from '@tanstack/react-query';
import { api as axios } from '../api/client';
import { useTranslation } from 'react-i18next';
import { Package, Box, TrendingUp, HandCoins, Truck, Send } from 'lucide-react';
import { formatCurrency } from '../i18n';

interface WarehouseStock {
  warehouse_name: string;
  product_title: string;
  sku: string;
  quantity: number;
}

interface TopProduct {
  title: string;
  sku: string;
  total_shipped: number;
  revenue: number;
}

interface DashboardStats {
  total_products: number;
  total_warehouses: number;
  total_movements: number;
  total_inflows: number;
  total_shipments: number;
  total_revenue: number;
  
  top_products: TopProduct[];
  stock_distribution: WarehouseStock[];
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  // Хук useQuery отправляет GET запрос на бэкенд и кеширует ответ
  // stats будет содержать готовый объект DashboardStats (выручка, топы)
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await axios.get('/api/v1/dashboard/stats')).data as DashboardStats
  });

  return (
    <div className="flex flex-col transition-colors duration-300">
      {/* Заголовок страницы */}
      <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 mb-8 drop-shadow-sm">{t('dashboard.title')}</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-100">{t('dashboard.offline')}</div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
           
           {/* Section 1: Business Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-md text-white flex items-center transform hover:scale-[1.02] transition-transform">
                 <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm"><HandCoins className="w-8 h-8" /></div>
                 <div>
                    <h3 className="text-green-50 text-sm font-medium uppercase tracking-wider">Выручка со сделок</h3>
                    <p className="text-3xl font-bold">{formatCurrency(stats?.total_revenue || 0, i18n.language)}</p>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                 <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4"><Send className="w-8 h-8" /></div>
                 <div>
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Успешные сделки</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_shipments} <span className="text-sm font-normal text-gray-500 ml-1">отправки</span></p>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                 <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4"><Truck className="w-8 h-8" /></div>
                 <div>
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Приходы на склад</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_inflows} <span className="text-sm font-normal text-gray-500 ml-1">поступлений</span></p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Section 2: Marketing & Sales Top */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 rounded-t-2xl flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-indigo-500" />
                     <h2 className="text-lg font-bold text-gray-900">Топ-продаж (Маркетинг)</h2>
                  </div>
                  <div className="p-6 flex-1">
                     {(!stats?.top_products || stats.top_products.length === 0) ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Пока нет успешных сделок</div>
                     ) : (
                        <div className="space-y-5">
                           {stats.top_products.map((tp, idx) => (
                              <div key={idx} className="flex justify-between items-center group">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                       ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}
                                    `}>
                                       {idx + 1}
                                    </div>
                                    <div>
                                       <h4 className="font-semibold text-gray-900">{tp.title}</h4>
                                       <p className="text-xs text-gray-500 font-mono">{tp.sku}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="font-bold text-green-600">{formatCurrency(tp.revenue, i18n.language)}</p>
                                    <p className="text-xs text-gray-500">{tp.total_shipped} шт отгружено</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
              </div>

              {/* Section 3: Small Logistics Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 rounded-t-2xl flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.stats.stock')}</h2>
                     </div>
                     <div className="flex gap-4">
                        <div className="text-center"><p className="text-xs text-gray-500">Складов</p><p className="font-bold text-gray-900 leading-tight">{stats?.total_warehouses}</p></div>
                        <div className="text-center"><p className="text-xs text-gray-500">Номенкл.</p><p className="font-bold text-gray-900 leading-tight">{stats?.total_products}</p></div>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-gray-100">
                        <tr>
                           <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Наименование</th>
                           <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Склад</th>
                           <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Остаток</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {stats?.stock_distribution.slice(0, 7).map((item, idx) => (
                           <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 font-medium text-gray-900">
                                 {item.product_title} 
                                 <span className="block text-xs text-gray-400 font-mono">{item.sku}</span>
                              </td>
                              <td className="px-6 py-3 text-gray-600">{item.warehouse_name}</td>
                              <td className="px-6 py-3 text-right">
                                 <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-xs">{item.quantity}</span>
                              </td>
                           </tr>
                        ))}
                        {stats?.stock_distribution.length === 0 && (
                           <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Нет остатков на складах</td></tr>
                        )}
                        </tbody>
                     </table>
                     {stats && stats.stock_distribution.length > 7 && (
                        <div className="px-6 py-3 text-center border-t border-gray-50">
                           <span className="text-xs text-gray-400">Показаны первые 7 записей</span>
                        </div>
                     )}
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
