import { useState, useEffect } from 'react';
import { AnnouncementList } from './components/AnnouncementList';
import { CreateAnnouncement } from './components/CreateAnnouncement';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { useAuth } from './contexts/AuthContext';
import { apiService, Schedule } from './services/api';
import { Home, PlusCircle, User, LogOut } from 'lucide-react';

type Tab = 'announcements' | 'create' | 'profile';
type AuthTab = 'login' | 'register';

export interface Announcement {
  id: number;
  time: string;
  address?: string;
  helpNeeded: string;
  author: string;
  authorAge?: number;
  createdAt: Date;
  status: string;
  ownerId: number;
  responderId?: number;
}

export default function App() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadAnnouncements();
    }
  }, [isAuthenticated]);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const schedules = await apiService.getAllSchedules();
      // Преобразуем Schedule в Announcement формат
      const formattedAnnouncements: Announcement[] = schedules.map((schedule) => ({
        id: schedule.id,
        time: new Date(schedule.dateTime).toLocaleString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'long',
        }),
        helpNeeded: schedule.task,
        author: schedule.ownerName || `Пользователь ${schedule.ownerId}`,
        createdAt: new Date(schedule.dateTime),
        status: schedule.status,
        ownerId: schedule.ownerId,
        responderId: schedule.responderId,
      }));
      setAnnouncements(formattedAnnouncements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки объявлений');
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    await loadAnnouncements();
    setActiveTab('announcements');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm border-b-2 border-indigo-100">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-indigo-600 text-center text-3xl font-bold">
              Помощь рядом
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Сервис взаимопомощи для пожилых людей
            </p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
              <button
                onClick={() => setAuthTab('login')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  authTab === 'login'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  authTab === 'register'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Регистрация
              </button>
            </div>
          </div>
          {authTab === 'login' ? <Login /> : <Register />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-indigo-600 text-3xl font-bold">
                Помощь рядом
              </h1>
              <p className="text-gray-600 mt-2">
                Сервис взаимопомощи для пожилых людей
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <LogOut size={20} />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-indigo-50 text-indigo-600 border-b-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home size={24} />
              <span>Объявления</span>
            </button>
            {user?.userType === 'NEEDY' && (
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 flex items-center justify-center gap-3 py-5 transition-colors ${
                  activeTab === 'create'
                    ? 'bg-indigo-50 text-indigo-600 border-b-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <PlusCircle size={24} />
                <span>Создать объявление</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-3 py-5 transition-colors ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-600 border-b-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={24} />
              <span>Профиль</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка объявлений...</p>
          </div>
        ) : (
          <>
            {activeTab === 'announcements' && (
              <AnnouncementList announcements={announcements} onRefresh={loadAnnouncements} />
            )}
            {activeTab === 'create' && (
              <CreateAnnouncement onSubmit={handleCreateAnnouncement} />
            )}
            {activeTab === 'profile' && <Profile />}
          </>
        )}
      </main>
    </div>
  );
}
