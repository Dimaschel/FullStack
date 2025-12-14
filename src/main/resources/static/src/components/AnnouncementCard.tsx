import { Clock, MapPin, HelpCircle, User } from 'lucide-react';
import { Announcement } from '../App';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="text-gray-900">{announcement.author}</h3>
            <p className="text-gray-500">{announcement.authorAge} лет</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="text-gray-600 text-sm">Время</p>
            <p className="text-gray-900">{announcement.time}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="text-gray-600 text-sm">Адрес</p>
            <p className="text-gray-900">{announcement.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <HelpCircle className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="text-gray-600 text-sm">Нужна помощь</p>
            <p className="text-gray-900">{announcement.helpNeeded}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors">
          Откликнуться на объявление
        </button>
      </div>
    </div>
  );
}
