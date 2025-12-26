import { User, MapPin, Phone, Mail, Calendar, Heart, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Information {
  id: number;
  age: number;
  name: string;
  countHelps: number;
  userId: number;
}

export function Profile() {
  const { user } = useAuth();
  const [information, setInformation] = useState<Information | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  });

  useEffect(() => {
    loadInformation();
  }, [user]);

  const loadInformation = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const info = await apiService.getMyInformation();
      if (info) {
        setInformation(info);
        setFormData({
          name: info.name || '',
          age: info.age?.toString() || '',
        });
      } else {
        // Информации нет - это нормально, пользователь может её создать
        setInformation(null);
        setFormData({
          name: '',
          age: '',
        });
      }
    } catch (err) {
      // Если ошибка не связана с отсутствием информации, показываем её
      if (err instanceof Error && !err.message.includes('not found') && !err.message.includes('404')) {
        setError(err.message);
      } else {
        // Информации нет - это нормально
        setInformation(null);
        setFormData({
          name: '',
          age: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.age) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 14 || age > 130) {
      setError('Возраст должен быть от 14 до 130 лет');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (information) {
        // Обновляем существующую информацию
        const updated = await apiService.updateInformation({
          name: formData.name,
          age: age,
        });
        setInformation(updated);
      } else {
        // Создаем новую информацию
        const created = await apiService.createInformation({
          name: formData.name,
          age: age,
        });
        setInformation(created);
      }
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении информации');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (information) {
      setFormData({
        name: information.name || '',
        age: information.age?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        age: '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const profile = {
    name: information?.name || user?.email || 'Пользователь',
    age: information?.age || undefined,
    email: user?.email || '',
    userType: user?.userType || '',
    helpedCount: information?.countHelps || 0,
    receivedHelpCount: 0, // TODO: Получить из API
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const userTypeLabels: Record<string, string> = {
    NEEDY: 'Нуждающийся',
    HELPER: 'Помощник',
    ADMIN: 'Администратор',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Мой профиль</h2>
        <p className="text-gray-600 mt-2">
          Ваши личные данные и статистика
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-8">
        {/* Avatar and Name */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="text-white" size={48} />
          </div>
          <div>
            <h3 className="text-gray-900 text-xl font-semibold">{profile.name}</h3>
            {profile.age && <p className="text-gray-600 mt-1">{profile.age} лет</p>}
            <p className="text-indigo-600 mt-1 font-medium">
              {userTypeLabels[profile.userType] || profile.userType}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800 font-semibold text-lg">Контактная информация</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
                <span>{information ? 'Редактировать' : 'Добавить информацию'}</span>
              </button>
            )}
          </div>
          
          <div className="flex items-start gap-4">
            <Mail className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите ваше имя"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Возраст
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Введите ваш возраст"
                  min="14"
                  max="130"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  <span>Отмена</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {profile.name && profile.name !== user?.email && (
                <div className="flex items-start gap-4">
                  <User className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="text-gray-600 text-sm">Имя</p>
                    <p className="text-gray-900">{profile.name}</p>
                  </div>
                </div>
              )}
              {profile.age && (
                <div className="flex items-start gap-4">
                  <Calendar className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="text-gray-600 text-sm">Возраст</p>
                    <p className="text-gray-900">{profile.age} лет</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="pt-8 border-t-2 border-gray-100">
          <h3 className="text-gray-800 font-semibold text-lg mb-6">Статистика</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.userType === 'HELPER' && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="text-green-600" size={24} />
                  <p className="text-green-900 font-medium">Помог людям</p>
                </div>
                <p className="text-green-600 text-2xl font-bold">{profile.helpedCount}</p>
              </div>
            )}
            
            {profile.userType === 'NEEDY' && (
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="text-blue-600" size={24} />
                  <p className="text-blue-900 font-medium">Получил помощь</p>
                </div>
                <p className="text-blue-600 text-2xl font-bold">{profile.receivedHelpCount}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
