import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Box, ArrowRightLeft, LayoutDashboard, Globe, Tags, Truck, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();

  const navItems = [
    { name: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('nav.categories'), path: '/categories', icon: Tags },
    { name: t('nav.products'), path: '/products', icon: Package },
    { name: t('nav.warehouses'), path: '/warehouses', icon: Box },
    { name: t('nav.movements'), path: '/movements', icon: ArrowRightLeft },
    { name: t('nav.shipments'), path: '/shipments', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans">
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">W-CRM</h1>
        </div>
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
             {t('header.mvp')}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
           <div className="text-sm text-gray-500 font-medium">{t('header.welcome')}</div>
           
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
               <Globe className="w-4 h-4 text-gray-500 ml-2" />
               <select 
                 value={i18n.language} 
                 onChange={(e) => i18n.changeLanguage(e.target.value)}
                 className="bg-transparent text-sm font-medium focus:outline-none py-1 pr-2 cursor-pointer"
               >
                 <option value="ru">🇷🇺 RU</option>
                 <option value="uk">🇺🇦 UK</option>
                 <option value="en">🇺🇸 EN</option>
               </select>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
               А
             </div>
             <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
               <LogOut className="w-5 h-5" />
             </button>
           </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
