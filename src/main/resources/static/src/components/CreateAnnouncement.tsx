import { useState } from 'react';
import { Clock, MapPin, HelpCircle, Calendar } from 'lucide-react';
import { apiService } from '../services/api';

interface CreateAnnouncementProps {
  onSubmit: () => void;
}

export function CreateAnnouncement({ onSubmit }: CreateAnnouncementProps) {
  const [formData, setFormData] = useState({
    task: '',
    dateTime: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.task || !formData.date || !formData.time) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Объединяем дату и время в ISO формат
    const dateTimeString = `${formData.date}T${formData.time}:00`;
    const dateTime = new Date(dateTimeString);

    if (isNaN(dateTime.getTime())) {
      setError('Некорректная дата или время');
      return;
    }

    if (dateTime < new Date()) {
      setError('Дата и время не могут быть в прошлом');
      return;
    }

    setIsSubmitting(true);

    try {
      // ownerId будет установлен автоматически на бэкенде из токена
      await apiService.createSchedule({
        task: formData.task,
        dateTime: dateTime.toISOString(),
        ownerId: 0, // Бэкенд игнорирует это значение и берет из токена
      });

      setFormData({
        task: '',
        dateTime: '',
        date: '',
        time: '',
      });
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания объявления');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Создать объявление</h2>
        <p className="text-gray-600 mt-2">
          Заполните форму, чтобы попросить о помощи
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
        <div>
          <label className="flex items-center gap-3 mb-3 text-gray-700">
            <HelpCircle className="text-indigo-600" size={24} />
            <span>С чем нужна помощь <span className="text-red-500">*</span></span>
          </label>
          <textarea
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            placeholder="Опишите, с чем вам нужна помощь..."
            rows={4}
            required
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-3 mb-3 text-gray-700">
              <Calendar className="text-indigo-600" size={24} />
              <span>Дата <span className="text-red-500">*</span></span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 mb-3 text-gray-700">
              <Clock className="text-indigo-600" size={24} />
              <span>Время <span className="text-red-500">*</span></span>
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Создание...</span>
            </>
          ) : (
            'Опубликовать объявление'
          )}
        </button>
      </form>
    </div>
  );
}
