import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Package, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const response = await api.post('/api/v1/auth/password-reset-request', { email });
      setMessage(response.data.msg);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Сталася помилка. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <Package className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Відновлення пароля</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Введіть ваш Email, і ми надішлемо вам посилання для зміни пароля.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {message ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                {message}
              </div>
              <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Повернутися до входу
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email адреса</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Надсилаємо...' : 'Надіслати посилання'}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Я згадав пароль
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
