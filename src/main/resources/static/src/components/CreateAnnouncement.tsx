import { useState } from 'react';
import { Clock, MapPin, HelpCircle, User, Calendar } from 'lucide-react';
import { Announcement } from '../App';

interface CreateAnnouncementProps {
  onSubmit: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
}

export function CreateAnnouncement({ onSubmit }: CreateAnnouncementProps) {
  const [formData, setFormData] = useState({
    time: '',
    address: '',
    helpNeeded: '',
    author: '',
    authorAge: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.time || !formData.address || !formData.helpNeeded || !formData.author || !formData.authorAge) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    onSubmit({
      time: formData.time,
      address: formData.address,
      helpNeeded: formData.helpNeeded,
      author: formData.author,
      authorAge: parseInt(formData.authorAge),
    });

    setFormData({
      time: '',
      address: '',
      helpNeeded: '',
      author: '',
      authorAge: '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-800">Создать объявление</h2>
        <p className="text-gray-600 mt-2">
          Заполните форму, чтобы попросить о помощи
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <User className="text-indigo-600" size={24} />
            <span>Ваше имя</span>
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="Например: Мария Ивановна"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <Calendar className="text-indigo-600" size={24} />
            <span>Ваш возраст</span>
          </label>
          <input
            type="number"
            value={formData.authorAge}
            onChange={(e) => setFormData({ ...formData, authorAge: e.target.value })}
            placeholder="Например: 75"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <Clock className="text-indigo-600" size={24} />
            <span>Когда нужна помощь</span>
          </label>
          <input
            type="text"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            placeholder="Например: 14:00, 5 декабря"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <MapPin className="text-indigo-600" size={24} />
            <span>Ваш адрес</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Например: ул. Ленина, д. 45, кв. 12"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <HelpCircle className="text-indigo-600" size={24} />
            <span>С чем нужна помощь</span>
          </label>
          <textarea
            value={formData.helpNeeded}
            onChange={(e) => setFormData({ ...formData, helpNeeded: e.target.value })}
            placeholder="Опишите, с чем вам нужна помощь..."
            rows={4}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Опубликовать объявление
        </button>
      </form>
    </div>
  );
}
