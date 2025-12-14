import { AnnouncementCard } from './AnnouncementCard';
import { Announcement } from '../App';

interface AnnouncementListProps {
  announcements: Announcement[];
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-800">Активные объявления</h2>
        <p className="text-gray-600 mt-2">
          Всего объявлений: {announcements.length}
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-500">
            Пока нет активных объявлений
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}
