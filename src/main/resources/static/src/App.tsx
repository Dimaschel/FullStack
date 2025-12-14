import { useState } from 'react';
import { AnnouncementList } from './components/AnnouncementList';
import { CreateAnnouncement } from './components/CreateAnnouncement';
import { Profile } from './components/Profile';
import { Home, PlusCircle, User } from 'lucide-react';

type Tab = 'announcements' | 'create' | 'profile';

export interface Announcement {
  id: string;
  time: string;
  address: string;
  helpNeeded: string;
  author: string;
  authorAge: number;
  createdAt: Date;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      time: '14:00, 2 декабря',
      address: 'ул. Ленина, д. 45, кв. 12',
      helpNeeded: 'Помощь с покупкой продуктов и лекарств в аптеке',
      author: 'Мария Ивановна',
      authorAge: 78,
      createdAt: new Date('2024-12-01T10:00:00'),
    },
    {
      id: '2',
      time: '10:00, 3 декабря',
      address: 'пр. Победы, д. 12, кв. 5',
      helpNeeded: 'Нужна помощь с оплатой коммунальных услуг через интернет',
      author: 'Петр Сергеевич',
      authorAge: 82,
      createdAt: new Date('2024-12-01T11:30:00'),
    },
    {
      id: '3',
      time: '15:30, 1 декабря',
      address: 'ул. Садовая, д. 8, кв. 23',
      helpNeeded: 'Помощь с выгулом собаки, небольшая такса',
      author: 'Анна Петровна',
      authorAge: 75,
      createdAt: new Date('2024-11-30T14:00:00'),
    },
  ]);

  const handleCreateAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setActiveTab('announcements');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-indigo-600 text-center">
            Помощь рядом
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Сервис взаимопомощи для пожилых людей
          </p>
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
        {activeTab === 'announcements' && (
          <AnnouncementList announcements={announcements} />
        )}
        {activeTab === 'create' && (
          <CreateAnnouncement onSubmit={handleCreateAnnouncement} />
        )}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}
