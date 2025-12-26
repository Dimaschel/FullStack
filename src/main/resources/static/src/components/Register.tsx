import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Phone, User, AlertCircle } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    number: '',
    password: '',
    confirmPassword: '',
    userType: 'NEEDY' as 'ADMIN' | 'HELPER' | 'NEEDY',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.email,
        formData.number,
        formData.userType,
        formData.password
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Регистрация</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <Mail className="text-indigo-600" size={20} />
            <span>Email</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <Phone className="text-indigo-600" size={20} />
            <span>Номер телефона</span>
          </label>
          <input
            type="tel"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="+7 (999) 123-45-67"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <User className="text-indigo-600" size={20} />
            <span>Тип пользователя</span>
          </label>
          <select
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'ADMIN' | 'HELPER' | 'NEEDY' })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          >
            <option value="NEEDY">Нуждающийся</option>
            <option value="HELPER">Помощник</option>
            <option value="ADMIN">Администратор</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <Lock className="text-indigo-600" size={20} />
            <span>Пароль</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <Lock className="text-indigo-600" size={20} />
            <span>Подтвердите пароль</span>
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
}


